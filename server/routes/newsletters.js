import { Router } from 'express';
import { db } from '../db.js';
import { requireAuth, requireAdmin } from '../auth.js';
import { clean } from '../publicForm.js';
import { isMailConfigured, sendMail } from '../mailer.js';

const router = Router();

router.use(requireAuth, requireAdmin);

function toPublic(row) {
  return {
    id: row.id,
    subject: row.subject,
    body: row.body,
    status: row.status,
    sentCount: row.sent_count,
    sentAt: row.sent_at,
    createdBy: row.created_by,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

function escapeHtml(value) {
  return value.replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);
}

function toHtml(body, unsubscribeUrl) {
  const paragraphs = escapeHtml(body)
    .split(/\n\s*\n/)
    .map((p) => `<p style="margin:0 0 16px;line-height:1.6">${p.replace(/\n/g, '<br>')}</p>`)
    .join('');
  return `<div style="font-family:Arial,sans-serif;font-size:15px;color:#111;max-width:600px;margin:0 auto">
<p style="font-size:22px;font-weight:900;margin:0 0 20px">North <span style="color:#e10600">i</span></p>
${paragraphs}
<hr style="border:none;border-top:1px solid #ddd;margin:24px 0">
<p style="font-size:12px;color:#666">You are receiving this because you subscribed on our website.
<a href="${unsubscribeUrl}" style="color:#666">Unsubscribe</a></p></div>`;
}

function siteUrl(req) {
  return (process.env.SITE_URL || req.get('origin') || `${req.protocol}://${req.get('host')}`).replace(/\/$/, '');
}

function readInput(body) {
  const subject = clean(body?.subject, 200);
  const text = clean(body?.body, 50000);
  if (!subject) return { error: 'Subject is required.' };
  if (!text) return { error: 'Write the newsletter before saving.' };
  return { subject, text };
}

router.get('/', async (req, res) => {
  const rows = await db.all('SELECT * FROM newsletters ORDER BY created_at DESC, id DESC');
  const { c: activeSubscribers } = await db.get("SELECT COUNT(*)::int AS c FROM subscribers WHERE status = 'active'");
  res.json({ newsletters: rows.map(toPublic), mailConfigured: isMailConfigured(), activeSubscribers });
});

// Active subscriber emails, used for the "copy emails" fallback when the
// server cannot send email itself.
router.get('/recipients', async (req, res) => {
  const rows = await db.all("SELECT email FROM subscribers WHERE status = 'active' ORDER BY email");
  res.json({ emails: rows.map((r) => r.email) });
});

router.post('/', async (req, res) => {
  const input = readInput(req.body);
  if (input.error) return res.status(400).json({ message: input.error });
  const id = await db.insert(
    'INSERT INTO newsletters (subject, body, created_by) VALUES (?, ?, ?)',
    input.subject,
    input.text,
    req.user.email
  );
  const row = await db.get('SELECT * FROM newsletters WHERE id = ?', id);
  return res.status(201).json({ newsletter: toPublic(row) });
});

router.put('/:id', async (req, res) => {
  const id = Number(req.params.id);
  const existing = await db.get('SELECT * FROM newsletters WHERE id = ?', id);
  if (!existing) return res.status(404).json({ message: 'Newsletter not found.' });
  if (existing.status === 'sent') return res.status(409).json({ message: 'A sent newsletter cannot be edited.' });
  const input = readInput(req.body);
  if (input.error) return res.status(400).json({ message: input.error });
  await db.run(
    "UPDATE newsletters SET subject = ?, body = ?, updated_at = datetime('now') WHERE id = ?",
    input.subject,
    input.text,
    id
  );
  return res.json({ newsletter: toPublic(await db.get('SELECT * FROM newsletters WHERE id = ?', id)) });
});

router.delete('/:id', async (req, res) => {
  const result = await db.run('DELETE FROM newsletters WHERE id = ?', Number(req.params.id));
  if (result.changes === 0) return res.status(404).json({ message: 'Newsletter not found.' });
  return res.status(204).end();
});

router.post('/:id/send', async (req, res) => {
  const id = Number(req.params.id);
  const newsletter = await db.get('SELECT * FROM newsletters WHERE id = ?', id);
  if (!newsletter) return res.status(404).json({ message: 'Newsletter not found.' });
  if (newsletter.status === 'sent') return res.status(409).json({ message: 'This newsletter was already sent.' });
  if (!isMailConfigured()) {
    return res.status(503).json({ message: 'Email sending is not set up on the server yet.' });
  }

  const recipients = await db.all("SELECT email, token FROM subscribers WHERE status = 'active'");
  if (recipients.length === 0) return res.status(400).json({ message: 'There are no active subscribers yet.' });

  const base = siteUrl(req);
  let sent = 0;
  const failed = [];
  for (const r of recipients) {
    const unsubscribeUrl = `${base}/unsubscribe?token=${r.token}`;
    try {
      await sendMail({
        to: r.email,
        subject: newsletter.subject,
        text: `${newsletter.body}\n\n---\nUnsubscribe: ${unsubscribeUrl}`,
        html: toHtml(newsletter.body, unsubscribeUrl),
      });
      sent += 1;
    } catch {
      failed.push(r.email);
    }
  }

  if (sent > 0) {
    await db.run(
      "UPDATE newsletters SET status = 'sent', sent_count = ?, sent_at = datetime('now'), updated_at = datetime('now') WHERE id = ?",
      sent,
      id
    );
  }
  const row = await db.get('SELECT * FROM newsletters WHERE id = ?', id);
  if (sent === 0) return res.status(502).json({ message: 'No emails could be sent. Check the SMTP settings.' });
  return res.json({ newsletter: toPublic(row), sent, failed: failed.length });
});

export default router;
