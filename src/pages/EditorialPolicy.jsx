import LegalPage from './LegalPage';
import { useSite } from '../context/SiteContext';

/** EditorialPolicy — the editorial transparency statement. Editable in Site settings. */
export default function EditorialPolicy() {
  const { config } = useSite();
  const page = config.pages.editorial;
  return (
    <LegalPage
      breadcrumb="Editorial Policy"
      kicker="Transparency"
      title="Editorial Transparency Policy"
      updated={page.updated}
      intro={page.intro}
      sections={page.sections}
    />
  );
}
