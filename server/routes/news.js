import { Router } from 'express';
import { db } from '../db.js';
import { requireAuth } from '../auth.js';
import { upload, storeImage, deleteUploadedFile } from '../upload.js';

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
//
// With `?limit=` the public site gets one page of stories with a short
// excerpt instead of the full text, so page loads stay small as the archive
// grows. Optional filters: `offset`, `category`, `q` (search). Without
// `limit` the full list is returned (used by the admin dashboard).
const MAX_PAGE_SIZE = 50;
const EXCERPT_LENGTH = 320;

function toInt(value, fallback) {
  const n = Number.parseInt(value, 10);
  return Number.isFinite(n) ? n : fallback;
}

router.get('/', async (req, res) => {
  if (req.query.limit === undefined) {
    const rows = await db.all('SELECT * FROM news ORDER BY date DESC NULLS LAST, id DESC');
    return res.json({ news: rows.map(toPublicNews), categories: NEWS_CATEGORIES });
  }

  const limit = Math.min(Math.max(toInt(req.query.limit, 20), 1), MAX_PAGE_SIZE);
  const offset = Math.max(toInt(req.query.offset, 0), 0);
  const where = [];
  const params = [];

  const category = NEWS_CATEGORIES.find((c) => c.toLowerCase() === String(req.query.category || '').toLowerCase());
  if (category) {
    where.push("COALESCE(category, 'General') = ?");
    params.push(category);
  }

  const q = String(req.query.q || '').trim().slice(0, 100);
  if (q) {
    where.push("(title || ' ' || COALESCE(description, '')) ILIKE ?");
    params.push(`%${q.replace(/[\\%_]/g, '\\$&')}%`);
  }

  // Fetch one extra row to know whether another page exists.
  const rows = await db.all(
    `SELECT id, title, date, category, image_path, created_at, updated_at,
            LEFT(description, ${EXCERPT_LENGTH}) AS description,
            LENGTH(description) > ${EXCERPT_LENGTH} AS truncated
       FROM news
      ${where.length ? `WHERE ${where.join(' AND ')}` : ''}
      ORDER BY date DESC NULLS LAST, id DESC
      LIMIT ? OFFSET ?`,
    ...params,
    limit + 1,
    offset
  );

  const hasMore = rows.length > limit;
  const news = rows.slice(0, limit).map((row) => {
    const item = toPublicNews(row);
    if (row.truncated && item.description) item.description = `${item.description.trimEnd()}…`;
    return item;
  });
  return res.json({ news, categories: NEWS_CATEGORIES, hasMore });
});

// A single story with its full text, for the article page.
router.get('/:id', async (req, res) => {
  const id = Number(req.params.id);
  if (!Number.isInteger(id) || id <= 0) return res.status(404).json({ message: 'Story not found.' });
  const row = await db.get('SELECT * FROM news WHERE id = ?', id);
  if (!row) return res.status(404).json({ message: 'Story not found.' });
  return res.json({ news: toPublicNews(row) });
});

// Everything below (create/update/delete) needs a dashboard login (Admin or Editor).
router.use(requireAuth);

router.post('/', upload.single('image'), async (req, res) => {
  const { title, date, description, category } = req.body;
  if (!title || !title.trim()) {
    return res.status(400).json({ message: 'Title is required.' });
  }
  const imagePath = await storeImage(req.file);

  const id = await db.insert(
    'INSERT INTO news (title, date, category, description, image_path) VALUES (?, ?, ?, ?, ?)',
    title.trim(),
    date || null,
    normalizeCategory(category),
    description || null,
    imagePath
  );

  const row = await db.get('SELECT * FROM news WHERE id = ?', id);
  return res.status(201).json({ item: toPublicNews(row) });
});

router.put('/:id', upload.single('image'), async (req, res) => {
  const id = Number(req.params.id);
  const existing = await db.get('SELECT * FROM news WHERE id = ?', id);
  if (!existing) {
    return res.status(404).json({ message: 'News item not found.' });
  }

  const { title, date, description, category, removeImage } = req.body;
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
    `UPDATE news SET title = ?, date = ?, category = ?, description = ?, image_path = ?, updated_at = datetime('now') WHERE id = ?`,
    title.trim(),
    date || null,
    normalizeCategory(category),
    description || null,
    imagePath,
    id
  );

  const row = await db.get('SELECT * FROM news WHERE id = ?', id);
  return res.json({ item: toPublicNews(row) });
});

router.delete('/:id', async (req, res) => {
  const id = Number(req.params.id);
  const existing = await db.get('SELECT * FROM news WHERE id = ?', id);
  if (!existing) {
    return res.status(404).json({ message: 'News item not found.' });
  }
  await db.run('DELETE FROM news WHERE id = ?', id);
  await deleteUploadedFile(existing.image_path);
  return res.status(204).end();
});

export default router;
