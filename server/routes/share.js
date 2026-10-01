import { Router } from 'express';
import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { db } from '../db.js';

/**
 * Serves article pages with story-specific Open Graph / Twitter tags already
 * in the HTML. Facebook, WhatsApp, X, LinkedIn, Slack etc. don't run
 * JavaScript, so without this every shared story would show the generic
 * homepage preview. The React app then boots from the same HTML as usual.
 */
const router = Router();

const BRAND = 'North i';
const DEFAULT_DESCRIPTION =
  'Independent journalism, sharp analysis and trusted reporting on politics, technology, business, sport, education and culture.';
const DEFAULT_IMAGE_PATH = '/og-image.png';
const DESCRIPTION_LENGTH = 200;
const META_BLOCK = /<!-- social-meta:start -->[\s\S]*?<!-- social-meta:end -->/;

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const TEMPLATE_PATHS = [
  path.join(process.cwd(), 'dist', 'index.html'),
  path.join(__dirname, '..', '..', 'dist', 'index.html'),
];

let templateCache = null;

function siteUrl(req) {
  return (process.env.SITE_URL || process.env.VITE_SITE_URL || `${req.protocol}://${req.get('host')}`).replace(/\/$/, '');
}

async function loadTemplate(req) {
  if (templateCache) return templateCache;
  for (const file of TEMPLATE_PATHS) {
    try {
      templateCache = await fs.readFile(file, 'utf8');
      return templateCache;
    } catch {
      // try the next location
    }
  }
  // Fall back to the deployed static copy (static files take precedence over
  // rewrites on Vercel, so this never loops back here).
  const response = await fetch(`${siteUrl(req)}/index.html`);
  if (!response.ok) throw new Error(`Could not load index.html (${response.status})`);
  templateCache = await response.text();
  return templateCache;
}

function escapeHtml(value) {
  return String(value ?? '').replace(/[<>&'"]/g, (character) => ({
    '<': '&lt;',
    '>': '&gt;',
    '&': '&amp;',
    "'": '&#39;',
    '"': '&quot;',
  })[character]);
}

function summarize(text) {
  const plain = String(text || '')
    .replace(/<[^>]*>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
  if (plain.length <= DESCRIPTION_LENGTH) return plain;
  const cut = plain.slice(0, DESCRIPTION_LENGTH);
  return `${cut.slice(0, cut.lastIndexOf(' ') > 120 ? cut.lastIndexOf(' ') : cut.length).trimEnd()}…`;
}

function absoluteUrl(value, base) {
  try {
    return new URL(value, `${base}/`).href;
  } catch {
    return null;
  }
}

function toIsoDate(value) {
  if (!value) return null;
  if (value instanceof Date) return Number.isNaN(value.getTime()) ? null : value.toISOString();
  const date = new Date(String(value).includes('T') ? value : `${String(value).replace(' ', 'T')}Z`);
  return Number.isNaN(date.getTime()) ? null : date.toISOString();
}

export function renderSocialMeta({ title, description, url, image, imageAlt, type = 'website', isDefaultImage, article, noIndex }) {
  const tags = [
    `<title>${escapeHtml(title)}</title>`,
    `<meta name="description" content="${escapeHtml(description)}" />`,
    `<meta name="robots" content="${noIndex ? 'noindex, nofollow' : 'index, follow, max-image-preview:large'}" />`,
    `<link rel="canonical" href="${escapeHtml(url)}" />`,
    `<meta property="og:site_name" content="${BRAND}" />`,
    '<meta property="og:locale" content="en_GB" />',
    `<meta property="og:type" content="${type}" />`,
    `<meta property="og:url" content="${escapeHtml(url)}" />`,
    `<meta property="og:title" content="${escapeHtml(title)}" />`,
    `<meta property="og:description" content="${escapeHtml(description)}" />`,
    `<meta property="og:image" content="${escapeHtml(image)}" />`,
  ];
  if (image.startsWith('https://')) tags.push(`<meta property="og:image:secure_url" content="${escapeHtml(image)}" />`);
  if (isDefaultImage) {
    tags.push(
      '<meta property="og:image:type" content="image/png" />',
      '<meta property="og:image:width" content="1200" />',
      '<meta property="og:image:height" content="630" />'
    );
  }
  tags.push(`<meta property="og:image:alt" content="${escapeHtml(imageAlt)}" />`);
  if (article) {
    if (article.publishedTime) tags.push(`<meta property="article:published_time" content="${article.publishedTime}" />`);
    if (article.modifiedTime) tags.push(`<meta property="article:modified_time" content="${article.modifiedTime}" />`);
    if (article.section) tags.push(`<meta property="article:section" content="${escapeHtml(article.section)}" />`);
  }
  tags.push(
    '<meta name="twitter:card" content="summary_large_image" />',
    `<meta name="twitter:title" content="${escapeHtml(title)}" />`,
    `<meta name="twitter:description" content="${escapeHtml(description)}" />`,
    `<meta name="twitter:image" content="${escapeHtml(image)}" />`,
    `<meta name="twitter:image:alt" content="${escapeHtml(imageAlt)}" />`
  );
  return `<!-- social-meta:start -->\n    ${tags.join('\n    ')}\n    <!-- social-meta:end -->`;
}

async function renderArticle(req, res, next) {
  try {
    const base = siteUrl(req);
    const template = await loadTemplate(req);
    const id = Number(req.params.id);
    const url = `${base}/article/${encodeURIComponent(req.params.id)}`;
    const defaultImage = `${base}${DEFAULT_IMAGE_PATH}`;

    let row = null;
    if (Number.isInteger(id) && id > 0) {
      try {
        row = await db.get('SELECT * FROM news WHERE id = ?', id);
      } catch (error) {
        // Database trouble: still serve the page (with generic tags) so readers aren't blocked.
        // eslint-disable-next-line no-console
        console.error(error);
        row = undefined;
      }
    }

    let meta;
    if (row) {
      const articleImage = row.image_path && !row.image_path.startsWith('storage:') ? absoluteUrl(row.image_path, base) : null;
      meta = renderSocialMeta({
        title: `${row.title} | ${BRAND}`,
        description: summarize(row.description) || DEFAULT_DESCRIPTION,
        url,
        image: articleImage || defaultImage,
        imageAlt: row.title,
        type: 'article',
        isDefaultImage: !articleImage,
        article: {
          publishedTime: toIsoDate(row.date || row.created_at),
          modifiedTime: toIsoDate(row.updated_at),
          section: row.category || 'General',
        },
      });
    } else {
      meta = renderSocialMeta({
        title: row === null ? `Story Not Found | ${BRAND}` : `${BRAND} | Independent News & Magazine`,
        description: DEFAULT_DESCRIPTION,
        url,
        image: defaultImage,
        imageAlt: `${BRAND} | Independent News & Magazine`,
        isDefaultImage: true,
        noIndex: row === null,
      });
    }

    const html = META_BLOCK.test(template) ? template.replace(META_BLOCK, () => meta) : template;
    res
      .status(row === null ? 404 : 200)
      .set('Cache-Control', 'public, max-age=0, s-maxage=300, stale-while-revalidate=86400')
      .type('html')
      .send(html);
  } catch (error) {
    next(error);
  }
}

router.get('/article/:id', renderArticle);

export default router;
