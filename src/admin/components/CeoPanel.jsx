import { useEffect, useRef, useState } from 'react';
import { ImageIcon } from './Icons';

const EMPTY_FORM = { name: '', title: '', message: '' };

/** Sticky "CEO & Founder" panel — Name, Title, a longer writings/message textarea, and Photo. */
export default function CeoPanel({ profile, onSubmit, submitting, resetSignal }) {
  const [form, setForm] = useState(EMPTY_FORM);
  const [imageFile, setImageFile] = useState(null);
  const [removeImage, setRemoveImage] = useState(false);
  const fileInputRef = useRef(null);

  useEffect(() => {
    setImageFile(null);
    setRemoveImage(false);
    if (fileInputRef.current) fileInputRef.current.value = '';
    setForm({
      name: profile?.name || '',
      title: profile?.title || '',
      message: profile?.message || '',
    });
  }, [profile, resetSignal]);

  function updateField(field, value) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  function handleFileChange(e) {
    const file = e.target.files?.[0] || null;
    setImageFile(file);
    if (file) setRemoveImage(false);
  }

  function handleClearImage() {
    setImageFile(null);
    setRemoveImage(true);
    if (fileInputRef.current) fileInputRef.current.value = '';
  }

  function handleSubmit(e) {
    e.preventDefault();
    const formData = new FormData();
    formData.append('name', form.name.trim());
    formData.append('title', form.title.trim());
    formData.append('message', form.message.trim());

    if (imageFile) {
      formData.append('image', imageFile);
    } else if (removeImage) {
      formData.append('removeImage', 'true');
    }

    onSubmit(formData);
  }

  const existingImageName = !imageFile && !removeImage && profile?.imagePath ? profile.imagePath.split('/').pop() : null;

  return (
    <div className="sticky top-6 rounded-lg border border-ink-200 bg-white p-5 shadow-sm ring-1 ring-brand-900/5">
      <div className="mb-4 border-b border-brand-100 pb-3">
        <h2 className="font-sans text-lg font-semibold text-ink-900">CEO & Founder</h2>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="mb-1.5 block text-sm font-medium text-ink-700" htmlFor="ceo-name">
            Name
          </label>
          <input
            id="ceo-name"
            type="text"
            required
            value={form.name}
            onChange={(e) => updateField('name', e.target.value)}
            className="w-full rounded-md border border-ink-200 px-3 py-2 text-sm text-ink-900 outline-none transition focus:border-brand-500 focus:ring-1 focus:ring-brand-500"
            placeholder="Alex Morgan"
          />
        </div>

        <div>
          <label className="mb-1.5 block text-sm font-medium text-ink-700" htmlFor="ceo-title">
            Title
          </label>
          <input
            id="ceo-title"
            type="text"
            value={form.title}
            onChange={(e) => updateField('title', e.target.value)}
            className="w-full rounded-md border border-ink-200 px-3 py-2 text-sm text-ink-900 outline-none transition focus:border-brand-500 focus:ring-1 focus:ring-brand-500"
            placeholder="CEO & Founder"
          />
        </div>

        <div>
          <label className="mb-1.5 block text-sm font-medium text-ink-700" htmlFor="ceo-message">
            Message / writings
          </label>
          <textarea
            id="ceo-message"
            rows={6}
            value={form.message}
            onChange={(e) => updateField('message', e.target.value)}
            className="w-full resize-y rounded-md border border-ink-200 px-3 py-2 text-sm text-ink-900 outline-none transition focus:border-brand-500 focus:ring-1 focus:ring-brand-500"
            placeholder="Share a founder's note, mission statement, or welcome message…"
          />
        </div>

        <div>
          <label className="mb-1.5 flex items-center gap-1.5 text-sm font-medium text-ink-700" htmlFor="ceo-image">
            <ImageIcon className="h-4 w-4 text-ink-400" />
            Photo
          </label>
          <input
            id="ceo-image"
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            className="block w-full text-sm text-ink-600 file:mr-3 file:rounded-md file:border file:border-ink-200 file:bg-ink-50 file:px-3 file:py-1.5 file:text-sm file:font-medium file:text-ink-700 hover:file:bg-ink-100"
          />
          {existingImageName && (
            <div className="mt-1.5 flex items-center gap-2 text-xs text-ink-500">
              <span className="truncate">Current: {existingImageName}</span>
              <button type="button" onClick={handleClearImage} className="font-medium text-danger-600 hover:underline">
                Remove
              </button>
            </div>
          )}
        </div>

        <button
          type="submit"
          disabled={submitting}
          className="w-full rounded-md bg-gradient-to-r from-brand-600 to-brand-500 px-4 py-2.5 text-center text-sm font-semibold text-white shadow-sm transition hover:from-brand-700 hover:to-brand-600 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {submitting ? 'Saving…' : 'Save profile'}
        </button>
      </form>
    </div>
  );
}
