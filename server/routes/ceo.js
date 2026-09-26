import { Router } from 'express';
import { db } from '../db.js';
import { requireAuth, requireAdmin } from '../auth.js';
import { upload, storeImage, deleteUploadedFile } from '../upload.js';

const router = Router();

function toPublicProfile(row) {
  return {
    name: row?.name || '',
    title: row?.title || '',
    message: row?.message || '',
    imagePath: row?.image_path || null,
    updatedAt: row?.updated_at || null,
  };
}

// Reading the CEO profile is public — the homepage spotlight and About page
// render whatever the admin has published, without requiring a login.
router.get('/', async (req, res) => {
  const row = await db.get('SELECT * FROM ceo_profile WHERE id = 1');
  res.json({ profile: toPublicProfile(row) });
});

// Updating the profile is limited to the Admin role.
router.use(requireAuth, requireAdmin);

router.put('/', upload.single('image'), async (req, res) => {
  const existing = (await db.get('SELECT * FROM ceo_profile WHERE id = 1')) || {};
  const { name, title, message, removeImage } = req.body;
  if (!name || !name.trim()) {
    return res.status(400).json({ message: 'Name is required.' });
  }

  let imagePath = existing.image_path || null;
  if (req.file) {
    imagePath = await storeImage(req.file);
    await deleteUploadedFile(existing.image_path);
  } else if (removeImage === 'true') {
    await deleteUploadedFile(existing.image_path);
    imagePath = null;
  }

  await db.run(
    `INSERT INTO ceo_profile (id, name, title, message, image_path, updated_at)
     VALUES (1, ?, ?, ?, ?, datetime('now'))
     ON CONFLICT (id) DO UPDATE SET name = excluded.name, title = excluded.title, message = excluded.message,
       image_path = excluded.image_path, updated_at = excluded.updated_at`,
    name.trim(),
    (title || '').trim() || null,
    (message || '').trim() || null,
    imagePath
  );

  const row = await db.get('SELECT * FROM ceo_profile WHERE id = 1');
  return res.json({ profile: toPublicProfile(row) });
});

export default router;
