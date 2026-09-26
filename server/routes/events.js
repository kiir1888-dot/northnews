import { Router } from 'express';
import { db } from '../db.js';
import { requireAuth } from '../auth.js';
import { upload, storeImage, deleteUploadedFile } from '../upload.js';
import { clean, isBot, isEmail, rateLimit } from '../publicForm.js';

const router = Router();

function toPublicEvent(row) {
  return {
    id: row.id,
    title: row.title,
    startDate: row.start_date,
    endDate: row.end_date,
    time: row.time,
    location: row.location,
    description: row.description,
    imagePath: row.image_path,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

// Public: the website's Events page lists everything the newsroom published.
router.get('/', async (req, res) => {
  const rows = await db.all('SELECT * FROM events ORDER BY start_date ASC NULLS FIRST, id DESC');
  res.json({ events: rows.map(toPublicEvent) });
});

// Public: a reader registers for an event.
router.post('/:id/signup', rateLimit({ max: 6 }), async (req, res) => {
  if (isBot(req.body)) return res.status(201).json({ ok: true });

  const id = Number(req.params.id);
  const event = Number.isInteger(id) ? await db.get('SELECT * FROM events WHERE id = ?', id) : null;
  if (!event) return res.status(404).json({ message: 'This event no longer exists.' });

  const lastDay = event.end_date || event.start_date;
  if (lastDay && lastDay < new Date().toISOString().slice(0, 10)) {
    return res.status(400).json({ message: 'Registration for this event has closed.' });
  }

  const name = clean(req.body?.name, 120);
  const email = clean(req.body?.email, 254);
  if (!name) return res.status(400).json({ message: 'Please enter your name.' });
  if (!isEmail(email)) return res.status(400).json({ message: 'Please enter a valid email address.' });

  const already = await db.get(
    'SELECT id FROM event_signups WHERE event_id = ? AND lower(email) = lower(?)',
    id,
    email
  );
  if (!already) {
    await db.run('INSERT INTO event_signups (event_id, name, email) VALUES (?, ?, ?)', id, name, email);
  }
  return res.status(201).json({ ok: true });
});

// Everything below (create/update/delete) needs a dashboard login (Admin or Editor).
router.use(requireAuth);

router.post('/', upload.single('image'), async (req, res) => {
  const { title, startDate, endDate, time, location, description } = req.body;
  if (!title || !title.trim()) {
    return res.status(400).json({ message: 'Title is required.' });
  }
  const imagePath = await storeImage(req.file);

  const id = await db.insert(
    `INSERT INTO events (title, start_date, end_date, time, location, description, image_path)
     VALUES (?, ?, ?, ?, ?, ?, ?)`,
    title.trim(),
    startDate || null,
    endDate || null,
    time || null,
    location || null,
    description || null,
    imagePath
  );

  const row = await db.get('SELECT * FROM events WHERE id = ?', id);
  return res.status(201).json({ event: toPublicEvent(row) });
});

router.put('/:id', upload.single('image'), async (req, res) => {
  const id = Number(req.params.id);
  const existing = await db.get('SELECT * FROM events WHERE id = ?', id);
  if (!existing) {
    return res.status(404).json({ message: 'Event not found.' });
  }

  const { title, startDate, endDate, time, location, description, removeImage } = req.body;
  if (!title || !title.trim()) {
    return res.status(400).json({ message: 'Title is required.' });
  }

  let imagePath = existing.image_path;
  if (req.file) {
    imagePath = await storeImage(req.file);
    await deleteUploadedFile(existing.image_path);
  } else if (removeImage === 'true') {
    await deleteUploadedFile(existing.image_path);
    imagePath = null;
  }

  await db.run(
    `UPDATE events
     SET title = ?, start_date = ?, end_date = ?, time = ?, location = ?, description = ?, image_path = ?, updated_at = datetime('now')
     WHERE id = ?`,
    title.trim(),
    startDate || null,
    endDate || null,
    time || null,
    location || null,
    description || null,
    imagePath,
    id
  );

  const row = await db.get('SELECT * FROM events WHERE id = ?', id);
  return res.json({ event: toPublicEvent(row) });
});

router.delete('/:id', async (req, res) => {
  const id = Number(req.params.id);
  const existing = await db.get('SELECT * FROM events WHERE id = ?', id);
  if (!existing) {
    return res.status(404).json({ message: 'Event not found.' });
  }
  await db.run('DELETE FROM events WHERE id = ?', id);
  await deleteUploadedFile(existing.image_path);
  return res.status(204).end();
});

export default router;
