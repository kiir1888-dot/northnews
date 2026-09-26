import { Router } from 'express';
import { db } from '../db.js';
import { requireAuth, requireAdmin } from '../auth.js';
import { clean } from '../publicForm.js';

const router = Router();

/*
 * The only settings the dashboard may change, with a max length for each
 * text field. Anything not listed here is dropped when saving.
 */
const SOCIAL_IDS = ['x', 'facebook', 'instagram', 'linkedin', 'youtube'];
const page = { updated: 60, intro: 2000, body: 30000 };
const SHAPE = {
  brand: { tagline: 120, description: 1000 },
  contact: {
    email: 254,
    phone: 40,
    whatsappUrl: 300,
    address: { line1: 200, line2: 200 },
    officeHours: 200,
  },
  socials: Object.fromEntries(SOCIAL_IDS.map((id) => [id, 300])),
  newsletter: { heading: 120, copy: 500 },
  about: { story: 3000, values: 'values' },
  pages: { privacy: page, editorial: page },
};

const URL_FIELDS = new Set(['contact.whatsappUrl', ...SOCIAL_IDS.map((id) => `socials.${id}`)]);

function sanitize(input, shape, pathPrefix = '') {
  const out = {};
  if (!input || typeof input !== 'object') return out;
  for (const [key, rule] of Object.entries(shape)) {
    if (!(key in input)) continue;
    const path = pathPrefix ? `${pathPrefix}.${key}` : key;
    const value = input[key];
    if (rule === 'values') {
      if (Array.isArray(value)) {
        out[key] = value.slice(0, 8).map((v) => ({ title: clean(v?.title, 120), body: clean(v?.body, 600) }));
      }
    } else if (typeof rule === 'object') {
      out[key] = sanitize(value, rule, path);
    } else {
      let text = clean(value, rule);
      if (URL_FIELDS.has(path) && text && !/^https?:\/\//i.test(text)) {
        throw Object.assign(new Error(`"${path}" must be a full link starting with https://`), { status: 400 });
      }
      out[key] = text;
    }
  }
  return out;
}

async function readSettings() {
  const row = await db.get("SELECT value, updated_at FROM site_settings WHERE key = 'site'");
  if (!row) return { settings: {}, updatedAt: null };
  try {
    return { settings: JSON.parse(row.value), updatedAt: row.updated_at };
  } catch {
    return { settings: {}, updatedAt: null };
  }
}

// Public: the website loads these overrides on top of its built-in defaults.
router.get('/', async (req, res) => {
  res.json(await readSettings());
});

router.put('/', requireAuth, requireAdmin, async (req, res) => {
  const settings = sanitize(req.body?.settings, SHAPE);
  if (settings.contact?.email === '') {
    return res.status(400).json({ message: 'The contact email cannot be empty.' });
  }
  await db.run(
    `INSERT INTO site_settings (key, value, updated_at) VALUES ('site', ?, datetime('now'))
     ON CONFLICT (key) DO UPDATE SET value = excluded.value, updated_at = excluded.updated_at`,
    JSON.stringify(settings)
  );
  res.json(await readSettings());
});

export default router;
