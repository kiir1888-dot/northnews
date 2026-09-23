import { useState } from 'react';
import { formatDate } from '../utils/format';

/** Seed comments so the thread is never empty on first view. */
const seedComments = [
  {
    id: 'c-1',
    name: 'Ifeoma Chukwu',
    createdAt: '2026-09-21T08:12:00Z',
    body: 'Useful breakdown. The point about regional variation is the one most coverage skips — would be good to see the state-level table published alongside this.',
  },
  {
    id: 'c-2',
    name: 'Samuel Trent',
    createdAt: '2026-09-21T09:47:00Z',
    body: 'Strong reporting. Any indication of when the consultation documents will be made public?',
  },
];

/**
 * CommentSection — interactive comment field with client-side validation.
 * Comments are held in local state (mock backend); wire the submit handler to
 * a real API when one is available.
 */
export default function CommentSection({ articleId }) {
  const [comments, setComments] = useState(seedComments);
  const [form, setForm] = useState({ name: '', email: '', body: '' });
  const [errors, setErrors] = useState({});

  const update = (field) => (e) => {
    setForm((f) => ({ ...f, [field]: e.target.value }));
    setErrors((prev) => ({ ...prev, [field]: undefined }));
  };

  const validate = () => {
    const next = {};
    if (!form.name.trim()) next.name = 'Please enter your name.';
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(form.email.trim()))
      next.email = 'Please enter a valid email address.';
    if (form.body.trim().length < 10) next.body = 'Comments must be at least 10 characters.';
    return next;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const found = validate();
    if (Object.keys(found).length) {
      setErrors(found);
      return;
    }
    setComments((prev) => [
      ...prev,
      {
        id: `${articleId}-${Date.now()}`,
        name: form.name.trim(),
        createdAt: new Date().toISOString(),
        body: form.body.trim(),
      },
    ]);
    setForm({ name: '', email: '', body: '' });
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

      <form onSubmit={handleSubmit} noValidate className="surface rounded-xl p-5 sm:p-6">
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

        <button
          type="submit"
          className="mt-5 rounded-lg bg-ink-950 px-6 py-2.5 font-display text-sm font-medium uppercase tracking-wide text-white transition hover:bg-brand-700 dark:bg-white dark:text-ink-950 dark:hover:bg-brand-200"
        >
          Post comment
        </button>
      </form>
    </section>
  );
}
