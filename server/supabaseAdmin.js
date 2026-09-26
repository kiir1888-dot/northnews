import { createClient } from '@supabase/supabase-js';
import { db } from './db.js';

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const isConfigured = Boolean(SUPABASE_URL && SUPABASE_SERVICE_ROLE_KEY);

if (!isConfigured) {
  // eslint-disable-next-line no-console
  console.warn(
    '[northi] SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY are not set. Admin login will fail until ' +
      'these are configured in your .env file. See .env.example.'
  );
}

// Service-role client: only ever used server-side to verify access tokens
// issued by Supabase Auth. Never expose this key to the browser.
// Left `null` (instead of throwing) when unconfigured so the rest of the
// server can still boot — `requireAuth` reports a clear 503 in that case.
export const supabaseAdmin = isConfigured
  ? createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
      auth: { autoRefreshToken: false, persistSession: false },
    })
  : null;

/**
 * Emails in `ADMIN_EMAILS` are the site's owners: they always have admin
 * access and cannot be removed or demoted from the dashboard, which
 * guarantees nobody can lock the owner out. Everyone else must be added from
 * the Editors page (stored in the `admin_users` table).
 */
const ownerEmails = (process.env.ADMIN_EMAILS || '')
  .split(',')
  .map((email) => email.trim().toLowerCase())
  .filter(Boolean);

export function getOwnerEmails() {
  return [...ownerEmails];
}

export function isOwnerEmail(email) {
  return Boolean(email) && ownerEmails.includes(email.toLowerCase());
}

/** Returns 'admin', 'editor', or null when the email has no dashboard access. */
export async function getDashboardRole(email) {
  if (!email) return null;
  if (isOwnerEmail(email)) return 'admin';

  const row = await db.get('SELECT role FROM admin_users WHERE lower(email) = lower(?)', email);
  if (row) return row.role;

  // With no owners and no added users configured, fall back to allowing any
  // authenticated Supabase user as admin. Convenient while first setting
  // things up locally, but ADMIN_EMAILS should be set before deploying.
  if (ownerEmails.length === 0) {
    const { count } = await db.get('SELECT COUNT(*)::int AS count FROM admin_users');
    if (count === 0) return 'admin';
  }
  return null;
}
