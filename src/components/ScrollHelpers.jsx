import { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { ArrowUp } from './Icons';

/** Resets scroll position on every route change. */
export function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' in window ? 'auto' : 'auto' });
  }, [pathname]);
  return null;
}

/** Floating "back to top" button, revealed after the first viewport. */
export default function BackToTopButton() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const onScroll = () => setVisible(window.scrollY > 700);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  if (!visible) return null;

  return (
    <button
      type="button"
      onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
      aria-label="Back to top"
      className="fixed bottom-20 right-4 z-30 grid h-11 w-11 place-items-center rounded-full bg-ink-950 text-white shadow-lg transition hover:bg-brand-700 xl:bottom-6 dark:bg-white dark:text-ink-950"
    >
      <ArrowUp className="h-5 w-5" />
    </button>
  );
}
