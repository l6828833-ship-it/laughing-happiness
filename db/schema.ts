// ============================================================
// db/schema.ts — Quizoi Database Schema
// ORM: Drizzle ORM  |  Database: Supabase (PostgreSQL)
// ============================================================
// Install dependencies:
//   pnpm add drizzle-orm @supabase/supabase-js postgres
//   pnpm add -D drizzle-kit
// ============================================================

import {
  pgTable,
  uuid,
  text,
  integer,
  boolean,
  timestamp,
  pgEnum,
  uniqueIndex,
  index,
  varchar,
} from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';

// ─── Enums ────────────────────────────────────────────────────────────────────

export const quizStatusEnum = pgEnum('quiz_status', ['DRAFT', 'PUBLISHED']);

export const mediaTypeEnum = pgEnum('media_type', [
  'IMAGE',
  'YOUTUBE',
  'VIMEO',
  'NONE',
]);

export const deviceTypeEnum = pgEnum('device_type', [
  'desktop',
  'tablet',
  'mobile',
]);

export const answerTypeEnum = pgEnum('answer_type', ['TEXT', 'IMAGE']);

// ─── categories ───────────────────────────────────────────────────────────────

export const categories = pgTable(
  'categories',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    name: text('name').notNull(),
    slug: text('slug').notNull(),
    emoji: text('emoji').notNull().default(''),
    description: text('description').notNull().default(''),
    imageUrl: text('image_url').default(''),
    quizCount: integer('quiz_count').notNull().default(0),
    createdAt: timestamp('created_at', { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => ({
    slugIdx: uniqueIndex('categories_slug_idx').on(table.slug),
  }),
);

// ─── quizzes ──────────────────────────────────────────────────────────────────

export const quizzes = pgTable(
  'quizzes',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    title: text('title').notNull(),
    slug: text('slug').notNull(),
    description: text('description').notNull().default(''),
    thumbnailUrl: text('thumbnail_url').notNull().default(''),
    categoryId: uuid('category_id')
      .notNull()
      .references(() => categories.id, { onDelete: 'restrict' }),
    status: quizStatusEnum('status').notNull().default('DRAFT'),
    questionCount: integer('question_count').notNull().default(0),
    playCount: integer('play_count').notNull().default(0),
    // Per-quiz ad toggle — master switch (default: ads ON)
    adsEnabled: boolean('ads_enabled').notNull().default(true),
    createdAt: timestamp('created_at', { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => ({
    slugIdx: uniqueIndex('quizzes_slug_idx').on(table.slug),
    categoryIdx: index('quizzes_category_idx').on(table.categoryId),
    statusIdx: index('quizzes_status_idx').on(table.status),
    playCountIdx: index('quizzes_play_count_idx').on(table.playCount),
  }),
);

// ─── questions ────────────────────────────────────────────────────────────────

export const questions = pgTable(
  'questions',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    quizId: uuid('quiz_id')
      .notNull()
      .references(() => quizzes.id, { onDelete: 'cascade' }),
    order: integer('order').notNull(), // 1, 2, 3 … defines sequence
    questionText: text('question_text').notNull(),
    mediaType: mediaTypeEnum('media_type').notNull().default('NONE'),
    mediaUrl: text('media_url').notNull().default(''),
    // Fact Lab — MINIMUM 150 words for AdSense compliance
    factLabTitle: text('fact_lab_title').notNull().default(''),
    factLabContent: text('fact_lab_content').notNull().default(''),
    // Answer display mode
    answerType: answerTypeEnum('answer_type').notNull().default('TEXT'),
    // Optional hint image shown above answer buttons
    previewImageUrl: text('preview_image_url').default(''),
    showPreviewImage: boolean('show_preview_image').notNull().default(false),
    // Per-question feature toggles
    adsEnabled: boolean('ads_enabled').notNull().default(true),
    showSuggestions: boolean('show_suggestions').notNull().default(true),
    showReveal: boolean('show_reveal').notNull().default(true),
    createdAt: timestamp('created_at', { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => ({
    quizOrderIdx: index('questions_quiz_order_idx').on(table.quizId, table.order),
  }),
);

// ─── answers ──────────────────────────────────────────────────────────────────

export const answers = pgTable(
  'answers',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    questionId: uuid('question_id')
      .notNull()
      .references(() => questions.id, { onDelete: 'cascade' }),
    text: text('text').notNull(),
    isCorrect: boolean('is_correct').notNull().default(false),
    // Incremented on every answer submission — powers "42% chose this" stats
    votesCount: integer('votes_count').notNull().default(0),
    order: integer('order').notNull(), // A=1, B=2, C=3, D=4
    // Optional image URL for image-style answer cards
    imageUrl: text('image_url').default(''),
    createdAt: timestamp('created_at', { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => ({
    questionOrderIdx: index('answers_question_order_idx').on(
      table.questionId,
      table.order,
    ),
  }),
);

// ─── quiz_sessions ────────────────────────────────────────────────────────────
// Analytics: tracks every user journey through a quiz.
// session_id is an anonymous UUID stored in a cookie — no login required.

export const quizSessions = pgTable(
  'quiz_sessions',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    quizId: uuid('quiz_id')
      .notNull()
      .references(() => quizzes.id, { onDelete: 'cascade' }),
    // Anonymous per-browser UUID (stored in cookie, never tied to a user account)
    sessionId: text('session_id').notNull(),
    startedAt: timestamp('started_at', { withTimezone: true })
      .notNull()
      .defaultNow(),
    // NULL until the user reaches the /result page
    completedAt: timestamp('completed_at', { withTimezone: true }),
    // Tracks where the user dropped off (last question number they reached)
    lastQuestion: integer('last_question').notNull().default(1),
    // NULL until quiz is completed
    score: integer('score'),
    deviceType: deviceTypeEnum('device_type').notNull().default('desktop'),
  },
  (table) => ({
    quizSessionIdx: index('quiz_sessions_quiz_idx').on(table.quizId),
    sessionIdIdx: index('quiz_sessions_session_id_idx').on(table.sessionId),
    startedAtIdx: index('quiz_sessions_started_at_idx').on(table.startedAt),
  }),
);

// ─── site_settings ────────────────────────────────────────────────────────────
// Single-row table for admin-configurable global settings.
// Replaces the localStorage-based settings in adminStore.ts.

export const siteSettings = pgTable('site_settings', {
  id: uuid('id').primaryKey().defaultRandom(),
  siteName: text('site_name').notNull().default('Quizoi'),
  siteDescription: text('site_description')
    .notNull()
    .default('Free online quizzes on every topic imaginable.'),
  adsensePublisherId: text('adsense_publisher_id').notNull().default(''),
  adsenseAutoAds: boolean('adsense_auto_ads').notNull().default(false),
  headerCode: text('header_code').notNull().default(''),
  footerCode: text('footer_code').notNull().default(''),
  customCss: text('custom_css').notNull().default(''),
  maintenanceMode: boolean('maintenance_mode').notNull().default(false),
  updatedAt: timestamp('updated_at', { withTimezone: true })
    .notNull()
    .defaultNow(),
});

// ─── Relations ────────────────────────────────────────────────────────────────

export const categoriesRelations = relations(categories, ({ many }) => ({
  quizzes: many(quizzes),
}));

export const quizzesRelations = relations(quizzes, ({ one, many }) => ({
  category: one(categories, {
    fields: [quizzes.categoryId],
    references: [categories.id],
  }),
  questions: many(questions),
  sessions: many(quizSessions),
}));

export const questionsRelations = relations(questions, ({ one, many }) => ({
  quiz: one(quizzes, {
    fields: [questions.quizId],
    references: [quizzes.id],
  }),
  answers: many(answers),
}));

export const answersRelations = relations(answers, ({ one }) => ({
  question: one(questions, {
    fields: [answers.questionId],
    references: [questions.id],
  }),
}));

export const quizSessionsRelations = relations(quizSessions, ({ one }) => ({
  quiz: one(quizzes, {
    fields: [quizSessions.quizId],
    references: [quizzes.id],
  }),
}));

// ─── Type Exports ─────────────────────────────────────────────────────────────

export type Category = typeof categories.$inferSelect;
export type NewCategory = typeof categories.$inferInsert;

export type Quiz = typeof quizzes.$inferSelect;
export type NewQuiz = typeof quizzes.$inferInsert;

export type Question = typeof questions.$inferSelect;
export type NewQuestion = typeof questions.$inferInsert;

export type Answer = typeof answers.$inferSelect;
export type NewAnswer = typeof answers.$inferInsert;

export type QuizSession = typeof quizSessions.$inferSelect;
export type NewQuizSession = typeof quizSessions.$inferInsert;

export type SiteSetting = typeof siteSettings.$inferSelect;
export type NewSiteSetting = typeof siteSettings.$inferInsert;

// ─── page_contents ────────────────────────────────────────────────────────────

export const pageContents = pgTable('page_contents', {
  id:        uuid('id').primaryKey().defaultRandom(),
  title:     varchar('title', { length: 120 }).notNull(),
  slug:      varchar('slug', { length: 80 }).notNull().unique(),
  content:   text('content').notNull().default(''),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
});

export type PageContent    = typeof pageContents.$inferSelect;
export type NewPageContent = typeof pageContents.$inferInsert;
