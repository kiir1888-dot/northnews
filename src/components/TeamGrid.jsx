import SectionHeading from './SectionHeading';
import { useSite } from '../context/SiteContext';
import { cx } from '../utils/format';

/** Shared placeholder shown wherever a team member has no uploaded photo. */
function ImagePlaceholder({ className }) {
  return (
    <div
      className={cx(
        'grid h-full w-full place-items-center bg-ink-100 font-serif text-2xl font-black text-ink-300 dark:bg-ink-800 dark:text-ink-600',
        className
      )}
      aria-hidden="true"
    >
      N
    </div>
  );
}

/**
 * TeamGrid — the "Editorial Team" section.
 *
 * Reads the live roster published from the admin dashboard (`/api/team`).
 * There is no hardcoded fallback content — add, edit or remove members
 * entirely from the admin panel.
 *
 * Responsive columns: 1 (mobile) → 2 (sm) → 3 (lg) → 4 (xl).
 */
export default function TeamGrid({ showHeading = true }) {
  const { config, teamMembers, teamLoading } = useSite();

  return (
    <section aria-label="Editorial team" className="mx-auto max-w-8xl px-4 py-10">
      {showHeading && (
        <SectionHeading
          kicker="Our company"
          title="Editorial Team"
          description={
            teamMembers.length > 0
              ? `The ${teamMembers.length} editors, reporters and producers responsible for what you read on ${config.brand.name}.`
              : `The people behind ${config.brand.name}.`
          }
        />
      )}

      {teamLoading ? (
        <p className="surface rounded-xl p-10 text-center text-sm text-ink-500 dark:text-ink-400">
          Loading team…
        </p>
      ) : teamMembers.length === 0 ? (
        <p className="surface rounded-xl p-10 text-center text-sm text-ink-500 dark:text-ink-400">
          No team members published yet.
        </p>
      ) : (
        <ul className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {teamMembers.map((member) => (
            <li key={member.id}>
              <article className="surface card-hover group flex h-full flex-col overflow-hidden rounded-xl text-center">
                {/* Square crop keeps portraits uniform regardless of source size */}
                <div className="aspect-square w-full overflow-hidden bg-ink-100 dark:bg-ink-800">
                  {member.imagePath ? (
                    <img
                      src={member.imagePath}
                      alt={member.name}
                      loading="lazy"
                      className="h-full w-full object-cover object-center transition duration-500 group-hover:scale-105"
                    />
                  ) : (
                    <ImagePlaceholder />
                  )}
                </div>

                <div className="flex flex-1 flex-col p-4">
                  <h3 className="text-lg font-bold leading-tight">{member.name}</h3>
                  <p className="mt-1 font-display text-[11px] uppercase tracking-[0.14em] text-brand-600 dark:text-brand-300">
                    {member.role}
                  </p>
                </div>
              </article>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
