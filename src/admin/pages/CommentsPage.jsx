import { useEffect, useMemo, useState } from 'react';
import { commentsApi } from '../api';
import { formatDateTime } from '../utils';
import { TrashIcon } from '../components/Icons';
import { Alert, EmptyState, FilterTabs, PageHeader, StatusBadge, secondaryButton } from '../components/ui';

/** Comments — approve or reject reader comments before they appear on articles. */
export default function CommentsPage() {
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState('pending');

  useEffect(() => {
    commentsApi
      .list()
      .then((data) => setComments(data.comments))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  const count = useMemo(() => {
    const c = { pending: 0, approved: 0, rejected: 0 };
    comments.forEach((x) => {
      c[x.status] += 1;
    });
    return c;
  }, [comments]);

  const visible = comments.filter((c) => filter === 'all' || c.status === filter);

  async function setStatus(comment, status) {
    setError('');
    try {
      await commentsApi.setStatus(comment.id, status);
      setComments((list) => list.map((c) => (c.id === comment.id ? { ...c, status } : c)));
    } catch (err) {
      setError(err.message);
    }
  }

  async function remove(comment) {
    if (!window.confirm(`Delete this comment by ${comment.name}?`)) return;
    try {
      await commentsApi.remove(comment.id);
      setComments((list) => list.filter((c) => c.id !== comment.id));
    } catch (err) {
      setError(err.message);
    }
  }

  return (
    <div className="p-6">
      <PageHeader title="Comments" subtitle="Reader comments only appear on the website after you approve them." />
      <Alert>{error}</Alert>

      <FilterTabs
        value={filter}
        onChange={setFilter}
        options={[
          { id: 'pending', label: 'Waiting', count: count.pending },
          { id: 'approved', label: 'Approved', count: count.approved },
          { id: 'rejected', label: 'Rejected', count: count.rejected },
          { id: 'all', label: 'All', count: comments.length },
        ]}
      />

      {loading ? (
        <p className="text-sm text-ink-500">Loading comments…</p>
      ) : visible.length === 0 ? (
        <EmptyState>{filter === 'pending' ? 'No comments waiting for review.' : 'No comments here.'}</EmptyState>
      ) : (
        <ul className="space-y-3">
          {visible.map((c) => (
            <li key={c.id} className="rounded-lg border border-ink-200 bg-white p-4 shadow-sm">
              <div className="mb-2 flex flex-wrap items-center gap-2 text-sm">
                <StatusBadge status={c.status} />
                <span className="font-medium text-ink-900">{c.name}</span>
                <span className="text-ink-500">&lt;{c.email}&gt;</span>
                <span className="ml-auto text-xs text-ink-400">{formatDateTime(c.createdAt)}</span>
              </div>
              <p className="mb-2 text-xs text-ink-500">
                On{' '}
                <a
                  href={`/article/${c.articleId}`}
                  target="_blank"
                  rel="noreferrer"
                  className="font-medium text-brand-600 hover:underline"
                >
                  {c.articleTitle || 'a deleted article'}
                </a>
              </p>
              <p className="whitespace-pre-wrap text-sm leading-6 text-ink-800">{c.body}</p>
              <div className="mt-3 flex flex-wrap gap-2">
                {c.status !== 'approved' && (
                  <button
                    type="button"
                    className="rounded-md bg-emerald-600 px-3 py-1.5 text-sm font-medium text-white transition hover:bg-emerald-700"
                    onClick={() => setStatus(c, 'approved')}
                  >
                    Approve
                  </button>
                )}
                {c.status !== 'rejected' && (
                  <button type="button" className={secondaryButton} onClick={() => setStatus(c, 'rejected')}>
                    {c.status === 'approved' ? 'Hide' : 'Reject'}
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => remove(c)}
                  aria-label="Delete comment"
                  className="rounded-md p-1.5 text-ink-400 transition hover:bg-danger-50 hover:text-danger-600"
                >
                  <TrashIcon className="h-4 w-4" />
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
