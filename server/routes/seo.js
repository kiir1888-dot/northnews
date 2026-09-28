import { Router } from 'express';
import { db } from '../db.js';

const router = Router();

const PUBLIC_PATHS = [
  '/',
  '/about',
  '/events',
  '/contact',
  '/submit-story',
  '/editorial-policy',
  '/privacy',
  '/terms',
  '/category/politics',
  '/category/technology',
  '/category/business',
  '/category/sports',
  '/category/education',
];

function siteUrl(req) {
  return (process.env.SITE_URL || `${req.protocol}://${req.get('host')}`).replace(/\/$/, '');
}

function escapeXml(value) {
  return String(value).replace(/[<>&'"]/g, (character) => ({
    '<': '&lt;',
    '>': '&gt;',
    '&': '&amp;',
    "'": '&apos;',
    '"': '&quot;',
  })[character]);
}

function robots(req, res) {
  const base = siteUrl(req);
  res.type('text/plain').send(`User-agent: *
Allow: /
Disallow: /admin/
Disallow: /api/

Sitemap: ${base}/sitemap.xml
`);
}

async function sitemap(req, res) {
  const base = siteUrl(req);
  const articles = await db.all('SELECT id, updated_at FROM news ORDER BY id DESC');
  const entries = [
    ...PUBLIC_PATHS.map((path) => ({ url: `${base}${path}`, updatedAt: null })),
    ...articles.map((article) => ({
      url: `${base}/article/${article.id}`,
      updatedAt: article.updated_at,
    })),
  ];

  const urls = entries
    .map(({ url, updatedAt }) => {
      const lastModified = updatedAt
        ? `\n    <lastmod>${escapeXml(String(updatedAt).replace(' ', 'T'))}Z</lastmod>`
        : '';
      return `  <url>
    <loc>${escapeXml(url)}</loc>${lastModified}
  </url>`;
    })
    .join('\n');

  res.type('application/xml').send(`<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls}
</urlset>
`);
}

router.get(['/robots', '/robots.txt'], robots);
router.get(['/sitemap', '/sitemap.xml'], sitemap);

export default router;
