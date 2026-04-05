# Quizoi — Supabase + Drizzle ORM Database Layer

This directory contains the complete database integration for **quizoi.com** using **Drizzle ORM** and **Supabase (PostgreSQL)**.

---

## File Structure

```
db/
├── schema.ts          ← Drizzle table definitions + TypeScript types
├── client.ts          ← Drizzle client (Supabase connection)
├── queries.ts         ← All CRUD query functions (used by server/routes/api.ts)
├── seed.ts            ← Seed script — populates initial data
├── index.ts           ← Barrel export
└── migrations/
    └── 0001_initial_schema.sql   ← Full SQL migration (run once)
```

---

## Quick Setup (5 Steps)

### Step 1 — Install Dependencies

```bash
pnpm add drizzle-orm postgres @supabase/supabase-js dotenv
pnpm add -D drizzle-kit tsx
```

### Step 2 — Create Your `.env` File

Copy `.env.example` to `.env` and fill in your Supabase credentials:

```bash
cp .env.example .env
```

| Variable | Where to Find |
|---|---|
| `DATABASE_URL` | Supabase → Project Settings → Database → **Session Pooler** URL (port **6543**) |
| `SUPABASE_URL` | Supabase → Project Settings → API → Project URL |
| `SUPABASE_ANON_KEY` | Supabase → Project Settings → API → `anon` key |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase → Project Settings → API → `service_role` key |
| `ADMIN_SECRET` | Generate with: `openssl rand -base64 32` |

> **Important:** Use the **Session Pooler** URL (port 6543), not the direct connection (port 5432). This is required for Railway and serverless deployments because it uses PgBouncer for connection pooling.

### Step 3 — Run the SQL Migration

**Option A — Drizzle Kit (recommended):**
```bash
pnpm drizzle-kit migrate
```

**Option B — Supabase SQL Editor:**
1. Open your Supabase project → SQL Editor
2. Paste the contents of `db/migrations/0001_initial_schema.sql`
3. Click **Run**

### Step 4 — Seed Initial Data

```bash
npx tsx db/seed.ts
```

This inserts:
- All 10 categories (Music, Sports, Geography, etc.)
- 1 sample quiz with 3 questions
- Default site settings

### Step 5 — Add Scripts to `package.json`

Add these to the `"scripts"` section of your `package.json`:

```json
{
  "scripts": {
    "db:generate": "drizzle-kit generate",
    "db:migrate": "drizzle-kit migrate",
    "db:push": "drizzle-kit push",
    "db:studio": "drizzle-kit studio",
    "db:seed": "tsx db/seed.ts"
  }
}
```

---

## Database Schema

### Tables

| Table | Purpose |
|---|---|
| `categories` | Quiz categories (Music, Sports, etc.) |
| `quizzes` | Quiz metadata (title, slug, status, play count) |
| `questions` | Individual questions with Fact Lab content |
| `answers` | Answer options with vote counts |
| `quiz_sessions` | Anonymous user session tracking for analytics |
| `site_settings` | Admin-configurable global settings (AdSense ID, code injection, etc.) |

### Key Design Decisions

**`votes_count` on answers** — Incremented server-side on every answer submission. Powers the "42% of people chose this" statistics on the reveal page. Never manipulable from the client.

**`play_count` on quizzes** — Automatically incremented by a PostgreSQL trigger when a new `quiz_sessions` row is inserted. No extra API call needed.

**`question_count` on quizzes** — Automatically synced by a trigger when questions are inserted or deleted.

**`quiz_count` on categories** — Automatically synced by a trigger when a quiz is published or unpublished.

**Row Level Security (RLS)** — Enabled on all tables. Public users can only read published content. All writes go through the server using the service role key, which bypasses RLS.

---

## API Routes

All routes are mounted at `/api` in `server/routes/api.ts`.

### Public Routes

| Method | Path | Description |
|---|---|---|
| `GET` | `/api/categories` | All categories |
| `GET` | `/api/categories/:slug` | Category + its quizzes |
| `GET` | `/api/quizzes` | Homepage data (most played + latest) |
| `GET` | `/api/quiz/:slug` | Single quiz metadata |
| `GET` | `/api/question/:slug/:n` | Question page data (answers without `is_correct`) |
| `POST` | `/api/answer` | Submit an answer (increments votes, returns stats) |
| `POST` | `/api/session/start` | Start a new quiz session |
| `POST` | `/api/session/complete` | Mark session as completed |
| `GET` | `/api/settings` | Public site settings |

### Admin Routes (require `X-Admin-Secret` header)

| Method | Path | Description |
|---|---|---|
| `GET` | `/api/admin/quizzes` | All quizzes (all statuses) |
| `GET` | `/api/admin/quiz/:id` | Quiz with all questions + answers |
| `POST` | `/api/admin/quiz` | Create quiz |
| `PATCH` | `/api/admin/quiz/:id` | Update quiz |
| `PATCH` | `/api/admin/quiz/:id/toggle` | Toggle DRAFT/PUBLISHED |
| `DELETE` | `/api/admin/quiz/:id` | Delete quiz |
| `GET/POST/PATCH/DELETE` | `/api/admin/category/*` | Category management |
| `POST/PATCH/DELETE` | `/api/admin/question/*` | Question management |
| `POST/PATCH/DELETE` | `/api/admin/answer/*` | Answer management |
| `GET` | `/api/admin/analytics/completion` | Completion rates |
| `GET` | `/api/admin/analytics/dropoff/:quizId` | Per-question drop-off |
| `GET` | `/api/admin/analytics/daily` | Daily stats chart |
| `GET/PATCH` | `/api/admin/settings` | Site settings |

---

## Connecting the React Frontend

The existing `adminStore.ts` uses `localStorage`. To connect it to the database API, update the functions to call the API instead:

```typescript
// Before (localStorage):
export function getAdminQuizzes(): Quiz[] {
  const stored = localStorage.getItem('quizoi_admin_quizzes');
  return stored ? JSON.parse(stored) : seedQuizzes;
}

// After (API):
export async function getAdminQuizzes(): Promise<Quiz[]> {
  const res = await fetch('/api/admin/quizzes', {
    headers: { 'X-Admin-Secret': import.meta.env.VITE_ADMIN_SECRET },
  });
  return res.json();
}
```

Add `VITE_ADMIN_SECRET` to your `.env` file (Vite exposes `VITE_*` variables to the browser).

---

## Railway Deployment

Your `railway.json` and `nixpacks.toml` are already configured. Just add these environment variables in the Railway dashboard:

- `DATABASE_URL`
- `SUPABASE_URL`
- `SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `ADMIN_SECRET`
- `NODE_ENV=production`

---

## Generating New Migrations

After modifying `db/schema.ts`:

```bash
pnpm db:generate   # generates a new SQL file in db/migrations/
pnpm db:migrate    # applies it to Supabase
```
