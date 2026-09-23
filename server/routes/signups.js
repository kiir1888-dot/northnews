import { Router } from 'express';
import { db } from '../db.js';
import { requireAuth } from '../auth.js';

const router = Router();

router.use(requireAuth);

router.get('/', (req, res) => {
  const rows = db
    .prepare(
      `SELECT event_signups.id AS id,
              event_signups.name AS name,
              event_signups.email AS email,
              event_signups.created_at AS createdAt,
              events.id AS eventId,
              events.title AS eventTitle
       FROM event_signups
       LEFT JOIN events ON events.id = event_signups.event_id
       ORDER BY event_signups.created_at DESC`
    )
    .all();
  res.json({ signups: rows });
});

router.delete('/:id', (req, res) => {
  const id = Number(req.params.id);
  const result = db.prepare('DELETE FROM event_signups WHERE id = ?').run(id);
  if (result.changes === 0) {
    return res.status(404).json({ message: 'Signup not found.' });
  }
  return res.status(204).end();
});

export default router;
