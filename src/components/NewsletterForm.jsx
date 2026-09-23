import { useState } from 'react';
import { cx } from '../utils/format';
import { CheckIcon } from './Icons';

/**
 * NewsletterForm — accessible email capture with inline validation.
 * Submission is simulated; wire `onSubmit` to a real endpoint when available.
 */
export default function NewsletterForm({ variant = 'light', className }) {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState('idle'); // idle | error | success
  const isDark = variant === 'dark';

  const handleSubmit = (e) => {
    e.preventDefault();
    const valid = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email.trim());
    if (!valid) {
      setStatus('error');
      return;
    }
    setStatus('success');
    setEmail('');
  };

  if (status === 'success') {
    return (
      <p
        className={cx(
          'flex items-center gap-2 rounded-lg px-3 py-3 text-sm',
          isDark ? 'bg-white/10 text-white' : 'bg-emerald-50 text-emerald-800',
          className
        )}
        role="status"
      >
        <CheckIcon className="h-5 w-5 shrink-0" />
        You’re subscribed. Look out for tomorrow’s briefing.
      </p>
    );
  }

  return (
    <form onSubmit={handleSubmit} className={cx('flex flex-col gap-2', className)} noValidate>
      <label htmlFor={`newsletter-${variant}`} className="sr-only">
        Email address
      </label>
      <div className="flex flex-col gap-2 sm:flex-row">
        <input
          id={`newsletter-${variant}`}
          type="email"
          value={email}
          onChange={(e) => {
            setEmail(e.target.value);
            if (status === 'error') setStatus('idle');
          }}
          placeholder="you@example.com"
          aria-invalid={status === 'error'}
          className={cx(
            'w-full rounded-lg border px-3 py-2.5 text-sm outline-none transition',
            isDark
              ? 'border-white/20 bg-white/10 text-white placeholder:text-white/50 focus:border-brand-300'
              : 'border-ink-300 bg-white text-ink-900 placeholder:text-ink-400 focus:border-brand-500 dark:border-ink-700 dark:bg-ink-900 dark:text-white',
            status === 'error' && 'border-accent-500'
          )}
        />
        <button
          type="submit"
          className={cx(
            'shrink-0 rounded-lg px-5 py-2.5 font-display text-sm font-medium uppercase tracking-wide transition',
            isDark
              ? 'bg-white text-ink-950 hover:bg-brand-200'
              : 'bg-ink-950 text-white hover:bg-brand-700 dark:bg-white dark:text-ink-950 dark:hover:bg-brand-200'
          )}
        >
          Subscribe
        </button>
      </div>
      {status === 'error' && (
        <p className="text-xs text-accent-500" role="alert">
          Please enter a valid email address.
        </p>
      )}
      <p className={cx('text-xs', isDark ? 'text-ink-400' : 'text-ink-500 dark:text-ink-400')}>
        No spam. Unsubscribe in one click.
      </p>
    </form>
  );
}
