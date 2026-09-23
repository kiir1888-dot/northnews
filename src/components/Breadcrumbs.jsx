import { Link } from 'react-router-dom';
import { ChevronRight } from './Icons';

/**
 * Breadcrumbs — nested navigation trail.
 * `items` is an ordered array of { label, to }. The final item is rendered as
 * the current page and marked with aria-current.
 */
export default function Breadcrumbs({ items = [] }) {
  const trail = [{ label: 'Home', to: '/' }, ...items];

  return (
    <nav aria-label="Breadcrumb" className="border-b border-ink-200 dark:border-ink-800">
      <ol className="mx-auto flex max-w-8xl flex-wrap items-center gap-1 px-4 py-3 font-display text-xs uppercase tracking-wider text-ink-500 dark:text-ink-400">
        {trail.map((item, i) => {
          const isLast = i === trail.length - 1;
          return (
            <li key={`${item.label}-${i}`} className="flex items-center gap-1">
              {isLast || !item.to ? (
                <span aria-current="page" className="font-medium text-ink-900 dark:text-ink-100">
                  {item.label}
                </span>
              ) : (
                <>
                  <Link to={item.to} className="transition hover:text-brand-600 dark:hover:text-brand-300">
                    {item.label}
                  </Link>
                  <ChevronRight className="h-3.5 w-3.5 text-ink-400" />
                </>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
