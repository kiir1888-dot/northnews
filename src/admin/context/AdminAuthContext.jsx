import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { isSupabaseConfigured, supabase } from '../../lib/supabaseClient';
import { authApi } from '../api';

const AdminAuthContext = createContext(null);

export function AdminAuthProvider({ children }) {
  const [session, setSession] = useState(null);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [authError, setAuthError] = useState('');

  // Confirms the signed-in Supabase user is on the admin allowlist by
  // asking the backend (which holds the authoritative ADMIN_EMAILS list).
  const confirmAdmin = useCallback(async (nextSession) => {
    if (!nextSession) {
      setUser(null);
      return;
    }
    try {
      const data = await authApi.me();
      setUser(data.user);
      setAuthError('');
    } catch (err) {
      setUser(null);
      setAuthError(
        err.status === 403
          ? 'This account is signed in but is not authorized for admin access.'
          : ''
      );
      // Not authorized (or token rejected) — end the Supabase session too.
      await supabase?.auth.signOut();
    }
  }, []);

  useEffect(() => {
    let cancelled = false;

    if (!isSupabaseConfigured) {
      setAuthError('Admin sign-in is not configured yet.');
      setLoading(false);
      return undefined;
    }

    supabase.auth.getSession().then(async ({ data }) => {
      if (cancelled) return;
      setSession(data.session);
      await confirmAdmin(data.session);
      if (!cancelled) setLoading(false);
    });

    const { data: subscription } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      setSession(nextSession);
      confirmAdmin(nextSession);
    });

    return () => {
      cancelled = true;
      subscription.subscription.unsubscribe();
    };
  }, [confirmAdmin]);

  const login = useCallback(async (email, password) => {
    if (!supabase) {
      throw new Error('Admin sign-in is not configured yet.');
    }
    setAuthError('');
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw error;
    await confirmAdmin(data.session);
    return data.session;
  }, [confirmAdmin]);

  const logout = useCallback(async () => {
    try {
      await supabase?.auth.signOut();
    } finally {
      setUser(null);
      setSession(null);
    }
  }, []);

  const value = useMemo(
    () => ({ user, session, loading, authError, login, logout }),
    [user, session, loading, authError, login, logout]
  );

  return <AdminAuthContext.Provider value={value}>{children}</AdminAuthContext.Provider>;
}

export function useAdminAuth() {
  const ctx = useContext(AdminAuthContext);
  if (!ctx) throw new Error('useAdminAuth must be used within an AdminAuthProvider');
  return ctx;
}
