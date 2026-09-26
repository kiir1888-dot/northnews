/**
 * One-time (safe to repeat) setup of the Supabase project for NORTH i:
 * creates the database tables and the image storage buckets.
 *
 *   npm run db:setup
 */
import 'dotenv/config';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { sql, withSchema, DB_SCHEMA } from '../server/db.js';
import { supabaseAdmin } from '../server/supabaseAdmin.js';
import { PUBLIC_BUCKET, PRIVATE_BUCKET, MAX_UPLOAD_BYTES } from '../server/upload.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

if (!sql) {
  console.error('DATABASE_URL is missing from .env. Add it first (see .env.example).');
  process.exit(1);
}
if (!supabaseAdmin) {
  console.error('SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY are missing from .env.');
  process.exit(1);
}

try {
  const schema = fs.readFileSync(path.join(__dirname, '..', 'server', 'schema.sql'), 'utf8');
  await sql.unsafe(`CREATE SCHEMA IF NOT EXISTS ${DB_SCHEMA}`);
  await withSchema((tx) => tx.unsafe(schema).simple());
  console.log(`Database tables are ready (schema "${DB_SCHEMA}").`);

  const buckets = [
    { name: PUBLIC_BUCKET, public: true },
    { name: PRIVATE_BUCKET, public: false },
  ];
  for (const bucket of buckets) {
    const options = {
      public: bucket.public,
      fileSizeLimit: MAX_UPLOAD_BYTES,
      allowedMimeTypes: ['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/svg+xml'],
    };
    const { error } = await supabaseAdmin.storage.createBucket(bucket.name, options);
    if (error && !/already exists/i.test(error.message)) throw error;
    if (error) await supabaseAdmin.storage.updateBucket(bucket.name, options);
    console.log(`Storage bucket "${bucket.name}" is ready (${bucket.public ? 'public' : 'private'}).`);
  }
  console.log('Setup complete.');
} catch (err) {
  console.error('Setup failed:', err.message);
  process.exitCode = 1;
} finally {
  await sql.end();
}
