import { useEffect, useState } from 'react';
import Breadcrumbs from '../components/Breadcrumbs';
import SectionHeading from '../components/SectionHeading';
import Honeypot from '../components/Honeypot';
import { CheckIcon, ClockIcon, PinIcon } from '../components/Icons';
import { getJson, postJson } from '../lib/publicApi';
import { formatDate } from '../utils/format';

const today = () => new Date().toISOString().slice(0, 10);
const lastDay = (event) => event.endDate || event.startDate;
const isPast = (event) => Boolean(lastDay(event)) && lastDay(event) < today();

function dateLabel(event) {
  if (!event.startDate) return 'Date to be announced';
  if (!event.endDate || event.endDate === event.startDate) return formatDate(event.startDate);
  return `${formatDate(event.startDate)} to ${formatDate(event.endDate)}`;
}

const fieldClass =
  'w-full rounded-lg border border-ink-300 px-3 py-2.5 text-sm outline-none transition placeholder:text-ink-400 focus:border-brand-500 dark:border-ink-700 dark:bg-ink-900';

function SignupForm({ event }) {
  const [form, setForm] = useState({ name: '', email: '' });
  const [trap, setTrap] = useState('');
  const [status, setStatus] = useState('idle'); // idle | sending | done
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name.trim()) return setError('Please enter your name.');
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(form.email.trim())) return setError('Please enter a valid email address.');
    setError('');
    setStatus('sending');
    try {
      await postJson(`/events/${event.id}/signup`, { ...form, website: trap });
      setStatus('done');
    } catch (err) {
      setError(err.message);
      setStatus('idle');
    }
  };

  if (status === 'done') {
    return (
      <p className="flex items-center gap-2 rounded-lg bg-emerald-50 px-3 py-3 text-sm text-emerald-800" role="status">
        <CheckIcon className="h-5 w-5 shrink-0" />
        You’re registered. See you there!
      </p>
    );
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="relative space-y-3">
      <Honeypot value={trap} onChange={(e) => setTrap(e.target.value)} />
      <div className="grid gap-3 sm:grid-cols-2">
        <label className="block">
          <span className="sr-only">Your name</span>
          <input
            value={form.name}
            onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
            placeholder="Your name"
            className={fieldClass}
          />
        </label>
        <label className="block">
          <span className="sr-only">Email</span>
          <input
            type="email"
            value={form.email}
            onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
            placeholder="you@example.com"
            className={fieldClass}
          />
        </label>
      </div>
      {error && (
        <p className="text-xs text-accent-500" role="alert">
          {error}
        </p>
      )}
      <button
        type="submit"
        disabled={status === 'sending'}
        className="rounded-lg bg-ink-950 px-5 py-2.5 font-display text-sm font-medium uppercase tracking-wide text-white transition hover:bg-brand-700 disabled:opacity-60 dark:bg-white dark:text-ink-950 dark:hover:bg-brand-200"
      >
        {status === 'sending' ? 'Registering…' : 'Register'}
      </button>
    </form>
  );
}

function EventCard({ event }) {
  const past = isPast(event);
  return (
    <article className="surface overflow-hidden rounded-2xl">
      {event.imagePath && (
        <div className="aspect-[16/9] w-full overflow-hidden bg-ink-100 dark:bg-ink-800">
          <img src={event.imagePath} alt="" loading="lazy" className="h-full w-full object-cover" />
        </div>
      )}
      <div className="p-5 sm:p-6">
        <p className="kicker mb-2">{dateLabel(event)}</p>
        <h2 className="text-2xl font-bold leading-snug">{event.title}</h2>
        <ul className="mt-3 space-y-1.5 text-sm text-ink-600 dark:text-ink-300">
          {event.time && (
            <li className="flex items-center gap-2">
              <ClockIcon className="h-4 w-4 shrink-0 text-brand-600" />
              {event.time}
            </li>
          )}
          {event.location && (
            <li className="flex items-center gap-2">
              <PinIcon className="h-4 w-4 shrink-0 text-brand-600" />
              {event.location}
            </li>
          )}
        </ul>
        {event.description && (
          <p className="mt-4 whitespace-pre-line text-sm leading-7 text-ink-700 dark:text-ink-200">{event.description}</p>
        )}
        {!past && (
          <div className="mt-5 border-t border-ink-200 pt-5 dark:border-ink-800">
            <h3 className="mb-3 text-sm font-bold uppercase tracking-wide">Register to attend</h3>
            <SignupForm event={event} />
          </div>
        )}
      </div>
    </article>
  );
}

/** Events — upcoming events with reader registration, plus a past archive. */
export default function Events() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    getJson('/events')
      .then((data) => setEvents(data.events))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  const upcoming = events.filter((e) => !isPast(e));
  const past = events.filter(isPast).reverse();

  return (
    <>
      <Breadcrumbs items={[{ label: 'Events' }]} />

      <div className="mx-auto max-w-8xl px-4 py-8">
        <SectionHeading
          as="h1"
          kicker="Join us"
          title="Events"
          description="Community forums, briefings and gatherings hosted by the newsroom."
        />

        {loading ? (
          <p className="surface rounded-xl p-10 text-center text-sm text-ink-500 dark:text-ink-400">Loading events…</p>
        ) : error ? (
          <p className="surface rounded-xl p-10 text-center text-sm text-ink-500 dark:text-ink-400">{error}</p>
        ) : upcoming.length === 0 ? (
          <p className="surface rounded-xl p-10 text-center text-sm text-ink-500 dark:text-ink-400">
            No upcoming events right now. Check back soon.
          </p>
        ) : (
          <div className="grid gap-6 md:grid-cols-2">
            {upcoming.map((event) => (
              <EventCard key={event.id} event={event} />
            ))}
          </div>
        )}

        {past.length > 0 && (
          <section className="mt-14">
            <h2 className="mb-6 border-b border-ink-200 pb-3 text-2xl font-black dark:border-ink-800">Past events</h2>
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {past.map((event) => (
                <EventCard key={event.id} event={event} />
              ))}
            </div>
          </section>
        )}
      </div>
    </>
  );
}
