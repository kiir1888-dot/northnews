import { useParams } from 'react-router-dom';
import Breadcrumbs from '../components/Breadcrumbs';
import ArticleCard from '../components/ArticleCard';
import TrendingSidebar from '../components/TrendingSidebar';
import SectionHeading from '../components/SectionHeading';
import { useSite } from '../context/SiteContext';
import { categorySlug } from '../utils/format';

/**
 * Category — a per-category news archive (e.g. /category/politics).
 * Stories are matched by comparing the slugified route param against each
 * story's `category` field. An unknown/missing slug falls back to showing
 * every published story.
 */
export default function Category() {
  const { categoryId } = useParams();
  const { newsItems, newsLoading } = useSite();

  const matchSlug = categorySlug(categoryId);
  const matchedCategory = newsItems.find(
    (item) => categorySlug(item.category) === matchSlug
  )?.category;

  const filtered = matchedCategory
    ? newsItems.filter((item) => item.category === matchedCategory)
    : newsItems;

  const title = matchedCategory || 'All Stories';

  return (
    <>
      <Breadcrumbs items={[{ label: title }]} />

      <div className="mx-auto max-w-8xl px-4 py-8">
        <SectionHeading
          kicker="Section archive"
          title={title}
          description={`${filtered.length} ${
            filtered.length === 1 ? 'story' : 'stories'
          } published so far.`}
        />

        <div className="grid gap-6 lg:grid-cols-12">
          <div className="lg:col-span-8">
            {newsLoading ? (
              <p className="surface rounded-xl p-10 text-center text-sm text-ink-500 dark:text-ink-400">
                Loading stories…
              </p>
            ) : filtered.length === 0 ? (
              <p className="surface rounded-xl p-10 text-center text-sm text-ink-500 dark:text-ink-400">
                Nothing published here yet.
              </p>
            ) : (
              <div className="grid gap-6 sm:grid-cols-2">
                {filtered.map((a) => (
                  <ArticleCard key={a.id} article={a} className="animate-fadeUp" />
                ))}
              </div>
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
