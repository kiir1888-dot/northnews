import { Link } from 'react-router-dom';
import { cx, formatShortDate, timeAgo } from '../utils/format';

/** Shared placeholder shown wherever a news item has no uploaded image. */
function ImagePlaceholder({ className }) {
  return (
    <div
      className={cx(
        'grid h-full w-full place-items-center bg-ink-100 font-serif text-2xl font-black text-ink-300 dark:bg-ink-800 dark:text-ink-600',
        className
      )}
      aria-hidden="true"
    >
      N
    </div>
  );
}

/**
 * ArticleCard — the single reusable card primitive used by every grid.
 *
 * `variant` controls the layout:
 *   • 'grid'       — image on top, used by the New Stories grid (default)
 *   • 'horizontal' — image left / copy right, used by the Featured strip
 *   • 'rail'       — compact row with timestamp badge, used beside the hero
 *   • 'minimal'    — numbered text row, used by the Trending sidebar
 *
 * Defensive styling note: every image uses `object-cover` inside a fixed
 * aspect-ratio box, so source images of any dimension never break the grid.
 */
export default function ArticleCard({ article, variant = 'grid', rank, className }) {
  const to = `/article/${article.id}`;

  /* ----------------------------- minimal (trending) --------------------- */
  if (variant === 'minimal') {
    return (
      <li className={cx('group flex gap-3 py-3', className)}>
        <span className="font-serif text-2xl font-bold leading-none text-ink-300 dark:text-ink-700">
          {String(rank).padStart(2, '0')}
        </span>
        <div className="min-w-0">
          <Link to={to} className="block">
            <h4 className="line-clamp-2 text-sm font-medium leading-snug group-hover:text-brand-600 dark:group-hover:text-brand-300">
              {article.title}
            </h4>
          </Link>
          {article.date && (
            <p className="mt-1 font-display text-[11px] uppercase tracking-wider text-ink-500 dark:text-ink-400">
              {formatShortDate(article.date)}
            </p>
          )}
        </div>
      </li>
    );
  }

  /* ------------------------------- rail (latest) ------------------------ */
  if (variant === 'rail') {
    return (
      <article className={cx('group flex gap-3', className)}>
        <Link to={to} className="shrink-0">
          <div className="h-20 w-24 overflow-hidden rounded-md bg-ink-100 dark:bg-ink-800 sm:h-[4.5rem] sm:w-28">
            {article.imagePath ? (
              <img
                src={article.imagePath}
                alt=""
                loading="lazy"
                className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
              />
            ) : (
              <ImagePlaceholder />
            )}
          </div>
        </Link>
        <div className="min-w-0 flex-1">
          <div className="mb-1 flex flex-wrap items-center gap-2">
            {article.category && (
              <span className="chip bg-brand-50 text-brand-700 dark:bg-brand-900/40 dark:text-brand-300">
                {article.category}
              </span>
            )}
            {article.date && (
              <span className="rounded-full bg-ink-100 px-2 py-0.5 font-display text-[10px] font-medium uppercase tracking-wider text-ink-600 dark:bg-ink-800 dark:text-ink-300">
                {timeAgo(article.date)}
              </span>
            )}
          </div>
          <Link to={to}>
            <h3 className="line-clamp-2 text-[0.95rem] font-medium leading-snug group-hover:text-brand-600 dark:group-hover:text-brand-300">
              {article.title}
            </h3>
          </Link>
        </div>
      </article>
    );
  }

  /* ---------------------------- horizontal (featured) ------------------- */
  if (variant === 'horizontal') {
    return (
      <article
        className={cx(
          'surface card-hover group flex h-full flex-col overflow-hidden rounded-xl',
          className
        )}
      >
        <Link to={to} className="block overflow-hidden">
          <div className="aspect-[16/10] w-full bg-ink-100 dark:bg-ink-800">
            {article.imagePath ? (
              <img
                src={article.imagePath}
                alt=""
                loading="lazy"
                className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
              />
            ) : (
              <ImagePlaceholder />
            )}
          </div>
        </Link>
        <div className="flex flex-1 flex-col p-5">
          <Link to={to}>
            <h3 className="mb-2 text-xl font-bold leading-snug group-hover:text-brand-600 dark:group-hover:text-brand-300">
              {article.title}
            </h3>
          </Link>
          {/* Multi-sentence preview text, per the reference layout */}
          {article.description && (
            <p className="mb-4 line-clamp-3 text-sm leading-6 text-ink-600 dark:text-ink-300">
              {article.description}
            </p>
          )}
          <div className="mt-auto flex flex-wrap items-center gap-x-3 gap-y-1 border-t border-ink-100 pt-3 font-display text-xs uppercase tracking-wider text-ink-500 dark:border-ink-800 dark:text-ink-400">
            {article.category && (
              <span className="chip bg-brand-50 text-brand-700 dark:bg-brand-900/40 dark:text-brand-300">
                {article.category}
              </span>
            )}
            {article.date && <span>{formatShortDate(article.date)}</span>}
          </div>
        </div>
      </article>
    );
  }

  /* --------------------------------- grid ------------------------------- */
  return (
    <article
      className={cx(
        'surface card-hover group flex h-full flex-col overflow-hidden rounded-xl',
        className
      )}
    >
      <Link to={to} className="relative block overflow-hidden">
        <div className="aspect-[16/11] w-full bg-ink-100 dark:bg-ink-800">
          {article.imagePath ? (
            <img
              src={article.imagePath}
              alt=""
              loading="lazy"
              className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
            />
          ) : (
            <ImagePlaceholder />
          )}
        </div>
      </Link>
      <div className="flex flex-1 flex-col p-4">
        <Link to={to}>
          <h3 className="mb-2 line-clamp-2 text-lg font-bold leading-snug group-hover:text-brand-600 dark:group-hover:text-brand-300">
            {article.title}
          </h3>
        </Link>
        {article.description && (
          <p className="mb-4 line-clamp-2 text-sm leading-6 text-ink-600 dark:text-ink-300">
            {article.description}
          </p>
        )}
        <div className="mt-auto flex flex-wrap items-center gap-2 font-display text-[11px] uppercase tracking-wider text-ink-500 dark:text-ink-400">
          {article.category && (
            <span className="chip bg-brand-50 text-brand-700 dark:bg-brand-900/40 dark:text-brand-300">
              {article.category}
            </span>
          )}
          {article.date && <span>{formatShortDate(article.date)}</span>}
        </div>
      </div>
    </article>
  );
}
