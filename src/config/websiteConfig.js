/**
 * =============================================================================
 *  North i — SITE CONFIGURATION
 * =============================================================================
 *  This is the single source of truth for everything "corporate" about the
 *  publication: branding, contact details, navigation and social profiles.
 *
 *  The CEO/Founder profile and editorial team roster are managed from the
 *  admin dashboard and fetched live at runtime — see `useSite()`'s
 *  `ceoProfile` / `teamMembers`, not this file.
 * =============================================================================
 */

import { defaultPages } from './pageContent';

export const websiteConfig = {
  /* ---------------------------------------------------------------------- */
  /* BRAND                                                                   */
  /* ---------------------------------------------------------------------- */
  brand: {
    name: 'North i',
    // The name is rendered as two parts so the accent mark can be styled.
    nameParts: { primary: 'North', accent: 'i' },
    tagline: 'journalism without a compass bias',
    description:
      'North i is an independent digital newsroom covering politics, technology, business, sport, education and culture. We publish verified reporting, long-form analysis and data journalism for readers who want the full picture, not the loudest headline.',
    foundedYear: 2026,
    legalEntity: 'North i Media Group Ltd.',
    locale: 'en-GB',
    timeZone: 'Africa/Juba',
  },

  /* ---------------------------------------------------------------------- */
  /* CONTACT                                                                 */
  /* ---------------------------------------------------------------------- */
  contact: {
    email: 'newsnorthi08@gmail.com',
    phone: '+211 929 150 111',
    whatsappUrl: 'https://wa.me/211929150111',
    address: {
      line1: 'Alem Building',
      line2: 'Atlabara, Juba, South Sudan',
    },
    officeHours: 'Open 24 hours, 7 days a week',
  },

  /* ---------------------------------------------------------------------- */
  /* SOCIAL PROFILES — used in the header, footer and article share bar      */
  /* ---------------------------------------------------------------------- */
  socials: [
    { id: 'x', label: 'X / Twitter', href: 'https://x.com/northi' },
    { id: 'facebook', label: 'Facebook', href: 'https://www.facebook.com/share/1LbQQDtFjZ/' },
    { id: 'instagram', label: 'Instagram', href: 'https://instagram.com/northi' },
    { id: 'linkedin', label: 'LinkedIn', href: 'https://linkedin.com/company/northi' },
    { id: 'youtube', label: 'YouTube', href: 'https://youtube.com/@northi' },
  ],

  /* ---------------------------------------------------------------------- */
  /* PRIMARY NAVIGATION                                                      */
  /* ---------------------------------------------------------------------- */
  navigation: [
    { label: 'Home', to: '/' },
    { label: 'Politics', to: '/category/politics' },
    { label: 'Technology', to: '/category/technology' },
    { label: 'Business', to: '/category/business' },
    { label: 'Sports', to: '/category/sports' },
    { label: 'Education', to: '/category/education' },
    { label: 'Events', to: '/events' },
    { label: 'About', to: '/about' },
    { label: 'Contact', to: '/contact' },
  ],

  /* ---------------------------------------------------------------------- */
  /* NOTE — CEO/Founder profile and the editorial team roster are no longer  */
  /* configured here. They are managed entirely from the admin dashboard    */
  /* and rendered live via `useSite().ceoProfile` / `useSite().teamMembers`  */
  /* (see <CeoSpotlight /> and <TeamGrid />).                                 */
  /* ---------------------------------------------------------------------- */

  /* ---------------------------------------------------------------------- */
  /* FOOTER — four navigation columns + newsletter copy                      */
  /* ---------------------------------------------------------------------- */
  footer: {
    newsletter: {
      heading: 'The North Briefing',
      copy: 'One email each weekday at 07:00. The five stories that matter, why they matter, and what to watch next.',
      cta: 'Subscribe',
      smallPrint: 'No spam. Unsubscribe in one click.',
    },
    columns: [
      {
        heading: 'Politics',
        links: [
          { label: 'Elections', to: '/category/politics' },
          { label: 'Policy & Law', to: '/category/politics' },
          { label: 'Foreign Affairs', to: '/category/politics' },
          { label: 'Fact Checks', to: '/editorial-policy' },
        ],
      },
      {
        heading: 'Tech',
        links: [
          { label: 'AI & Compute', to: '/category/technology' },
          { label: 'Startups', to: '/category/technology' },
          { label: 'Cybersecurity', to: '/category/technology' },
          { label: 'Product Reviews', to: '/category/technology' },
        ],
      },
      {
        heading: 'Lifestyle',
        links: [
          { label: 'Culture', to: '/category/lifestyle' },
          { label: 'Health', to: '/category/lifestyle' },
          { label: 'Travel', to: '/category/lifestyle' },
          { label: 'Food', to: '/category/lifestyle' },
        ],
      },
      {
        heading: 'Corporate',
        links: [
          { label: 'About Us', to: '/about' },
          { label: 'Events', to: '/events' },
          { label: 'Submit a Story', to: '/submit-story' },
          { label: 'Editorial Policy', to: '/editorial-policy' },
          { label: 'Contact Us', to: '/contact' },
          { label: 'Privacy Policy', to: '/privacy' },
        ],
      },
    ],
    legalLinks: [
      { label: 'Privacy Policy', to: '/privacy' },
      { label: 'Editorial Transparency', to: '/editorial-policy' },
      { label: 'Terms of Use', to: '/terms' },
    ],
  },

  /* ---------------------------------------------------------------------- */
  /* ABOUT PAGE                                                              */
  /* ---------------------------------------------------------------------- */
  about: {
    story:
      'Founded in 2026 and operating as North i Media Group Ltd., we publish from newsrooms across the region with a permanent desk in Atlabara, Juba, South Sudan. Our readers fund a growing share of our reporting, which is why our editorial priorities answer to them first.',
    values: [
      {
        title: 'Verification before velocity',
        body: 'Every claim is sourced to a document or a named person before publication. If we cannot verify it, we do not run it.',
      },
      {
        title: 'Independence by structure',
        body: 'No shareholder, advertiser or political party holds editorial veto. Ownership is disclosed in full in our transparency statement.',
      },
      {
        title: 'Corrections in the open',
        body: 'Errors are corrected on the page with a dated note explaining what changed and why. We never silently edit a published story.',
      },
      {
        title: 'Data you can check',
        body: 'Where a story rests on a dataset, we publish the source, the methodology and, wherever licensing allows, the data itself.',
      },
    ],
  },

  /* Privacy and Editorial Policy page text (see ./pageContent.js). */
  pages: defaultPages,

  /* ---------------------------------------------------------------------- */
  /* COOKIE CONSENT BANNER                                                   */
  /* ---------------------------------------------------------------------- */
  cookieNotice: {
    storageKey: 'northi-cookie-consent',
    heading: 'We use cookies',
    body: 'We use essential cookies to run North i and optional analytics cookies to understand which stories resonate. You can change your mind at any time.',
    acceptLabel: 'Accept all',
    rejectLabel: 'Essential only',
    policyLabel: 'Read our privacy policy',
    policyTo: '/privacy',
  },
};

export default websiteConfig;
