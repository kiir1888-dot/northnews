import { Link } from 'react-router-dom';
import ArticleCard from './ArticleCard';
import { useSite } from '../context/SiteContext';
import { formatDate } from '../utils/format';

/**
 * Hero — the two-part showcase grid:
 *   • LEFT  : prominent mega-feature card with overlay typography (the
 *             most recently published news item)
 *   • RIGHT : vertical "Latest Posts" rail with timestamp badges
 *
 * On mobile the rail stacks beneath the feature as a single scrollable column.
 */
export default function Hero() {
  const { newsItems, newsLoading } = useSite();

  if (newsLoading) return null;

  const [hero, ...rest] = newsItems;

  if (!hero) {
    return (
      <section aria-label="Top stories" className="mx-auto max-w-8xl px-4 py-8">
        <div className="surface rounded-2xl p-10 text-center text-sm text-ink-500 dark:text-ink-400">
          No stories published yet. Check back shortly.
        </div>
      </section>
    );
  }

  const latest = rest.slice(0, 5);

  return (
    <section aria-label="Top stories" className="mx-auto max-w-8xl px-4 py-8">
      <div className="grid gap-6 lg:grid-cols-12">
        {/* ------------------------- mega feature ------------------------ */}
        <article className="group relative overflow-hidden rounded-2xl lg:col-span-8">
          <Link to={`/article/${hero.id}`} className="block">
            {/* Fixed aspect ratio + object-cover keeps any image dimension safe */}
            <div className="aspect-[16/11] w-full bg-ink-200 dark:bg-ink-800 sm:aspect-[16/9] lg:aspect-[16/10]">
              {hero.imagePath ? (
                <img
                  src={hero.imagePath}
                  alt=""
                  className="h-full w-full object-cover transition duration-700 group-hover:scale-105"
                />
              ) : (
                <div className="grid h-full w-full place-items-center font-serif text-6xl font-black text-ink-400 dark:text-ink-600">
                  N
                </div>
              )}
            </div>

            {/* Gradient scrim guarantees legible overlay typography */}
            <div className="absolute inset-0 bg-gradient-to-t from-ink-950 via-ink-950/60 to-transparent" />

            <div className="absolute inset-x-0 bottom-0 p-5 text-white sm:p-8">
              <div className="mb-3 flex flex-wrap items-center gap-2">
                <span className="chip bg-white/15 text-white backdrop-blur">Lead Story</span>
              </div>

              <h1 className="max-w-3xl text-2xl font-black leading-tight sm:text-4xl lg:text-[2.75rem]">
                {hero.title}
              </h1>

              {hero.description && (
                <p className="mt-3 hidden max-w-2xl text-sm leading-7 text-white/85 sm:block">
                  {hero.description}
                </p>
              )}

              {hero.date && (
                <div className="mt-4 flex flex-wrap items-center gap-x-3 gap-y-2 font-display text-xs uppercase tracking-wider text-white/80">
                  <span>{formatDate(hero.date)}</span>
                </div>
              )}
            </div>
          </Link>
        </article>

        {/* ------------------------- latest posts rail ------------------- */}
        <aside className="surface flex flex-col rounded-2xl p-4 lg:col-span-4">
          <div className="mb-4 flex items-center justify-between border-b border-ink-200 pb-3 dark:border-ink-800">
            <h2 className="text-lg font-bold">Latest Posts</h2>
            <span className="chip bg-ink-100 text-ink-600 dark:bg-ink-800 dark:text-ink-300">
              Live
            </span>
          </div>

          {latest.length === 0 ? (
            <p className="py-6 text-center text-sm text-ink-500 dark:text-ink-400">
              More stories will appear here as they’re published.
            </p>
          ) : (
            <div className="rail-scroll flex flex-col gap-4 overflow-y-auto lg:max-h-[30rem]">
              {latest.map((article) => (
                <ArticleCard key={article.id} article={article} variant="rail" />
              ))}
            </div>
          )}

          <Link
            to="/category/all"
            className="mt-4 inline-flex items-center justify-center rounded-lg bg-ink-950 px-4 py-2.5 font-display text-sm font-medium uppercase tracking-wide text-white transition hover:bg-brand-700 dark:bg-white dark:text-ink-950 dark:hover:bg-brand-300"
          >
            View all stories
          </Link>
        </aside>
      </div>
    </section>
  );
}
