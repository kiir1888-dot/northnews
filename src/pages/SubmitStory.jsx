import { useState } from 'react';
import { Link } from 'react-router-dom';
import Breadcrumbs from '../components/Breadcrumbs';
import Honeypot from '../components/Honeypot';
import { CheckIcon } from '../components/Icons';
import { emailNewsroom, postForm } from '../lib/publicApi';

const EMPTY = { name: '', email: '', phone: '', headline: '', story: '' };
const MAX_IMAGE_BYTES = 4 * 1024 * 1024;

/** SubmitStory — readers and freelance writers send stories to the newsroom. */
export default function SubmitStory() {
  const [form, setForm] = useState(EMPTY);
  const [image, setImage] = useState(null);
  const [trap, setTrap] = useState('');
  const [errors, setErrors] = useState({});
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);

  const update = (field) => (e) => {
    setForm((f) => ({ ...f, [field]: e.target.value }));
    setErrors((prev) => ({ ...prev, [field]: undefined, form: undefined }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const next = {};
    if (!form.name.trim()) next.name = 'Please tell us your name.';
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(form.email.trim())) next.email = 'Please enter a valid email address.';
    if (!form.headline.trim()) next.headline = 'Please give your story a headline.';
    if (form.story.trim().length < 50) next.story = 'Please describe the story in at least 50 characters.';
    if (image && image.size > MAX_IMAGE_BYTES) next.image = 'The photo must be smaller than 4 MB.';
    if (Object.keys(next).length) {
      setErrors(next);
      return;
    }

    const data = new FormData();
    Object.entries(form).forEach(([k, v]) => data.append(k, v));
    data.append('website', trap);
    if (image) data.append('image', image);

    setSending(true);
    try {
      const saved = await postForm('/submissions', data);
      if (!trap && !saved?.emailed) {
        await emailNewsroom({
          subject: `New story submission: ${form.headline}`,
          name: form.name,
          email: form.email,
          fields: {
            Phone: form.phone || 'Not given',
            Headline: form.headline,
            Story: form.story,
            Photo: image ? 'Attached. View it in the dashboard under Submissions.' : 'None',
          },
        });
      }
      setSent(true);
      setForm(EMPTY);
      setImage(null);
    } catch (err) {
      setErrors({ form: err.message });
    } finally {
      setSending(false);
    }
  };

  const fieldClass = (field) =>
    `w-full rounded-lg border px-3 py-2.5 text-sm outline-none transition placeholder:text-ink-400 dark:bg-ink-900 ${
      errors[field] ? 'border-accent-500' : 'border-ink-300 focus:border-brand-500 dark:border-ink-700'
    }`;

  const fieldError = (field) =>
    errors[field] && (
      <p className="mt-1 text-xs text-accent-500" role="alert">
        {errors[field]}
      </p>
    );

  return (
    <>
      <Breadcrumbs items={[{ label: 'Submit a story' }]} />

      <section className="mx-auto max-w-3xl px-4 py-10">
        <p className="kicker mb-2">Share with the newsroom</p>
        <h1 className="text-3xl font-black leading-tight sm:text-4xl">Submit a story</h1>
        <p className="mt-4 text-base leading-7 text-ink-600 dark:text-ink-300">
          Witnessed something newsworthy, or written a piece you want us to consider? Send it here. An editor
          reviews every submission and will contact you before anything is published. Read our{' '}
          <Link to="/editorial-policy" className="font-medium text-brand-600 underline underline-offset-2 dark:text-brand-300">
            editorial policy
          </Link>
          .
        </p>

        <div className="surface mt-8 rounded-2xl p-6 sm:p-8">
          {sent ? (
            <div className="py-10 text-center">
              <span className="mx-auto mb-4 grid h-14 w-14 place-items-center rounded-full bg-emerald-100 text-emerald-700">
                <CheckIcon className="h-7 w-7" />
              </span>
              <h2 className="text-2xl font-bold">Story received</h2>
              <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-ink-600 dark:text-ink-300">
                Thank you. An editor will review it and get back to you by email.
              </p>
              <button
                type="button"
                onClick={() => setSent(false)}
                className="mt-6 rounded-lg border-2 border-ink-950 px-5 py-2.5 font-display text-sm font-medium uppercase tracking-wide transition hover:bg-ink-950 hover:text-white dark:border-white dark:hover:bg-white dark:hover:text-ink-950"
              >
                Submit another story
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} noValidate className="relative space-y-4">
              <Honeypot value={trap} onChange={(e) => setTrap(e.target.value)} />
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label htmlFor="s-name" className="mb-1.5 block text-sm font-medium">
                    Full name *
                  </label>
                  <input id="s-name" value={form.name} onChange={update('name')} className={fieldClass('name')} />
                  {fieldError('name')}
                </div>
                <div>
                  <label htmlFor="s-email" className="mb-1.5 block text-sm font-medium">
                    Email *
                  </label>
                  <input
                    id="s-email"
                    type="email"
                    value={form.email}
                    onChange={update('email')}
                    placeholder="you@example.com"
                    className={fieldClass('email')}
                  />
                  {fieldError('email')}
                </div>
              </div>

              <div>
                <label htmlFor="s-phone" className="mb-1.5 block text-sm font-medium">
                  Phone or WhatsApp (optional)
                </label>
                <input id="s-phone" value={form.phone} onChange={update('phone')} className={fieldClass('phone')} />
              </div>

              <div>
                <label htmlFor="s-headline" className="mb-1.5 block text-sm font-medium">
                  Headline *
                </label>
                <input
                  id="s-headline"
                  value={form.headline}
                  onChange={update('headline')}
                  placeholder="What happened, in one line"
                  className={fieldClass('headline')}
                />
                {fieldError('headline')}
              </div>

              <div>
                <label htmlFor="s-story" className="mb-1.5 block text-sm font-medium">
                  Your story *
                </label>
                <textarea
                  id="s-story"
                  rows={10}
                  value={form.story}
                  onChange={update('story')}
                  placeholder="Who, what, when, where and how you know. Include sources if you can."
                  className={fieldClass('story')}
                />
                {fieldError('story')}
              </div>

              <div>
                <label htmlFor="s-image" className="mb-1.5 block text-sm font-medium">
                  Photo (optional, up to 4 MB)
                </label>
                <input
                  id="s-image"
                  type="file"
                  accept="image/jpeg,image/png,image/webp,image/gif"
                  onChange={(e) => {
                    setImage(e.target.files?.[0] || null);
                    setErrors((prev) => ({ ...prev, image: undefined }));
                  }}
                  className="block w-full text-sm text-ink-600 file:mr-3 file:rounded-lg file:border-0 file:bg-ink-100 file:px-4 file:py-2 file:text-sm file:font-medium dark:text-ink-300 dark:file:bg-ink-800 dark:file:text-white"
                />
                {fieldError('image')}
              </div>

              {errors.form && (
                <p className="rounded-lg bg-danger-50 px-3 py-2 text-sm text-danger-700" role="alert">
                  {errors.form}
                </p>
              )}

              <button
                type="submit"
                disabled={sending}
                className="w-full rounded-lg bg-ink-950 px-6 py-3 font-display text-sm font-medium uppercase tracking-wide text-white transition hover:bg-brand-700 disabled:opacity-60 sm:w-auto dark:bg-white dark:text-ink-950 dark:hover:bg-brand-200"
              >
                {sending ? 'Sending…' : 'Send story'}
              </button>
            </form>
          )}
        </div>
      </section>
    </>
  );
}
