import { Router } from 'express';
import { requireAuth } from '../auth.js';

const router = Router();

/**
 * Login/logout now happen entirely client-side via Supabase Auth
 * (supabase-js). This endpoint just confirms that the bearer token the
 * frontend is holding belongs to an authorized admin email, so the
 * dashboard can show a clear "not authorized" state instead of a wall of
 * failed requests.
 */
router.get('/me', requireAuth, (req, res) => {
  return res.json({ user: req.user });
});

export default router;
