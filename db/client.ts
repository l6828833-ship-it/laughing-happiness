// ============================================================
// db/client.ts — Drizzle ORM Client (Supabase PostgreSQL)
// ============================================================
// This file initialises the Drizzle client using the Supabase
// connection string.  Import `db` anywhere in server code.
//
// Required environment variables (set in .env or Railway):
//   DATABASE_URL=postgresql://postgres.[ref]:[password]@aws-0-[region].pooler.supabase.com:6543/postgres
//
// The URL above uses the Supabase Session Pooler (port 6543).
// For direct connections use port 5432 (not recommended in production
// because it bypasses connection pooling).
// ============================================================

import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from './schema';

if (!process.env.DATABASE_URL) {
  throw new Error(
    'DATABASE_URL environment variable is not set.\n' +
      'Add it to your .env file:\n' +
      '  DATABASE_URL=postgresql://postgres.[ref]:[password]@aws-0-[region].pooler.supabase.com:6543/postgres',
  );
}

// Use a single connection in development; use connection pooling in production.
// Supabase Session Pooler supports up to 200 concurrent connections.
const connectionString = process.env.DATABASE_URL;

const client = postgres(connectionString, {
  // Disable prepare statements — required for Supabase Session Pooler (PgBouncer).
  prepare: false,
  // Maximum connections in the pool.
  max: process.env.NODE_ENV === 'production' ? 10 : 1,
});

export const db = drizzle(client, { schema });

export type DB = typeof db;
