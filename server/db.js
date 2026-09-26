import { DatabaseSync } from 'node:sqlite';
import path from 'node:path';
import fs from 'node:fs';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const dataDir = path.join(__dirname, 'data');
fs.mkdirSync(dataDir, { recursive: true });

const dbPath = path.join(dataDir, 'northi.db');
export const db = new DatabaseSync(dbPath);

db.exec(`
  PRAGMA journal_mode = WAL;

  CREATE TABLE IF NOT EXISTS events (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    start_date TEXT,
    end_date TEXT,
    time TEXT,
    location TEXT,
    description TEXT,
    image_path TEXT,
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    updated_at TEXT NOT NULL DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS news (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    date TEXT,
    category TEXT NOT NULL DEFAULT 'General',
    description TEXT,
    image_path TEXT,
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    updated_at TEXT NOT NULL DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS event_signups (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    event_id INTEGER REFERENCES events(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    email TEXT NOT NULL,
    created_at TEXT NOT NULL DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS team_members (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    role TEXT,
    image_path TEXT,
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    updated_at TEXT NOT NULL DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS ceo_profile (
    id INTEGER PRIMARY KEY CHECK (id = 1),
    name TEXT,
    title TEXT,
    message TEXT,
    image_path TEXT,
    updated_at TEXT NOT NULL DEFAULT (datetime('now'))
  );

  -- Dashboard accounts added from the Editors page. Owners listed in the
  -- ADMIN_EMAILS env var are not stored here; they always have admin access.
  CREATE TABLE IF NOT EXISTS admin_users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    email TEXT NOT NULL UNIQUE COLLATE NOCASE,
    role TEXT NOT NULL CHECK (role IN ('admin', 'editor')),
    added_by TEXT,
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    updated_at TEXT NOT NULL DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS contact_messages (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    email TEXT NOT NULL,
    subject TEXT,
    message TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'new' CHECK (status IN ('new', 'read', 'resolved')),
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    updated_at TEXT NOT NULL DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS subscribers (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    email TEXT NOT NULL UNIQUE COLLATE NOCASE,
    token TEXT NOT NULL UNIQUE,
    status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'unsubscribed')),
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    unsubscribed_at TEXT
  );

  CREATE TABLE IF NOT EXISTS newsletters (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    subject TEXT NOT NULL,
    body TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'sent')),
    sent_count INTEGER NOT NULL DEFAULT 0,
    sent_at TEXT,
    created_by TEXT,
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    updated_at TEXT NOT NULL DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS comments (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    article_id INTEGER NOT NULL REFERENCES news(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    email TEXT NOT NULL,
    body TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
    created_at TEXT NOT NULL DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS submissions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    email TEXT NOT NULL,
    phone TEXT,
    headline TEXT NOT NULL,
    story TEXT NOT NULL,
    image_path TEXT,
    status TEXT NOT NULL DEFAULT 'new' CHECK (status IN ('new', 'reviewing', 'accepted', 'rejected')),
    notes TEXT,
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    updated_at TEXT NOT NULL DEFAULT (datetime('now'))
  );

  -- Editable website text (contact details, socials, page copy). Stored as a
  -- single JSON document under the key 'site'.
  CREATE TABLE IF NOT EXISTS site_settings (
    key TEXT PRIMARY KEY,
    value TEXT NOT NULL,
    updated_at TEXT NOT NULL DEFAULT (datetime('now'))
  );
`);

db.exec('PRAGMA foreign_keys = ON;');

// Migration: older databases were created before `news.category` existed.
// Add it in place (defaulting existing rows to "General") instead of
// requiring a fresh database.
const newsColumns = db.prepare('PRAGMA table_info(news)').all().map((c) => c.name);
if (!newsColumns.includes('category')) {
  db.exec("ALTER TABLE news ADD COLUMN category TEXT NOT NULL DEFAULT 'General'");
}

// Seed a couple of demo event signups so the "Event signups" tab has data
// to display before any real registrations arrive.
const signupCount = db.prepare('SELECT COUNT(*) AS count FROM event_signups').get().count;
const eventCount = db.prepare('SELECT COUNT(*) AS count FROM events').get().count;
if (signupCount === 0 && eventCount === 0) {
  const insertEvent = db.prepare(
    `INSERT INTO events (title, start_date, end_date, time, location, description, image_path)
     VALUES (?, ?, ?, ?, ?, ?, ?)`
  );
  const result = insertEvent.run(
    'Community Town Hall',
    '2026-10-04',
    '2026-10-04',
    '18:00 - 20:00',
    'North Hall, 12 Union Street',
    'Join local leaders for an open discussion on upcoming neighbourhood initiatives and Q&A.',
    null
  );
  const eventId = Number(result.lastInsertRowid);
  const insertSignup = db.prepare(
    'INSERT INTO event_signups (event_id, name, email) VALUES (?, ?, ?)'
  );
  insertSignup.run(eventId, 'Jordan Ellis', 'jordan.ellis@example.com');
  insertSignup.run(eventId, 'Priya Nair', 'priya.nair@example.com');
}

// Seed a single row for the CEO & Founder profile (id is fixed at 1) so the
// dashboard always has a record to read/update in place.
const ceoCount = db.prepare('SELECT COUNT(*) AS count FROM ceo_profile').get().count;
if (ceoCount === 0) {
  db.prepare(
    `INSERT INTO ceo_profile (id, name, title, message, image_path) VALUES (1, ?, ?, ?, ?)`
  ).run(
    'Alex Morgan',
    'CEO & Founder',
    'Welcome to NORTH i. We started this newsroom to bring honest, independent reporting to our community. Thank you for reading and supporting our mission.',
    null
  );
}

export default db;
