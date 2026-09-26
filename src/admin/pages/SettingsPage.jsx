import { useEffect, useState } from 'react';
import { settingsApi } from '../api';
import { websiteConfig } from '../../config/websiteConfig';
import { sectionsToText } from '../../config/siteSettings';
import { formatDateTime } from '../utils';
import { Alert, PageHeader, inputClass, primaryButton, secondaryButton } from '../components/ui';

const SOCIAL_LABELS = {
  x: 'X / Twitter',
  facebook: 'Facebook',
  instagram: 'Instagram',
  linkedin: 'LinkedIn',
  youtube: 'YouTube',
};

const defaultSocial = (id) => websiteConfig.socials.find((s) => s.id === id)?.href || '';
const pageDefaults = (key) => {
  const p = websiteConfig.pages[key];
  return { updated: p.updated, intro: p.intro, body: sectionsToText(p.sections) };
};

/** Builds the form from the built-in defaults with any saved values on top. */
function buildForm(saved = {}) {
  const v = (value, fallback) => (typeof value === 'string' ? value : fallback);
  const c = saved.contact || {};
  const d = websiteConfig;
  const values = Array.isArray(saved.about?.values) && saved.about.values.length ? saved.about.values : d.about.values;
  return {
    brand: {
      tagline: v(saved.brand?.tagline, d.brand.tagline),
      description: v(saved.brand?.description, d.brand.description),
    },
    contact: {
      email: v(c.email, d.contact.email),
      phone: v(c.phone, d.contact.phone),
      whatsappUrl: v(c.whatsappUrl, d.contact.whatsappUrl),
      officeHours: v(c.officeHours, d.contact.officeHours),
      address: {
        line1: v(c.address?.line1, d.contact.address.line1),
        line2: v(c.address?.line2, d.contact.address.line2),
      },
    },
    socials: Object.fromEntries(
      Object.keys(SOCIAL_LABELS).map((id) => [id, v(saved.socials?.[id], defaultSocial(id))])
    ),
    newsletter: {
      heading: v(saved.newsletter?.heading, d.footer.newsletter.heading),
      copy: v(saved.newsletter?.copy, d.footer.newsletter.copy),
    },
    about: {
      story: v(saved.about?.story, d.about.story),
      values: [0, 1, 2, 3].map((i) => ({ title: values[i]?.title || '', body: values[i]?.body || '' })),
    },
    pages: {
      privacy: { ...pageDefaults('privacy'), ...(saved.pages?.privacy || {}) },
      editorial: { ...pageDefaults('editorial'), ...(saved.pages?.editorial || {}) },
    },
  };
}

/** Immutably sets a nested value, e.g. setIn(obj, ['contact', 'email'], 'x'). */
function setIn(obj, [key, ...rest], value) {
  if (Array.isArray(obj)) {
    const copy = [...obj];
    copy[key] = rest.length ? setIn(obj[key], rest, value) : value;
    return copy;
  }
  return { ...obj, [key]: rest.length ? setIn(obj[key], rest, value) : value };
}

function Section({ title, description, children }) {
  return (
    <section className="rounded-lg border border-ink-200 bg-white p-5 shadow-sm">
      <h2 className="text-sm font-semibold uppercase tracking-wider text-brand-700">{title}</h2>
      {description && <p className="mt-1 text-xs text-ink-500">{description}</p>}
      <div className="mt-4 space-y-4">{children}</div>
    </section>
  );
}

function Field({ label, hint, children }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-sm font-medium text-ink-700">{label}</span>
      {children}
      {hint && <span className="mt-1 block text-xs text-ink-400">{hint}</span>}
    </label>
  );
}

/** Site settings — edit website text without changing code. Admins only. */
export default function SettingsPage() {
  const [form, setForm] = useState(null);
  const [updatedAt, setUpdatedAt] = useState(null);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    settingsApi
      .get()
      .then((data) => {
        setForm(buildForm(data.settings));
        setUpdatedAt(data.updatedAt);
      })
      .catch((err) => setError(err.message));
  }, []);

  const bind = (...path) => ({
    value: path.reduce((o, k) => o?.[k], form) ?? '',
    onChange: (e) => {
      setForm((f) => setIn(f, path, e.target.value));
      setNotice('');
    },
  });

  async function save(e) {
    e.preventDefault();
    setError('');
    setNotice('');
    setSaving(true);
    try {
      const data = await settingsApi.save(form);
      setForm(buildForm(data.settings));
      setUpdatedAt(data.updatedAt);
      setNotice('Saved. Refresh the website to see the changes.');
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  }

  function resetPage(key) {
    if (!window.confirm('Replace this page text with the original default text?')) return;
    setForm((f) => setIn(f, ['pages', key], pageDefaults(key)));
  }

  if (!form) {
    return (
      <div className="p-6">
        <PageHeader title="Site settings" />
        <Alert>{error}</Alert>
        {!error && <p className="text-sm text-ink-500">Loading…</p>}
      </div>
    );
  }

  return (
    <form onSubmit={save} className="p-6">
      <PageHeader
        title="Site settings"
        subtitle={`Change the website's text and contact details.${updatedAt ? ` Last saved ${formatDateTime(updatedAt)}.` : ''}`}
      >
        <button type="submit" disabled={saving} className={primaryButton}>
          {saving ? 'Saving…' : 'Save changes'}
        </button>
      </PageHeader>
      <Alert>{error}</Alert>
      <Alert kind="info">{notice}</Alert>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
        <Section title="General">
          <Field label="Tagline" hint="Shown under the logo in the header.">
            <input className={inputClass} {...bind('brand', 'tagline')} />
          </Field>
          <Field label="Short description" hint="Used on the About page and in the footer.">
            <textarea rows={4} className={inputClass} {...bind('brand', 'description')} />
          </Field>
        </Section>

        <Section title="Contact details" description="Shown on the Contact page and in the footer.">
          <Field label="Email">
            <input type="email" className={inputClass} {...bind('contact', 'email')} />
          </Field>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Phone (as displayed)">
              <input className={inputClass} {...bind('contact', 'phone')} />
            </Field>
            <Field label="WhatsApp link" hint="Format: https://wa.me/211929150111">
              <input className={inputClass} {...bind('contact', 'whatsappUrl')} />
            </Field>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Address line 1">
              <input className={inputClass} {...bind('contact', 'address', 'line1')} />
            </Field>
            <Field label="Address line 2">
              <input className={inputClass} {...bind('contact', 'address', 'line2')} />
            </Field>
          </div>
          <Field label="Office hours">
            <input className={inputClass} {...bind('contact', 'officeHours')} />
          </Field>
        </Section>

        <Section title="Social media links" description="Paste the full link to each profile. Leave a box empty to hide that icon.">
          {Object.entries(SOCIAL_LABELS).map(([id, label]) => (
            <Field key={id} label={label}>
              <input className={inputClass} placeholder="https://" {...bind('socials', id)} />
            </Field>
          ))}
        </Section>

        <Section title="Newsletter box" description="The sign-up box in the footer.">
          <Field label="Heading">
            <input className={inputClass} {...bind('newsletter', 'heading')} />
          </Field>
          <Field label="Text">
            <textarea rows={3} className={inputClass} {...bind('newsletter', 'copy')} />
          </Field>
        </Section>

        <Section title="About page" description="The team and CEO sections are edited under Content.">
          <Field label="Our story">
            <textarea rows={5} className={inputClass} {...bind('about', 'story')} />
          </Field>
          {form.about.values.map((_, i) => (
            <div key={i} className="grid gap-2 rounded-md bg-ink-50 p-3">
              <Field label={`Value ${i + 1} title`}>
                <input className={inputClass} {...bind('about', 'values', i, 'title')} />
              </Field>
              <Field label={`Value ${i + 1} text`}>
                <textarea rows={2} className={inputClass} {...bind('about', 'values', i, 'body')} />
              </Field>
            </div>
          ))}
        </Section>

        {[
          ['privacy', 'Privacy Policy page'],
          ['editorial', 'Editorial Policy page'],
        ].map(([key, title]) => (
          <Section
            key={key}
            title={title}
            description='Start a heading line with "## ". Leave an empty line between paragraphs.'
          >
            <Field label="Last updated (as displayed)">
              <input className={inputClass} placeholder="e.g. 1 September 2026" {...bind('pages', key, 'updated')} />
            </Field>
            <Field label="Introduction">
              <textarea rows={3} className={inputClass} {...bind('pages', key, 'intro')} />
            </Field>
            <Field label="Page text">
              <textarea rows={14} className={`${inputClass} font-mono text-xs`} {...bind('pages', key, 'body')} />
            </Field>
            <button type="button" onClick={() => resetPage(key)} className={secondaryButton}>
              Restore original text
            </button>
          </Section>
        ))}
      </div>

      <div className="mt-6">
        <button type="submit" disabled={saving} className={primaryButton}>
          {saving ? 'Saving…' : 'Save changes'}
        </button>
      </div>
    </form>
  );
}
