import { Router } from 'express';
import { db } from '../db.js';
import { requireAuth, requireAdmin } from '../auth.js';
import { upload, deleteUploadedFile } from '../upload.js';

const router = Router();

function toPublicProfile(row) {
  return {
    name: row.name || '',
    title: row.title || '',
    message: row.message || '',
    imagePath: row.image_path,
    updatedAt: row.updated_at,
  };
}

// Reading the CEO profile is public — the homepage spotlight and About page
// render whatever the admin has published, without requiring a login.
router.get('/', (req, res) => {
  const row = db.prepare('SELECT * FROM ceo_profile WHERE id = 1').get();
  res.json({ profile: toPublicProfile(row) });
});

// Updating the profile is limited to the Admin role.
router.use(requireAuth, requireAdmin);

router.put('/', upload.single('image'), (req, res) => {
  const existing = db.prepare('SELECT * FROM ceo_profile WHERE id = 1').get();
  const { name, title, message, removeImage } = req.body;
  if (!name || !name.trim()) {
    return res.status(400).json({ message: 'Name is required.' });
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
    `UPDATE ceo_profile SET name = ?, title = ?, message = ?, image_path = ?, updated_at = datetime('now') WHERE id = 1`
  ).run(name.trim(), (title || '').trim() || null, (message || '').trim() || null, imagePath);

  const row = db.prepare('SELECT * FROM ceo_profile WHERE id = 1').get();
  return res.json({ profile: toPublicProfile(row) });
});

export default router;
