import LegalPage from './LegalPage';

/** Privacy — privacy and cookies notice. */
export default function Privacy() {
  return (
    <LegalPage
      breadcrumb="Privacy Policy"
      kicker="Legal"
      title="Privacy & Cookies Policy"
      updated="1 September 2026"
      intro="This notice explains what personal data NORTH i collects, why we collect it, how long we keep it, and the rights you have over it."
      sections={[
        {
          heading: '1. Data we collect',
          paragraphs: [
            'Account and newsletter data: the email address you provide, and your subscription preferences. We do not require a real name to read NORTH i.',
            'Usage data: pages viewed, referring site, approximate location derived from IP address, device type and browser. This is aggregated for audience reporting and is not used to build advertising profiles.',
            'Correspondence: messages you send through our contact form or by email, retained so we can respond and maintain a record of complaints and corrections.',
          ],
        },
        {
          heading: '2. Cookies',
          paragraphs: [
            'Essential cookies keep you signed in, remember your theme preference and secure form submissions. These cannot be disabled without breaking core functionality.',
            'Analytics cookies help us understand which stories readers finish and which they abandon. These are optional, and are only set after you accept them in the consent banner.',
            'You can change your choice at any time by clearing site data in your browser, which will cause the consent banner to appear again on your next visit.',
          ],
        },
        {
          heading: '3. How we use your data',
          paragraphs: [
            'To deliver the newsletters and services you request, to improve our journalism and product, to prevent abuse and fraud, and to comply with legal obligations.',
            'We do not sell personal data. We do not share reader-level data with advertisers.',
          ],
        },
        {
          heading: '4. Retention',
          paragraphs: [
            'Newsletter data is held until you unsubscribe, plus 30 days. Aggregated analytics are retained for 26 months. Correspondence is retained for three years, or longer where it relates to an unresolved complaint or legal matter.',
          ],
        },
        {
          heading: '5. Your rights',
          paragraphs: [
            'You may request access to the personal data we hold about you, ask for it to be corrected or erased, object to processing, or request a portable copy. Write to our newsroom address and we will respond within one month.',
            'Where processing relies on consent, you may withdraw that consent at any time without affecting the lawfulness of processing carried out beforehand.',
          ],
        },
        {
          heading: '6. Security',
          paragraphs: [
            'Data is encrypted in transit and at rest. Access is restricted to staff who need it, logged, and reviewed quarterly. If a breach affects your data and poses a material risk, we will notify you and the relevant supervisory authority without undue delay.',
          ],
        },
      ]}
    />
  );
}
