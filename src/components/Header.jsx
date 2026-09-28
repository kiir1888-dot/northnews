import { useEffect, useState } from 'react';
import { Link, NavLink, useLocation } from 'react-router-dom';
import { useSite } from '../context/SiteContext';
import { cx } from '../utils/format';
import {
  CloseIcon,
  MenuIcon,
  MoonIcon,
  SearchIcon,
  SunIcon,
  socialIconMap,
} from './Icons';
import SearchOverlay from './SearchOverlay';

/** Live, locale-aware clock for the utility bar. */
function LocalClock({ locale, timeZone }) {
  const [now, setNow] = useState(() => new Date());

  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 30_000);
    return () => clearInterval(id);
  }, []);

  const date = now.toLocaleDateString(locale, {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    timeZone,
  });
  const time = now.toLocaleTimeString(locale, {
    hour: '2-digit',
    minute: '2-digit',
    timeZone,
  });

  return (
    <span className="whitespace-nowrap">
      {date} · {time} ({timeZone.split('/')[1]?.replace('_', ' ')})
    </span>
  );
}

/**
 * Header — utility bar (date/time, socials, theme, search),
 * masthead with the NORTH i logo and primary navigation,
 * and the dynamic breaking-news ticker.
 */
export default function Header() {
  const { config, theme, toggleTheme, openSearch, newsItems } = useSite();
  const { brand, navigation, socials } = config;
  const breakingNews = newsItems.slice(0, 8).map((n) => n.title);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const location = useLocation();

  // Close the mobile drawer whenever the route changes.
  useEffect(() => setMobileOpen(false), [location.pathname]);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <header className="sticky top-0 z-40">
      {/* ---------------------------- utility bar ------------------------ */}
      <div className="hidden bg-ink-950 text-ink-300 lg:block">
        <div className="mx-auto flex max-w-8xl items-center justify-between gap-4 px-4 py-2 text-xs">
          <LocalClock locale={brand.locale} timeZone={brand.timeZone} />

          <div className="flex items-center gap-4">
            <nav aria-label="Social media" className="flex items-center gap-2">
              {socials.map((s) => {
                const Icon = socialIconMap[s.id];
                return (
                  <a
                    key={s.id}
                    href={s.href}
                    target="_blank"
                    rel="noreferrer noopener"
                    aria-label={s.label}
                    className="rounded p-1 transition hover:bg-white/10 hover:text-white"
                  >
                    {Icon ? <Icon className="h-4 w-4" /> : s.label}
                  </a>
                );
              })}
            </nav>

            <span className="h-4 w-px bg-white/20" aria-hidden="true" />

            <button
              type="button"
              onClick={toggleTheme}
              aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} theme`}
              className="inline-flex items-center gap-2 rounded-full border border-white/20 px-3 py-1 transition hover:bg-white/10 hover:text-white"
            >
              {theme === 'dark' ? (
                <SunIcon className="h-4 w-4" />
              ) : (
                <MoonIcon className="h-4 w-4" />
              )}
              <span>{theme === 'dark' ? 'Light' : 'Dark'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* ------------------------------ masthead ------------------------- */}
      <div
        className={cx(
          'border-b border-ink-200 bg-white/95 backdrop-blur transition-shadow dark:border-ink-800 dark:bg-ink-950/95',
          scrolled && 'shadow-md'
        )}
      >
        <div className="mx-auto flex max-w-8xl items-center justify-between gap-4 px-4 py-3">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2" aria-label={`${brand.name} home`}>
            <span
              aria-hidden="true"
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-ink-950 font-serif text-sm font-black tracking-tight text-white shadow-sm ring-1 ring-ink-950/10 transition-transform duration-200 hover:scale-105 dark:bg-white dark:text-ink-950 dark:ring-white/10"
            >
              N<span className="text-[#e10600]">i</span>
            </span>
            <span className="leading-none">
              <span className="font-serif text-2xl font-black tracking-tight">
                {brand.nameParts.primary}
                <span className="text-accent-500"> {brand.nameParts.accent}</span>
              </span>
              <span className="mt-0.5 hidden font-display text-[11px] lowercase tracking-[0.12em] text-ink-500 dark:text-ink-400 sm:block">
                {brand.tagline}
              </span>
            </span>
          </Link>

          {/* Desktop navigation */}
          <nav aria-label="Primary" className="hidden items-center gap-1 xl:flex">
            {navigation.map((item) => (
              <NavLink
                key={item.label}
                to={item.to}
                end={item.to === '/'}
                className={({ isActive }) =>
                  cx(
                    'rounded-md px-3 py-2 font-display text-sm font-medium uppercase tracking-wide transition',
                    isActive
                      ? 'bg-ink-100 text-brand-700 dark:bg-ink-800 dark:text-brand-300'
                      : 'text-ink-700 hover:bg-ink-100 hover:text-brand-600 dark:text-ink-200 dark:hover:bg-ink-800'
                  )
                }
              >
                {item.label}
              </NavLink>
            ))}
          </nav>

          {/* Actions */}
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={openSearch}
              aria-label="Search articles"
              className="rounded-full p-2.5 text-ink-700 transition hover:bg-ink-100 dark:text-ink-200 dark:hover:bg-ink-800"
            >
              <SearchIcon className="h-5 w-5" />
            </button>

            <button
              type="button"
              onClick={toggleTheme}
              aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} theme`}
              className="rounded-full p-2.5 text-ink-700 transition hover:bg-ink-100 dark:text-ink-200 dark:hover:bg-ink-800 lg:hidden"
            >
              {theme === 'dark' ? <SunIcon className="h-5 w-5" /> : <MoonIcon className="h-5 w-5" />}
            </button>

            <button
              type="button"
              onClick={() => setMobileOpen((o) => !o)}
              aria-expanded={mobileOpen}
              aria-controls="mobile-nav"
              aria-label="Toggle navigation menu"
              className="rounded-full p-2.5 text-ink-700 transition hover:bg-ink-100 dark:text-ink-200 dark:hover:bg-ink-800 xl:hidden"
            >
              {mobileOpen ? <CloseIcon className="h-5 w-5" /> : <MenuIcon className="h-5 w-5" />}
            </button>
          </div>
        </div>

        {/* Mobile drawer — stacks into a single scrollable column */}
        {mobileOpen && (
          <nav
            id="mobile-nav"
            aria-label="Mobile"
            className="max-h-[70vh] overflow-y-auto border-t border-ink-200 px-4 py-3 dark:border-ink-800 xl:hidden"
          >
            <ul className="grid gap-1 sm:grid-cols-2">
              {navigation.map((item) => (
                <li key={item.label}>
                  <NavLink
                    to={item.to}
                    end={item.to === '/'}
                    className={({ isActive }) =>
                      cx(
                        'block rounded-md px-3 py-2.5 font-display text-sm font-medium uppercase tracking-wide',
                        isActive
                          ? 'bg-ink-100 text-brand-700 dark:bg-ink-800 dark:text-brand-300'
                          : 'text-ink-700 hover:bg-ink-100 dark:text-ink-200 dark:hover:bg-ink-800'
                      )
                    }
                  >
                    {item.label}
                  </NavLink>
                </li>
              ))}
            </ul>

            <div className="mt-3 flex items-center gap-2 border-t border-ink-200 pt-3 dark:border-ink-800">
              {socials.map((s) => {
                const Icon = socialIconMap[s.id];
                return (
                  <a
                    key={s.id}
                    href={s.href}
                    target="_blank"
                    rel="noreferrer noopener"
                    aria-label={s.label}
                    className="rounded-full border border-ink-200 p-2 text-ink-600 transition hover:text-brand-600 dark:border-ink-700 dark:text-ink-300"
                  >
                    {Icon ? <Icon className="h-4 w-4" /> : s.label}
                  </a>
                );
              })}
            </div>
          </nav>
        )}
      </div>

      {/* -------------------------- breaking ticker ---------------------- */}
      <div className="flex items-stretch overflow-hidden border-b border-ink-200 bg-white dark:border-ink-800 dark:bg-ink-950">
        <span className="z-10 flex shrink-0 items-center gap-2 bg-accent-500 px-3 py-2 font-display text-xs font-bold uppercase tracking-[0.16em] text-white sm:px-4">
          <span className="h-2 w-2 animate-pulse rounded-full bg-white" aria-hidden="true" />
          Breaking
        </span>
        <div className="relative flex-1 overflow-hidden" role="marquee" aria-label="Breaking news">
          {/* Duplicated list creates a seamless infinite loop. */}
          {breakingNews.length === 0 ? (
            <div className="flex items-center py-2 pl-6">
              <span className="whitespace-nowrap text-sm text-ink-500 dark:text-ink-400">
                Stay tuned. The latest headlines will appear here as soon as they’re published.
              </span>
            </div>
          ) : (
            <div className="ticker-track flex w-max animate-ticker items-center gap-10 py-2 pl-6">
              {[...breakingNews, ...breakingNews].map((item, i) => (
                <span
                  key={`${item}-${i}`}
                  className="whitespace-nowrap text-sm text-ink-700 dark:text-ink-200"
                >
                  <span className="mr-2 text-accent-500" aria-hidden="true">
                    ●
                  </span>
                  {item}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>

      <SearchOverlay />
    </header>
  );
}
