import Breadcrumbs from '../components/Breadcrumbs';
import { useSite } from '../context/SiteContext';

/**
 * LegalPage — shared template for long-form policy documents.
 * `sections` is an array of { heading, paragraphs[] }.
 */
export default function LegalPage({ breadcrumb, kicker, title, intro, sections, updated }) {
  const { config } = useSite();

  return (
    <>
      <Breadcrumbs items={[{ label: breadcrumb }]} />

      <article className="mx-auto max-w-3xl px-4 py-10">
        <p className="kicker mb-2">{kicker}</p>
        <h1 className="text-3xl font-black leading-tight sm:text-4xl">{title}</h1>
        <p className="mt-3 font-display text-xs uppercase tracking-wider text-ink-500 dark:text-ink-400">
          Last updated {updated} · {config.brand.legalEntity}
        </p>

        <p className="mt-6 text-lg leading-8 text-ink-700 dark:text-ink-200">{intro}</p>

        <div className="mt-10 space-y-9">
          {sections.map((section) => (
            <section key={section.heading}>
              <h2 className="mb-3 text-xl font-bold">{section.heading}</h2>
              {section.paragraphs.map((p, i) => (
                <p key={i} className="mb-3 text-[1.0625rem] leading-8 text-ink-700 dark:text-ink-200">
                  {p}
                </p>
              ))}
            </section>
          ))}
        </div>

        <aside className="surface mt-12 rounded-xl p-5">
          <h2 className="text-lg font-bold">Questions about this policy?</h2>
          <p className="mt-2 text-sm leading-6 text-ink-600 dark:text-ink-300">
            Write to{' '}
            <a
              href={`mailto:${config.contact.email}`}
              className="font-medium text-brand-600 underline underline-offset-2 dark:text-brand-300"
            >
              {config.contact.email}
            </a>{' '}
            and we will respond within two working days.
          </p>
        </aside>
      </article>
    </>
  );
}
