import { useCallback, useEffect, useState } from 'react';
import { editorsApi } from '../api';
import { useAdminAuth } from '../context/AdminAuthContext';
import { EyeIcon, EyeOffIcon, TrashIcon } from '../components/Icons';
import { formatDateTime } from '../utils';

const EMPTY_FORM = { email: '', role: 'editor', password: '' };

const ROLE_DETAILS = {
  admin: 'Full access, including subscribers, newsletters, event signups, team, CEO profile, site settings and editors.',
  editor: 'Can manage news and events, approve comments, review submissions and answer support messages.',
};

const inputClass =
  'w-full rounded-md border border-ink-200 px-3 py-2 text-sm text-ink-900 outline-none transition focus:border-brand-500 focus:ring-1 focus:ring-brand-500';

function RoleBadge({ editor }) {
  if (editor.isOwner) {
    return (
      <span className="rounded-full bg-brand-600 px-2.5 py-0.5 text-xs font-semibold text-white">Owner</span>
    );
  }
  return editor.role === 'admin' ? (
    <span className="rounded-full bg-brand-100 px-2.5 py-0.5 text-xs font-semibold text-brand-700">Admin</span>
  ) : (
    <span className="rounded-full bg-ink-100 px-2.5 py-0.5 text-xs font-semibold text-ink-700">Editor</span>
  );
}

export default function EditorsPage() {
  const { user } = useAdminAuth();
  const [editors, setEditors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [form, setForm] = useState(EMPTY_FORM);
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const loadEditors = useCallback(async () => {
    const data = await editorsApi.list();
    setEditors(data.editors);
  }, []);

  useEffect(() => {
    loadEditors()
      .catch((err) => setError(err.message || 'Failed to load editors.'))
      .finally(() => setLoading(false));
  }, [loadEditors]);

  const isSelf = (editor) => editor.email.toLowerCase() === user?.email?.toLowerCase();

  async function handleAdd(e) {
    e.preventDefault();
    setError('');
    setNotice('');
    setSubmitting(true);
    try {
      const data = await editorsApi.create({ ...form, email: form.email.trim() });
      await loadEditors();
      setNotice(
        data.accountExisted
          ? `${data.editor.email} already had a login, so they can sign in with their existing password.`
          : `${data.editor.email} was added. Share the temporary password with them privately and ask them to change it after signing in.`
      );
      setForm(EMPTY_FORM);
      setShowPassword(false);
    } catch (err) {
      setError(err.message || 'Failed to add editor.');
    } finally {
      setSubmitting(false);
    }
  }

  async function handleRoleChange(editor, role) {
    setError('');
    setNotice('');
    try {
      await editorsApi.updateRole(editor.id, role);
      await loadEditors();
    } catch (err) {
      setError(err.message || 'Failed to change role.');
    }
  }

  async function handleRemove(editor) {
    if (!window.confirm(`Remove dashboard access for ${editor.email}?`)) return;
    setError('');
    setNotice('');
    try {
      await editorsApi.remove(editor.id);
      await loadEditors();
    } catch (err) {
      setError(err.message || 'Failed to remove editor.');
    }
  }

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="font-sans text-xl font-semibold text-ink-900">Editors</h1>
        <p className="mt-1 text-sm text-ink-500">Choose who can sign in to this dashboard and what they can do.</p>
      </div>

      {error && (
        <div role="alert" className="mb-4 rounded-md border border-danger-200 bg-danger-50 px-4 py-2.5 text-sm font-medium text-danger-700">
          {error}
        </div>
      )}
      {notice && (
        <div className="mb-4 rounded-md border border-brand-200 bg-brand-50 px-4 py-2.5 text-sm font-medium text-brand-700">
          {notice}
        </div>
      )}

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[minmax(0,1fr)_22rem]">
        <div>
          {loading ? (
            <p className="text-sm text-ink-500">Loading editors…</p>
          ) : (
            <div className="overflow-hidden rounded-lg border border-ink-200 bg-white shadow-sm">
              <table className="w-full text-left text-sm">
                <thead className="bg-brand-50 text-xs font-semibold uppercase tracking-wider text-brand-700">
                  <tr>
                    <th className="px-4 py-3">Email</th>
                    <th className="px-4 py-3">Role</th>
                    <th className="px-4 py-3">Added</th>
                    <th className="px-4 py-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-ink-100">
                  {editors.map((editor) => {
                    const locked = editor.isOwner || isSelf(editor);
                    return (
                      <tr key={editor.id} className="transition hover:bg-brand-50/40">
                        <td className="px-4 py-3 font-medium text-ink-900">
                          {editor.email}
                          {isSelf(editor) && <span className="ml-2 text-xs font-normal text-ink-400">(you)</span>}
                        </td>
                        <td className="px-4 py-3">
                          {locked ? (
                            <RoleBadge editor={editor} />
                          ) : (
                            <select
                              value={editor.role}
                              onChange={(e) => handleRoleChange(editor, e.target.value)}
                              aria-label={`Role for ${editor.email}`}
                              className="rounded-md border border-ink-200 bg-white px-2 py-1 text-sm text-ink-800 outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500"
                            >
                              <option value="editor">Editor</option>
                              <option value="admin">Admin</option>
                            </select>
                          )}
                        </td>
                        <td className="px-4 py-3 text-ink-500">
                          {editor.isOwner ? 'Set in server settings' : formatDateTime(editor.createdAt)}
                        </td>
                        <td className="px-4 py-3 text-right">
                          {!locked && (
                            <button
                              type="button"
                              onClick={() => handleRemove(editor)}
                              aria-label={`Remove ${editor.email}`}
                              className="rounded-md p-1.5 text-ink-400 transition hover:bg-danger-50 hover:text-danger-600"
                            >
                              <TrashIcon className="h-4 w-4" />
                            </button>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}

          <dl className="mt-4 space-y-1.5 text-xs text-ink-500">
            <div>
              <dt className="inline font-semibold text-ink-700">Admin: </dt>
              <dd className="inline">{ROLE_DETAILS.admin}</dd>
            </div>
            <div>
              <dt className="inline font-semibold text-ink-700">Editor: </dt>
              <dd className="inline">{ROLE_DETAILS.editor}</dd>
            </div>
            <div>
              <dt className="inline font-semibold text-ink-700">Owner: </dt>
              <dd className="inline">An admin listed in the server&apos;s ADMIN_EMAILS setting. Owners cannot be removed here.</dd>
            </div>
          </dl>
        </div>

        <div className="sticky top-6 h-fit rounded-lg border border-ink-200 bg-white p-5 shadow-sm ring-1 ring-brand-900/5">
          <h2 className="mb-4 border-b border-brand-100 pb-3 font-sans text-lg font-semibold text-ink-900">Add editor</h2>
          <form onSubmit={handleAdd} className="space-y-4">
            <div>
              <label className="mb-1.5 block text-sm font-medium text-ink-700" htmlFor="ed-email">
                Email
              </label>
              <input
                id="ed-email"
                type="email"
                required
                autoComplete="off"
                value={form.email}
                onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
                className={inputClass}
                placeholder="editor@example.com"
              />
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-medium text-ink-700" htmlFor="ed-role">
                Role
              </label>
              <select
                id="ed-role"
                value={form.role}
                onChange={(e) => setForm((f) => ({ ...f, role: e.target.value }))}
                className={`${inputClass} bg-white`}
              >
                <option value="editor">Editor</option>
                <option value="admin">Admin</option>
              </select>
              <p className="mt-1.5 text-xs text-ink-500">{ROLE_DETAILS[form.role]}</p>
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-medium text-ink-700" htmlFor="ed-password">
                Temporary password
              </label>
              <div className="relative">
                <input
                  id="ed-password"
                  type={showPassword ? 'text' : 'password'}
                  required
                  minLength={8}
                  autoComplete="new-password"
                  value={form.password}
                  onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))}
                  className={`${inputClass} pr-10`}
                  placeholder="At least 8 characters"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                  aria-pressed={showPassword}
                  className="absolute inset-y-0 right-0 flex w-10 items-center justify-center text-ink-500 transition hover:text-brand-600"
                >
                  {showPassword ? <EyeOffIcon className="h-4 w-4" /> : <EyeIcon className="h-4 w-4" />}
                </button>
              </div>
              <p className="mt-1.5 text-xs text-ink-500">
                If this email already has a login, their existing password stays the same.
              </p>
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full rounded-md bg-gradient-to-r from-brand-600 to-brand-500 px-4 py-2.5 text-center text-sm font-semibold text-white shadow-sm transition hover:from-brand-700 hover:to-brand-600 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {submitting ? 'Adding…' : 'Add editor'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
