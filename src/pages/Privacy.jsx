import LegalPage from './LegalPage';
import { useSite } from '../context/SiteContext';

/** Privacy — privacy and cookies notice. Text is editable in Site settings. */
export default function Privacy() {
  const { config } = useSite();
  const page = config.pages.privacy;
  return (
    <LegalPage
      breadcrumb="Privacy Policy"
      kicker="Legal"
      title="Privacy & Cookies Policy"
      updated={page.updated}
      intro={page.intro}
      sections={page.sections}
    />
  );
}
