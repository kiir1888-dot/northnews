import { Router } from 'express';
import { db } from '../db.js';
import { requireAuth } from '../auth.js';
import { upload, storeImage, deleteUploadedFile, viewableUrl } from '../upload.js';
import { clean, isBot, isEmail, rateLimit } from '../publicForm.js';
import { notifyNewsroom } from '../mailer.js';

const router = Router();
const STATUSES = ['new', 'reviewing', 'accepted', 'rejected'];

async function toPublic(row) {
  return {
    id: row.id,
    name: row.name,
    email: row.email,
    phone: row.phone,
    headline: row.headline,
    story: row.story,
    // Reader photos are private; the dashboard gets a temporary link.
    imagePath: await viewableUrl(row.image_path),
    status: row.status,
    notes: row.notes,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

// Public: "Submit a story" form. The optional photo is uploaded with it.
router.post('/', rateLimit({ max: 4 }), upload.single('image'), async (req, res) => {
  if (isBot(req.body)) return res.status(201).json({ ok: true });

  const name = clean(req.body.name, 120);
  const email = clean(req.body.email, 254);
  const phone = clean(req.body.phone, 40);
  const headline = clean(req.body.headline, 200);
  const story = clean(req.body.story, 20000);

  let problem = '';
  if (!name) problem = 'Please tell us your name.';
  else if (!isEmail(email)) problem = 'Please enter a valid email address.';
  else if (!headline) problem = 'Please give your story a headline.';
  else if (story.length < 50) problem = 'Please describe the story in at least 50 characters.';
  if (problem) return res.status(400).json({ message: problem });

  const imagePath = await storeImage(req.file, { isPrivate: true });
  await db.run(
    'INSERT INTO submissions (name, email, phone, headline, story, image_path) VALUES (?, ?, ?, ?, ?, ?)',
    name,
    email,
    phone || null,
    headline,
    story,
    imagePath
  );

  const emailed = await notifyNewsroom(
    `New story submission: ${headline}`,
    `From: ${name} <${email}> ${phone}\n\n${story}`,
    email
  );
  return res.status(201).json({ ok: true, emailed });
});

// Dashboard (Admins and Editors): editorial review.
router.use(requireAuth);

router.get('/', async (req, res) => {
  const rows = await db.all('SELECT * FROM submissions ORDER BY created_at DESC, id DESC');
  res.json({ submissions: await Promise.all(rows.map(toPublic)) });
});

router.patch('/:id', async (req, res) => {
  const id = Number(req.params.id);
  const existing = await db.get('SELECT * FROM submissions WHERE id = ?', id);
  if (!existing) return res.status(404).json({ message: 'Submission not found.' });

  const status = req.body?.status ?? existing.status;
  if (!STATUSES.includes(status)) return res.status(400).json({ message: 'Invalid status.' });
  const notes = req.body?.notes !== undefined ? clean(req.body.notes, 5000) : existing.notes;

  await db.run(
    "UPDATE submissions SET status = ?, notes = ?, updated_at = datetime('now') WHERE id = ?",
    status,
    notes || null,
    id
  );
  return res.json({ submission: await toPublic(await db.get('SELECT * FROM submissions WHERE id = ?', id)) });
});

router.delete('/:id', async (req, res) => {
  const id = Number(req.params.id);
  const existing = await db.get('SELECT * FROM submissions WHERE id = ?', id);
  if (!existing) return res.status(404).json({ message: 'Submission not found.' });
  await db.run('DELETE FROM submissions WHERE id = ?', id);
  await deleteUploadedFile(existing.image_path);
  return res.status(204).end();
});

export default router;
