-- ============================================================
-- 0001_initial_schema.sql — Quizoi Initial Database Schema
-- Database: Supabase (PostgreSQL 15+)
-- Run via:  pnpm drizzle-kit migrate
--           OR paste directly into Supabase SQL Editor
-- ============================================================

-- ─── Extensions ──────────────────────────────────────────────────────────────
-- uuid_generate_v4() is available by default in Supabase.
-- gen_random_uuid() is used instead (built-in since PG 13).

-- ─── Enums ───────────────────────────────────────────────────────────────────

DO $$ BEGIN
  CREATE TYPE quiz_status AS ENUM ('DRAFT', 'PUBLISHED');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE media_type AS ENUM ('IMAGE', 'YOUTUBE', 'VIMEO', 'NONE');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE device_type AS ENUM ('desktop', 'tablet', 'mobile');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE answer_type AS ENUM ('TEXT', 'IMAGE');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- ─── categories ──────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS categories (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name          TEXT NOT NULL,
  slug          TEXT NOT NULL,
  emoji         TEXT NOT NULL DEFAULT '',
  description   TEXT NOT NULL DEFAULT '',
  image_url     TEXT DEFAULT '',
  quiz_count    INTEGER NOT NULL DEFAULT 0,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE UNIQUE INDEX IF NOT EXISTS categories_slug_idx ON categories (slug);

-- ─── quizzes ─────────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS quizzes (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title          TEXT NOT NULL,
  slug           TEXT NOT NULL,
  description    TEXT NOT NULL DEFAULT '',
  thumbnail_url  TEXT NOT NULL DEFAULT '',
  category_id    UUID NOT NULL REFERENCES categories (id) ON DELETE RESTRICT,
  status         quiz_status NOT NULL DEFAULT 'DRAFT',
  question_count INTEGER NOT NULL DEFAULT 0,
  play_count     INTEGER NOT NULL DEFAULT 0,
  ads_enabled    BOOLEAN NOT NULL DEFAULT TRUE,
  created_at     TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at     TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE UNIQUE INDEX IF NOT EXISTS quizzes_slug_idx      ON quizzes (slug);
CREATE INDEX        IF NOT EXISTS quizzes_category_idx  ON quizzes (category_id);
CREATE INDEX        IF NOT EXISTS quizzes_status_idx    ON quizzes (status);
CREATE INDEX        IF NOT EXISTS quizzes_play_count_idx ON quizzes (play_count DESC);

-- ─── questions ───────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS questions (
  id                 UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  quiz_id            UUID NOT NULL REFERENCES quizzes (id) ON DELETE CASCADE,
  "order"            INTEGER NOT NULL,
  question_text      TEXT NOT NULL,
  media_type         media_type NOT NULL DEFAULT 'NONE',
  media_url          TEXT NOT NULL DEFAULT '',
  -- Fact Lab: MINIMUM 150 words for AdSense compliance
  fact_lab_title     TEXT NOT NULL DEFAULT '',
  fact_lab_content   TEXT NOT NULL DEFAULT '',
  -- Answer display mode
  answer_type        answer_type NOT NULL DEFAULT 'TEXT',
  preview_image_url  TEXT DEFAULT '',
  show_preview_image BOOLEAN NOT NULL DEFAULT FALSE,
  -- Per-question feature toggles
  ads_enabled        BOOLEAN NOT NULL DEFAULT TRUE,
  show_suggestions   BOOLEAN NOT NULL DEFAULT TRUE,
  show_reveal        BOOLEAN NOT NULL DEFAULT TRUE,
  created_at         TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS questions_quiz_order_idx ON questions (quiz_id, "order");

-- ─── answers ─────────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS answers (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  question_id  UUID NOT NULL REFERENCES questions (id) ON DELETE CASCADE,
  text         TEXT NOT NULL,
  is_correct   BOOLEAN NOT NULL DEFAULT FALSE,
  -- Incremented on every submission — powers "42% chose this" reveal stats
  votes_count  INTEGER NOT NULL DEFAULT 0,
  "order"      INTEGER NOT NULL,  -- A=1, B=2, C=3, D=4
  image_url    TEXT DEFAULT '',
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS answers_question_order_idx ON answers (question_id, "order");

-- ─── quiz_sessions ────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS quiz_sessions (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  quiz_id       UUID NOT NULL REFERENCES quizzes (id) ON DELETE CASCADE,
  -- Anonymous per-browser UUID stored in a cookie — no user account required
  session_id    TEXT NOT NULL,
  started_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  -- NULL until the user reaches the /result page
  completed_at  TIMESTAMPTZ,
  -- Last question number the user reached (for drop-off analytics)
  last_question INTEGER NOT NULL DEFAULT 1,
  -- NULL until quiz is completed
  score         INTEGER,
  device_type   device_type NOT NULL DEFAULT 'desktop'
);

CREATE INDEX IF NOT EXISTS quiz_sessions_quiz_idx        ON quiz_sessions (quiz_id);
CREATE INDEX IF NOT EXISTS quiz_sessions_session_id_idx  ON quiz_sessions (session_id);
CREATE INDEX IF NOT EXISTS quiz_sessions_started_at_idx  ON quiz_sessions (started_at DESC);

-- ─── site_settings ───────────────────────────────────────────────────────────
-- Single-row table. Insert one row on first deploy; update it via admin panel.

CREATE TABLE IF NOT EXISTS site_settings (
  id                    UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  site_name             TEXT NOT NULL DEFAULT 'Quizoi',
  site_description      TEXT NOT NULL DEFAULT 'Free online quizzes on every topic imaginable.',
  adsense_publisher_id  TEXT NOT NULL DEFAULT '',
  adsense_auto_ads      BOOLEAN NOT NULL DEFAULT FALSE,
  header_code           TEXT NOT NULL DEFAULT '',
  footer_code           TEXT NOT NULL DEFAULT '',
  custom_css            TEXT NOT NULL DEFAULT '',
  maintenance_mode      BOOLEAN NOT NULL DEFAULT FALSE,
  updated_at            TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ─── Triggers: auto-update updated_at ────────────────────────────────────────

CREATE OR REPLACE FUNCTION trigger_set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS set_updated_at_categories ON categories;
CREATE TRIGGER set_updated_at_categories
  BEFORE UPDATE ON categories
  FOR EACH ROW EXECUTE FUNCTION trigger_set_updated_at();

DROP TRIGGER IF EXISTS set_updated_at_quizzes ON quizzes;
CREATE TRIGGER set_updated_at_quizzes
  BEFORE UPDATE ON quizzes
  FOR EACH ROW EXECUTE FUNCTION trigger_set_updated_at();

DROP TRIGGER IF EXISTS set_updated_at_site_settings ON site_settings;
CREATE TRIGGER set_updated_at_site_settings
  BEFORE UPDATE ON site_settings
  FOR EACH ROW EXECUTE FUNCTION trigger_set_updated_at();

-- ─── Trigger: keep quiz.question_count in sync ────────────────────────────────

CREATE OR REPLACE FUNCTION sync_question_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE quizzes SET question_count = question_count + 1 WHERE id = NEW.quiz_id;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE quizzes SET question_count = question_count - 1 WHERE id = OLD.quiz_id;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS sync_question_count_trigger ON questions;
CREATE TRIGGER sync_question_count_trigger
  AFTER INSERT OR DELETE ON questions
  FOR EACH ROW EXECUTE FUNCTION sync_question_count();

-- ─── Trigger: keep category.quiz_count in sync ────────────────────────────────

CREATE OR REPLACE FUNCTION sync_quiz_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' AND NEW.status = 'PUBLISHED' THEN
    UPDATE categories SET quiz_count = quiz_count + 1 WHERE id = NEW.category_id;
  ELSIF TG_OP = 'UPDATE' THEN
    IF OLD.status != 'PUBLISHED' AND NEW.status = 'PUBLISHED' THEN
      UPDATE categories SET quiz_count = quiz_count + 1 WHERE id = NEW.category_id;
    ELSIF OLD.status = 'PUBLISHED' AND NEW.status != 'PUBLISHED' THEN
      UPDATE categories SET quiz_count = quiz_count - 1 WHERE id = OLD.category_id;
    END IF;
  ELSIF TG_OP = 'DELETE' AND OLD.status = 'PUBLISHED' THEN
    UPDATE categories SET quiz_count = quiz_count - 1 WHERE id = OLD.category_id;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS sync_quiz_count_trigger ON quizzes;
CREATE TRIGGER sync_quiz_count_trigger
  AFTER INSERT OR UPDATE OR DELETE ON quizzes
  FOR EACH ROW EXECUTE FUNCTION sync_quiz_count();

-- ─── Trigger: increment play_count on new session ────────────────────────────

CREATE OR REPLACE FUNCTION increment_play_count()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE quizzes SET play_count = play_count + 1 WHERE id = NEW.quiz_id;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS increment_play_count_trigger ON quiz_sessions;
CREATE TRIGGER increment_play_count_trigger
  AFTER INSERT ON quiz_sessions
  FOR EACH ROW EXECUTE FUNCTION increment_play_count();

-- ─── Row Level Security (RLS) ─────────────────────────────────────────────────
-- Public read access for published content.
-- Write access is handled exclusively through the server (service role key).

ALTER TABLE categories    ENABLE ROW LEVEL SECURITY;
ALTER TABLE quizzes       ENABLE ROW LEVEL SECURITY;
ALTER TABLE questions     ENABLE ROW LEVEL SECURITY;
ALTER TABLE answers       ENABLE ROW LEVEL SECURITY;
ALTER TABLE quiz_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE site_settings ENABLE ROW LEVEL SECURITY;

-- Allow anyone to read published quizzes and their content
CREATE POLICY "Public read categories"
  ON categories FOR SELECT USING (TRUE);

CREATE POLICY "Public read published quizzes"
  ON quizzes FOR SELECT USING (status = 'PUBLISHED');

CREATE POLICY "Public read questions of published quizzes"
  ON questions FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM quizzes
      WHERE quizzes.id = questions.quiz_id
        AND quizzes.status = 'PUBLISHED'
    )
  );

CREATE POLICY "Public read answers of published quizzes"
  ON answers FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM questions
      JOIN quizzes ON quizzes.id = questions.quiz_id
      WHERE questions.id = answers.question_id
        AND quizzes.status = 'PUBLISHED'
    )
  );

-- Sessions and settings are NOT publicly readable
-- All writes go through the server using the service role key (bypasses RLS)

-- ─── page_contents ─────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS page_contents (
  id          UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
  title       VARCHAR(120) NOT NULL,
  slug        VARCHAR(80)  NOT NULL UNIQUE,
  content     TEXT         NOT NULL DEFAULT '',
  created_at  TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

-- Seed static pages
INSERT INTO page_contents (id, title, slug, content) VALUES
  (gen_random_uuid(), 'Privacy Policy', 'privacy-policy', '# Privacy Policy\n\nYour privacy is important to us. This policy explains how Quizoi collects and uses your data.\n\n## Data We Collect\n\nWe collect anonymous usage data to improve our quizzes. We do not collect personally identifiable information unless you contact us directly.\n\n## Cookies\n\nWe use cookies to serve relevant advertisements and remember your quiz progress.\n\n## Third-Party Services\n\nWe use Google AdSense to display ads. Google may use cookies to serve ads based on your interests.\n\n## Contact\n\nFor privacy questions, contact us at privacy@quizoi.com'),
  (gen_random_uuid(), 'Terms of Service', 'terms-of-service', '# Terms of Service\n\nBy using Quizoi, you agree to these terms.\n\n## Use of Service\n\nQuizoi is a free quiz platform. You may use it for personal, non-commercial purposes.\n\n## Content\n\nAll quiz content is provided for educational and entertainment purposes. We strive for accuracy but cannot guarantee it.\n\n## Advertising\n\nQuizoi is supported by advertising. By using the site you agree to see relevant ads.\n\n## Limitation of Liability\n\nQuizoi is provided "as is" without warranties of any kind.\n\n## Contact\n\nFor questions, contact us at legal@quizoi.com'),
  (gen_random_uuid(), 'About', 'about', '# About Quizoi\n\nQuizoi is a free online quiz platform covering thousands of topics — from science and history to pop culture and sports.\n\n## Our Mission\n\nWe believe learning should be fun. Our quizzes are designed to challenge your knowledge while keeping you entertained.\n\n## How It Works\n\nBrowse quizzes by category, pick one that interests you, and answer questions one at a time. After each answer, see how other players voted and learn interesting facts.\n\n## Contact\n\nHave a question or suggestion? Reach us at hello@quizoi.com'),
  (gen_random_uuid(), 'Contact', 'contact', '# Contact Us\n\nWe would love to hear from you!\n\n## General Inquiries\n\nEmail: hello@quizoi.com\n\n## Advertising\n\nFor advertising inquiries: ads@quizoi.com\n\n## Content Submissions\n\nWant to suggest a quiz topic? Email: content@quizoi.com\n\n## Response Time\n\nWe aim to respond to all inquiries within 48 hours.')
ON CONFLICT (slug) DO NOTHING;
