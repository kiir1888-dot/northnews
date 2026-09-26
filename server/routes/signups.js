import { Router } from 'express';
import { db } from '../db.js';
import { requireAuth, requireAdmin } from '../auth.js';

const router = Router();

// Signups contain readers' personal details, so only admins can see them.
router.use(requireAuth, requireAdmin);

router.get('/', async (req, res) => {
  const rows = await db.all(
    `SELECT event_signups.id AS id,
            event_signups.name AS name,
            event_signups.email AS email,
            event_signups.created_at AS "createdAt",
            events.id AS "eventId",
            events.title AS "eventTitle"
     FROM event_signups
     LEFT JOIN events ON events.id = event_signups.event_id
     ORDER BY event_signups.created_at DESC`
  );
  res.json({ signups: rows });
});

router.delete('/:id', async (req, res) => {
  const id = Number(req.params.id);
  const result = await db.run('DELETE FROM event_signups WHERE id = ?', id);
  if (result.changes === 0) {
    return res.status(404).json({ message: 'Signup not found.' });
  }
  return res.status(204).end();
});

export default router;
