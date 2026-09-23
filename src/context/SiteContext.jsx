import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { websiteConfig } from '../config/websiteConfig';
import { fetchNews, searchNews } from '../data/newsData';
import { fetchCeoProfile, fetchTeam } from '../data/siteData';

/**
 * =============================================================================
 *  SiteContext — the single reactive store for the application.
 * =============================================================================
 *  Holds:
 *   • `config`      — the live, static website configuration (brand, nav, contact)
 *   • `theme`       — dark / light preference, persisted to localStorage
 *   • `newsItems`   — news published from the admin dashboard, fetched once
 *   • `teamMembers` — editorial team roster, fetched from the admin dashboard
 *   • `ceoProfile`  — CEO/Founder spotlight, fetched from the admin dashboard
 *   • `searchQuery` / `searchResults` — drives the header search overlay
 *
 *  Search filtering happens entirely in state; no route change or reload.
 * =============================================================================
 */

const SiteContext = createContext(null);
const THEME_KEY = 'northi-theme';

export function SiteProvider({ children }) {
  /* ------------------------------ configuration ------------------------- */
  // Static brand/contact/nav config; CEO and team data are fetched
  // separately below since they come from the live admin-managed backend.
  const [config, setConfig] = useState(websiteConfig);

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
  // Loaded once from the real backend; the admin dashboard is the only way
  // to add, edit or remove items from this list.
  const [newsItems, setNewsItems] = useState([]);
  const [newsLoading, setNewsLoading] = useState(true);
  const [newsError, setNewsError] = useState(null);

  const loadNews = useCallback(async () => {
    setNewsLoading(true);
    setNewsError(null);
    try {
      const items = await fetchNews();
      setNewsItems(items);
    } catch (err) {
      setNewsError(err.message || 'Failed to load news.');
    } finally {
      setNewsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadNews();
  }, [loadNews]);

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

  const searchResults = useMemo(
    () => searchNews(newsItems, searchQuery),
    [newsItems, searchQuery]
  );

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
      teamMembers,
      teamLoading,
      reloadTeam: loadTeam,
      ceoProfile,
      ceoLoading,
      reloadCeoProfile: loadCeoProfile,
      searchQuery,
      setSearchQuery,
      searchResults,
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
      teamMembers,
      teamLoading,
      loadTeam,
      ceoProfile,
      ceoLoading,
      loadCeoProfile,
      searchQuery,
      searchResults,
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
