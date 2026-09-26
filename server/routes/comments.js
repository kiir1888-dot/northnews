import { Router } from 'express';
import { db } from '../db.js';
import { requireAuth } from '../auth.js';
import { clean, isBot, isEmail, rateLimit } from '../publicForm.js';

const router = Router();
const STATUSES = ['pending', 'approved', 'rejected'];

// Public: approved comments for one article. Emails are never returned here.
router.get('/', async (req, res) => {
  const articleId = Number(req.query.articleId);
  if (!articleId) return res.status(400).json({ message: 'articleId is required.' });
  const rows = await db.all(
    "SELECT id, name, body, created_at FROM comments WHERE article_id = ? AND status = 'approved' ORDER BY created_at ASC, id ASC",
    articleId
  );
  res.json({ comments: rows.map((r) => ({ id: r.id, name: r.name, body: r.body, createdAt: r.created_at })) });
});

// Public: new comments wait for moderation before they appear.
router.post('/', rateLimit({ max: 6 }), async (req, res) => {
  if (isBot(req.body)) return res.status(201).json({ ok: true });

  const articleId = Number(req.body.articleId);
  const name = clean(req.body.name, 80);
  const email = clean(req.body.email, 254);
  const body = clean(req.body.body, 3000);

  if (!articleId || !(await db.get('SELECT id FROM news WHERE id = ?', articleId))) {
    return res.status(404).json({ message: 'This article no longer exists.' });
  }
  if (!name) return res.status(400).json({ message: 'Please enter your name.' });
  if (!isEmail(email)) return res.status(400).json({ message: 'Please enter a valid email address.' });
  if (body.length < 10) return res.status(400).json({ message: 'Comments must be at least 10 characters.' });

  await db.run('INSERT INTO comments (article_id, name, email, body) VALUES (?, ?, ?, ?)', articleId, name, email, body);
  return res.status(201).json({ ok: true });
});

// Dashboard (Admins and Editors): moderation.
router.use(requireAuth);

router.get('/all', async (req, res) => {
  const rows = await db.all(
    `SELECT comments.*, news.title AS article_title
     FROM comments LEFT JOIN news ON news.id = comments.article_id
     ORDER BY comments.created_at DESC, comments.id DESC`
  );
  res.json({
    comments: rows.map((r) => ({
      id: r.id,
      articleId: r.article_id,
      articleTitle: r.article_title,
      name: r.name,
      email: r.email,
      body: r.body,
      status: r.status,
      createdAt: r.created_at,
    })),
  });
});

router.patch('/:id', async (req, res) => {
  const { status } = req.body || {};
  if (!STATUSES.includes(status)) return res.status(400).json({ message: 'Invalid status.' });
  const result = await db.run('UPDATE comments SET status = ? WHERE id = ?', status, Number(req.params.id));
  if (result.changes === 0) return res.status(404).json({ message: 'Comment not found.' });
  return res.json({ ok: true });
});

router.delete('/:id', async (req, res) => {
  const result = await db.run('DELETE FROM comments WHERE id = ?', Number(req.params.id));
  if (result.changes === 0) return res.status(404).json({ message: 'Comment not found.' });
  return res.status(204).end();
});

export default router;
