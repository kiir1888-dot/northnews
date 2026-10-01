import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { useSite } from '../context/SiteContext';
import { categoryLabel, categorySlug } from '../utils/format';

const DEFAULT_TITLE = 'North i | Independent News & Magazine';
const DEFAULT_IMAGE_PATH = '/og-image.png';

const STATIC_ROUTES = {
  '/': {
    title: DEFAULT_TITLE,
    description:
      'Independent journalism, sharp analysis and trusted reporting on politics, technology, business, sport, education and culture.',
  },
  '/about': {
    title: 'About North i | Independent Journalism',
    description: 'Learn about North i, our newsroom, values, leadership and commitment to independent journalism.',
  },
  '/events': {
    title: 'Events | North i',
    description: 'Community forums, briefings and gatherings hosted by the North i newsroom.',
  },
  '/contact': {
    title: 'Contact North i',
    description: 'Contact the North i newsroom with news tips, corrections, partnership enquiries or feedback.',
  },
  '/submit-story': {
    title: 'Submit a Story | North i',
    description: 'Send a news tip, eyewitness account, article or supporting photo to the North i newsroom.',
  },
  '/editorial-policy': {
    title: 'Editorial Transparency Policy | North i',
    description: 'How North i verifies reporting, protects editorial independence, corrects errors and handles conflicts.',
  },
  '/privacy': {
    title: 'Privacy & Cookies Policy | North i',
    description: 'How North i collects, uses, protects and retains reader information.',
  },
  '/terms': {
    title: 'Terms of Use | North i',
    description: 'The terms that apply when accessing and using the North i website and services.',
  },
};

function setMeta(selector, attributes) {
  let element = document.head.querySelector(selector);
  if (!element) {
    element = document.createElement('meta');
    document.head.appendChild(element);
  }
  Object.entries(attributes).forEach(([name, value]) => element.setAttribute(name, value));
}

function setLink(rel, href) {
  let element = document.head.querySelector(`link[rel="${rel}"]`);
  if (!element) {
    element = document.createElement('link');
    element.rel = rel;
    document.head.appendChild(element);
  }
  element.href = href;
}

function removeMeta(selector) {
  document.head.querySelector(selector)?.remove();
}

export default function Seo() {
  const location = useLocation();
  const { config, newsItems, articleCache } = useSite();

  useEffect(() => {
    const articleMatch = location.pathname.match(/^\/article\/([^/]+)$/);
    // Wait until the article page has loaded the story.
    if (articleMatch && articleCache[articleMatch[1]] === undefined) return;

    const origin = window.location.origin;
    const canonicalUrl = `${origin}${location.pathname === '/' ? '/' : location.pathname}`;
    let title = STATIC_ROUTES[location.pathname]?.title;
    let description = STATIC_ROUTES[location.pathname]?.description;
    let image;
    let imageAlt = title;
    let type = 'website';
    let noIndex = false;

    if (articleMatch) {
      const article = articleCache[articleMatch[1]];
      if (article) {
        title = `${article.title} | North i`;
        description = article.description || config.brand.description;
        image = article.imagePath;
        imageAlt = article.title;
        type = 'article';
      } else {
        title = 'Story Not Found | North i';
        description = 'The requested story could not be found.';
        noIndex = true;
      }
    } else if (location.pathname.startsWith('/category/')) {
      const requested = categorySlug(location.pathname.slice('/category/'.length));
      const category = newsItems.find((item) => categorySlug(item.category) === requested)?.category;
      const label = category || categoryLabel(requested);
      title = `${label} | North i`;
      description = `Latest ${label.toLowerCase()} reporting, analysis and updates from North i.`;
    } else if (!title) {
      title = 'Page Not Found | North i';
      description = 'The requested page could not be found.';
      noIndex = true;
    }

    document.title = title;
    setMeta('meta[name="description"]', { name: 'description', content: description });
    setMeta('meta[name="robots"]', {
      name: 'robots',
      content: noIndex ? 'noindex, nofollow' : 'index, follow, max-image-preview:large',
    });
    setLink('canonical', canonicalUrl);

    setMeta('meta[property="og:site_name"]', { property: 'og:site_name', content: config.brand.name });
    setMeta('meta[property="og:type"]', { property: 'og:type', content: type });
    setMeta('meta[property="og:title"]', { property: 'og:title', content: title });
    setMeta('meta[property="og:description"]', { property: 'og:description', content: description });
    setMeta('meta[property="og:url"]', { property: 'og:url', content: canonicalUrl });
    setMeta('meta[name="twitter:card"]', { name: 'twitter:card', content: 'summary_large_image' });
    setMeta('meta[name="twitter:title"]', { name: 'twitter:title', content: title });
    setMeta('meta[name="twitter:description"]', { name: 'twitter:description', content: description });

    // Social platforms only accept absolute image URLs.
    let imageUrl = null;
    try {
      imageUrl = image ? new URL(image, origin).href : null;
    } catch {
      imageUrl = null;
    }
    const isDefaultImage = !imageUrl;
    imageUrl = imageUrl || `${origin}${DEFAULT_IMAGE_PATH}`;
    if (isDefaultImage) imageAlt = title || DEFAULT_TITLE;

    setMeta('meta[property="og:image"]', { property: 'og:image', content: imageUrl });
    setMeta('meta[property="og:image:secure_url"]', { property: 'og:image:secure_url', content: imageUrl });
    setMeta('meta[property="og:image:alt"]', { property: 'og:image:alt', content: imageAlt });
    setMeta('meta[name="twitter:image"]', { name: 'twitter:image', content: imageUrl });
    setMeta('meta[name="twitter:image:alt"]', { name: 'twitter:image:alt', content: imageAlt });
    if (isDefaultImage) {
      setMeta('meta[property="og:image:type"]', { property: 'og:image:type', content: 'image/png' });
      setMeta('meta[property="og:image:width"]', { property: 'og:image:width', content: '1200' });
      setMeta('meta[property="og:image:height"]', { property: 'og:image:height', content: '630' });
    } else {
      removeMeta('meta[property="og:image:type"]');
      removeMeta('meta[property="og:image:width"]');
      removeMeta('meta[property="og:image:height"]');
    }
  }, [articleCache, config.brand.description, config.brand.name, location.pathname, newsItems]);

  return null;
}
