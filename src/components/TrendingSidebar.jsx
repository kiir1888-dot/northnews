import ArticleCard from './ArticleCard';
import NewsletterForm from './NewsletterForm';
import { useSite } from '../context/SiteContext';
import { FlameIcon } from './Icons';

/**
 * TrendingSidebar — the stacked widget column:
 *   1. Trending Now (most recently published stories)
 *   2. Newsletter capture
 *   3. Editor's pick card
 *
 * Sticky on desktop; collapses into the normal document flow on mobile.
 */
export default function TrendingSidebar() {
  const { newsItems, newsLoading } = useSite();

  const trending = newsItems.slice(0, 5);
  const editorsPick = trending[0];

  if (!newsLoading && trending.length === 0) {
    return (
      <div className="flex flex-col gap-6 lg:sticky lg:top-44">
        <section className="surface rounded-xl p-5" aria-label="Trending now">
          <div className="mb-2 flex items-center gap-2 border-b border-ink-200 pb-3 dark:border-ink-800">
            <FlameIcon className="h-5 w-5 text-accent-500" />
            <h3 className="text-lg font-bold">Trending Now</h3>
          </div>
          <p className="py-4 text-sm text-ink-500 dark:text-ink-400">
            No stories published yet.
          </p>
        </section>

        <section className="rounded-xl bg-ink-950 p-5 text-white dark:bg-brand-950" aria-label="Newsletter">
          <p className="kicker mb-1 text-brand-300">Daily digest</p>
          <h3 className="mb-2 text-lg font-bold text-white">The North Briefing</h3>
          <p className="mb-4 text-sm leading-6 text-ink-300">
            Five stories, every weekday at 07:00. Free, and always will be.
          </p>
          <NewsletterForm variant="dark" />
        </section>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6 lg:sticky lg:top-44">
      {/* ---------------------------- trending ------------------------- */}
      <section className="surface rounded-xl p-5" aria-label="Trending now">
        <div className="mb-2 flex items-center gap-2 border-b border-ink-200 pb-3 dark:border-ink-800">
          <FlameIcon className="h-5 w-5 text-accent-500" />
          <h3 className="text-lg font-bold">Trending Now</h3>
        </div>
        <ol className="divide-y divide-ink-100 dark:divide-ink-800">
          {trending.map((article, i) => (
            <ArticleCard key={article.id} article={article} variant="minimal" rank={i + 1} />
          ))}
        </ol>
      </section>

      {/* --------------------------- newsletter ------------------------ */}
      <section className="rounded-xl bg-ink-950 p-5 text-white dark:bg-brand-950" aria-label="Newsletter">
        <p className="kicker mb-1 text-brand-300">Daily digest</p>
        <h3 className="mb-2 text-lg font-bold text-white">The North Briefing</h3>
        <p className="mb-4 text-sm leading-6 text-ink-300">
          Five stories, every weekday at 07:00. Free, and always will be.
        </p>
        <NewsletterForm variant="dark" />
      </section>

      {/* -------------------------- editor's pick ---------------------- */}
      {editorsPick && (
        <section className="surface overflow-hidden rounded-xl" aria-label="Editor's pick">
          <div className="border-b border-ink-200 px-5 py-3 dark:border-ink-800">
            <h3 className="text-lg font-bold">Editor’s Pick</h3>
          </div>
          <ArticleCard article={editorsPick} variant="horizontal" className="border-0 shadow-none" />
        </section>
      )}
    </div>
  );
}
