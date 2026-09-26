import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabaseClient';
import { useAdminAuth } from '../context/AdminAuthContext';
import { KeyIcon } from '../components/Icons';
import { inputClass, primaryButton } from '../components/ui';

const MIN_PASSWORD_LENGTH = 8;

/** Reads an error Supabase puts in the link, e.g. when the link has expired. */
function linkError() {
  const params = new URLSearchParams(window.location.hash.slice(1) || window.location.search);
  return params.get('error_description')?.replace(/\+/g, ' ') || '';
}

/**
 * ResetPassword — where the "Forgot password?" email link lands. Supabase
 * signs the user in from the link, then they choose a new password here.
 */
export default function ResetPassword() {
  const { session, user, loading, authError } = useAdminAuth();
  const navigate = useNavigate();
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [initialError] = useState(linkError);

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
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
      navigate('/admin/content', { replace: true });
    } catch (err) {
      setError(err.message || 'Could not set your new password.');
    } finally {
      setSubmitting(false);
    }
  }

  const ready = !loading && session && user;
  const failed = !loading && !ready;

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-brand-100 via-brand-50 to-white px-4">
      <div className="w-full max-w-sm rounded-lg border border-brand-100 bg-white p-8 shadow-xl shadow-brand-900/10">
        <div className="mb-6 flex flex-col items-center text-center">
          <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-brand-500 to-brand-700 text-white shadow-md shadow-brand-500/30">
            <KeyIcon className="h-5 w-5" />
          </div>
          <h1 className="font-sans text-xl font-medium text-ink-900">Choose a new password</h1>
        </div>

        {loading && <p className="text-center text-sm text-ink-500">Checking your reset link…</p>}

        {failed && (
          <div className="space-y-4 text-center">
            <p role="alert" className="rounded-md border border-danger-200 bg-danger-50 px-3 py-2 text-sm font-medium text-danger-700">
              {authError || initialError || 'This reset link is invalid or has expired. Request a new one from the sign in page.'}
            </p>
            <Link to="/admin/login" className="text-sm font-medium text-brand-600 hover:text-brand-700">
              Back to sign in
            </Link>
          </div>
        )}

        {ready && (
          <form onSubmit={handleSubmit} className="space-y-4" noValidate>
            <p className="text-center text-sm text-ink-500">
              For <span className="font-medium text-ink-700">{user.email}</span>
            </p>
            <div>
              <label htmlFor="rp-password" className="mb-1.5 block text-sm font-medium text-ink-700">
                New password
              </label>
              <input
                id="rp-password"
                type="password"
                autoComplete="new-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className={inputClass}
                placeholder="At least 8 characters"
              />
            </div>
            <div>
              <label htmlFor="rp-confirm" className="mb-1.5 block text-sm font-medium text-ink-700">
                Confirm new password
              </label>
              <input
                id="rp-confirm"
                type="password"
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
            <button type="submit" disabled={submitting} className={`${primaryButton} w-full py-2.5`}>
              {submitting ? 'Saving…' : 'Save new password'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
