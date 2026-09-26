import { Router } from 'express';
import { db } from '../db.js';
import { requireAuth, requireAdmin } from '../auth.js';
import { upload, deleteUploadedFile } from '../upload.js';

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
router.get('/', (req, res) => {
  const rows = db.prepare('SELECT * FROM team_members ORDER BY id DESC').all();
  res.json({ members: rows.map(toPublicMember) });
});

// Everything below (create/update/delete) is limited to the Admin role.
router.use(requireAuth, requireAdmin);

router.post('/', upload.single('image'), (req, res) => {
  const { name, role } = req.body;
  if (!name || !name.trim()) {
    return res.status(400).json({ message: 'Name is required.' });
  }
  const imagePath = req.file ? `/uploads/${req.file.filename}` : null;

  const result = db
    .prepare('INSERT INTO team_members (name, role, image_path) VALUES (?, ?, ?)')
    .run(name.trim(), (role || '').trim() || null, imagePath);

  const row = db.prepare('SELECT * FROM team_members WHERE id = ?').get(Number(result.lastInsertRowid));
  return res.status(201).json({ member: toPublicMember(row) });
});

router.put('/:id', upload.single('image'), (req, res) => {
  const id = Number(req.params.id);
  const existing = db.prepare('SELECT * FROM team_members WHERE id = ?').get(id);
  if (!existing) {
    return res.status(404).json({ message: 'Worker not found.' });
  }

  const { name, role, removeImage } = req.body;
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
    `UPDATE team_members SET name = ?, role = ?, image_path = ?, updated_at = datetime('now') WHERE id = ?`
  ).run(name.trim(), (role || '').trim() || null, imagePath, id);

  const row = db.prepare('SELECT * FROM team_members WHERE id = ?').get(id);
  return res.json({ member: toPublicMember(row) });
});

router.delete('/:id', (req, res) => {
  const id = Number(req.params.id);
  const existing = db.prepare('SELECT * FROM team_members WHERE id = ?').get(id);
  if (!existing) {
    return res.status(404).json({ message: 'Worker not found.' });
  }
  db.prepare('DELETE FROM team_members WHERE id = ?').run(id);
  deleteUploadedFile(existing.image_path);
  return res.status(204).end();
});

export default router;
