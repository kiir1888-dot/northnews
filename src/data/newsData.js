/**
 * =============================================================================
 *  NORTH i — NEWS DATA LAYER (newsData.js)
 * =============================================================================
 *  Every news item shown on the public site comes from the real backend
 *  (`/api/news`), which is populated entirely through the admin dashboard.
 *  This module only holds the fetch call and a couple of pure query helpers
 *  that operate on whatever list the API returns — there is no mock content
 *  here.
 *
 *  Item shape returned by the API:
 *    { id, title, date, description, imagePath, createdAt, updatedAt }
 * =============================================================================
 */

/** Fetch every published news item (already sorted newest-first by the API). */
export async function fetchNews() {
  const res = await fetch('/api/news');
  if (!res.ok) {
    throw new Error('Failed to load news.');
  }
  const data = await res.json();
  return data.news ?? [];
}

/** Full-text search across title and description. */
export function searchNews(items, query) {
  const q = query.trim().toLowerCase();
  if (!q) return [];
  return items.filter((n) =>
    [n.title, n.description].filter(Boolean).join(' ').toLowerCase().includes(q)
  );
}
