import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useSite } from '../context/SiteContext';

/**
 * CookieConsent — subtle, accessible consent banner shown on first load.
 * The decision is persisted in localStorage under `cookieNotice.storageKey`,
 * so the banner never reappears once answered.
 */
export default function CookieConsent() {
  const { config } = useSite();
  const notice = config.cookieNotice;
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    let stored = null;
    try {
      stored = localStorage.getItem(notice.storageKey);
    } catch {
      /* storage blocked — show the banner but it won't persist */
    }
    if (!stored) {
      // Short delay so the banner animates in after first paint.
      const id = setTimeout(() => setVisible(true), 900);
      return () => clearTimeout(id);
    }
    return undefined;
  }, [notice.storageKey]);

  const decide = (value) => {
    try {
      localStorage.setItem(notice.storageKey, value);
    } catch {
      /* ignore */
    }
    setVisible(false);
  };

  if (!visible) return null;

  return (
    <div
      role="dialog"
      aria-live="polite"
      aria-label="Cookie consent"
      className="fixed inset-x-0 bottom-0 z-50 animate-fadeUp p-3 sm:p-4"
    >
      <div className="mx-auto flex max-w-5xl flex-col gap-4 rounded-2xl border border-ink-200 bg-white/95 p-4 shadow-2xl backdrop-blur sm:flex-row sm:items-center dark:border-ink-700 dark:bg-ink-900/95">
        <div className="flex-1">
          <h2 className="text-base font-bold">{notice.heading}</h2>
          <p className="mt-1 text-sm leading-6 text-ink-600 dark:text-ink-300">
            {notice.body}{' '}
            <Link
              to={notice.policyTo}
              className="font-medium text-brand-600 underline underline-offset-2 dark:text-brand-300"
            >
              {notice.policyLabel}
            </Link>
            .
          </p>
        </div>

        <div className="flex shrink-0 flex-wrap gap-2">
          <button
            type="button"
            onClick={() => decide('essential')}
            className="rounded-lg border border-ink-300 px-4 py-2.5 font-display text-sm font-medium uppercase tracking-wide transition hover:bg-ink-100 dark:border-ink-600 dark:hover:bg-ink-800"
          >
            {notice.rejectLabel}
          </button>
          <button
            type="button"
            onClick={() => decide('all')}
            className="rounded-lg bg-ink-950 px-4 py-2.5 font-display text-sm font-medium uppercase tracking-wide text-white transition hover:bg-brand-700 dark:bg-white dark:text-ink-950 dark:hover:bg-brand-200"
          >
            {notice.acceptLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
