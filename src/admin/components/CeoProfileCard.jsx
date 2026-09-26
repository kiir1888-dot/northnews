import { useEffect, useRef, useState } from 'react';
import { CheckIcon, CloseIcon, PencilIcon } from './Icons';

/**
 * Read-only display of the CEO & Founder profile that also supports
 * click-to-edit inline editing for the name, title and message — a quicker
 * alternative to the full form panel on the right, which stays in sync.
 */
export default function CeoProfileCard({ profile, onFieldSave, saving }) {
  const [editingField, setEditingField] = useState(null);
  const [draft, setDraft] = useState('');
  const inputRef = useRef(null);

  useEffect(() => {
    if (editingField && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select?.();
    }
  }, [editingField]);

  function startEdit(field) {
    setEditingField(field);
    setDraft(profile[field] || '');
  }

  function cancelEdit() {
    setEditingField(null);
    setDraft('');
  }

  async function commitEdit() {
    const field = editingField;
    const value = draft;
    setEditingField(null);
    if (value === (profile[field] || '')) return;
    await onFieldSave({ [field]: value });
  }

  function handleKeyDown(e, allowMultiline) {
    if (e.key === 'Escape') {
      e.preventDefault();
      cancelEdit();
    } else if (e.key === 'Enter' && (!allowMultiline || e.metaKey || e.ctrlKey)) {
      e.preventDefault();
      commitEdit();
    }
  }

  function EditControls() {
    return (
      <div className="mt-2 flex items-center gap-2">
        <button
          type="button"
          onClick={commitEdit}
          disabled={saving}
          className="inline-flex items-center gap-1 rounded-full bg-brand-600 px-2.5 py-1 text-xs font-medium text-white transition hover:bg-brand-700 disabled:opacity-60"
        >
          <CheckIcon className="h-3.5 w-3.5" />
          Save
        </button>
        <button
          type="button"
          onClick={cancelEdit}
          className="inline-flex items-center gap-1 rounded-full bg-ink-100 px-2.5 py-1 text-xs font-medium text-ink-600 transition hover:bg-ink-200"
        >
          <CloseIcon className="h-3.5 w-3.5" />
          Cancel
        </button>
      </div>
    );
  }

  return (
    <div className="group relative overflow-hidden rounded-lg border border-ink-200 bg-white p-6 pl-8 transition hover:shadow-lg hover:shadow-brand-900/5">
      <span className="absolute inset-y-0 left-0 w-1.5 bg-gradient-to-b from-brand-400 to-brand-600" aria-hidden="true" />

      <div className="flex flex-col items-start gap-5 sm:flex-row">
        <div className="h-24 w-24 shrink-0 overflow-hidden rounded-full border-2 border-brand-100 bg-brand-50 shadow-sm">
          {profile.imagePath ? (
            <img src={profile.imagePath} alt={profile.name} className="h-full w-full object-cover" />
          ) : (
            <div className="flex h-full w-full items-center justify-center text-2xl font-semibold text-brand-500">
              {profile.name?.[0]?.toUpperCase() || '?'}
            </div>
          )}
        </div>

        <div className="min-w-0 flex-1">
          {/* Name */}
          {editingField === 'name' ? (
            <div>
              <input
                ref={inputRef}
                type="text"
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                onKeyDown={(e) => handleKeyDown(e, false)}
                className="w-full max-w-sm rounded-md border border-brand-300 px-2 py-1 font-sans text-lg font-semibold text-ink-900 outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500"
              />
              <EditControls />
            </div>
          ) : (
            <button
              type="button"
              onClick={() => startEdit('name')}
              className="group/field inline-flex items-center gap-1.5 rounded-md text-left font-sans text-lg font-semibold text-ink-900 transition hover:bg-brand-50"
            >
              {profile.name || 'Add a name'}
              <PencilIcon className="h-3.5 w-3.5 text-ink-300 opacity-0 transition group-hover/field:opacity-100" />
            </button>
          )}

          {/* Title */}
          {editingField === 'title' ? (
            <div className="mt-1">
              <input
                ref={inputRef}
                type="text"
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                onKeyDown={(e) => handleKeyDown(e, false)}
                className="w-full max-w-sm rounded-md border border-brand-300 px-2 py-1 font-sans text-xs font-semibold uppercase tracking-[0.12em] text-brand-700 outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500"
              />
              <EditControls />
            </div>
          ) : (
            <button
              type="button"
              onClick={() => startEdit('title')}
              className="group/field mt-0.5 inline-flex items-center gap-1.5 rounded-md text-left font-sans text-[11px] font-semibold uppercase tracking-[0.12em] text-brand-600 transition hover:bg-brand-50"
            >
              {profile.title || 'Add a title'}
              <PencilIcon className="h-3 w-3 text-ink-300 opacity-0 transition group-hover/field:opacity-100" />
            </button>
          )}

          {/* Message */}
          {editingField === 'message' ? (
            <div className="mt-3">
              <textarea
                ref={inputRef}
                rows={5}
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                onKeyDown={(e) => handleKeyDown(e, true)}
                className="w-full resize-y rounded-md border border-brand-300 px-3 py-2 text-sm leading-relaxed text-ink-900 outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500"
              />
              <p className="mt-1 text-xs text-ink-400">Tip: press Ctrl/Cmd + Enter to save, Esc to cancel.</p>
              <EditControls />
            </div>
          ) : (
            <button
              type="button"
              onClick={() => startEdit('message')}
              className="group/field mt-3 block w-full rounded-md p-1 text-left transition hover:bg-brand-50"
            >
              <p className="whitespace-pre-line text-sm leading-relaxed text-ink-600">
                {profile.message || 'No message added yet. Click to write one.'}
              </p>
              <span className="mt-1 inline-flex items-center gap-1 text-xs font-medium text-brand-500 opacity-0 transition group-hover/field:opacity-100">
                <PencilIcon className="h-3 w-3" />
                Click to edit
              </span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
