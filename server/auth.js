import { supabaseAdmin, getDashboardRole, isOwnerEmail } from './supabaseAdmin.js';

/**
 * Express middleware: verifies the Supabase Auth access token sent in the
 * Authorization header (Bearer scheme) and rejects the request unless the
 * email has dashboard access (an owner from ADMIN_EMAILS, or someone added
 * on the Editors page). Attaches `req.user = { id, email, role, isOwner }`.
 */
export async function requireAuth(req, res, next) {
  if (!supabaseAdmin) {
    return res
      .status(503)
      .json({ message: 'Admin login is not configured yet. Set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY.' });
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
  const role = await getDashboardRole(email);
  if (!role) {
    return res.status(403).json({ message: 'This account is not authorized for admin access.' });
  }

  req.user = { id: data.user.id, email, role, isOwner: isOwnerEmail(email) };
  return next();
}

/** Use after `requireAuth`: limits a route to the Admin role (Editors get 403). */
export function requireAdmin(req, res, next) {
  if (req.user?.role !== 'admin') {
    return res.status(403).json({ message: 'Only admins can do this.' });
  }
  return next();
}
