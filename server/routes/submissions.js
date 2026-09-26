import { Router } from 'express';
import { db } from '../db.js';
import { requireAuth } from '../auth.js';
import { upload, deleteUploadedFile } from '../upload.js';
import { clean, isBot, isEmail, rateLimit } from '../publicForm.js';
import { notifyNewsroom } from '../mailer.js';

const router = Router();
const STATUSES = ['new', 'reviewing', 'accepted', 'rejected'];

function toPublic(row) {
  return {
    id: row.id,
    name: row.name,
    email: row.email,
    phone: row.phone,
    headline: row.headline,
    story: row.story,
    imagePath: row.image_path,
    status: row.status,
    notes: row.notes,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

// Public: "Submit a story" form. The optional photo is uploaded with it.
router.post('/', rateLimit({ max: 4 }), upload.single('image'), (req, res) => {
  const discard = () => req.file && deleteUploadedFile(`/uploads/${req.file.filename}`);
  if (isBot(req.body)) {
    discard();
    return res.status(201).json({ ok: true });
  }

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
  if (problem) {
    discard();
    return res.status(400).json({ message: problem });
  }

  db.prepare(
    'INSERT INTO submissions (name, email, phone, headline, story, image_path) VALUES (?, ?, ?, ?, ?, ?)'
  ).run(name, email, phone || null, headline, story, req.file ? `/uploads/${req.file.filename}` : null);

  notifyNewsroom(`New story submission: ${headline}`, `From: ${name} <${email}> ${phone}\n\n${story}`, email);
  return res.status(201).json({ ok: true });
});

// Dashboard (Admins and Editors): editorial review.
router.use(requireAuth);

router.get('/', (req, res) => {
  const rows = db.prepare('SELECT * FROM submissions ORDER BY created_at DESC, id DESC').all();
  res.json({ submissions: rows.map(toPublic) });
});

router.patch('/:id', (req, res) => {
  const id = Number(req.params.id);
  const existing = db.prepare('SELECT * FROM submissions WHERE id = ?').get(id);
  if (!existing) return res.status(404).json({ message: 'Submission not found.' });

  const status = req.body?.status ?? existing.status;
  if (!STATUSES.includes(status)) return res.status(400).json({ message: 'Invalid status.' });
  const notes = req.body?.notes !== undefined ? clean(req.body.notes, 5000) : existing.notes;

  db.prepare("UPDATE submissions SET status = ?, notes = ?, updated_at = datetime('now') WHERE id = ?").run(
    status,
    notes || null,
    id
  );
  return res.json({ submission: toPublic(db.prepare('SELECT * FROM submissions WHERE id = ?').get(id)) });
});

router.delete('/:id', (req, res) => {
  const id = Number(req.params.id);
  const existing = db.prepare('SELECT * FROM submissions WHERE id = ?').get(id);
  if (!existing) return res.status(404).json({ message: 'Submission not found.' });
  db.prepare('DELETE FROM submissions WHERE id = ?').run(id);
  deleteUploadedFile(existing.image_path);
  return res.status(204).end();
});

export default router;
