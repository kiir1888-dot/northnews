import { useState } from 'react';
import { supabase } from '../../lib/supabaseClient';
import { useAdminAuth } from '../context/AdminAuthContext';

const MIN_PASSWORD_LENGTH = 8;

const inputClass =
  'w-full rounded-md border border-ink-200 px-3 py-2 text-sm text-ink-900 outline-none transition focus:border-brand-500 focus:ring-1 focus:ring-brand-500';

export default function AccountPage() {
  const { user } = useAdminAuth();
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [error, setError] = useState('');
  const [saved, setSaved] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setSaved(false);

    if (password.length < MIN_PASSWORD_LENGTH) {
      setError(`Your new password must be at least ${MIN_PASSWORD_LENGTH} characters.`);
      return;
    }
    if (password !== confirm) {
      setError('The two passwords do not match.');
      return;
    }

    setSubmitting(true);
    try {
      const { error: updateError } = await supabase.auth.updateUser({ password });
      if (updateError) throw updateError;
      setSaved(true);
      setPassword('');
      setConfirm('');
    } catch (err) {
      setError(err.message || 'Could not change your password.');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="p-6">
      <h1 className="font-sans text-xl font-semibold text-ink-900">Change password</h1>
      <p className="mt-1 text-sm text-ink-500">
        Signed in as <span className="font-medium text-ink-700">{user?.email}</span>
      </p>

      <form
        onSubmit={handleSubmit}
        className="mt-6 max-w-md space-y-4 rounded-lg border border-ink-200 bg-white p-5 shadow-sm ring-1 ring-brand-900/5"
      >
        <div>
          <label className="mb-1.5 block text-sm font-medium text-ink-700" htmlFor="acc-password">
            New password
          </label>
          <input
            id="acc-password"
            type="password"
            required
            minLength={MIN_PASSWORD_LENGTH}
            autoComplete="new-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className={inputClass}
            placeholder="At least 8 characters"
          />
        </div>

        <div>
          <label className="mb-1.5 block text-sm font-medium text-ink-700" htmlFor="acc-confirm">
            Confirm new password
          </label>
          <input
            id="acc-confirm"
            type="password"
            required
            autoComplete="new-password"
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
            className={inputClass}
          />
        </div>

        {error && (
          <p role="alert" className="rounded-md border border-danger-200 bg-danger-50 px-3 py-2 text-sm font-medium text-danger-700">
            {error}
          </p>
        )}
        {saved && (
          <p className="rounded-md border border-brand-200 bg-brand-50 px-3 py-2 text-sm font-medium text-brand-700">
            Password changed. Use your new password next time you sign in.
          </p>
        )}

        <button
          type="submit"
          disabled={submitting}
          className="w-full rounded-md bg-gradient-to-r from-brand-600 to-brand-500 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:from-brand-700 hover:to-brand-600 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {submitting ? 'Saving…' : 'Change password'}
        </button>
      </form>
    </div>
  );
}
