/**
 * =============================================================================
 *  North i — NEWS DATA LAYER (newsData.js)
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

/** How many stories the public site loads per page. */
export const NEWS_PAGE_SIZE = 30;

/**
 * Fetch one page of stories (newest first) with short excerpts.
 * Resolves to `{ items, hasMore }`.
 */
export async function fetchNewsPage({ offset = 0, limit = NEWS_PAGE_SIZE, category, q, signal } = {}) {
  const params = new URLSearchParams({ limit: String(limit), offset: String(offset) });
  if (category) params.set('category', category);
  if (q) params.set('q', q);
  const res = await fetch(`/api/news?${params}`, { signal });
  if (!res.ok) {
    throw new Error('Failed to load news.');
  }
  const data = await res.json();
  return { items: data.news ?? [], hasMore: Boolean(data.hasMore) };
}

/** Fetch one story with its full text. Resolves to null if it doesn't exist. */
export async function fetchArticle(id) {
  const res = await fetch(`/api/news/${encodeURIComponent(id)}`);
  if (res.status === 404) return null;
  if (!res.ok) {
    throw new Error('Failed to load the story.');
  }
  const data = await res.json();
  return data.news ?? null;
}
