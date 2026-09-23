import Hero from '../components/Hero';
import FeaturedPosts from '../components/FeaturedPosts';
import NewsTabs from '../components/NewsTabs';
import CeoSpotlight from '../components/CeoSpotlight';
import TeamGrid from '../components/TeamGrid';

/** Home — assembles the full homepage in reading order. */
export default function Home() {
  return (
    <>
      <Hero />
      <FeaturedPosts />
      <NewsTabs />
      <CeoSpotlight />
      <TeamGrid />
    </>
  );
}
