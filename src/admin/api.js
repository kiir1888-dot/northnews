/**
 * Thin fetch wrapper for the admin dashboard API.
 * All requests are same-origin (proxied by Vite in dev, served together in
 * production) and carry the current Supabase session's access token as a
 * Bearer header so the backend can verify who's making the request.
 */
import { supabase } from '../lib/supabaseClient';

async function request(path, options = {}) {
  if (!supabase) {
    throw new Error('Admin sign-in is not configured yet.');
  }

  const {
    data: { session },
  } = await supabase.auth.getSession();

  const headers = { ...(options.headers || {}) };
  if (session?.access_token) {
    headers.Authorization = `Bearer ${session.access_token}`;
  }

  const res = await fetch(`/api${path}`, {
    ...options,
    headers,
  });

  if (res.status === 204) return null;

  const isJson = res.headers.get('content-type')?.includes('application/json');
  const data = isJson ? await res.json().catch(() => null) : null;

  if (!res.ok) {
    const message = data?.message || res.statusText || 'Request failed.';
    const error = new Error(message);
    error.status = res.status;
    throw error;
  }

  return data;
}

export const authApi = {
  me: () => request('/auth/me'),
};

export const eventsApi = {
  list: () => request('/events'),
  create: (formData) => request('/events', { method: 'POST', body: formData }),
  update: (id, formData) => request(`/events/${id}`, { method: 'PUT', body: formData }),
  remove: (id) => request(`/events/${id}`, { method: 'DELETE' }),
};

export const newsApi = {
  list: () => request('/news'),
  create: (formData) => request('/news', { method: 'POST', body: formData }),
  update: (id, formData) => request(`/news/${id}`, { method: 'PUT', body: formData }),
  remove: (id) => request(`/news/${id}`, { method: 'DELETE' }),
};

export const signupsApi = {
  list: () => request('/signups'),
  remove: (id) => request(`/signups/${id}`, { method: 'DELETE' }),
};

export const teamApi = {
  list: () => request('/team'),
  create: (formData) => request('/team', { method: 'POST', body: formData }),
  update: (id, formData) => request(`/team/${id}`, { method: 'PUT', body: formData }),
  remove: (id) => request(`/team/${id}`, { method: 'DELETE' }),
};

export const ceoApi = {
  get: () => request('/ceo'),
  update: (formData) => request('/ceo', { method: 'PUT', body: formData }),
};
