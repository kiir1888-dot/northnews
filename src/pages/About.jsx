import Breadcrumbs from '../components/Breadcrumbs';
import CeoSpotlight from '../components/CeoSpotlight';
import TeamGrid from '../components/TeamGrid';
import SectionHeading from '../components/SectionHeading';
import { useSite } from '../context/SiteContext';

/** About — corporate overview, values, CEO profile and the team grid. */
export default function About() {
  const { config } = useSite();
  const { brand, about } = config;
  const values = about.values;

  return (
    <>
      <Breadcrumbs items={[{ label: 'About Us' }]} />

      <section className="mx-auto max-w-8xl px-4 py-10">
        <div className="grid gap-8 lg:grid-cols-12 lg:items-center">
          <div className="lg:col-span-7">
            <p className="kicker mb-2">Who we are</p>
            <h1 className="text-3xl font-black leading-tight sm:text-5xl">
              About {brand.name}
            </h1>
            <p className="mt-5 text-lg leading-8 text-ink-600 dark:text-ink-300">
              {brand.description}
            </p>
            <p className="mt-4 whitespace-pre-line text-base leading-8 text-ink-600 dark:text-ink-300">
              {about.story}
            </p>
          </div>

          <div className="lg:col-span-5">
            <div className="aspect-[4/3] w-full overflow-hidden rounded-2xl bg-ink-100 dark:bg-ink-800">
              <img
                src="https://images.unsplash.com/photo-1504711434969-e33886168f5c?auto=format&fit=crop&w=1200&q=80"
                alt="The North i newsroom"
                loading="lazy"
                className="h-full w-full object-cover"
              />
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-8xl px-4 py-8">
        <SectionHeading
          kicker="What we stand for"
          title="Our editorial values"
          description={`${values.length === 4 ? 'Four' : 'The'} commitments that govern every story we publish.`}
        />
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {values.map((v, i) => (
            <article key={v.title} className="surface rounded-xl p-5">
              <span className="font-serif text-3xl font-bold text-ink-200 dark:text-ink-700">
                {String(i + 1).padStart(2, '0')}
              </span>
              <h3 className="mt-2 text-lg font-bold leading-snug">{v.title}</h3>
              <p className="mt-2 text-sm leading-6 text-ink-600 dark:text-ink-300">{v.body}</p>
            </article>
          ))}
        </div>
      </section>

      <CeoSpotlight />
      <TeamGrid />
    </>
  );
}
