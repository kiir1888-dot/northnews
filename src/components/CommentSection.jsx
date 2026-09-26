import { useEffect, useState } from 'react';
import { formatDate } from '../utils/format';
import { getJson, postJson } from '../lib/publicApi';
import Honeypot from './Honeypot';

/**
 * CommentSection — shows approved comments for an article and lets readers
 * post new ones, which appear once the newsroom approves them.
 */
export default function CommentSection({ articleId }) {
  const [comments, setComments] = useState([]);
  const [form, setForm] = useState({ name: '', email: '', body: '' });
  const [trap, setTrap] = useState('');
  const [errors, setErrors] = useState({});
  const [sending, setSending] = useState(false);
  const [posted, setPosted] = useState(false);

  useEffect(() => {
    let cancelled = false;
    getJson(`/comments?articleId=${encodeURIComponent(articleId)}`)
      .then((data) => !cancelled && setComments(data.comments))
      .catch(() => !cancelled && setComments([]));
    return () => {
      cancelled = true;
    };
  }, [articleId]);

  const update = (field) => (e) => {
    setForm((f) => ({ ...f, [field]: e.target.value }));
    setErrors((prev) => ({ ...prev, [field]: undefined, form: undefined }));
    setPosted(false);
  };

  const validate = () => {
    const next = {};
    if (!form.name.trim()) next.name = 'Please enter your name.';
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(form.email.trim()))
      next.email = 'Please enter a valid email address.';
    if (form.body.trim().length < 10) next.body = 'Comments must be at least 10 characters.';
    return next;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const found = validate();
    if (Object.keys(found).length) {
      setErrors(found);
      return;
    }
    setSending(true);
    try {
      await postJson('/comments', { articleId, ...form, website: trap });
      setForm({ name: '', email: '', body: '' });
      setPosted(true);
    } catch (err) {
      setErrors({ form: err.message });
    } finally {
      setSending(false);
    }
  };

  const fieldClass = (field) =>
    `w-full rounded-lg border px-3 py-2.5 text-sm outline-none transition placeholder:text-ink-400 dark:bg-ink-900 ${
      errors[field]
        ? 'border-accent-500'
        : 'border-ink-300 focus:border-brand-500 dark:border-ink-700'
    }`;

  return (
    <section aria-label="Comments" className="mt-12 border-t border-ink-200 pt-8 dark:border-ink-800">
      <h2 className="mb-6 text-2xl font-black">
        Discussion <span className="text-ink-400">({comments.length})</span>
      </h2>

      {comments.length === 0 && (
        <p className="mb-8 text-sm text-ink-500 dark:text-ink-400">No comments yet. Be the first to share your view.</p>
      )}

      <ul className="mb-10 space-y-5">
        {comments.map((c) => (
          <li key={c.id} className="surface rounded-xl p-5">
            <div className="mb-2 flex flex-wrap items-center gap-3">
              <span className="grid h-9 w-9 place-items-center rounded-full bg-brand-600 font-display text-sm font-bold text-white">
                {c.name.charAt(0).toUpperCase()}
              </span>
              <div>
                <p className="text-sm font-medium">{c.name}</p>
                <p className="font-display text-[11px] uppercase tracking-wider text-ink-500 dark:text-ink-400">
                  {formatDate(c.createdAt)}
                </p>
              </div>
            </div>
            <p className="text-sm leading-7 text-ink-700 dark:text-ink-200">{c.body}</p>
          </li>
        ))}
      </ul>

      <form onSubmit={handleSubmit} noValidate className="surface relative rounded-xl p-5 sm:p-6">
        <Honeypot value={trap} onChange={(e) => setTrap(e.target.value)} />
        <h3 className="mb-1 text-xl font-bold">Leave a comment</h3>
        <p className="mb-5 text-sm text-ink-500 dark:text-ink-400">
          Your email address is never published. Comments are moderated before appearing.
        </p>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label htmlFor="comment-name" className="mb-1.5 block text-sm font-medium">
              Name
            </label>
            <input
              id="comment-name"
              value={form.name}
              onChange={update('name')}
              aria-invalid={Boolean(errors.name)}
              placeholder="Your name"
              className={fieldClass('name')}
            />
            {errors.name && (
              <p className="mt-1 text-xs text-accent-500" role="alert">
                {errors.name}
              </p>
            )}
          </div>

          <div>
            <label htmlFor="comment-email" className="mb-1.5 block text-sm font-medium">
              Email
            </label>
            <input
              id="comment-email"
              type="email"
              value={form.email}
              onChange={update('email')}
              aria-invalid={Boolean(errors.email)}
              placeholder="you@example.com"
              className={fieldClass('email')}
            />
            {errors.email && (
              <p className="mt-1 text-xs text-accent-500" role="alert">
                {errors.email}
              </p>
            )}
          </div>
        </div>

        <div className="mt-4">
          <label htmlFor="comment-body" className="mb-1.5 block text-sm font-medium">
            Comment
          </label>
          <textarea
            id="comment-body"
            rows={5}
            value={form.body}
            onChange={update('body')}
            aria-invalid={Boolean(errors.body)}
            placeholder="Add to the discussion…"
            className={fieldClass('body')}
          />
          {errors.body && (
            <p className="mt-1 text-xs text-accent-500" role="alert">
              {errors.body}
            </p>
          )}
        </div>

        {errors.form && (
          <p className="mt-4 rounded-lg bg-danger-50 px-3 py-2 text-sm text-danger-700" role="alert">
            {errors.form}
          </p>
        )}
        {posted && (
          <p className="mt-4 rounded-lg bg-emerald-50 px-3 py-2 text-sm text-emerald-800" role="status">
            Thank you. Your comment will appear here once the newsroom approves it.
          </p>
        )}

        <button
          type="submit"
          disabled={sending}
          className="mt-5 rounded-lg bg-ink-950 px-6 py-2.5 font-display text-sm font-medium uppercase tracking-wide text-white transition hover:bg-brand-700 disabled:opacity-60 dark:bg-white dark:text-ink-950 dark:hover:bg-brand-200"
        >
          {sending ? 'Posting…' : 'Post comment'}
        </button>
      </form>
    </section>
  );
}
