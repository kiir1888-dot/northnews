/**
 * SectionHeading — consistent kicker / serif title / supporting copy block
 * used at the top of every homepage section.
 */
export default function SectionHeading({ kicker, title, description, action, as: Heading = 'h2' }) {
  return (
    <div className="mb-6 flex flex-wrap items-end justify-between gap-4 border-b border-ink-200 pb-4 dark:border-ink-800">
      <div className="max-w-2xl">
        {kicker && <p className="kicker mb-1">{kicker}</p>}
        <Heading className="text-2xl font-black leading-tight sm:text-3xl">{title}</Heading>
        {description && (
          <p className="mt-2 text-sm leading-6 text-ink-600 dark:text-ink-300">{description}</p>
        )}
      </div>
      {action}
    </div>
  );
}
