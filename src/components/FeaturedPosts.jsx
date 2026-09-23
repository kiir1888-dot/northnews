import ArticleCard from './ArticleCard';
import SectionHeading from './SectionHeading';
import { useSite } from '../context/SiteContext';

/**
 * FeaturedPosts — the 3-column strip of the most recent stories, excluding
 * whichever one the hero is already showing.
 */
export default function FeaturedPosts() {
  const { newsItems, newsLoading } = useSite();

  if (newsLoading) return null;

  const featured = newsItems.slice(1, 4);
  if (featured.length === 0) return null;

  return (
    <section aria-label="Featured posts" className="mx-auto max-w-8xl px-4 py-8">
      <SectionHeading
        kicker="Editor’s selection"
        title="Featured Posts"
        description="Stories our desk believes deserve your full attention today."
      />

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {featured.map((article) => (
          <ArticleCard key={article.id} article={article} variant="horizontal" />
        ))}
      </div>
    </section>
  );
}
