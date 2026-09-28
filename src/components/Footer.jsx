import { Link } from 'react-router-dom';
import NewsletterForm from './NewsletterForm';
import { useSite } from '../context/SiteContext';
import { MailIcon, PinIcon, WhatsAppIcon, socialIconMap } from './Icons';

/**
 * Footer — comprehensive 4-column corporate footer:
 *   • About Us summary + contact details + social links
 *   • Newsletter subscription box
 *   • Categorised navigation columns (Politics, Tech, Lifestyle, Corporate)
 *   • Legal bar with privacy policy and copyright
 *
 * All content is sourced from `websiteConfig.footer`, `brand` and `contact`.
 */
export default function Footer() {
  const { config } = useSite();
  const { brand, contact, socials, footer } = config;
  const year = new Date().getFullYear();

  return (
    <footer className="mt-12 border-t border-ink-200 bg-ink-950 text-ink-300 dark:border-ink-800">
      <div className="mx-auto max-w-8xl px-4 py-12">
        <div className="grid gap-10 lg:grid-cols-12">
          {/* ------------------------ About Us ------------------------- */}
          <div className="lg:col-span-4">
            <Link to="/" className="group mb-4 inline-flex items-center gap-2" aria-label={`${brand.name} home`}>
              <span
                aria-hidden="true"
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-white font-serif text-[10px] font-black tracking-tight text-ink-950 shadow-sm ring-1 ring-white/20 transition-transform duration-200 group-hover:scale-105"
              >
                NOR
              </span>
              <span className="font-serif text-2xl font-black text-white">
                {brand.nameParts.primary}
                <span className="text-accent-500"> {brand.nameParts.accent}</span>
              </span>
            </Link>

            <h2 className="mb-2 font-display text-xs uppercase tracking-[0.18em] text-brand-300">
              About Us
            </h2>
            <p className="mb-5 max-w-md text-sm leading-6">{brand.description}</p>

            <ul className="space-y-2 text-sm">
              <li className="flex items-start gap-2">
                <PinIcon className="mt-0.5 h-4 w-4 shrink-0 text-brand-300" />
                <span>
                  {contact.address.line1}, {contact.address.line2}
                </span>
              </li>
              <li>
                <a
                  href={`mailto:${contact.email}`}
                  className="flex items-center gap-2 transition hover:text-white"
                >
                  <MailIcon className="h-4 w-4 shrink-0 text-brand-300" />
                  {contact.email}
                </a>
              </li>
              <li>
                <a
                  href={contact.whatsappUrl}
                  target="_blank"
                  rel="noreferrer noopener"
                  aria-label={`WhatsApp ${contact.phone}`}
                  className="flex items-center gap-2 transition hover:text-white"
                >
                  <WhatsAppIcon className="h-4 w-4 shrink-0 text-brand-300" />
                  {contact.phone}
                </a>
              </li>
            </ul>

            <nav aria-label="Social media" className="mt-5 flex flex-wrap gap-2">
              {socials.map((s) => {
                const Icon = socialIconMap[s.id];
                return (
                  <a
                    key={s.id}
                    href={s.href}
                    target="_blank"
                    rel="noreferrer noopener"
                    aria-label={s.label}
                    className="rounded-full border border-white/15 p-2.5 transition hover:border-brand-300 hover:bg-white/10 hover:text-white"
                  >
                    {Icon ? <Icon className="h-4 w-4" /> : s.label}
                  </a>
                );
              })}
            </nav>
          </div>

          {/* --------------------- category columns -------------------- */}
          <div className="grid gap-8 sm:grid-cols-2 lg:col-span-5 lg:grid-cols-4">
            {footer.columns.map((col) => (
              <nav key={col.heading} aria-label={col.heading}>
                <h2 className="mb-3 font-display text-xs uppercase tracking-[0.18em] text-brand-300">
                  {col.heading}
                </h2>
                <ul className="space-y-2 text-sm">
                  {col.links.map((link) => (
                    <li key={link.label}>
                      <Link to={link.to} className="transition hover:text-white">
                        {link.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </nav>
            ))}
          </div>

          {/* ------------------------ newsletter ----------------------- */}
          <div className="lg:col-span-3">
            <h2 className="mb-2 font-display text-xs uppercase tracking-[0.18em] text-brand-300">
              {footer.newsletter.heading}
            </h2>
            <p className="mb-4 text-sm leading-6">{footer.newsletter.copy}</p>
            <NewsletterForm variant="dark" />
          </div>
        </div>
      </div>

      {/* ------------------------- legal bar ------------------------- */}
      <div className="border-t border-white/10">
        <div className="mx-auto flex max-w-8xl flex-col items-center justify-between gap-3 px-4 py-5 text-xs sm:flex-row">
          <p>
            © {year} {brand.legalEntity} All rights reserved. Established {brand.foundedYear}.
          </p>
          <nav aria-label="Legal" className="flex flex-wrap items-center gap-x-4 gap-y-2">
            {footer.legalLinks.map((l) => (
              <Link key={l.label} to={l.to} className="transition hover:text-white">
                {l.label}
              </Link>
            ))}
          </nav>
        </div>
      </div>
    </footer>
  );
}
