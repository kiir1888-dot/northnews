import { useState } from 'react';
import {
  CheckIcon,
  FacebookIcon,
  LinkIcon,
  LinkedInIcon,
  WhatsAppIcon,
  XIcon,
} from './Icons';

/**
 * ShareBar — floating sticky social share rail for single articles.
 * Renders as a vertical rail on desktop (xl+) and a fixed bottom bar on mobile.
 */
export default function ShareBar({ title, className }) {
  const [copied, setCopied] = useState(false);
  const url = typeof window !== 'undefined' ? window.location.href : '';
  const encodedUrl = encodeURIComponent(url);
  const encodedTitle = encodeURIComponent(title ?? '');

  const targets = [
    { id: 'x', label: 'Share on X', Icon: XIcon, href: `https://twitter.com/intent/tweet?url=${encodedUrl}&text=${encodedTitle}` },
    { id: 'facebook', label: 'Share on Facebook', Icon: FacebookIcon, href: `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}` },
    { id: 'linkedin', label: 'Share on LinkedIn', Icon: LinkedInIcon, href: `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}` },
    { id: 'whatsapp', label: 'Share on WhatsApp', Icon: WhatsAppIcon, href: `https://wa.me/?text=${encodedTitle}%20${encodedUrl}` },
  ];

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      /* clipboard unavailable — silently ignore */
    }
  };

  const buttonClass =
    'grid h-10 w-10 place-items-center rounded-full border border-ink-200 text-ink-600 transition hover:border-brand-500 hover:bg-brand-50 hover:text-brand-600 dark:border-ink-700 dark:text-ink-300 dark:hover:bg-ink-800 dark:hover:text-brand-300';

  return (
    <>
      {/* Desktop: sticky vertical rail */}
      <aside
        aria-label="Share this article"
        className={`sticky top-48 hidden flex-col items-center gap-3 xl:flex ${className ?? ''}`}
      >
        <span className="font-display text-[10px] uppercase tracking-[0.18em] text-ink-500 dark:text-ink-400">
          Share
        </span>
        {targets.map(({ id, label, Icon, href }) => (
          <a
            key={id}
            href={href}
            target="_blank"
            rel="noreferrer noopener"
            aria-label={label}
            className={buttonClass}
          >
            <Icon className="h-4 w-4" />
          </a>
        ))}
        <button type="button" onClick={copyLink} aria-label="Copy article link" className={buttonClass}>
          {copied ? <CheckIcon className="h-4 w-4 text-emerald-600" /> : <LinkIcon className="h-4 w-4" />}
        </button>
      </aside>

      {/* Mobile / tablet: fixed bottom bar */}
      <div className="fixed inset-x-0 bottom-0 z-30 border-t border-ink-200 bg-white/95 backdrop-blur xl:hidden dark:border-ink-800 dark:bg-ink-950/95">
        <div className="mx-auto flex max-w-8xl items-center justify-center gap-3 px-4 py-2.5">
          <span className="font-display text-[10px] uppercase tracking-[0.18em] text-ink-500 dark:text-ink-400">
            Share
          </span>
          {targets.map(({ id, label, Icon, href }) => (
            <a
              key={id}
              href={href}
              target="_blank"
              rel="noreferrer noopener"
              aria-label={label}
              className={buttonClass}
            >
              <Icon className="h-4 w-4" />
            </a>
          ))}
          <button type="button" onClick={copyLink} aria-label="Copy article link" className={buttonClass}>
            {copied ? <CheckIcon className="h-4 w-4 text-emerald-600" /> : <LinkIcon className="h-4 w-4" />}
          </button>
        </div>
      </div>
    </>
  );
}
