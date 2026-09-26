/** Formats an ISO-ish date string (YYYY-MM-DD) as dd/mm/yyyy for display. */
export function formatDate(value) {
  if (!value) return 'Not set';
  const date = new Date(`${value}T00:00:00`);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric' });
}

/** Formats a start/end date pair as a single dd/mm/yyyy range, collapsing when equal. */
export function formatDateRange(start, end) {
  if (!start && !end) return 'Not set';
  if (!end || start === end) return formatDate(start);
  return `${formatDate(start)} to ${formatDate(end)}`;
}

/** Formats a SQLite `datetime('now')` string ("YYYY-MM-DD HH:MM:SS") for display. */
export function formatDateTime(value) {
  if (!value) return 'Not set';
  const date = new Date(value.replace(' ', 'T') + 'Z');
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleString('en-GB', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

/** Converts a dd/mm/yyyy-agnostic ISO date string into the value a <input type="date"> expects. */
export function toDateInputValue(value) {
  if (!value) return '';
  return value.slice(0, 10);
}
