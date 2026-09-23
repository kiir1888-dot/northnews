import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const isConfigured = Boolean(SUPABASE_URL && SUPABASE_SERVICE_ROLE_KEY);

if (!isConfigured) {
  // eslint-disable-next-line no-console
  console.warn(
    '[northi] SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY are not set. Admin login will fail until ' +
      'these are configured in your .env file — see .env.example.'
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
 * Admin access is further restricted to an explicit allowlist of email
 * addresses, since anyone can otherwise sign up for a Supabase Auth account
 * on this project. Configure `ADMIN_EMAILS` as a comma-separated list.
 */
const allowedEmails = (process.env.ADMIN_EMAILS || '')
  .split(',')
  .map((email) => email.trim().toLowerCase())
  .filter(Boolean);

export function isAllowedAdminEmail(email) {
  if (!email) return false;
  // If no allowlist is configured, fall back to allowing any authenticated
  // Supabase user — convenient while first setting things up locally, but
  // ADMIN_EMAILS should be set before deploying.
  if (allowedEmails.length === 0) return true;
  return allowedEmails.includes(email.toLowerCase());
}
