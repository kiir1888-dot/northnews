import { Router } from 'express';
import { db } from '../db.js';
import { requireAuth } from '../auth.js';
import { upload, deleteUploadedFile } from '../upload.js';

const router = Router();

// The fixed set of categories an admin can file a story under. Kept here
// (not free text) so the public site can reliably group/filter by it.
export const NEWS_CATEGORIES = ['General', 'Politics', 'Technology', 'Business', 'Sports', 'Education'];

function normalizeCategory(value) {
  const match = NEWS_CATEGORIES.find((c) => c.toLowerCase() === String(value || '').toLowerCase());
  return match || 'General';
}

function toPublicNews(row) {
  return {
    id: row.id,
    title: row.title,
    date: row.date,
    category: row.category || 'General',
    description: row.description,
    imagePath: row.image_path,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

// Reading news is public — the site's homepage and article pages render
// whatever the admin has published, without requiring a login.
router.get('/', (req, res) => {
  const rows = db.prepare('SELECT * FROM news ORDER BY date DESC, id DESC').all();
  res.json({ news: rows.map(toPublicNews), categories: NEWS_CATEGORIES });
});

// Everything below (create/update/delete) needs a dashboard login (Admin or Editor).
router.use(requireAuth);

router.post('/', upload.single('image'), (req, res) => {
  const { title, date, description, category } = req.body;
  if (!title || !title.trim()) {
    return res.status(400).json({ message: 'Title is required.' });
  }
  const imagePath = req.file ? `/uploads/${req.file.filename}` : null;

  const result = db
    .prepare('INSERT INTO news (title, date, category, description, image_path) VALUES (?, ?, ?, ?, ?)')
    .run(title.trim(), date || null, normalizeCategory(category), description || null, imagePath);

  const row = db.prepare('SELECT * FROM news WHERE id = ?').get(Number(result.lastInsertRowid));
  return res.status(201).json({ item: toPublicNews(row) });
});

router.put('/:id', upload.single('image'), (req, res) => {
  const id = Number(req.params.id);
  const existing = db.prepare('SELECT * FROM news WHERE id = ?').get(id);
  if (!existing) {
    return res.status(404).json({ message: 'News item not found.' });
  }

  const { title, date, description, category, removeImage } = req.body;
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
    `UPDATE news SET title = ?, date = ?, category = ?, description = ?, image_path = ?, updated_at = datetime('now') WHERE id = ?`
  ).run(title.trim(), date || null, normalizeCategory(category), description || null, imagePath, id);

  const row = db.prepare('SELECT * FROM news WHERE id = ?').get(id);
  return res.json({ item: toPublicNews(row) });
});

router.delete('/:id', (req, res) => {
  const id = Number(req.params.id);
  const existing = db.prepare('SELECT * FROM news WHERE id = ?').get(id);
  if (!existing) {
    return res.status(404).json({ message: 'News item not found.' });
  }
  db.prepare('DELETE FROM news WHERE id = ?').run(id);
  deleteUploadedFile(existing.image_path);
  return res.status(204).end();
});

export default router;
