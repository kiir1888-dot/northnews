import { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { postJson } from '../lib/publicApi';

/** Unsubscribe — landing page for the link at the bottom of every newsletter. */
export default function Unsubscribe() {
  const [params] = useSearchParams();
  const token = params.get('token');
  const [state, setState] = useState({ status: token ? 'working' : 'error', message: 'This unsubscribe link is not valid.' });

  useEffect(() => {
    if (!token) return;
    postJson('/subscribers/unsubscribe', { token })
      .then((data) => setState({ status: 'done', message: `${data.email} will no longer receive our newsletter.` }))
      .catch((err) => setState({ status: 'error', message: err.message }));
  }, [token]);

  return (
    <section className="mx-auto max-w-xl px-4 py-24 text-center">
      <h1 className="mb-3 text-3xl font-black">
        {state.status === 'working' ? 'Unsubscribing…' : state.status === 'done' ? 'You’re unsubscribed' : 'Something went wrong'}
      </h1>
      {state.status !== 'working' && <p className="mb-6 text-ink-600 dark:text-ink-300">{state.message}</p>}
      <Link
        to="/"
        className="inline-block rounded-lg bg-ink-950 px-6 py-2.5 font-display text-sm font-medium uppercase tracking-wide text-white dark:bg-white dark:text-ink-950"
      >
        Return home
      </Link>
    </section>
  );
}
