import { Link } from 'react-router-dom';
import ArticleCard from '../components/ArticleCard';
import { useSite } from '../context/SiteContext';

/** NotFound — 404 page with a route back into the archive. */
export default function NotFound() {
  const { newsItems } = useSite();
  const suggestions = newsItems.slice(0, 3);

  return (
    <div className="mx-auto max-w-8xl px-4 py-20">
      <div className="mx-auto max-w-2xl text-center">
        <p className="kicker mb-2">Error 404</p>
        <h1 className="text-4xl font-black leading-tight sm:text-6xl">Page not found</h1>
        <p className="mt-4 text-base leading-7 text-ink-600 dark:text-ink-300">
          The page you requested doesn’t exist, or it may have moved. Here are three stories worth
          your time instead.
        </p>
        <Link
          to="/"
          className="mt-6 inline-block rounded-lg bg-ink-950 px-6 py-3 font-display text-sm font-medium uppercase tracking-wide text-white transition hover:bg-brand-700 dark:bg-white dark:text-ink-950"
        >
          Back to the front page
        </Link>
      </div>

      <div className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {suggestions.map((a) => (
          <ArticleCard key={a.id} article={a} />
        ))}
      </div>
    </div>
  );
}
