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

const jsonBody = (method, body) => ({
  method,
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(body),
});

export const editorsApi = {
  list: () => request('/editors'),
  create: (data) => request('/editors', jsonBody('POST', data)),
  updateRole: (id, role) => request(`/editors/${id}`, jsonBody('PATCH', { role })),
  remove: (id) => request(`/editors/${id}`, { method: 'DELETE' }),
};

export const supportApi = {
  list: () => request('/contact'),
  setStatus: (id, status) => request(`/contact/${id}`, jsonBody('PATCH', { status })),
  remove: (id) => request(`/contact/${id}`, { method: 'DELETE' }),
};

export const subscribersApi = {
  list: () => request('/subscribers'),
  remove: (id) => request(`/subscribers/${id}`, { method: 'DELETE' }),
};

export const newslettersApi = {
  list: () => request('/newsletters'),
  recipients: () => request('/newsletters/recipients'),
  create: (data) => request('/newsletters', jsonBody('POST', data)),
  update: (id, data) => request(`/newsletters/${id}`, jsonBody('PUT', data)),
  send: (id) => request(`/newsletters/${id}/send`, { method: 'POST' }),
  remove: (id) => request(`/newsletters/${id}`, { method: 'DELETE' }),
};

export const commentsApi = {
  list: () => request('/comments/all'),
  setStatus: (id, status) => request(`/comments/${id}`, jsonBody('PATCH', { status })),
  remove: (id) => request(`/comments/${id}`, { method: 'DELETE' }),
};

export const submissionsApi = {
  list: () => request('/submissions'),
  update: (id, data) => request(`/submissions/${id}`, jsonBody('PATCH', data)),
  remove: (id) => request(`/submissions/${id}`, { method: 'DELETE' }),
};

export const settingsApi = {
  get: () => request('/settings'),
  save: (settings) => request('/settings', jsonBody('PUT', { settings })),
};
