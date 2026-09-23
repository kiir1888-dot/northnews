/**
 * =============================================================================
 *  NORTH i — TEAM & CEO DATA LAYER (siteData.js)
 * =============================================================================
 *  The editorial team roster and the CEO/Founder spotlight are both managed
 *  entirely from the admin dashboard. These fetchers hit the same public
 *  read endpoints the admin panel writes to — there is no fallback content
 *  baked into the frontend.
 * =============================================================================
 */

/** Fetch the editorial team roster (newest-added first). */
export async function fetchTeam() {
  const res = await fetch('/api/team');
  if (!res.ok) {
    throw new Error('Failed to load team.');
  }
  const data = await res.json();
  return data.members ?? [];
}

/** Fetch the single CEO/Founder profile row. */
export async function fetchCeoProfile() {
  const res = await fetch('/api/ceo');
  if (!res.ok) {
    throw new Error('Failed to load CEO profile.');
  }
  const data = await res.json();
  return data.profile ?? null;
}
