/**
 * =============================================================================
 *  NORTH i — SITE CONFIGURATION
 * =============================================================================
 *  This is the single source of truth for everything "corporate" about the
 *  publication: branding, contact details, navigation and social profiles.
 *
 *  The CEO/Founder profile and editorial team roster are managed from the
 *  admin dashboard and fetched live at runtime — see `useSite()`'s
 *  `ceoProfile` / `teamMembers`, not this file.
 * =============================================================================
 */

export const websiteConfig = {
  /* ---------------------------------------------------------------------- */
  /* BRAND                                                                   */
  /* ---------------------------------------------------------------------- */
  brand: {
    name: 'NORTH i',
    // The name is rendered as two parts so the accent mark can be styled.
    nameParts: { primary: 'NORTH', accent: 'i' },
    tagline: 'Journalism without a compass bias.',
    description:
      'NORTH i is an independent digital newsroom covering politics, technology, business, sport, education and culture. We publish verified reporting, long-form analysis and data journalism for readers who want the full picture — not the loudest headline.',
    foundedYear: 2016,
    legalEntity: 'NORTH i Media Group Ltd.',
    locale: 'en-GB',
    timeZone: 'Africa/Lagos',
  },

  /* ---------------------------------------------------------------------- */
  /* CONTACT                                                                 */
  /* ---------------------------------------------------------------------- */
  contact: {
    email: 'newsroom@north-i.com',
    pressEmail: 'press@north-i.com',
    phone: '+234 (0) 700 66784 41',
    address: {
      line1: '14 Harbour Point, Victoria Island',
      line2: 'Lagos, Nigeria',
    },
    officeHours: 'Monday – Friday, 08:00 – 18:00 WAT',
  },

  /* ---------------------------------------------------------------------- */
  /* SOCIAL PROFILES — used in the header, footer and article share bar      */
  /* ---------------------------------------------------------------------- */
  socials: [
    { id: 'x', label: 'X / Twitter', href: 'https://x.com/northi' },
    { id: 'facebook', label: 'Facebook', href: 'https://facebook.com/northi' },
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
          { label: 'Editorial Policy', to: '/editorial-policy' },
          { label: 'Contact Us', to: '/contact' },
          { label: 'Privacy Policy', to: '/privacy' },
        ],
      },
    ],
    legalLinks: [
      { label: 'Privacy Policy', to: '/privacy' },
      { label: 'Editorial Transparency', to: '/editorial-policy' },
      { label: 'Terms of Use', to: '/privacy' },
    ],
  },

  /* ---------------------------------------------------------------------- */
  /* COOKIE CONSENT BANNER                                                   */
  /* ---------------------------------------------------------------------- */
  cookieNotice: {
    storageKey: 'northi-cookie-consent',
    heading: 'We use cookies',
    body: 'We use essential cookies to run NORTH i and optional analytics cookies to understand which stories resonate. You can change your mind at any time.',
    acceptLabel: 'Accept all',
    rejectLabel: 'Essential only',
    policyLabel: 'Read our privacy policy',
    policyTo: '/privacy',
  },
};

export default websiteConfig;
