import { Link, useParams } from 'react-router-dom';
import Breadcrumbs from '../components/Breadcrumbs';
import ArticleCard from '../components/ArticleCard';
import ShareBar from '../components/ShareBar';
import CommentSection from '../components/CommentSection';
import TrendingSidebar from '../components/TrendingSidebar';
import { useSite } from '../context/SiteContext';
import { formatDate } from '../utils/format';

/**
 * Article — the single-article reading layout.
 * Includes breadcrumbs, hero image, sticky share bar, related stories and
 * the comment thread. Content comes entirely from what the admin published.
 */
export default function Article() {
  const { slug: id } = useParams();
  const { newsItems, newsLoading } = useSite();
  const article = newsItems.find((n) => String(n.id) === id);

  if (newsLoading) return null;

  if (!article) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-24 text-center">
        <h1 className="mb-3 text-3xl font-black">Story not found</h1>
        <p className="mb-6 text-ink-600 dark:text-ink-300">
          The article you’re looking for may have been moved or unpublished.
        </p>
        <Link
          to="/"
          className="inline-block rounded-lg bg-ink-950 px-6 py-2.5 font-display text-sm font-medium uppercase tracking-wide text-white dark:bg-white dark:text-ink-950"
        >
          Return home
        </Link>
      </div>
    );
  }

  const related = newsItems.filter((n) => n.id !== article.id).slice(0, 3);

  return (
    <>
      <Breadcrumbs items={[{ label: 'News', to: '/category/all' }, { label: article.title }]} />

      <div className="mx-auto max-w-8xl px-4 pb-20 pt-8">
        <div className="grid gap-8 lg:grid-cols-12">
          {/* Sticky share rail (desktop) / fixed bar (mobile) */}
          <div className="lg:col-span-1">
            <ShareBar title={article.title} />
          </div>

          {/* ---------------------------- article ---------------------- */}
          <article className="lg:col-span-7">
            <header className="mb-6">
              <h1 className="text-3xl font-black leading-tight sm:text-4xl lg:text-[2.6rem]">
                {article.title}
              </h1>

              {article.date && (
                <div className="mt-5 flex flex-wrap items-center gap-x-3 gap-y-2 border-y border-ink-200 py-3 font-display text-xs uppercase tracking-wider text-ink-500 dark:border-ink-800 dark:text-ink-400">
                  <time dateTime={article.date}>{formatDate(article.date)}</time>
                </div>
              )}
            </header>

            {article.imagePath && (
              <figure className="mb-8">
                <div className="aspect-[16/9] w-full overflow-hidden rounded-xl bg-ink-100 dark:bg-ink-800">
                  <img src={article.imagePath} alt="" className="h-full w-full object-cover" />
                </div>
              </figure>
            )}

            {article.description && (
              <div className="article-body">
                <p>{article.description}</p>
              </div>
            )}

            <CommentSection articleId={article.id} />
          </article>

          {/* ---------------------------- sidebar ---------------------- */}
          <div className="lg:col-span-4">
            <TrendingSidebar />
          </div>
        </div>

        {/* --------------------------- related ------------------------ */}
        {related.length > 0 && (
          <section aria-label="Related stories" className="mt-14">
            <h2 className="mb-6 border-b border-ink-200 pb-3 text-2xl font-black dark:border-ink-800">
              More stories
            </h2>
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {related.map((a) => (
                <ArticleCard key={a.id} article={a} />
              ))}
            </div>
          </section>
        )}
      </div>
    </>
  );
}
