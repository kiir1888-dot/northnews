/**
 * Merges the dashboard's saved Site settings on top of the built-in
 * websiteConfig defaults. Blank values fall back to the default, except
 * social links, where a blank value hides that icon.
 */

const pick = (value, fallback) => (typeof value === 'string' && value.trim() ? value : fallback);

/** Converts policy sections into editable text: "## Heading" then paragraphs. */
export function sectionsToText(sections = []) {
  return sections.map((s) => [`## ${s.heading}`, ...s.paragraphs].join('\n\n')).join('\n\n');
}

/** Parses the editable text format back into { heading, paragraphs[] } sections. */
export function textToSections(text = '') {
  const sections = [];
  const blocks = text
    .replace(/\r\n/g, '\n')
    .split(/\n\s*\n/)
    .map((block) => block.trim())
    .filter(Boolean);

  for (const block of blocks) {
    const [first, ...rest] = block.split('\n');
    let paragraph = block;
    if (first.startsWith('## ')) {
      sections.push({ heading: first.slice(3).trim(), paragraphs: [] });
      paragraph = rest.join(' ').trim();
    } else if (!sections.length) {
      sections.push({ heading: '', paragraphs: [] });
    }
    if (paragraph) sections[sections.length - 1].paragraphs.push(paragraph.replace(/\n/g, ' '));
  }
  return sections;
}

function mergePage(base, override) {
  if (!override) return base;
  const sections = override.body && override.body.trim() ? textToSections(override.body) : base.sections;
  return {
    updated: pick(override.updated, base.updated),
    intro: pick(override.intro, base.intro),
    sections,
  };
}

export function applySettings(base, s = {}) {
  if (!s || typeof s !== 'object') return base;
  const contact = s.contact || {};
  const socials = s.socials || {};
  const values = Array.isArray(s.about?.values)
    ? s.about.values.filter((v) => v.title?.trim() && v.body?.trim())
    : [];

  return {
    ...base,
    brand: {
      ...base.brand,
      tagline: pick(s.brand?.tagline, base.brand.tagline),
      description: pick(s.brand?.description, base.brand.description),
    },
    contact: {
      ...base.contact,
      email: pick(contact.email, base.contact.email),
      phone: pick(contact.phone, base.contact.phone),
      whatsappUrl: pick(contact.whatsappUrl, base.contact.whatsappUrl),
      officeHours: pick(contact.officeHours, base.contact.officeHours),
      address: {
        line1: pick(contact.address?.line1, base.contact.address.line1),
        line2: pick(contact.address?.line2, base.contact.address.line2),
      },
    },
    socials: base.socials
      .map((social) => (social.id in socials ? { ...social, href: socials[social.id].trim() } : social))
      .filter((social) => social.href),
    footer: {
      ...base.footer,
      newsletter: {
        ...base.footer.newsletter,
        heading: pick(s.newsletter?.heading, base.footer.newsletter.heading),
        copy: pick(s.newsletter?.copy, base.footer.newsletter.copy),
      },
    },
    about: {
      story: pick(s.about?.story, base.about.story),
      values: values.length ? values : base.about.values,
    },
    pages: {
      ...base.pages,
      privacy: mergePage(base.pages.privacy, s.pages?.privacy),
      editorial: mergePage(base.pages.editorial, s.pages?.editorial),
    },
  };
}
