import { Router } from 'express';
import { db } from '../db.js';
import { requireAuth, requireAdmin } from '../auth.js';
import { supabaseAdmin, getOwnerEmails, isOwnerEmail } from '../supabaseAdmin.js';

const router = Router();

const ROLES = ['admin', 'editor'];
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const MIN_PASSWORD_LENGTH = 8;

router.use(requireAuth, requireAdmin);

function toPublicEditor(row) {
  return {
    id: row.id,
    email: row.email,
    role: row.role,
    isOwner: false,
    addedBy: row.added_by,
    createdAt: row.created_at,
  };
}

function isAccountExistsError(error) {
  return error?.code === 'email_exists' || /already (been )?registered/i.test(error?.message || '');
}

router.get('/', (req, res) => {
  const owners = getOwnerEmails().map((email) => ({
    id: `owner:${email}`,
    email,
    role: 'admin',
    isOwner: true,
    addedBy: null,
    createdAt: null,
  }));
  const rows = db.prepare('SELECT * FROM admin_users ORDER BY created_at DESC, id DESC').all();
  res.json({ editors: [...owners, ...rows.map(toPublicEditor)], currentEmail: req.user.email });
});

/**
 * Grants dashboard access. Creates the Supabase login with the temporary
 * password; if that email already has a Supabase account, access is granted
 * and their existing password is left unchanged.
 */
router.post('/', async (req, res) => {
  const email = String(req.body?.email || '').trim().toLowerCase();
  const role = String(req.body?.role || '').trim();
  const password = String(req.body?.password || '');

  if (!EMAIL_PATTERN.test(email)) {
    return res.status(400).json({ message: 'Enter a valid email address.' });
  }
  if (!ROLES.includes(role)) {
    return res.status(400).json({ message: 'Choose a role: Admin or Editor.' });
  }
  if (password.length < MIN_PASSWORD_LENGTH) {
    return res
      .status(400)
      .json({ message: `The temporary password must be at least ${MIN_PASSWORD_LENGTH} characters.` });
  }
  if (isOwnerEmail(email)) {
    return res.status(409).json({ message: 'This email is an owner and already has full admin access.' });
  }
  if (db.prepare('SELECT id FROM admin_users WHERE email = ?').get(email)) {
    return res.status(409).json({ message: 'This email already has dashboard access.' });
  }

  const { error } = await supabaseAdmin.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
  });
  const accountExisted = isAccountExistsError(error);
  if (error && !accountExisted) {
    return res.status(400).json({ message: error.message || 'Could not create the login account.' });
  }

  const result = db
    .prepare('INSERT INTO admin_users (email, role, added_by) VALUES (?, ?, ?)')
    .run(email, role, req.user.email);
  const row = db.prepare('SELECT * FROM admin_users WHERE id = ?').get(Number(result.lastInsertRowid));
  return res.status(201).json({ editor: toPublicEditor(row), accountExisted });
});

router.patch('/:id', (req, res) => {
  const id = Number(req.params.id);
  const role = String(req.body?.role || '').trim();
  if (!ROLES.includes(role)) {
    return res.status(400).json({ message: 'Choose a role: Admin or Editor.' });
  }

  const existing = db.prepare('SELECT * FROM admin_users WHERE id = ?').get(id);
  if (!existing) {
    return res.status(404).json({ message: 'Editor not found.' });
  }
  if (existing.email.toLowerCase() === req.user.email.toLowerCase()) {
    return res.status(400).json({ message: 'You cannot change your own role.' });
  }

  db.prepare(`UPDATE admin_users SET role = ?, updated_at = datetime('now') WHERE id = ?`).run(role, id);
  const row = db.prepare('SELECT * FROM admin_users WHERE id = ?').get(id);
  return res.json({ editor: toPublicEditor(row) });
});

// Removes dashboard access immediately. The person's Supabase login is kept,
// so they could be re-added later, but it can no longer open the dashboard.
router.delete('/:id', (req, res) => {
  const id = Number(req.params.id);
  const existing = db.prepare('SELECT * FROM admin_users WHERE id = ?').get(id);
  if (!existing) {
    return res.status(404).json({ message: 'Editor not found.' });
  }
  if (existing.email.toLowerCase() === req.user.email.toLowerCase()) {
    return res.status(400).json({ message: 'You cannot remove your own access.' });
  }

  db.prepare('DELETE FROM admin_users WHERE id = ?').run(id);
  return res.status(204).end();
});

export default router;
