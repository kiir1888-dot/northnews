import { Router } from 'express';
import { db } from '../db.js';
import { requireAuth } from '../auth.js';
import { upload, deleteUploadedFile } from '../upload.js';

const router = Router();

router.use(requireAuth);

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

router.get('/', (req, res) => {
  const rows = db.prepare('SELECT * FROM events ORDER BY start_date ASC, id DESC').all();
  res.json({ events: rows.map(toPublicEvent) });
});

router.post('/', upload.single('image'), (req, res) => {
  const { title, startDate, endDate, time, location, description } = req.body;
  if (!title || !title.trim()) {
    return res.status(400).json({ message: 'Title is required.' });
  }
  const imagePath = req.file ? `/uploads/${req.file.filename}` : null;

  const result = db
    .prepare(
      `INSERT INTO events (title, start_date, end_date, time, location, description, image_path)
       VALUES (?, ?, ?, ?, ?, ?, ?)`
    )
    .run(title.trim(), startDate || null, endDate || null, time || null, location || null, description || null, imagePath);

  const row = db.prepare('SELECT * FROM events WHERE id = ?').get(Number(result.lastInsertRowid));
  return res.status(201).json({ event: toPublicEvent(row) });
});

router.put('/:id', upload.single('image'), (req, res) => {
  const id = Number(req.params.id);
  const existing = db.prepare('SELECT * FROM events WHERE id = ?').get(id);
  if (!existing) {
    return res.status(404).json({ message: 'Event not found.' });
  }

  const { title, startDate, endDate, time, location, description, removeImage } = req.body;
  if (!title || !title.trim()) {
    return res.status(400).json({ message: 'Title is required.' });
  }

  let imagePath = existing.image_path;
  if (req.file) {
    deleteUploadedFile(existing.image_path);
    imagePath = `/uploads/${req.file.filename}`;
  } else if (removeImage === 'true') {
    deleteUploadedFile(existing.image_path);
    imagePath = null;
  }

  db.prepare(
    `UPDATE events
     SET title = ?, start_date = ?, end_date = ?, time = ?, location = ?, description = ?, image_path = ?, updated_at = datetime('now')
     WHERE id = ?`
  ).run(title.trim(), startDate || null, endDate || null, time || null, location || null, description || null, imagePath, id);

  const row = db.prepare('SELECT * FROM events WHERE id = ?').get(id);
  return res.json({ event: toPublicEvent(row) });
});

router.delete('/:id', (req, res) => {
  const id = Number(req.params.id);
  const existing = db.prepare('SELECT * FROM events WHERE id = ?').get(id);
  if (!existing) {
    return res.status(404).json({ message: 'Event not found.' });
  }
  db.prepare('DELETE FROM events WHERE id = ?').run(id);
  deleteUploadedFile(existing.image_path);
  return res.status(204).end();
});

export default router;
