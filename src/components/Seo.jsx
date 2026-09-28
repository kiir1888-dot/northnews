import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { useSite } from '../context/SiteContext';
import { categoryLabel, categorySlug } from '../utils/format';

const DEFAULT_TITLE = 'NORTH i | Independent News & Magazine';

const STATIC_ROUTES = {
  '/': {
    title: DEFAULT_TITLE,
    description:
      'Independent journalism, sharp analysis and trusted reporting on politics, technology, business, sport, education and culture.',
  },
  '/about': {
    title: 'About NORTH i | Independent Journalism',
    description: 'Learn about NORTH i, our newsroom, values, leadership and commitment to independent journalism.',
  },
  '/events': {
    title: 'Events | NORTH i',
    description: 'Community forums, briefings and gatherings hosted by the NORTH i newsroom.',
  },
  '/contact': {
    title: 'Contact NORTH i',
    description: 'Contact the NORTH i newsroom with news tips, corrections, partnership enquiries or feedback.',
  },
  '/submit-story': {
    title: 'Submit a Story | NORTH i',
    description: 'Send a news tip, eyewitness account, article or supporting photo to the NORTH i newsroom.',
  },
  '/editorial-policy': {
    title: 'Editorial Transparency Policy | NORTH i',
    description: 'How NORTH i verifies reporting, protects editorial independence, corrects errors and handles conflicts.',
  },
  '/privacy': {
    title: 'Privacy & Cookies Policy | NORTH i',
    description: 'How NORTH i collects, uses, protects and retains reader information.',
  },
  '/terms': {
    title: 'Terms of Use | NORTH i',
    description: 'The terms that apply when accessing and using the NORTH i website and services.',
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
  const { config, newsItems, newsLoading } = useSite();

  useEffect(() => {
    if (newsLoading && location.pathname.startsWith('/article/')) return;

    const origin = window.location.origin;
    const canonicalUrl = `${origin}${location.pathname === '/' ? '/' : location.pathname}`;
    let title = STATIC_ROUTES[location.pathname]?.title;
    let description = STATIC_ROUTES[location.pathname]?.description;
    let image;
    let type = 'website';
    let noIndex = false;

    const articleMatch = location.pathname.match(/^\/article\/([^/]+)$/);
    if (articleMatch) {
      const article = newsItems.find((item) => String(item.id) === articleMatch[1]);
      if (article) {
        title = `${article.title} | NORTH i`;
        description = article.description || config.brand.description;
        image = article.imagePath;
        type = 'article';
      } else {
        title = 'Story Not Found | NORTH i';
        description = 'The requested story could not be found.';
        noIndex = true;
      }
    } else if (location.pathname.startsWith('/category/')) {
      const requested = categorySlug(location.pathname.slice('/category/'.length));
      const category = newsItems.find((item) => categorySlug(item.category) === requested)?.category;
      const label = category || categoryLabel(requested);
      title = `${label} | NORTH i`;
      description = `Latest ${label.toLowerCase()} reporting, analysis and updates from NORTH i.`;
    } else if (!title) {
      title = 'Page Not Found | NORTH i';
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
    setMeta('meta[name="twitter:card"]', {
      name: 'twitter:card',
      content: image ? 'summary_large_image' : 'summary',
    });
    setMeta('meta[name="twitter:title"]', { name: 'twitter:title', content: title });
    setMeta('meta[name="twitter:description"]', { name: 'twitter:description', content: description });

    if (image) {
      setMeta('meta[property="og:image"]', { property: 'og:image', content: image });
      setMeta('meta[name="twitter:image"]', { name: 'twitter:image', content: image });
    } else {
      removeMeta('meta[property="og:image"]');
      removeMeta('meta[name="twitter:image"]');
    }
  }, [config.brand.description, config.brand.name, location.pathname, newsItems, newsLoading]);

  return null;
}
