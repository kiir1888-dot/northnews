import { Link } from 'react-router-dom';
import { useSite } from '../context/SiteContext';
import { formatShortDate } from '../utils/format';
import { CloseIcon, SearchIcon } from './Icons';

/**
 * SearchOverlay — full-screen search driven entirely by context state.
 * Results filter live as the user types; no navigation or reload occurs.
 */
export default function SearchOverlay() {
  const { isSearchOpen, closeSearch, searchQuery, setSearchQuery, searchResults } = useSite();

  if (!isSearchOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 bg-ink-950/70 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-label="Search articles"
      onClick={closeSearch}
    >
      <div
        className="mx-auto mt-24 w-[min(46rem,92vw)] overflow-hidden rounded-2xl bg-white shadow-2xl dark:bg-ink-900"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center gap-3 border-b border-ink-200 px-4 dark:border-ink-800">
          <SearchIcon className="h-5 w-5 shrink-0 text-ink-400" />
          <input
            autoFocus
            type="search"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search stories, topics, tags…"
            aria-label="Search stories"
            className="w-full bg-transparent py-4 text-base outline-none placeholder:text-ink-400"
          />
          <button
            type="button"
            onClick={closeSearch}
            aria-label="Close search"
            className="rounded-full p-2 text-ink-500 transition hover:bg-ink-100 dark:hover:bg-ink-800"
          >
            <CloseIcon className="h-5 w-5" />
          </button>
        </div>

        <div className="max-h-[55vh] overflow-y-auto rail-scroll">
          {searchQuery.trim() === '' ? (
            <p className="px-5 py-8 text-center text-sm text-ink-500 dark:text-ink-400">
              Start typing to search the North i archive.
            </p>
          ) : searchResults.length === 0 ? (
            <p className="px-5 py-8 text-center text-sm text-ink-500 dark:text-ink-400">
              No stories match “{searchQuery}”.
            </p>
          ) : (
            <ul className="divide-y divide-ink-100 dark:divide-ink-800">
              {searchResults.map((a) => (
                <li key={a.id}>
                  <Link
                    to={`/article/${a.id}`}
                    onClick={closeSearch}
                    className="flex gap-3 px-4 py-3 transition hover:bg-ink-50 dark:hover:bg-ink-800"
                  >
                    <div className="h-16 w-20 shrink-0 overflow-hidden rounded-md bg-ink-100 dark:bg-ink-800">
                      {a.imagePath ? (
                        <img src={a.imagePath} alt="" loading="lazy" className="h-full w-full object-cover" />
                      ) : (
                        <div className="grid h-full w-full place-items-center font-serif text-lg font-black text-ink-300 dark:text-ink-600">
                          N
                        </div>
                      )}
                    </div>
                    <div className="min-w-0">
                      <h4 className="line-clamp-2 text-sm font-medium leading-snug">{a.title}</h4>
                      {a.date && (
                        <p className="mt-1 font-display text-[11px] uppercase tracking-wider text-ink-500 dark:text-ink-400">
                          {formatShortDate(a.date)}
                        </p>
                      )}
                    </div>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </div>

        {searchResults.length > 0 && (
          <p className="border-t border-ink-100 px-4 py-2 text-xs text-ink-500 dark:border-ink-800 dark:text-ink-400">
            {searchResults.length} {searchResults.length === 1 ? 'story' : 'stories'} found · press
            Esc to close
          </p>
        )}
      </div>
    </div>
  );
}
