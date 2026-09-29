import { useMemo, useState } from 'react';
import ArticleCard from './ArticleCard';
import SectionHeading from './SectionHeading';
import TrendingSidebar from './TrendingSidebar';
import { useSite } from '../context/SiteContext';
import { cx } from '../utils/format';

const PAGE_SIZE = 6;

/**
 * NewsTabs — the "New Stories" section: a filterable, paginated grid of
 * every published news item, newest first, next to the trending sidebar.
 */
export default function NewsTabs() {
  const { newsItems, newsLoading, hasMoreNews, loadingMoreNews, loadMoreNews } = useSite();
  const [visible, setVisible] = useState(PAGE_SIZE);
  const [activeCategory, setActiveCategory] = useState('All');

  const categories = useMemo(() => {
    const unique = new Set(newsItems.map((item) => item.category).filter(Boolean));
    return ['All', ...Array.from(unique)];
  }, [newsItems]);

  const filtered =
    activeCategory === 'All'
      ? newsItems
      : newsItems.filter((item) => item.category === activeCategory);

  const shown = filtered.slice(0, visible);

  function handleSelectCategory(category) {
    setActiveCategory(category);
    setVisible(PAGE_SIZE);
  }

  return (
    <section aria-label="New stories" className="mx-auto max-w-8xl px-4 py-8">
      <SectionHeading
        kicker="Fresh off the desk"
        title="New Stories"
        description="Everything published by the newsroom, newest first."
      />

      {categories.length > 1 && (
        <div className="mb-6 flex flex-wrap gap-2">
          {categories.map((category) => (
            <button
              key={category}
              type="button"
              onClick={() => handleSelectCategory(category)}
              className={cx(
                'rounded-full border px-4 py-1.5 font-display text-xs font-medium uppercase tracking-wide transition',
                activeCategory === category
                  ? 'border-ink-950 bg-ink-950 text-white dark:border-white dark:bg-white dark:text-ink-950'
                  : 'border-ink-200 text-ink-600 hover:border-ink-400 dark:border-ink-700 dark:text-ink-300 dark:hover:border-ink-500'
              )}
            >
              {category}
            </button>
          ))}
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-12">
        {/* ------------------------- news grid ---------------------------- */}
        <div className="lg:col-span-8">
          {newsLoading ? (
            <p className="surface rounded-xl p-10 text-center text-sm text-ink-500 dark:text-ink-400">
              Loading stories…
            </p>
          ) : shown.length === 0 ? (
            <p className="surface rounded-xl p-10 text-center text-sm text-ink-500 dark:text-ink-400">
              {activeCategory === 'All'
                ? 'No stories published yet. Check back shortly.'
                : `No stories published in ${activeCategory} yet.`}
            </p>
          ) : (
            <>
              <div className="grid gap-6 sm:grid-cols-2">
                {shown.map((article) => (
                  <ArticleCard
                    key={article.id}
                    article={article}
                    className="animate-fadeUp"
                  />
                ))}
              </div>

              {(visible < filtered.length || hasMoreNews) && (
                <div className="mt-8 text-center">
                  <button
                    type="button"
                    disabled={loadingMoreNews}
                    onClick={() => {
                      // Fetch the next page from the server once the loaded stories run out.
                      if (visible + PAGE_SIZE > filtered.length && hasMoreNews) loadMoreNews();
                      setVisible((v) => v + PAGE_SIZE);
                    }}
                    className="rounded-lg border-2 border-ink-950 px-6 py-2.5 font-display text-sm font-medium uppercase tracking-wide transition hover:bg-ink-950 hover:text-white disabled:opacity-60 dark:border-white dark:hover:bg-white dark:hover:text-ink-950"
                  >
                    {loadingMoreNews ? 'Loading…' : 'Load more stories'}
                  </button>
                </div>
              )}
            </>
          )}
        </div>

        {/* --------------------------- sidebar --------------------------- */}
        <div className="lg:col-span-4">
          <TrendingSidebar />
        </div>
      </div>
    </section>
  );
}
