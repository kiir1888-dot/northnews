import { useEffect, useMemo, useState } from 'react';
import { subscribersApi } from '../api';
import { formatDateTime } from '../utils';
import { DownloadIcon, TrashIcon } from '../components/Icons';
import { Alert, EmptyState, FilterTabs, PageHeader, StatusBadge, downloadCsv, inputClass, secondaryButton } from '../components/ui';

/** Subscribers — everyone who signed up for the newsletter on the website. */
export default function SubscribersPage() {
  const [subscribers, setSubscribers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState('active');
  const [query, setQuery] = useState('');

  useEffect(() => {
    subscribersApi
      .list()
      .then((data) => setSubscribers(data.subscribers))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  const activeCount = useMemo(() => subscribers.filter((s) => s.status === 'active').length, [subscribers]);

  const visible = subscribers.filter(
    (s) => (filter === 'all' || s.status === filter) && s.email.toLowerCase().includes(query.trim().toLowerCase())
  );

  async function remove(sub) {
    if (!window.confirm(`Permanently delete ${sub.email} from the list?`)) return;
    try {
      await subscribersApi.remove(sub.id);
      setSubscribers((list) => list.filter((s) => s.id !== sub.id));
    } catch (err) {
      setError(err.message);
    }
  }

  function exportCsv() {
    downloadCsv(
      'northi-subscribers.csv',
      ['Email', 'Status', 'Subscribed', 'Unsubscribed'],
      visible.map((s) => [s.email, s.status, s.createdAt, s.unsubscribedAt || ''])
    );
  }

  return (
    <div className="p-6">
      <PageHeader title="Subscribers" subtitle="Readers who signed up for the newsletter on the website.">
        <button type="button" onClick={exportCsv} disabled={!visible.length} className={`${secondaryButton} inline-flex items-center gap-1.5`}>
          <DownloadIcon className="h-4 w-4" /> Download CSV
        </button>
      </PageHeader>
      <Alert>{error}</Alert>

      <div className="mb-4 flex flex-wrap items-center gap-4">
        <FilterTabs
          value={filter}
          onChange={setFilter}
          options={[
            { id: 'active', label: 'Subscribed', count: activeCount },
            { id: 'unsubscribed', label: 'Unsubscribed', count: subscribers.length - activeCount },
            { id: 'all', label: 'All', count: subscribers.length },
          ]}
        />
        <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search email…"
          aria-label="Search subscribers"
          className={`${inputClass} mb-4 max-w-xs`}
        />
      </div>

      {loading ? (
        <p className="text-sm text-ink-500">Loading subscribers…</p>
      ) : visible.length === 0 ? (
        <EmptyState>No subscribers yet. Readers join using the newsletter box on the website.</EmptyState>
      ) : (
        <div className="overflow-hidden rounded-lg border border-ink-200 bg-white shadow-sm">
          <table className="w-full text-left text-sm">
            <thead className="bg-brand-50 text-xs font-semibold uppercase tracking-wider text-brand-700">
              <tr>
                <th className="px-4 py-3">Email</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Subscribed</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-ink-100">
              {visible.map((s) => (
                <tr key={s.id} className="transition hover:bg-brand-50/40">
                  <td className="px-4 py-3 font-medium text-ink-900">{s.email}</td>
                  <td className="px-4 py-3">
                    <StatusBadge status={s.status} />
                  </td>
                  <td className="px-4 py-3 text-ink-500">{formatDateTime(s.createdAt)}</td>
                  <td className="px-4 py-3 text-right">
                    <button
                      type="button"
                      onClick={() => remove(s)}
                      aria-label={`Delete ${s.email}`}
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
      )}
    </div>
  );
}
