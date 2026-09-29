import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { websiteConfig } from '../config/websiteConfig';
import { applySettings } from '../config/siteSettings';
import { fetchArticle, fetchNewsPage } from '../data/newsData';
import { fetchCeoProfile, fetchTeam } from '../data/siteData';

/**
 * =============================================================================
 *  SiteContext — the single reactive store for the application.
 * =============================================================================
 *  Holds:
 *   • `config`      — the live, static website configuration (brand, nav, contact)
 *   • `theme`       — dark / light preference, persisted to localStorage
 *   • `newsItems`   — the latest page of stories (excerpts); more via `loadMoreNews`
 *   • `articleCache` — full stories fetched on demand via `loadArticle`
 *   • `teamMembers` — editorial team roster, fetched from the admin dashboard
 *   • `ceoProfile`  — CEO/Founder spotlight, fetched from the admin dashboard
 *   • `searchQuery` / `searchResults` — drives the header search overlay
 *
 *  Search queries the server (debounced); no route change or reload.
 * =============================================================================
 */

const SiteContext = createContext(null);
const THEME_KEY = 'northi-theme';

export function SiteProvider({ children }) {
  /* ------------------------------ configuration ------------------------- */
  // Static brand/contact/nav config; CEO and team data are fetched
  // separately below since they come from the live admin-managed backend.
  const [config, setConfig] = useState(websiteConfig);

  // Apply text saved from the dashboard's Site settings page on top of the
  // built-in defaults.
  useEffect(() => {
    let cancelled = false;
    fetch('/api/settings')
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (!cancelled && data?.settings) setConfig(applySettings(websiteConfig, data.settings));
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, []);

  /** Shallow-merge a partial config patch, e.g. updateConfig({ brand: {...} }). */
  const updateConfig = useCallback((patch) => {
    setConfig((prev) => ({ ...prev, ...patch }));
  }, []);

  /* --------------------------------- theme ------------------------------ */
  const [theme, setTheme] = useState(() => {
    if (typeof document === 'undefined') return 'light';
    return document.documentElement.classList.contains('dark') ? 'dark' : 'light';
  });

  useEffect(() => {
    const root = document.documentElement;
    root.classList.toggle('dark', theme === 'dark');
    try {
      localStorage.setItem(THEME_KEY, theme);
    } catch {
      /* storage unavailable — theme simply won't persist */
    }
  }, [theme]);

  const toggleTheme = useCallback(
    () => setTheme((t) => (t === 'dark' ? 'light' : 'dark')),
    []
  );

  /* --------------------------------- news -------------------------------- */
  // The latest page of stories (with short excerpts) is loaded once; older
  // pages are fetched on demand with `loadMoreNews`. Full article text is
  // fetched per story with `loadArticle` and kept in `articleCache`
  // (value `null` means the story doesn't exist).
  const [newsItems, setNewsItems] = useState([]);
  const [newsLoading, setNewsLoading] = useState(true);
  const [newsError, setNewsError] = useState(null);
  const [hasMoreNews, setHasMoreNews] = useState(false);
  const [loadingMoreNews, setLoadingMoreNews] = useState(false);
  const [articleCache, setArticleCache] = useState({});
  const requestedArticles = useRef(new Set());

  const loadNews = useCallback(async () => {
    setNewsLoading(true);
    setNewsError(null);
    try {
      const { items, hasMore } = await fetchNewsPage();
      setNewsItems(items);
      setHasMoreNews(hasMore);
    } catch (err) {
      setNewsError(err.message || 'Failed to load news.');
    } finally {
      setNewsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadNews();
  }, [loadNews]);

  const loadMoreNews = useCallback(async () => {
    if (loadingMoreNews || !hasMoreNews) return;
    setLoadingMoreNews(true);
    try {
      const { items, hasMore } = await fetchNewsPage({ offset: newsItems.length });
      setNewsItems((prev) => {
        const seen = new Set(prev.map((n) => n.id));
        return [...prev, ...items.filter((n) => !seen.has(n.id))];
      });
      setHasMoreNews(hasMore);
    } catch {
      /* keep what we have; the button can be pressed again */
    } finally {
      setLoadingMoreNews(false);
    }
  }, [hasMoreNews, loadingMoreNews, newsItems.length]);

  const loadArticle = useCallback(async (id) => {
    const key = String(id);
    if (requestedArticles.current.has(key)) return;
    requestedArticles.current.add(key);
    try {
      const article = await fetchArticle(key);
      setArticleCache((prev) => ({ ...prev, [key]: article }));
    } catch {
      requestedArticles.current.delete(key);
      setArticleCache((prev) => ({ ...prev, [key]: null }));
    }
  }, []);

  /* --------------------------------- team -------------------------------- */
  // Loaded once from the real backend; the admin dashboard is the only way
  // to add, edit or remove editorial team members.
  const [teamMembers, setTeamMembers] = useState([]);
  const [teamLoading, setTeamLoading] = useState(true);

  const loadTeam = useCallback(async () => {
    setTeamLoading(true);
    try {
      const members = await fetchTeam();
      setTeamMembers(members);
    } catch {
      setTeamMembers([]);
    } finally {
      setTeamLoading(false);
    }
  }, []);

  useEffect(() => {
    loadTeam();
  }, [loadTeam]);

  /* --------------------------------- ceo ---------------------------------- */
  // Loaded once from the real backend; edited entirely from the admin panel.
  const [ceoProfile, setCeoProfile] = useState(null);
  const [ceoLoading, setCeoLoading] = useState(true);

  const loadCeoProfile = useCallback(async () => {
    setCeoLoading(true);
    try {
      const profile = await fetchCeoProfile();
      setCeoProfile(profile);
    } catch {
      setCeoProfile(null);
    } finally {
      setCeoLoading(false);
    }
  }, []);

  useEffect(() => {
    loadCeoProfile();
  }, [loadCeoProfile]);

  /* --------------------------------- search ----------------------------- */
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchOpen, setSearchOpen] = useState(false);
  const [searchResults, setSearchResults] = useState([]);
  const [searchLoading, setSearchLoading] = useState(false);

  // Search runs on the server so it covers the whole archive, not just the
  // stories already loaded. Debounced so we don't query on every keystroke.
  useEffect(() => {
    const q = searchQuery.trim();
    if (!q) {
      setSearchResults([]);
      setSearchLoading(false);
      return undefined;
    }
    const controller = new AbortController();
    setSearchLoading(true);
    const timer = setTimeout(async () => {
      try {
        const { items } = await fetchNewsPage({ q, limit: 20, signal: controller.signal });
        setSearchResults(items);
      } catch (err) {
        if (err.name !== 'AbortError') setSearchResults([]);
      } finally {
        if (!controller.signal.aborted) setSearchLoading(false);
      }
    }, 300);
    return () => {
      clearTimeout(timer);
      controller.abort();
    };
  }, [searchQuery]);

  const openSearch = useCallback(() => setSearchOpen(true), []);
  const closeSearch = useCallback(() => {
    setSearchOpen(false);
    setSearchQuery('');
  }, []);

  // Close the search overlay with Escape for keyboard accessibility.
  useEffect(() => {
    if (!isSearchOpen) return undefined;
    const onKey = (e) => {
      if (e.key === 'Escape') closeSearch();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [isSearchOpen, closeSearch]);

  /* --------------------------------- value ------------------------------ */
  const value = useMemo(
    () => ({
      config,
      updateConfig,
      theme,
      toggleTheme,
      newsItems,
      newsLoading,
      newsError,
      reloadNews: loadNews,
      hasMoreNews,
      loadingMoreNews,
      loadMoreNews,
      articleCache,
      loadArticle,
      teamMembers,
      teamLoading,
      reloadTeam: loadTeam,
      ceoProfile,
      ceoLoading,
      reloadCeoProfile: loadCeoProfile,
      searchQuery,
      setSearchQuery,
      searchResults,
      searchLoading,
      isSearchOpen,
      openSearch,
      closeSearch,
    }),
    [
      config,
      updateConfig,
      theme,
      toggleTheme,
      newsItems,
      newsLoading,
      newsError,
      loadNews,
      hasMoreNews,
      loadingMoreNews,
      loadMoreNews,
      articleCache,
      loadArticle,
      teamMembers,
      teamLoading,
      loadTeam,
      ceoProfile,
      ceoLoading,
      loadCeoProfile,
      searchQuery,
      searchResults,
      searchLoading,
      isSearchOpen,
      openSearch,
      closeSearch,
    ]
  );

  return <SiteContext.Provider value={value}>{children}</SiteContext.Provider>;
}

/** Consume the site store. Throws early if used outside the provider. */
export function useSite() {
  const ctx = useContext(SiteContext);
  if (!ctx) throw new Error('useSite() must be used inside <SiteProvider>');
  return ctx;
}

export default SiteContext;
