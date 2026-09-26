/**
 * Copies content from the old local database (server/data/northi.db) and
 * photos (server/uploads) into Supabase. Tables that already contain data in
 * Supabase are skipped, so running it twice never duplicates anything.
 *
 *   npm run db:migrate-local
 */
import 'dotenv/config';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { DatabaseSync } from 'node:sqlite';
import { sql, withSchema, DB_SCHEMA } from '../server/db.js';
import { supabaseAdmin } from '../server/supabaseAdmin.js';
import { PUBLIC_BUCKET, PRIVATE_BUCKET } from '../server/upload.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, '..');
const dbFile = path.join(root, 'server', 'data', 'northi.db');
const uploadsDir = path.join(root, 'server', 'uploads');

// Parents before children so foreign keys are satisfied.
const TABLES = [
  'events',
  'news',
  'event_signups',
  'team_members',
  'ceo_profile',
  'admin_users',
  'contact_messages',
  'subscribers',
  'newsletters',
  'comments',
  'submissions',
  'site_settings',
];

const MIME = {
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.png': 'image/png',
  '.webp': 'image/webp',
  '.gif': 'image/gif',
  '.svg': 'image/svg+xml',
};

if (!fs.existsSync(dbFile)) {
  console.log('No local database found; nothing to copy.');
  process.exit(0);
}
if (!sql || !supabaseAdmin) {
  console.error('DATABASE_URL and the Supabase keys must be set in .env first.');
  process.exit(1);
}

const local = new DatabaseSync(dbFile, { readOnly: true });

async function uploadLocalImage(imagePath, table) {
  if (!imagePath || !imagePath.startsWith('/uploads/')) return imagePath;
  const file = path.join(uploadsDir, path.basename(imagePath));
  if (!fs.existsSync(file)) {
    console.warn(`  missing photo ${imagePath}, leaving it empty`);
    return null;
  }
  const isPrivate = table === 'submissions';
  const bucket = isPrivate ? PRIVATE_BUCKET : PUBLIC_BUCKET;
  const name = path.basename(file);
  const { error } = await supabaseAdmin.storage.from(bucket).upload(name, fs.readFileSync(file), {
    contentType: MIME[path.extname(name).toLowerCase()] || 'application/octet-stream',
    cacheControl: '31536000',
    upsert: true,
  });
  if (error) throw new Error(`Uploading ${name} failed: ${error.message}`);
  return isPrivate
    ? `storage:${PRIVATE_BUCKET}/${name}`
    : supabaseAdmin.storage.from(bucket).getPublicUrl(name).data.publicUrl;
}

async function targetColumns(table) {
  const rows = await sql`SELECT column_name FROM information_schema.columns WHERE table_schema = ${DB_SCHEMA} AND table_name = ${table}`;
  return new Set(rows.map((r) => r.column_name));
}

try {
  for (const table of TABLES) {
    const exists = local.prepare("SELECT name FROM sqlite_master WHERE type='table' AND name = ?").get(table);
    if (!exists) continue;
    const rows = local.prepare(`SELECT * FROM ${table}`).all();
    if (rows.length === 0) continue;

    // The CEO row always exists in Supabase as a placeholder; replace it
    // unless it has already been edited there.
    if (table === 'ceo_profile') {
      const [current] = await withSchema((tx) => tx`SELECT name, image_path FROM ceo_profile WHERE id = 1`);
      const untouched = !current || (current.name === 'Alex Morgan' && !current.image_path);
      if (!untouched) {
        console.log('ceo_profile: already edited in Supabase, skipped');
        continue;
      }
    } else {
      const [{ count }] = await withSchema((tx) => tx.unsafe(`SELECT COUNT(*)::int AS count FROM ${table}`));
      if (count > 0) {
        console.log(`${table}: already has data in Supabase, skipped`);
        continue;
      }
    }

    const allowed = await targetColumns(table);
    const columns = local
      .prepare(`PRAGMA table_info(${table})`)
      .all()
      .map((c) => c.name)
      .filter((c) => allowed.has(c));
    const conflict =
      table === 'ceo_profile'
        ? `ON CONFLICT (id) DO UPDATE SET ${columns
            .filter((c) => c !== 'id')
            .map((c) => `${c} = excluded.${c}`)
            .join(', ')}`
        : '';

    for (const row of rows) {
      const record = Object.fromEntries(columns.map((c) => [c, row[c] ?? null]));
      if ('image_path' in record) record.image_path = await uploadLocalImage(record.image_path, table);
      await withSchema((tx) =>
        tx.unsafe(
          `INSERT INTO ${table} (${columns.join(', ')}) VALUES (${columns.map((_, i) => `$${i + 1}`).join(', ')}) ${conflict}`,
          columns.map((c) => record[c])
        )
      );
    }

    // Keep new ids counting up from the copied rows.
    if (columns.includes('id') && table !== 'ceo_profile') {
      await withSchema((tx) =>
        tx.unsafe(
          `SELECT setval(pg_get_serial_sequence('${table}', 'id'), GREATEST((SELECT MAX(id) FROM ${table}), 1))`
        )
      );
    }
    console.log(`${table}: copied ${rows.length} row(s)`);
  }
  console.log('Done. Your local content is now in Supabase.');
} catch (err) {
  console.error('Copy failed:', err.message);
  process.exitCode = 1;
} finally {
  local.close();
  await sql.end();
}
