/** Small shared building blocks for the dashboard pages. */

export const inputClass =
  'w-full rounded-md border border-ink-200 px-3 py-2 text-sm text-ink-900 outline-none transition focus:border-brand-500 focus:ring-1 focus:ring-brand-500';

export const primaryButton =
  'rounded-md bg-gradient-to-r from-brand-600 to-brand-500 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:from-brand-700 hover:to-brand-600 disabled:cursor-not-allowed disabled:opacity-60';

export const secondaryButton =
  'rounded-md border border-ink-200 bg-white px-3 py-1.5 text-sm font-medium text-ink-700 transition hover:border-brand-300 hover:text-brand-700 disabled:cursor-not-allowed disabled:opacity-60';

export const dangerButton =
  'rounded-md border border-danger-200 bg-white px-3 py-1.5 text-sm font-medium text-danger-600 transition hover:bg-danger-50';

export function PageHeader({ title, subtitle, children }) {
  return (
    <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
      <div>
        <h1 className="font-sans text-xl font-semibold text-ink-900">{title}</h1>
        {subtitle && <p className="mt-1 text-sm text-ink-500">{subtitle}</p>}
      </div>
      {children && <div className="flex flex-wrap items-center gap-2">{children}</div>}
    </div>
  );
}

export function Alert({ kind = 'error', children }) {
  if (!children) return null;
  const styles =
    kind === 'error'
      ? 'border-danger-200 bg-danger-50 text-danger-700'
      : kind === 'warning'
        ? 'border-amber-200 bg-amber-50 text-amber-800'
        : 'border-brand-200 bg-brand-50 text-brand-700';
  return (
    <div role={kind === 'error' ? 'alert' : 'status'} className={`mb-4 rounded-md border px-4 py-2.5 text-sm font-medium ${styles}`}>
      {children}
    </div>
  );
}

/** Row of filter pills, e.g. All / New / Resolved, with counts. */
export function FilterTabs({ options, value, onChange }) {
  return (
    <div className="mb-4 flex flex-wrap gap-2" role="tablist">
      {options.map((opt) => (
        <button
          key={opt.id}
          type="button"
          role="tab"
          aria-selected={value === opt.id}
          onClick={() => onChange(opt.id)}
          className={`rounded-full px-3 py-1 text-sm font-medium transition ${
            value === opt.id ? 'bg-brand-600 text-white shadow-sm' : 'bg-white text-ink-600 ring-1 ring-ink-200 hover:ring-brand-300'
          }`}
        >
          {opt.label}
          {typeof opt.count === 'number' && <span className="ml-1.5 opacity-75">{opt.count}</span>}
        </button>
      ))}
    </div>
  );
}

export function EmptyState({ children }) {
  return (
    <div className="rounded-lg border-2 border-dashed border-ink-200 bg-white px-6 py-12 text-center text-sm text-ink-500">
      {children}
    </div>
  );
}

const BADGE_STYLES = {
  new: 'bg-brand-100 text-brand-700',
  pending: 'bg-amber-100 text-amber-800',
  reviewing: 'bg-amber-100 text-amber-800',
  read: 'bg-ink-100 text-ink-700',
  draft: 'bg-ink-100 text-ink-700',
  resolved: 'bg-emerald-100 text-emerald-800',
  approved: 'bg-emerald-100 text-emerald-800',
  accepted: 'bg-emerald-100 text-emerald-800',
  active: 'bg-emerald-100 text-emerald-800',
  sent: 'bg-emerald-100 text-emerald-800',
  rejected: 'bg-danger-100 text-danger-700',
  unsubscribed: 'bg-ink-100 text-ink-500',
};

export function StatusBadge({ status }) {
  return (
    <span className={`rounded-full px-2.5 py-0.5 text-xs font-semibold capitalize ${BADGE_STYLES[status] || 'bg-ink-100 text-ink-700'}`}>
      {status}
    </span>
  );
}

/** Downloads rows as a CSV file the user can open in Excel or Google Sheets. */
export function downloadCsv(filename, headers, rows) {
  const escape = (v) => {
    let s = String(v ?? '');
    // Stops spreadsheet apps from running reader-supplied text as a formula.
    if (/^[=+\-@\t\r]/.test(s)) s = `'${s}`;
    return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
  };
  const csv = [headers, ...rows].map((r) => r.map(escape).join(',')).join('\r\n');
  const url = URL.createObjectURL(new Blob([`\uFEFF${csv}`], { type: 'text/csv;charset=utf-8' }));
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}
