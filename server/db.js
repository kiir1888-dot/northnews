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
`);

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
    'Welcome to NORTH i. We started this newsroom to bring honest, independent reporting to our community — thank you for reading and supporting our mission.',
    null
  );
}

export default db;
