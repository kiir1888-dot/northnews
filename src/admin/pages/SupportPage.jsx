import { useEffect, useMemo, useState } from 'react';
import { supportApi } from '../api';
import { formatDateTime } from '../utils';
import { TrashIcon } from '../components/Icons';
import { Alert, EmptyState, FilterTabs, PageHeader, StatusBadge, dangerButton, secondaryButton } from '../components/ui';

/** Support — the inbox for messages sent through the website's Contact form. */
export default function SupportPage() {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState('open');
  const [openId, setOpenId] = useState(null);

  useEffect(() => {
    supportApi
      .list()
      .then((data) => setMessages(data.messages))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  const counts = useMemo(
    () => ({
      open: messages.filter((m) => m.status !== 'resolved').length,
      new: messages.filter((m) => m.status === 'new').length,
      resolved: messages.filter((m) => m.status === 'resolved').length,
    }),
    [messages]
  );

  const visible = messages.filter((m) =>
    filter === 'all' ? true : filter === 'open' ? m.status !== 'resolved' : m.status === filter
  );

  async function setStatus(message, status) {
    setError('');
    try {
      const data = await supportApi.setStatus(message.id, status);
      setMessages((list) => list.map((m) => (m.id === message.id ? data.message : m)));
    } catch (err) {
      setError(err.message);
    }
  }

  async function toggle(message) {
    const next = openId === message.id ? null : message.id;
    setOpenId(next);
    if (next && message.status === 'new') await setStatus(message, 'read');
  }

  async function remove(message) {
    if (!window.confirm(`Delete the message from ${message.name}? This cannot be undone.`)) return;
    try {
      await supportApi.remove(message.id);
      setMessages((list) => list.filter((m) => m.id !== message.id));
    } catch (err) {
      setError(err.message);
    }
  }

  return (
    <div className="p-6">
      <PageHeader title="Support" subtitle="Messages readers send through the Contact Us page." />
      <Alert>{error}</Alert>

      <FilterTabs
        value={filter}
        onChange={setFilter}
        options={[
          { id: 'open', label: 'Open', count: counts.open },
          { id: 'new', label: 'Unread', count: counts.new },
          { id: 'resolved', label: 'Resolved', count: counts.resolved },
          { id: 'all', label: 'All', count: messages.length },
        ]}
      />

      {loading ? (
        <p className="text-sm text-ink-500">Loading messages…</p>
      ) : visible.length === 0 ? (
        <EmptyState>No messages here.</EmptyState>
      ) : (
        <ul className="space-y-3">
          {visible.map((m) => {
            const open = openId === m.id;
            return (
              <li key={m.id} className="rounded-lg border border-ink-200 bg-white shadow-sm">
                <button
                  type="button"
                  onClick={() => toggle(m)}
                  aria-expanded={open}
                  className="flex w-full flex-wrap items-center gap-3 px-4 py-3 text-left"
                >
                  <StatusBadge status={m.status} />
                  <span className={`text-sm ${m.status === 'new' ? 'font-semibold text-ink-900' : 'text-ink-700'}`}>
                    {m.subject || 'No subject'}
                  </span>
                  <span className="text-sm text-ink-500">from {m.name}</span>
                  <span className="ml-auto text-xs text-ink-400">{formatDateTime(m.createdAt)}</span>
                </button>
                {open && (
                  <div className="border-t border-ink-100 px-4 py-4">
                    <p className="mb-3 text-sm text-ink-600">
                      <span className="font-medium text-ink-800">{m.name}</span> &lt;{m.email}&gt;
                    </p>
                    <p className="whitespace-pre-wrap text-sm leading-6 text-ink-800">{m.message}</p>
                    <div className="mt-4 flex flex-wrap gap-2">
                      <a
                        href={`mailto:${m.email}?subject=${encodeURIComponent(`Re: ${m.subject || 'Your message to North i'}`)}`}
                        className={secondaryButton}
                      >
                        Reply by email
                      </a>
                      {m.status !== 'resolved' ? (
                        <button type="button" className={secondaryButton} onClick={() => setStatus(m, 'resolved')}>
                          Mark resolved
                        </button>
                      ) : (
                        <button type="button" className={secondaryButton} onClick={() => setStatus(m, 'read')}>
                          Reopen
                        </button>
                      )}
                      <button type="button" className={`${dangerButton} inline-flex items-center gap-1.5`} onClick={() => remove(m)}>
                        <TrashIcon className="h-4 w-4" /> Delete
                      </button>
                    </div>
                  </div>
                )}
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
