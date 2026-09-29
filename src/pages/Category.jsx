import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import Breadcrumbs from '../components/Breadcrumbs';
import ArticleCard from '../components/ArticleCard';
import TrendingSidebar from '../components/TrendingSidebar';
import SectionHeading from '../components/SectionHeading';
import { NEWS_CATEGORIES } from '../admin/constants';
import { fetchNewsPage } from '../data/newsData';
import { categoryLabel, categorySlug } from '../utils/format';

/**
 * Category — a per-category news archive (e.g. /category/politics).
 * Stories are loaded from the server a page at a time. An unknown/missing
 * slug (e.g. /category/all) shows every published story.
 */
export default function Category() {
  const { categoryId } = useParams();
  const matchedCategory = NEWS_CATEGORIES.find((c) => categorySlug(c) === categorySlug(categoryId));
  const title = matchedCategory || categoryLabel(categoryId);

  const [items, setItems] = useState([]);
  const [hasMore, setHasMore] = useState(false);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError('');
    setItems([]);
    fetchNewsPage({ category: matchedCategory })
      .then((page) => {
        if (cancelled) return;
        setItems(page.items);
        setHasMore(page.hasMore);
      })
      .catch((err) => !cancelled && setError(err.message))
      .finally(() => !cancelled && setLoading(false));
    return () => {
      cancelled = true;
    };
  }, [matchedCategory]);

  async function loadMore() {
    setLoadingMore(true);
    try {
      const page = await fetchNewsPage({ category: matchedCategory, offset: items.length });
      setItems((prev) => {
        const seen = new Set(prev.map((n) => n.id));
        return [...prev, ...page.items.filter((n) => !seen.has(n.id))];
      });
      setHasMore(page.hasMore);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoadingMore(false);
    }
  }

  return (
    <>
      <Breadcrumbs items={[{ label: title }]} />

      <div className="mx-auto max-w-8xl px-4 py-8">
        <SectionHeading
          as="h1"
          kicker="Section archive"
          title={title}
          description="The latest stories, newest first."
        />

        <div className="grid gap-6 lg:grid-cols-12">
          <div className="lg:col-span-8">
            {loading ? (
              <p className="surface rounded-xl p-10 text-center text-sm text-ink-500 dark:text-ink-400">
                Loading stories…
              </p>
            ) : items.length === 0 ? (
              <p className="surface rounded-xl p-10 text-center text-sm text-ink-500 dark:text-ink-400">
                {error || 'Nothing published here yet.'}
              </p>
            ) : (
              <>
                <div className="grid gap-6 sm:grid-cols-2">
                  {items.map((a) => (
                    <ArticleCard key={a.id} article={a} className="animate-fadeUp" />
                  ))}
                </div>

                {hasMore && (
                  <div className="mt-8 text-center">
                    <button
                      type="button"
                      onClick={loadMore}
                      disabled={loadingMore}
                      className="rounded-lg border-2 border-ink-950 px-6 py-2.5 font-display text-sm font-medium uppercase tracking-wide transition hover:bg-ink-950 hover:text-white disabled:opacity-60 dark:border-white dark:hover:bg-white dark:hover:text-ink-950"
                    >
                      {loadingMore ? 'Loading…' : 'Load more stories'}
                    </button>
                  </div>
                )}
              </>
            )}
          </div>

          <div className="lg:col-span-4">
            <TrendingSidebar />
          </div>
        </div>
      </div>
    </>
  );
}
