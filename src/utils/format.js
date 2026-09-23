/**
 * Small formatting helpers shared across the UI.
 * Kept framework-agnostic and pure so they are trivially testable.
 */

/** Absolute, locale-aware date — e.g. "21 September 2026". */
export function formatDate(iso, locale = 'en-GB') {
  return new Date(iso).toLocaleDateString(locale, {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
}

/** Short date used on compact cards — e.g. "21 Sep". */
export function formatShortDate(iso, locale = 'en-GB') {
  return new Date(iso).toLocaleDateString(locale, { day: 'numeric', month: 'short' });
}

/** Clock time — e.g. "07:40". */
export function formatTime(iso, locale = 'en-GB') {
  return new Date(iso).toLocaleTimeString(locale, { hour: '2-digit', minute: '2-digit' });
}

/**
 * Relative timestamp badge used on the "Latest Posts" rail.
 * Falls back to an absolute short date beyond one week.
 */
export function timeAgo(iso, locale = 'en-GB') {
  const seconds = Math.floor((Date.now() - new Date(iso).getTime()) / 1000);
  if (seconds < 60) return 'just now';
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;
  return formatShortDate(iso, locale);
}

/** Join conditional class names — a tiny local stand-in for `clsx`. */
export function cx(...parts) {
  return parts.filter(Boolean).join(' ');
}

/** URL-safe slug for a category name — e.g. "Technology" -> "technology". */
export function categorySlug(category) {
  return String(category || '').trim().toLowerCase();
}
