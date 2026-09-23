import { useEffect, useRef, useState } from 'react';
import { ImageIcon, CloseIcon } from './Icons';
import { toDateInputValue } from '../utils';
import { NEWS_CATEGORIES } from '../constants';

const EMPTY_FORM = {
  title: '',
  startDate: '',
  endDate: '',
  time: '',
  location: '',
  date: '',
  category: NEWS_CATEGORIES[0],
  description: '',
};

/**
 * Sticky right-hand "Create" panel. Its fields shift shape between the
 * Events and News tabs (`mode` prop) and repopulate when an existing item
 * is opened for editing (`editingItem` prop).
 */
export default function CreatePanel({ mode, editingItem, onSubmit, onCancelEdit, submitting, resetSignal }) {
  const [form, setForm] = useState(EMPTY_FORM);
  const [imageFile, setImageFile] = useState(null);
  const [removeImage, setRemoveImage] = useState(false);
  const fileInputRef = useRef(null);

  const isEvent = mode === 'event';
  const isEditing = Boolean(editingItem);

  useEffect(() => {
    setImageFile(null);
    setRemoveImage(false);
    if (fileInputRef.current) fileInputRef.current.value = '';

    if (editingItem) {
      setForm({
        title: editingItem.title || '',
        startDate: toDateInputValue(editingItem.startDate),
        endDate: toDateInputValue(editingItem.endDate),
        time: editingItem.time || '',
        location: editingItem.location || '',
        date: toDateInputValue(editingItem.date),
        category: editingItem.category || NEWS_CATEGORIES[0],
        description: editingItem.description || '',
      });
    } else {
      setForm(EMPTY_FORM);
    }
  }, [editingItem, mode, resetSignal]);

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
    formData.append('title', form.title.trim());
    formData.append('description', form.description.trim());

    if (isEvent) {
      formData.append('startDate', form.startDate);
      formData.append('endDate', form.endDate);
      formData.append('time', form.time.trim());
      formData.append('location', form.location.trim());
    } else {
      formData.append('date', form.date);
      formData.append('category', form.category);
    }

    if (imageFile) {
      formData.append('image', imageFile);
    } else if (removeImage) {
      formData.append('removeImage', 'true');
    }

    onSubmit(formData);
  }

  const existingImageName = !imageFile && !removeImage && editingItem?.imagePath ? editingItem.imagePath.split('/').pop() : null;

  return (
    <div className="sticky top-6 rounded-lg border border-ink-200 bg-white p-5 shadow-sm ring-1 ring-brand-900/5">
      <div className="mb-4 flex items-center justify-between border-b border-brand-100 pb-3">
        <h2 className="font-sans text-lg font-semibold text-ink-900">
          {isEvent ? 'Create event' : 'Create news post'}
        </h2>
        {isEditing && (
          <button
            type="button"
            onClick={onCancelEdit}
            className="inline-flex items-center gap-1 rounded-full bg-danger-50 px-2.5 py-1 text-xs font-medium text-danger-600 transition hover:bg-danger-100"
          >
            <CloseIcon className="h-3.5 w-3.5" />
            Cancel edit
          </button>
        )}
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="mb-1.5 block text-sm font-medium text-ink-700" htmlFor="cp-title">
            Title
          </label>
          <input
            id="cp-title"
            type="text"
            required
            value={form.title}
            onChange={(e) => updateField('title', e.target.value)}
            className="w-full rounded-md border border-ink-200 px-3 py-2 text-sm text-ink-900 outline-none transition focus:border-brand-500 focus:ring-1 focus:ring-brand-500"
            placeholder={isEvent ? 'Community Town Hall' : 'New product announcement'}
          />
        </div>

        {isEvent ? (
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="mb-1.5 block text-sm font-medium text-ink-700" htmlFor="cp-start">
                Date
              </label>
              <input
                id="cp-start"
                type="date"
                lang="en-GB"
                value={form.startDate}
                onChange={(e) => updateField('startDate', e.target.value)}
                className="w-full rounded-md border border-ink-200 px-3 py-2 text-sm text-ink-900 outline-none transition focus:border-brand-500 focus:ring-1 focus:ring-brand-500"
              />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-ink-700" htmlFor="cp-end">
                End date
              </label>
              <input
                id="cp-end"
                type="date"
                lang="en-GB"
                value={form.endDate}
                onChange={(e) => updateField('endDate', e.target.value)}
                className="w-full rounded-md border border-ink-200 px-3 py-2 text-sm text-ink-900 outline-none transition focus:border-brand-500 focus:ring-1 focus:ring-brand-500"
              />
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="mb-1.5 block text-sm font-medium text-ink-700" htmlFor="cp-date">
                Date
              </label>
              <input
                id="cp-date"
                type="date"
                lang="en-GB"
                value={form.date}
                onChange={(e) => updateField('date', e.target.value)}
                className="w-full rounded-md border border-ink-200 px-3 py-2 text-sm text-ink-900 outline-none transition focus:border-brand-500 focus:ring-1 focus:ring-brand-500"
              />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-ink-700" htmlFor="cp-category">
                Category
              </label>
              <select
                id="cp-category"
                value={form.category}
                onChange={(e) => updateField('category', e.target.value)}
                className="w-full rounded-md border border-ink-200 bg-white px-3 py-2 text-sm text-ink-900 outline-none transition focus:border-brand-500 focus:ring-1 focus:ring-brand-500"
              >
                {NEWS_CATEGORIES.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>
          </div>
        )}

        {isEvent && (
          <div>
            <label className="mb-1.5 block text-sm font-medium text-ink-700" htmlFor="cp-time">
              Time
            </label>
            <input
              id="cp-time"
              type="text"
              value={form.time}
              onChange={(e) => updateField('time', e.target.value)}
              className="w-full rounded-md border border-ink-200 px-3 py-2 text-sm text-ink-900 outline-none transition focus:border-brand-500 focus:ring-1 focus:ring-brand-500"
              placeholder="18:00 - 20:00"
            />
          </div>
        )}

        {isEvent && (
          <div>
            <label className="mb-1.5 block text-sm font-medium text-ink-700" htmlFor="cp-location">
              Location
            </label>
            <input
              id="cp-location"
              type="text"
              value={form.location}
              onChange={(e) => updateField('location', e.target.value)}
              className="w-full rounded-md border border-ink-200 px-3 py-2 text-sm text-ink-900 outline-none transition focus:border-brand-500 focus:ring-1 focus:ring-brand-500"
              placeholder="North Hall, 12 Union Street"
            />
          </div>
        )}

        <div>
          <label className="mb-1.5 block text-sm font-medium text-ink-700" htmlFor="cp-description">
            Description
          </label>
          <textarea
            id="cp-description"
            rows={5}
            value={form.description}
            onChange={(e) => updateField('description', e.target.value)}
            className="w-full resize-y rounded-md border border-ink-200 px-3 py-2 text-sm text-ink-900 outline-none transition focus:border-brand-500 focus:ring-1 focus:ring-brand-500"
            placeholder={isEvent ? 'Tell attendees what to expect…' : 'Write a short summary…'}
          />
        </div>

        <div>
          <label className="mb-1.5 flex items-center gap-1.5 text-sm font-medium text-ink-700" htmlFor="cp-image">
            <ImageIcon className="h-4 w-4 text-ink-400" />
            Image attachment
          </label>
          <input
            id="cp-image"
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
          {submitting ? 'Saving…' : isEditing ? 'Save changes' : 'Create'}
        </button>
      </form>
    </div>
  );
}
