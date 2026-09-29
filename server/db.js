import postgres from 'postgres';

/**
 * Database access (Supabase Postgres).
 *
 * Routes write plain SQL with `?` placeholders; this wrapper converts them to
 * Postgres `$1, $2...` parameters and maps `datetime('now')` to a UTC text
 * timestamp, so every row keeps the "YYYY-MM-DD HH:MM:SS" format.
 */
let connectionString = process.env.DATABASE_URL;

// On Vercel, Supabase's session pooler (port 5432) runs out of its 15 slots
// because every serverless instance keeps a connection open. The transaction
// pooler (port 6543) on the same host shares connections, so use it instead.
if (process.env.VERCEL && connectionString) {
  try {
    const url = new URL(connectionString);
    if (url.hostname.endsWith('pooler.supabase.com') && url.port === '5432') {
      url.port = '6543';
      connectionString = url.toString();
    }
  } catch {
    // Leave an unparsable URL as it is; postgres() will report the problem.
  }
}

export const NOW_SQL = "to_char(now() AT TIME ZONE 'utc', 'YYYY-MM-DD HH24:MI:SS')";

export const sql = connectionString
  ? postgres(connectionString, {
      ssl: 'require',
      // Supabase's connection pooler (port 6543) does not support prepared statements.
      prepare: false,
      // Serverless functions each hold their own tiny pool.
      max: process.env.VERCEL ? 1 : 5,
      idle_timeout: 20,
      connect_timeout: 15,
      onnotice: () => {},
    })
  : null;

if (!sql) {
  // eslint-disable-next-line no-console
  console.warn('[northi] DATABASE_URL is not set. See .env.example.');
}

function translate(text) {
  let index = 0;
  return text.replace(/datetime\('now'\)/g, NOW_SQL).replace(/\?/g, () => `$${++index}`);
}

/**
 * North i keeps its tables in their own Postgres schema so they never clash
 * with other tables (e.g. an older app's `news` or `events`) in the same
 * Supabase project. The pooler hands out a fresh connection per transaction,
 * so the search_path is set with SET LOCAL inside each transaction.
 */
export const DB_SCHEMA = 'northi';

export async function withSchema(fn) {
  if (!sql) {
    throw Object.assign(new Error('The database is not configured yet (DATABASE_URL is missing).'), { status: 503 });
  }
  return sql.begin(async (tx) => {
    await tx.unsafe(`SET LOCAL search_path TO ${DB_SCHEMA}`);
    return fn(tx);
  });
}

async function query(text, params) {
  return withSchema((tx) =>
    tx.unsafe(
      translate(text),
      params.map((value) => (value === undefined || Number.isNaN(value) ? null : value))
    )
  );
}

export const db = {
  /** All matching rows. */
  async all(text, ...params) {
    return [...(await query(text, params))];
  },
  /** The first matching row, or undefined. */
  async get(text, ...params) {
    return (await query(text, params))[0];
  },
  /** Runs an UPDATE/DELETE; resolves to `{ changes }`. */
  async run(text, ...params) {
    const result = await query(text, params);
    return { changes: result.count };
  },
  /** Runs an INSERT and resolves to the new row's id. */
  async insert(text, ...params) {
    const result = await query(`${text} RETURNING id`, params);
    return result[0]?.id;
  },
};

export default db;
