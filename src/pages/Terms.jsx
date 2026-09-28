import LegalPage from './LegalPage';

const terms = {
  updated: '28 September 2026',
  intro:
    'These terms govern your access to and use of the NORTH i website, newsletters, forms and other digital services.',
  sections: [
    {
      heading: '1. Using this website',
      paragraphs: [
        'You may use NORTH i for lawful personal and informational purposes. You must not interfere with the operation or security of the website, attempt unauthorized access, or use automated tools in a way that disrupts service for other readers.',
        'You are responsible for ensuring that information you submit through our forms is accurate and that you have the right to share it.',
      ],
    },
    {
      heading: '2. Editorial content',
      paragraphs: [
        'Our reporting is provided for general information and does not constitute legal, financial, medical or other professional advice. Although we work to verify information before publication, developing stories may change as new facts emerge.',
        'Opinions expressed by contributors are their own unless an article states otherwise.',
      ],
    },
    {
      heading: '3. Copyright and permitted sharing',
      paragraphs: [
        'Unless otherwise stated, NORTH i owns or licenses the text, design, graphics and original media published on this website.',
        'You may share links and brief quotations with clear attribution. Republishing complete articles, removing attribution, or using our content commercially requires prior written permission.',
      ],
    },
    {
      heading: '4. Reader submissions',
      paragraphs: [
        'When you submit text, photos or other material, you confirm that you created it or have permission to share it. You retain ownership while granting NORTH i permission to review, edit and publish the material in connection with our journalism.',
        'Submitting material does not guarantee publication. We may contact you to verify facts, permissions or attribution before using it.',
      ],
    },
    {
      heading: '5. External links and availability',
      paragraphs: [
        'Links to third-party websites are provided for context or convenience. NORTH i does not control those services and is not responsible for their content, security or privacy practices.',
        'We may update, suspend or withdraw parts of the website when necessary for editorial, technical, security or legal reasons.',
      ],
    },
    {
      heading: '6. Changes to these terms',
      paragraphs: [
        'We may revise these terms as the website and our services develop. The updated date at the top of this page shows when the latest version took effect.',
      ],
    },
  ],
};

export default function Terms() {
  return (
    <LegalPage
      breadcrumb="Terms of Use"
      kicker="Legal"
      title="Terms of Use"
      updated={terms.updated}
      intro={terms.intro}
      sections={terms.sections}
    />
  );
}
