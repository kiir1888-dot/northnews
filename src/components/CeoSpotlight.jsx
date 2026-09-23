import { useSite } from '../context/SiteContext';

/**
 * CeoSpotlight — "From the founder's desk" banner.
 *
 * Reads the live CEO/Founder profile published from the admin dashboard
 * (`/api/ceo`) — name, title, message and photo. There is no hardcoded
 * fallback content; edit the profile from the admin panel.
 */
export default function CeoSpotlight() {
  const { ceoProfile, ceoLoading } = useSite();

  if (ceoLoading) {
    return (
      <section aria-label="About the owner" className="mx-auto max-w-8xl px-4 py-10">
        <div className="surface rounded-2xl p-10 text-center text-sm text-ink-500 dark:text-ink-400">
          Loading founder profile…
        </div>
      </section>
    );
  }

  if (!ceoProfile || !ceoProfile.name) {
    return (
      <section aria-label="About the owner" className="mx-auto max-w-8xl px-4 py-10">
        <div className="surface rounded-2xl p-10 text-center text-sm text-ink-500 dark:text-ink-400">
          Founder profile not published yet.
        </div>
      </section>
    );
  }

  return (
    <section aria-label="About the owner" className="mx-auto max-w-8xl px-4 py-10">
      <div className="overflow-hidden rounded-2xl bg-ink-950 text-white dark:bg-brand-950">
        <div className="grid items-stretch gap-0 lg:grid-cols-12">
          {/* Portrait — object-cover protects the layout from any aspect ratio */}
          <div className="relative lg:col-span-4">
            <div className="aspect-[4/3] h-full w-full bg-ink-800 sm:aspect-[16/9] lg:aspect-auto lg:min-h-[26rem]">
              {ceoProfile.imagePath ? (
                <img
                  src={ceoProfile.imagePath}
                  alt={ceoProfile.name}
                  loading="lazy"
                  className="h-full w-full object-cover"
                />
              ) : (
                <div
                  className="grid h-full w-full place-items-center font-serif text-3xl font-black text-ink-500"
                  aria-hidden="true"
                >
                  N
                </div>
              )}
            </div>
            <div className="absolute inset-0 bg-gradient-to-t from-ink-950/70 to-transparent lg:bg-gradient-to-r" />
          </div>

          {/* Copy */}
          <div className="flex flex-col justify-center p-6 sm:p-10 lg:col-span-8">
            <p className="kicker mb-3 text-brand-300">From the founder’s desk</p>

            <h2 className="text-2xl font-black sm:text-3xl">{ceoProfile.name}</h2>
            {ceoProfile.title && (
              <p className="mt-1 font-display text-sm uppercase tracking-[0.16em] text-brand-300">
                {ceoProfile.title}
              </p>
            )}

            {ceoProfile.message && (
              <p className="mt-4 max-w-2xl text-sm leading-7 text-ink-300">{ceoProfile.message}</p>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
