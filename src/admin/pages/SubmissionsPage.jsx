import { useEffect, useMemo, useState } from 'react';
import { submissionsApi } from '../api';
import { formatDateTime } from '../utils';
import { TrashIcon } from '../components/Icons';
import { Alert, EmptyState, FilterTabs, PageHeader, StatusBadge, inputClass, secondaryButton } from '../components/ui';

const STATUS_LABELS = { new: 'New', reviewing: 'Reviewing', accepted: 'Accepted', rejected: 'Rejected' };

function SubmissionDetail({ item, onChange, onDelete }) {
  const [notes, setNotes] = useState(item.notes || '');
  const [saving, setSaving] = useState(false);

  async function saveNotes() {
    setSaving(true);
    await onChange(item, { notes });
    setSaving(false);
  }

  return (
    <div className="border-t border-ink-100 px-4 py-4">
      <p className="mb-3 text-sm text-ink-600">
        <span className="font-medium text-ink-800">{item.name}</span> &lt;{item.email}&gt;
        {item.phone && <span> · {item.phone}</span>}
      </p>
      <p className="whitespace-pre-wrap text-sm leading-6 text-ink-800">{item.story}</p>
      {item.imagePath && (
        <a href={item.imagePath} target="_blank" rel="noreferrer" className="mt-4 block w-fit">
          <img src={item.imagePath} alt="Submitted" className="max-h-64 rounded-md border border-ink-200" />
        </a>
      )}

      <div className="mt-5 grid gap-4 sm:grid-cols-[12rem_minmax(0,1fr)]">
        <label className="block">
          <span className="mb-1.5 block text-sm font-medium text-ink-700">Status</span>
          <select
            value={item.status}
            onChange={(e) => onChange(item, { status: e.target.value })}
            className={inputClass}
          >
            {Object.entries(STATUS_LABELS).map(([id, label]) => (
              <option key={id} value={id}>
                {label}
              </option>
            ))}
          </select>
        </label>
        <label className="block">
          <span className="mb-1.5 block text-sm font-medium text-ink-700">Private notes for the team</span>
          <textarea rows={2} value={notes} onChange={(e) => setNotes(e.target.value)} className={inputClass} />
        </label>
      </div>

      <div className="mt-3 flex flex-wrap gap-2">
        <button type="button" onClick={saveNotes} disabled={saving || notes === (item.notes || '')} className={secondaryButton}>
          {saving ? 'Saving…' : 'Save notes'}
        </button>
        <a
          href={`mailto:${item.email}?subject=${encodeURIComponent(`Your story: ${item.headline}`)}`}
          className={secondaryButton}
        >
          Reply by email
        </a>
        <button
          type="button"
          onClick={() => onDelete(item)}
          aria-label="Delete submission"
          className="rounded-md p-1.5 text-ink-400 transition hover:bg-danger-50 hover:text-danger-600"
        >
          <TrashIcon className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}

/** Submissions — stories sent in by readers through the "Submit a story" page. */
export default function SubmissionsPage() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState('open');
  const [openId, setOpenId] = useState(null);

  useEffect(() => {
    submissionsApi
      .list()
      .then((data) => setItems(data.submissions))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  const counts = useMemo(() => {
    const c = { new: 0, reviewing: 0, accepted: 0, rejected: 0 };
    items.forEach((i) => {
      c[i.status] += 1;
    });
    return c;
  }, [items]);

  const visible = items.filter((i) =>
    filter === 'all' ? true : filter === 'open' ? ['new', 'reviewing'].includes(i.status) : i.status === filter
  );

  async function update(item, patch) {
    setError('');
    try {
      const data = await submissionsApi.update(item.id, patch);
      setItems((list) => list.map((i) => (i.id === item.id ? data.submission : i)));
    } catch (err) {
      setError(err.message);
    }
  }

  async function remove(item) {
    if (!window.confirm(`Delete "${item.headline}"? This cannot be undone.`)) return;
    try {
      await submissionsApi.remove(item.id);
      setItems((list) => list.filter((i) => i.id !== item.id));
    } catch (err) {
      setError(err.message);
    }
  }

  function toggle(item) {
    const next = openId === item.id ? null : item.id;
    setOpenId(next);
    if (next && item.status === 'new') update(item, { status: 'reviewing' });
  }

  return (
    <div className="p-6">
      <PageHeader
        title="Submissions"
        subtitle="Stories readers send through the Submit a story page. To publish one, write it up under Content, then News."
      />
      <Alert>{error}</Alert>

      <FilterTabs
        value={filter}
        onChange={setFilter}
        options={[
          { id: 'open', label: 'To review', count: counts.new + counts.reviewing },
          { id: 'accepted', label: 'Accepted', count: counts.accepted },
          { id: 'rejected', label: 'Rejected', count: counts.rejected },
          { id: 'all', label: 'All', count: items.length },
        ]}
      />

      {loading ? (
        <p className="text-sm text-ink-500">Loading submissions…</p>
      ) : visible.length === 0 ? (
        <EmptyState>No submissions here.</EmptyState>
      ) : (
        <ul className="space-y-3">
          {visible.map((item) => (
            <li key={item.id} className="rounded-lg border border-ink-200 bg-white shadow-sm">
              <button
                type="button"
                onClick={() => toggle(item)}
                aria-expanded={openId === item.id}
                className="flex w-full flex-wrap items-center gap-3 px-4 py-3 text-left"
              >
                <StatusBadge status={item.status} />
                <span className={`text-sm ${item.status === 'new' ? 'font-semibold text-ink-900' : 'text-ink-700'}`}>
                  {item.headline}
                </span>
                <span className="text-sm text-ink-500">by {item.name}</span>
                <span className="ml-auto text-xs text-ink-400">{formatDateTime(item.createdAt)}</span>
              </button>
              {openId === item.id && <SubmissionDetail item={item} onChange={update} onDelete={remove} />}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
