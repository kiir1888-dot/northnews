import { supabaseAdmin, isAllowedAdminEmail } from './supabaseAdmin.js';

/**
 * Express middleware: verifies the Supabase Auth access token sent as
 * `Authorization: Bearer <token>` and rejects the request unless it belongs
 * to an email on the admin allowlist (see `isAllowedAdminEmail`).
 */
export async function requireAuth(req, res, next) {
  if (!supabaseAdmin) {
    return res
      .status(503)
      .json({ message: 'Admin login is not configured yet — set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY.' });
  }

  const header = req.headers.authorization || '';
  const token = header.startsWith('Bearer ') ? header.slice(7).trim() : null;

  if (!token) {
    return res.status(401).json({ message: 'Not authenticated.' });
  }

  const { data, error } = await supabaseAdmin.auth.getUser(token);
  if (error || !data?.user) {
    return res.status(401).json({ message: 'Session expired or invalid.' });
  }

  const email = data.user.email || '';
  if (!isAllowedAdminEmail(email)) {
    return res.status(403).json({ message: 'This account is not authorized for admin access.' });
  }

  req.user = { id: data.user.id, email, role: 'admin' };
  return next();
}
