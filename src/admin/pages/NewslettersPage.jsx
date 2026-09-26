import { useCallback, useEffect, useState } from 'react';
import { newslettersApi } from '../api';
import { formatDateTime } from '../utils';
import { SendIcon, TrashIcon } from '../components/Icons';
import {
  Alert,
  EmptyState,
  PageHeader,
  StatusBadge,
  inputClass,
  primaryButton,
  secondaryButton,
} from '../components/ui';

const EMPTY = { id: null, subject: '', body: '' };

/** Newsletters — write bulletins and send them to every active subscriber. */
export default function NewslettersPage() {
  const [items, setItems] = useState([]);
  const [meta, setMeta] = useState({ mailConfigured: false, activeSubscribers: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [draft, setDraft] = useState(EMPTY);
  const [busy, setBusy] = useState(false);

  const load = useCallback(async () => {
    const data = await newslettersApi.list();
    setItems(data.newsletters);
    setMeta({ mailConfigured: data.mailConfigured, activeSubscribers: data.activeSubscribers });
  }, []);

  useEffect(() => {
    load()
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [load]);

  const reset = () => setDraft(EMPTY);

  async function save(e) {
    e?.preventDefault();
    setError('');
    setNotice('');
    setBusy(true);
    try {
      const payload = { subject: draft.subject, body: draft.body };
      const data = draft.id ? await newslettersApi.update(draft.id, payload) : await newslettersApi.create(payload);
      setDraft({ id: data.newsletter.id, subject: data.newsletter.subject, body: data.newsletter.body });
      await load();
      setNotice('Draft saved.');
      return data.newsletter;
    } catch (err) {
      setError(err.message);
      return null;
    } finally {
      setBusy(false);
    }
  }

  async function send() {
    if (!window.confirm(`Send "${draft.subject}" to ${meta.activeSubscribers} subscriber(s) now? This cannot be undone.`)) return;
    const saved = await save();
    if (!saved) return;
    setBusy(true);
    try {
      const data = await newslettersApi.send(saved.id);
      await load();
      reset();
      setNotice(
        `Sent to ${data.sent} subscriber(s).${data.failed ? ` ${data.failed} could not be delivered.` : ''}`
      );
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  }

  async function copyEmails() {
    setError('');
    try {
      const data = await newslettersApi.recipients();
      if (!data.emails.length) {
        setNotice('There are no active subscribers yet.');
        return;
      }
      await navigator.clipboard.writeText(data.emails.join(', '));
      setNotice(`Copied ${data.emails.length} email address(es). Paste them into the BCC field of your email app.`);
    } catch (err) {
      setError(err.message || 'Could not copy the email addresses.');
    }
  }

  async function remove(item) {
    if (!window.confirm(`Delete "${item.subject}"?`)) return;
    try {
      await newslettersApi.remove(item.id);
      if (draft.id === item.id) reset();
      await load();
    } catch (err) {
      setError(err.message);
    }
  }

  return (
    <div className="p-6">
      <PageHeader
        title="Newsletters"
        subtitle={`Write bulletins for your ${meta.activeSubscribers} active subscriber(s).`}
      />
      <Alert>{error}</Alert>
      <Alert kind="info">{notice}</Alert>
      {!loading && !meta.mailConfigured && (
        <Alert kind="warning">
          Email sending is not switched on yet, so you can write and save newsletters here but not send them. To send,
          copy the subscriber emails and paste them into the BCC field of your own email. Ask your developer to add
          SMTP settings to the server to send directly from here.
          <button type="button" onClick={copyEmails} className={`${secondaryButton} ml-2 mt-2`}>
            Copy subscriber emails
          </button>
        </Alert>
      )}

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[minmax(0,1fr)_24rem]">
        <form onSubmit={save} className="space-y-4 rounded-lg border border-ink-200 bg-white p-5 shadow-sm">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-brand-700">
            {draft.id ? 'Edit draft' : 'New newsletter'}
          </h2>
          <div>
            <label htmlFor="nl-subject" className="mb-1.5 block text-sm font-medium text-ink-700">
              Subject
            </label>
            <input
              id="nl-subject"
              value={draft.subject}
              onChange={(e) => setDraft((d) => ({ ...d, subject: e.target.value }))}
              className={inputClass}
              placeholder="e.g. The North Briefing: this week's top stories"
            />
          </div>
          <div>
            <label htmlFor="nl-body" className="mb-1.5 block text-sm font-medium text-ink-700">
              Message
            </label>
            <textarea
              id="nl-body"
              rows={14}
              value={draft.body}
              onChange={(e) => setDraft((d) => ({ ...d, body: e.target.value }))}
              className={inputClass}
              placeholder={'Write your newsletter here.\n\nLeave an empty line between paragraphs. An unsubscribe link is added automatically.'}
            />
          </div>
          <div className="flex flex-wrap gap-2">
            <button type="submit" disabled={busy} className={secondaryButton}>
              Save draft
            </button>
            <button
              type="button"
              onClick={send}
              disabled={busy || !meta.mailConfigured || !meta.activeSubscribers || !draft.subject.trim() || !draft.body.trim()}
              className={`${primaryButton} inline-flex items-center gap-1.5`}
            >
              <SendIcon className="h-4 w-4" /> Send to subscribers
            </button>
            {draft.id && (
              <button type="button" onClick={reset} className={secondaryButton}>
                Start a new one
              </button>
            )}
          </div>
        </form>

        <div>
          <h2 className="mb-3 text-sm font-semibold uppercase tracking-wider text-ink-500">History</h2>
          {loading ? (
            <p className="text-sm text-ink-500">Loading…</p>
          ) : items.length === 0 ? (
            <EmptyState>No newsletters yet.</EmptyState>
          ) : (
            <ul className="space-y-2">
              {items.map((item) => (
                <li key={item.id} className="rounded-lg border border-ink-200 bg-white p-3 shadow-sm">
                  <div className="flex items-start gap-2">
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium text-ink-900">{item.subject}</p>
                      <p className="mt-0.5 text-xs text-ink-500">
                        {item.status === 'sent'
                          ? `Sent ${formatDateTime(item.sentAt)} to ${item.sentCount}`
                          : `Updated ${formatDateTime(item.updatedAt)}`}
                      </p>
                    </div>
                    <StatusBadge status={item.status} />
                  </div>
                  <div className="mt-2 flex gap-2">
                    {item.status === 'draft' ? (
                      <button
                        type="button"
                        className={secondaryButton}
                        onClick={() => setDraft({ id: item.id, subject: item.subject, body: item.body })}
                      >
                        Edit
                      </button>
                    ) : (
                      <button
                        type="button"
                        className={secondaryButton}
                        onClick={() => setDraft({ id: null, subject: item.subject, body: item.body })}
                      >
                        Reuse
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={() => remove(item)}
                      aria-label={`Delete ${item.subject}`}
                      className="rounded-md p-1.5 text-ink-400 transition hover:bg-danger-50 hover:text-danger-600"
                    >
                      <TrashIcon className="h-4 w-4" />
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}
