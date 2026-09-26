import { useCallback, useEffect, useState } from 'react';
import { ceoApi, eventsApi, newsApi, signupsApi, teamApi } from '../api';
import ContentCard from '../components/ContentCard';
import CreatePanel from '../components/CreatePanel';
import SignupsTable from '../components/SignupsTable';
import TeamMemberCard from '../components/TeamMemberCard';
import TeamPanel from '../components/TeamPanel';
import CeoProfileCard from '../components/CeoProfileCard';
import CeoPanel from '../components/CeoPanel';
import { PlusIcon } from '../components/Icons';
import { useAdminAuth } from '../context/AdminAuthContext';

const TABS = [
  { id: 'events', label: 'Events' },
  { id: 'signups', label: 'Event signups', adminOnly: true },
  { id: 'news', label: 'News' },
  { id: 'team', label: 'Team', adminOnly: true },
  { id: 'ceo', label: 'CEO & Founder', adminOnly: true },
];

export default function ContentPage() {
  const { user } = useAdminAuth();
  const isAdmin = user?.role === 'admin';
  const visibleTabs = TABS.filter((tab) => isAdmin || !tab.adminOnly);
  const [activeTab, setActiveTab] = useState('events');

  const [events, setEvents] = useState([]);
  const [news, setNews] = useState([]);
  const [signups, setSignups] = useState([]);
  const [team, setTeam] = useState([]);
  const [ceo, setCeo] = useState(null);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const [editingEvent, setEditingEvent] = useState(null);
  const [editingNews, setEditingNews] = useState(null);
  const [editingMember, setEditingMember] = useState(null);
  const [eventFormReset, setEventFormReset] = useState(0);
  const [newsFormReset, setNewsFormReset] = useState(0);
  const [teamFormReset, setTeamFormReset] = useState(0);
  const [ceoFormReset, setCeoFormReset] = useState(0);

  const loadEvents = useCallback(async () => {
    const data = await eventsApi.list();
    setEvents(data.events);
  }, []);

  const loadNews = useCallback(async () => {
    const data = await newsApi.list();
    setNews(data.news);
  }, []);

  const loadSignups = useCallback(async () => {
    const data = await signupsApi.list();
    setSignups(data.signups);
  }, []);

  const loadTeam = useCallback(async () => {
    const data = await teamApi.list();
    setTeam(data.members);
  }, []);

  const loadCeo = useCallback(async () => {
    const data = await ceoApi.get();
    setCeo(data.profile);
  }, []);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError('');
    Promise.all([loadEvents(), loadNews(), isAdmin ? loadSignups() : null, loadTeam(), loadCeo()])
      .catch((err) => {
        if (!cancelled) setError(err.message || 'Failed to load dashboard data.');
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [loadEvents, loadNews, loadSignups, loadTeam, loadCeo, isAdmin]);

  function switchTab(tabId) {
    setActiveTab(tabId);
    setEditingEvent(null);
    setEditingNews(null);
    setEditingMember(null);
    setError('');
  }

  async function handleEventSubmit(formData) {
    setSubmitting(true);
    setError('');
    try {
      if (editingEvent) {
        await eventsApi.update(editingEvent.id, formData);
      } else {
        await eventsApi.create(formData);
      }
      await loadEvents();
      setEditingEvent(null);
      setEventFormReset((n) => n + 1);
    } catch (err) {
      setError(err.message || 'Failed to save event.');
    } finally {
      setSubmitting(false);
    }
  }

  async function handleNewsSubmit(formData) {
    setSubmitting(true);
    setError('');
    try {
      if (editingNews) {
        await newsApi.update(editingNews.id, formData);
      } else {
        await newsApi.create(formData);
      }
      await loadNews();
      setEditingNews(null);
      setNewsFormReset((n) => n + 1);
    } catch (err) {
      setError(err.message || 'Failed to save news post.');
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDeleteEvent(item) {
    if (!window.confirm(`Delete "${item.title}"? This cannot be undone.`)) return;
    try {
      await eventsApi.remove(item.id);
      if (editingEvent?.id === item.id) setEditingEvent(null);
      await loadEvents();
    } catch (err) {
      setError(err.message || 'Failed to delete event.');
    }
  }

  async function handleDeleteNews(item) {
    if (!window.confirm(`Delete "${item.title}"? This cannot be undone.`)) return;
    try {
      await newsApi.remove(item.id);
      if (editingNews?.id === item.id) setEditingNews(null);
      await loadNews();
    } catch (err) {
      setError(err.message || 'Failed to delete news post.');
    }
  }

  async function handleDeleteSignup(item) {
    if (!window.confirm(`Remove signup from ${item.name}?`)) return;
    try {
      await signupsApi.remove(item.id);
      await loadSignups();
    } catch (err) {
      setError(err.message || 'Failed to remove signup.');
    }
  }

  async function handleTeamSubmit(formData) {
    setSubmitting(true);
    setError('');
    try {
      if (editingMember) {
        await teamApi.update(editingMember.id, formData);
      } else {
        await teamApi.create(formData);
      }
      await loadTeam();
      setEditingMember(null);
      setTeamFormReset((n) => n + 1);
    } catch (err) {
      setError(err.message || 'Failed to save worker.');
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDeleteMember(item) {
    if (!window.confirm(`Remove "${item.name}" from the team?`)) return;
    try {
      await teamApi.remove(item.id);
      if (editingMember?.id === item.id) setEditingMember(null);
      await loadTeam();
    } catch (err) {
      setError(err.message || 'Failed to remove worker.');
    }
  }

  async function handleCeoSubmit(formData) {
    setSubmitting(true);
    setError('');
    try {
      const data = await ceoApi.update(formData);
      setCeo(data.profile);
      setCeoFormReset((n) => n + 1);
    } catch (err) {
      setError(err.message || 'Failed to save profile.');
    } finally {
      setSubmitting(false);
    }
  }

  async function handleCeoFieldSave(patch) {
    setSubmitting(true);
    setError('');
    try {
      const merged = { ...(ceo || {}), ...patch };
      const formData = new FormData();
      formData.append('name', merged.name || '');
      formData.append('title', merged.title || '');
      formData.append('message', merged.message || '');
      const data = await ceoApi.update(formData);
      setCeo(data.profile);
      setCeoFormReset((n) => n + 1);
    } catch (err) {
      setError(err.message || 'Failed to save profile.');
    } finally {
      setSubmitting(false);
    }
  }

  const showCreatePanel = activeTab === 'events' || activeTab === 'news' || activeTab === 'team' || activeTab === 'ceo';

  return (
    <div className="p-6">
      <div className="mb-6 flex items-center gap-1 rounded-t-lg border-b border-brand-100 bg-white/60 px-1 pt-1">
        {visibleTabs.map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => switchTab(tab.id)}
            className={`-mb-px rounded-t-md border-b-2 px-4 py-2.5 text-sm font-medium transition ${
              activeTab === tab.id
                ? 'border-brand-600 bg-brand-50 text-brand-700'
                : 'border-transparent text-ink-500 hover:bg-brand-50/50 hover:text-ink-800'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {error && (
        <div className="mb-4 rounded-md border border-danger-200 bg-danger-50 px-4 py-2.5 text-sm font-medium text-danger-700">{error}</div>
      )}

      <div className={showCreatePanel ? 'grid grid-cols-1 gap-6 lg:grid-cols-[minmax(0,1fr)_22rem]' : ''}>
        <div className="space-y-4">
          {activeTab === 'events' && (
            <>
              <div className="flex items-center justify-between">
                <h1 className="font-sans text-xl font-semibold text-ink-900">Upcoming events</h1>
                <button
                  type="button"
                  onClick={() => setEditingEvent(null)}
                  className="inline-flex items-center gap-1.5 rounded-md bg-gradient-to-r from-brand-600 to-brand-500 px-3 py-1.5 text-sm font-medium text-white shadow-sm transition hover:from-brand-700 hover:to-brand-600"
                >
                  <PlusIcon className="h-4 w-4" />
                  New
                </button>
              </div>

              {loading ? (
                <p className="text-sm text-ink-500">Loading events…</p>
              ) : events.length === 0 ? (
                <div className="rounded-lg border-2 border-dashed border-brand-200 bg-brand-50/30 p-10 text-center text-sm text-ink-500">
                  No events yet. Create your first one using the panel on the right.
                </div>
              ) : (
                events.map((event) => (
                  <ContentCard
                    key={event.id}
                    kind="event"
                    item={event}
                    onEdit={setEditingEvent}
                    onDelete={handleDeleteEvent}
                  />
                ))
              )}
            </>
          )}

          {activeTab === 'news' && (
            <>
              <div className="flex items-center justify-between">
                <h1 className="font-sans text-xl font-semibold text-ink-900">Latest news</h1>
                <button
                  type="button"
                  onClick={() => setEditingNews(null)}
                  className="inline-flex items-center gap-1.5 rounded-md bg-gradient-to-r from-brand-600 to-brand-500 px-3 py-1.5 text-sm font-medium text-white shadow-sm transition hover:from-brand-700 hover:to-brand-600"
                >
                  <PlusIcon className="h-4 w-4" />
                  New
                </button>
              </div>

              {loading ? (
                <p className="text-sm text-ink-500">Loading news…</p>
              ) : news.length === 0 ? (
                <div className="rounded-lg border-2 border-dashed border-brand-200 bg-brand-50/30 p-10 text-center text-sm text-ink-500">
                  No news posts yet. Create your first one using the panel on the right.
                </div>
              ) : (
                news.map((item) => (
                  <ContentCard key={item.id} kind="news" item={item} onEdit={setEditingNews} onDelete={handleDeleteNews} />
                ))
              )}
            </>
          )}

          {activeTab === 'signups' && (
            <>
              <h1 className="mb-4 font-sans text-xl font-semibold text-ink-900">Event signups</h1>
              {loading ? (
                <p className="text-sm text-ink-500">Loading signups…</p>
              ) : (
                <SignupsTable signups={signups} onDelete={handleDeleteSignup} />
              )}
            </>
          )}

          {activeTab === 'team' && (
            <>
              <div className="flex items-center justify-between">
                <h1 className="font-sans text-xl font-semibold text-ink-900">Team</h1>
                <button
                  type="button"
                  onClick={() => setEditingMember(null)}
                  className="inline-flex items-center gap-1.5 rounded-md bg-gradient-to-r from-brand-600 to-brand-500 px-3 py-1.5 text-sm font-medium text-white shadow-sm transition hover:from-brand-700 hover:to-brand-600"
                >
                  <PlusIcon className="h-4 w-4" />
                  New
                </button>
              </div>

              {loading ? (
                <p className="text-sm text-ink-500">Loading team…</p>
              ) : team.length === 0 ? (
                <div className="rounded-lg border-2 border-dashed border-brand-200 bg-brand-50/30 p-10 text-center text-sm text-ink-500">
                  No workers yet. Add your first one using the panel on the right.
                </div>
              ) : (
                team.map((member) => (
                  <TeamMemberCard
                    key={member.id}
                    item={member}
                    onEdit={setEditingMember}
                    onDelete={handleDeleteMember}
                  />
                ))
              )}
            </>
          )}

          {activeTab === 'ceo' && (
            <>
              <h1 className="mb-4 font-sans text-xl font-semibold text-ink-900">CEO & Founder</h1>
              {loading ? (
                <p className="text-sm text-ink-500">Loading profile…</p>
              ) : (
                <CeoProfileCard profile={ceo || {}} onFieldSave={handleCeoFieldSave} saving={submitting} />
              )}
            </>
          )}
        </div>

        {activeTab === 'events' && (
          <CreatePanel
            mode="event"
            editingItem={editingEvent}
            onSubmit={handleEventSubmit}
            onCancelEdit={() => setEditingEvent(null)}
            submitting={submitting}
            resetSignal={eventFormReset}
          />
        )}

        {activeTab === 'news' && (
          <CreatePanel
            mode="news"
            editingItem={editingNews}
            onSubmit={handleNewsSubmit}
            onCancelEdit={() => setEditingNews(null)}
            submitting={submitting}
            resetSignal={newsFormReset}
          />
        )}

        {activeTab === 'team' && (
          <TeamPanel
            editingItem={editingMember}
            onSubmit={handleTeamSubmit}
            onCancelEdit={() => setEditingMember(null)}
            submitting={submitting}
            resetSignal={teamFormReset}
          />
        )}

        {activeTab === 'ceo' && (
          <CeoPanel profile={ceo} onSubmit={handleCeoSubmit} submitting={submitting} resetSignal={ceoFormReset} />
        )}
      </div>
    </div>
  );
}
