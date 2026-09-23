import { TrashIcon } from './Icons';
import { formatDateTime } from '../utils';

export default function SignupsTable({ signups, onDelete }) {
  if (signups.length === 0) {
    return (
      <div className="rounded-lg border-2 border-dashed border-brand-200 bg-brand-50/30 p-10 text-center text-sm text-ink-500">
        No event signups yet.
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-lg border border-ink-200 bg-white shadow-sm">
      <table className="w-full text-left text-sm">
        <thead className="bg-brand-50 text-xs font-semibold uppercase tracking-wider text-brand-700">
          <tr>
            <th className="px-4 py-3">Name</th>
            <th className="px-4 py-3">Email</th>
            <th className="px-4 py-3">Event</th>
            <th className="px-4 py-3">Registered</th>
            <th className="px-4 py-3 text-right">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-ink-100">
          {signups.map((s) => (
            <tr key={s.id} className="transition hover:bg-brand-50/40">
              <td className="px-4 py-3 font-medium text-ink-900">{s.name}</td>
              <td className="px-4 py-3 text-ink-600">{s.email}</td>
              <td className="px-4 py-3 text-ink-600">{s.eventTitle || '—'}</td>
              <td className="px-4 py-3 text-ink-500">{formatDateTime(s.createdAt)}</td>
              <td className="px-4 py-3 text-right">
                <button
                  type="button"
                  onClick={() => onDelete(s)}
                  aria-label={`Remove signup from ${s.name}`}
                  className="rounded-md p-1.5 text-ink-400 transition hover:bg-danger-50 hover:text-danger-600"
                >
                  <TrashIcon className="h-4 w-4" />
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
