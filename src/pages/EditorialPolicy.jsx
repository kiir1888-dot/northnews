import LegalPage from './LegalPage';

/** EditorialPolicy — the editorial transparency statement. */
export default function EditorialPolicy() {
  return (
    <LegalPage
      breadcrumb="Editorial Policy"
      kicker="Transparency"
      title="Editorial Transparency Policy"
      updated="1 September 2026"
      intro="This statement explains who owns NORTH i, how we fund our journalism, how we make editorial decisions, and what you can expect when we get something wrong."
      sections={[
        {
          heading: '1. Ownership and funding',
          paragraphs: [
            'NORTH i is published by NORTH i Media Group Ltd., a privately held company. Our founder retains a controlling interest; no political party, government body or state-owned entity holds any stake, directly or indirectly.',
            'Revenue comes from reader subscriptions, display advertising, licensed syndication and philanthropic grants for specific investigative projects. Where a grant funds a body of work, that funder is named on every story produced under it.',
          ],
        },
        {
          heading: '2. Editorial independence',
          paragraphs: [
            'Commercial partners, advertisers and grant funders have no sight of, or influence over, editorial content before publication. Advertising is visually and structurally distinct from journalism, and any sponsored content is labelled as such at the top of the page.',
            'Editorial decisions are made by the Managing Editor in consultation with desk heads. The publisher does not exercise a veto over individual stories.',
          ],
        },
        {
          heading: '3. Sourcing and verification',
          paragraphs: [
            'We publish claims only where they are supported by documentation, direct observation, or at least two independent sources. Where a single source is used, this is disclosed in the story alongside our reasoning.',
            'Anonymity is granted only where a source faces a credible risk of retaliation and the information cannot be obtained otherwise. The reason for anonymity is always explained to readers.',
            'Quotes are never composited or reordered in a way that changes their meaning. Translations are marked, and the original language is available on request.',
          ],
        },
        {
          heading: '4. Use of artificial intelligence',
          paragraphs: [
            'We use automated tools for transcription, translation drafts, data extraction and archive search. Every output is reviewed by a journalist before it informs a published claim.',
            'We do not publish AI-generated article text, images or audio presented as reportage. Where a synthetic image is used to illustrate a concept, it is labelled in the caption.',
          ],
        },
        {
          heading: '5. Corrections and complaints',
          paragraphs: [
            'Factual errors are corrected promptly. Corrections appear as a dated note at the foot of the article describing precisely what changed. We do not silently amend published text.',
            'If you believe we have published something inaccurate or unfair, write to our newsroom address with the article URL and the specific claim in dispute. We acknowledge complaints within two working days and aim to resolve them within ten.',
          ],
        },
        {
          heading: '6. Conflicts of interest',
          paragraphs: [
            'Staff declare financial holdings, board positions, paid speaking engagements and close personal relationships relevant to their beat. Journalists are recused from stories where a declared interest could reasonably be seen to compromise independence.',
            'Gifts, hospitality and travel provided by organisations we cover are declined, or where acceptance is unavoidable, disclosed on the story.',
          ],
        },
      ]}
    />
  );
}
