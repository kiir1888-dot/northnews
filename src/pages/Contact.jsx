import { useState } from 'react';
import Breadcrumbs from '../components/Breadcrumbs';
import { useSite } from '../context/SiteContext';
import { CheckIcon, MailIcon, PhoneIcon, PinIcon, ClockIcon } from '../components/Icons';

const subjects = [
  'News tip',
  'Correction request',
  'Press & media',
  'Advertising',
  'Careers',
  'Something else',
];

/** Contact — corporate contact details plus a validated enquiry form. */
export default function Contact() {
  const { config } = useSite();
  const { contact } = config;

  const [form, setForm] = useState({ name: '', email: '', subject: subjects[0], message: '' });
  const [errors, setErrors] = useState({});
  const [sent, setSent] = useState(false);

  const update = (field) => (e) => {
    setForm((f) => ({ ...f, [field]: e.target.value }));
    setErrors((prev) => ({ ...prev, [field]: undefined }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const next = {};
    if (!form.name.trim()) next.name = 'Please tell us your name.';
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(form.email.trim()))
      next.email = 'Please enter a valid email address.';
    if (form.message.trim().length < 20)
      next.message = 'Please give us at least 20 characters of detail.';

    if (Object.keys(next).length) {
      setErrors(next);
      return;
    }
    setSent(true);
    setForm({ name: '', email: '', subject: subjects[0], message: '' });
  };

  const fieldClass = (field) =>
    `w-full rounded-lg border px-3 py-2.5 text-sm outline-none transition placeholder:text-ink-400 dark:bg-ink-900 ${
      errors[field] ? 'border-accent-500' : 'border-ink-300 focus:border-brand-500 dark:border-ink-700'
    }`;

  return (
    <>
      <Breadcrumbs items={[{ label: 'Contact Us' }]} />

      <section className="mx-auto max-w-8xl px-4 py-10">
        <div className="grid gap-10 lg:grid-cols-12">
          {/* -------------------------- details ---------------------- */}
          <div className="lg:col-span-5">
            <p className="kicker mb-2">Get in touch</p>
            <h1 className="text-3xl font-black leading-tight sm:text-4xl">Contact Us</h1>
            <p className="mt-4 text-base leading-7 text-ink-600 dark:text-ink-300">
              Story tips, corrections, partnership enquiries or feedback — the newsroom reads
              everything that arrives here. We aim to respond within two working days.
            </p>

            <ul className="mt-8 space-y-5">
              <li className="flex gap-3">
                <span className="grid h-10 w-10 shrink-0 place-items-center rounded-lg bg-ink-100 text-brand-600 dark:bg-ink-800 dark:text-brand-300">
                  <MailIcon className="h-5 w-5" />
                </span>
                <div>
                  <p className="font-display text-xs uppercase tracking-wider text-ink-500 dark:text-ink-400">
                    Email
                  </p>
                  <a href={`mailto:${contact.email}`} className="font-medium hover:text-brand-600">
                    {contact.email}
                  </a>
                  <br />
                  <a
                    href={`mailto:${contact.pressEmail}`}
                    className="text-sm text-ink-600 hover:text-brand-600 dark:text-ink-300"
                  >
                    {contact.pressEmail} (press)
                  </a>
                </div>
              </li>

              <li className="flex gap-3">
                <span className="grid h-10 w-10 shrink-0 place-items-center rounded-lg bg-ink-100 text-brand-600 dark:bg-ink-800 dark:text-brand-300">
                  <PhoneIcon className="h-5 w-5" />
                </span>
                <div>
                  <p className="font-display text-xs uppercase tracking-wider text-ink-500 dark:text-ink-400">
                    Phone
                  </p>
                  <a
                    href={`tel:${contact.phone.replace(/[^+\d]/g, '')}`}
                    className="font-medium hover:text-brand-600"
                  >
                    {contact.phone}
                  </a>
                </div>
              </li>

              <li className="flex gap-3">
                <span className="grid h-10 w-10 shrink-0 place-items-center rounded-lg bg-ink-100 text-brand-600 dark:bg-ink-800 dark:text-brand-300">
                  <PinIcon className="h-5 w-5" />
                </span>
                <div>
                  <p className="font-display text-xs uppercase tracking-wider text-ink-500 dark:text-ink-400">
                    Newsroom
                  </p>
                  <p className="font-medium">{contact.address.line1}</p>
                  <p className="text-sm text-ink-600 dark:text-ink-300">{contact.address.line2}</p>
                </div>
              </li>

              <li className="flex gap-3">
                <span className="grid h-10 w-10 shrink-0 place-items-center rounded-lg bg-ink-100 text-brand-600 dark:bg-ink-800 dark:text-brand-300">
                  <ClockIcon className="h-5 w-5" />
                </span>
                <div>
                  <p className="font-display text-xs uppercase tracking-wider text-ink-500 dark:text-ink-400">
                    Office hours
                  </p>
                  <p className="font-medium">{contact.officeHours}</p>
                </div>
              </li>
            </ul>
          </div>

          {/* ---------------------------- form ----------------------- */}
          <div className="lg:col-span-7">
            <div className="surface rounded-2xl p-6 sm:p-8">
              {sent ? (
                <div className="py-10 text-center">
                  <span className="mx-auto mb-4 grid h-14 w-14 place-items-center rounded-full bg-emerald-100 text-emerald-700">
                    <CheckIcon className="h-7 w-7" />
                  </span>
                  <h2 className="text-2xl font-bold">Message received</h2>
                  <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-ink-600 dark:text-ink-300">
                    Thank you — a member of the newsroom will respond within two working days.
                  </p>
                  <button
                    type="button"
                    onClick={() => setSent(false)}
                    className="mt-6 rounded-lg border-2 border-ink-950 px-5 py-2.5 font-display text-sm font-medium uppercase tracking-wide transition hover:bg-ink-950 hover:text-white dark:border-white dark:hover:bg-white dark:hover:text-ink-950"
                  >
                    Send another message
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} noValidate>
                  <h2 className="mb-1 text-2xl font-bold">Send us a message</h2>
                  <p className="mb-6 text-sm text-ink-500 dark:text-ink-400">
                    Fields marked with an asterisk are required.
                  </p>

                  <div className="grid gap-4 sm:grid-cols-2">
                    <div>
                      <label htmlFor="c-name" className="mb-1.5 block text-sm font-medium">
                        Full name *
                      </label>
                      <input
                        id="c-name"
                        value={form.name}
                        onChange={update('name')}
                        aria-invalid={Boolean(errors.name)}
                        placeholder="Jane Okafor"
                        className={fieldClass('name')}
                      />
                      {errors.name && (
                        <p className="mt-1 text-xs text-accent-500" role="alert">
                          {errors.name}
                        </p>
                      )}
                    </div>

                    <div>
                      <label htmlFor="c-email" className="mb-1.5 block text-sm font-medium">
                        Email address *
                      </label>
                      <input
                        id="c-email"
                        type="email"
                        value={form.email}
                        onChange={update('email')}
                        aria-invalid={Boolean(errors.email)}
                        placeholder="you@example.com"
                        className={fieldClass('email')}
                      />
                      {errors.email && (
                        <p className="mt-1 text-xs text-accent-500" role="alert">
                          {errors.email}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="mt-4">
                    <label htmlFor="c-subject" className="mb-1.5 block text-sm font-medium">
                      Subject
                    </label>
                    <select
                      id="c-subject"
                      value={form.subject}
                      onChange={update('subject')}
                      className={fieldClass('subject')}
                    >
                      {subjects.map((s) => (
                        <option key={s}>{s}</option>
                      ))}
                    </select>
                  </div>

                  <div className="mt-4">
                    <label htmlFor="c-message" className="mb-1.5 block text-sm font-medium">
                      Message *
                    </label>
                    <textarea
                      id="c-message"
                      rows={6}
                      value={form.message}
                      onChange={update('message')}
                      aria-invalid={Boolean(errors.message)}
                      placeholder="Tell us what's on your mind…"
                      className={fieldClass('message')}
                    />
                    {errors.message && (
                      <p className="mt-1 text-xs text-accent-500" role="alert">
                        {errors.message}
                      </p>
                    )}
                  </div>

                  <button
                    type="submit"
                    className="mt-6 w-full rounded-lg bg-ink-950 px-6 py-3 font-display text-sm font-medium uppercase tracking-wide text-white transition hover:bg-brand-700 sm:w-auto dark:bg-white dark:text-ink-950 dark:hover:bg-brand-200"
                  >
                    Send message
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
