import { Router } from 'express';
import { db } from '../db.js';
import { requireAuth, requireAdmin } from '../auth.js';
import { upload, storeImage, deleteUploadedFile } from '../upload.js';

const router = Router();

function toPublicMember(row) {
  return {
    id: row.id,
    name: row.name,
    role: row.role,
    imagePath: row.image_path,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

// Reading the team roster is public — the About page and homepage render
// whatever the admin has published, without requiring a login.
router.get('/', async (req, res) => {
  const rows = await db.all('SELECT * FROM team_members ORDER BY id DESC');
  res.json({ members: rows.map(toPublicMember) });
});

// Everything below (create/update/delete) is limited to the Admin role.
router.use(requireAuth, requireAdmin);

router.post('/', upload.single('image'), async (req, res) => {
  const { name, role } = req.body;
  if (!name || !name.trim()) {
    return res.status(400).json({ message: 'Name is required.' });
  }
  const imagePath = await storeImage(req.file);

  const id = await db.insert(
    'INSERT INTO team_members (name, role, image_path) VALUES (?, ?, ?)',
    name.trim(),
    (role || '').trim() || null,
    imagePath
  );

  const row = await db.get('SELECT * FROM team_members WHERE id = ?', id);
  return res.status(201).json({ member: toPublicMember(row) });
});

router.put('/:id', upload.single('image'), async (req, res) => {
  const id = Number(req.params.id);
  const existing = await db.get('SELECT * FROM team_members WHERE id = ?', id);
  if (!existing) {
    return res.status(404).json({ message: 'Worker not found.' });
  }

  const { name, role, removeImage } = req.body;
  if (!name || !name.trim()) {
    return res.status(400).json({ message: 'Name is required.' });
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
    `UPDATE team_members SET name = ?, role = ?, image_path = ?, updated_at = datetime('now') WHERE id = ?`,
    name.trim(),
    (role || '').trim() || null,
    imagePath,
    id
  );

  const row = await db.get('SELECT * FROM team_members WHERE id = ?', id);
  return res.json({ member: toPublicMember(row) });
});

router.delete('/:id', async (req, res) => {
  const id = Number(req.params.id);
  const existing = await db.get('SELECT * FROM team_members WHERE id = ?', id);
  if (!existing) {
    return res.status(404).json({ message: 'Worker not found.' });
  }
  await db.run('DELETE FROM team_members WHERE id = ?', id);
  await deleteUploadedFile(existing.image_path);
  return res.status(204).end();
});

export default router;
