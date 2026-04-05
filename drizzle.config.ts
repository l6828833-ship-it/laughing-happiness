// ============================================================
// drizzle.config.ts — Drizzle Kit Configuration
// ============================================================
// Usage:
//   pnpm drizzle-kit generate   → generate SQL migration files
//   pnpm drizzle-kit migrate    → apply migrations to Supabase
//   pnpm drizzle-kit studio     → open Drizzle Studio (local DB GUI)
//   pnpm drizzle-kit push       → push schema directly (dev only)
// ============================================================

import { defineConfig } from 'drizzle-kit';

if (!process.env.DATABASE_URL) {
  throw new Error('DATABASE_URL is not set in environment variables.');
}

export default defineConfig({
  // Path to your schema file
  schema: './db/schema.ts',

  // Output directory for generated SQL migration files
  out: './db/migrations',

  // Target dialect
  dialect: 'postgresql',

  dbCredentials: {
    url: process.env.DATABASE_URL,
  },

  // Print all SQL statements being executed
  verbose: true,

  // Strict mode — fails if any destructive changes are detected
  strict: true,
});
