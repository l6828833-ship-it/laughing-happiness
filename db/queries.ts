// ============================================================
// db/queries.ts — Quizoi Database Query Functions
// All server-side data access goes through these functions.
// Import in server/routes/*.ts files.
// ============================================================

import { db } from './client';
import {
  categories,
  quizzes,
  questions,
  answers,
  quizSessions,
  siteSettings,
  pageContents,
  type NewQuiz,
  type NewQuestion,
  type NewAnswer,
  type NewCategory,
  type NewQuizSession,
} from './schema';
import { eq, desc, asc, and, sql, count, isNull, isNotNull } from 'drizzle-orm';

// ─── Categories ───────────────────────────────────────────────────────────────

/** Fetch all categories ordered by name */
export async function getAllCategories() {
  return db.select().from(categories).orderBy(asc(categories.name));
}

/** Fetch a single category by slug */
export async function getCategoryBySlug(slug: string) {
  const rows = await db
    .select()
    .from(categories)
    .where(eq(categories.slug, slug))
    .limit(1);
  return rows[0] ?? null;
}

/** Create a new category */
export async function createCategory(data: NewCategory) {
  const rows = await db.insert(categories).values(data).returning();
  return rows[0];
}

/** Update a category */
export async function updateCategory(
  id: string,
  data: Partial<NewCategory>,
) {
  const rows = await db
    .update(categories)
    .set(data)
    .where(eq(categories.id, id))
    .returning();
  return rows[0] ?? null;
}

/** Delete a category (only if no quizzes reference it) */
export async function deleteCategory(id: string) {
  await db.delete(categories).where(eq(categories.id, id));
}

// ─── Quizzes ──────────────────────────────────────────────────────────────────

/** Fetch all published quizzes for the homepage, ordered by play count */
export async function getPublishedQuizzes(limit = 50) {
  return db
    .select()
    .from(quizzes)
    .where(eq(quizzes.status, 'PUBLISHED'))
    .orderBy(desc(quizzes.playCount))
    .limit(limit);
}

/** Fetch latest published quizzes (for "New This Week" section) */
export async function getLatestQuizzes(limit = 6) {
  return db
    .select()
    .from(quizzes)
    .where(eq(quizzes.status, 'PUBLISHED'))
    .orderBy(desc(quizzes.createdAt))
    .limit(limit);
}

/** Fetch published quizzes by category */
export async function getQuizzesByCategory(categoryId: string, limit = 12) {
  return db
    .select()
    .from(quizzes)
    .where(
      and(
        eq(quizzes.status, 'PUBLISHED'),
        eq(quizzes.categoryId, categoryId),
      ),
    )
    .orderBy(desc(quizzes.playCount))
    .limit(limit);
}

/** Fetch a single quiz by slug (published only — for public pages) */
export async function getPublishedQuizBySlug(slug: string) {
  const rows = await db
    .select()
    .from(quizzes)
    .where(and(eq(quizzes.slug, slug), eq(quizzes.status, 'PUBLISHED')))
    .limit(1);
  return rows[0] ?? null;
}

/** Fetch a single quiz by slug (any status — for admin) */
export async function getQuizBySlug(slug: string) {
  const rows = await db
    .select()
    .from(quizzes)
    .where(eq(quizzes.slug, slug))
    .limit(1);
  return rows[0] ?? null;
}

/** Fetch a quiz with all its questions and answers (for admin editor) */
export async function getQuizWithQuestions(quizId: string) {
  const quiz = await db
    .select()
    .from(quizzes)
    .where(eq(quizzes.id, quizId))
    .limit(1);

  if (!quiz[0]) return null;

  const qs = await db
    .select()
    .from(questions)
    .where(eq(questions.quizId, quizId))
    .orderBy(asc(questions.order));

  const questionIds = qs.map((q) => q.id);
  const ans =
    questionIds.length > 0
      ? await db
          .select()
          .from(answers)
          .where(sql`${answers.questionId} = ANY(${sql.raw(`ARRAY[${questionIds.map((id) => `'${id}'`).join(',')}]::uuid[]`)})`)
          .orderBy(asc(answers.order))
      : [];

  return {
    ...quiz[0],
    questions: qs.map((q) => ({
      ...q,
      answers: ans.filter((a) => a.questionId === q.id),
    })),
  };
}

/** Admin: fetch all quizzes (all statuses) */
export async function getAllQuizzes() {
  return db
    .select()
    .from(quizzes)
    .orderBy(desc(quizzes.updatedAt));
}

/** Create a new quiz */
export async function createQuiz(data: NewQuiz) {
  const rows = await db.insert(quizzes).values(data).returning();
  return rows[0];
}

/** Update a quiz */
export async function updateQuiz(id: string, data: Partial<NewQuiz>) {
  const rows = await db
    .update(quizzes)
    .set({ ...data, updatedAt: new Date() })
    .where(eq(quizzes.id, id))
    .returning();
  return rows[0] ?? null;
}

/** Toggle quiz status between DRAFT and PUBLISHED */
export async function toggleQuizStatus(id: string) {
  const quiz = await db
    .select({ status: quizzes.status })
    .from(quizzes)
    .where(eq(quizzes.id, id))
    .limit(1);

  if (!quiz[0]) return null;

  const newStatus = quiz[0].status === 'PUBLISHED' ? 'DRAFT' : 'PUBLISHED';
  return updateQuiz(id, { status: newStatus });
}

/** Delete a quiz and all its questions/answers (CASCADE) */
export async function deleteQuiz(id: string) {
  await db.delete(quizzes).where(eq(quizzes.id, id));
}

// ─── Questions ────────────────────────────────────────────────────────────────

/** Fetch a single question by quiz slug + order number (for question page SSR) */
export async function getQuestionByOrder(quizSlug: string, order: number) {
  const quiz = await getPublishedQuizBySlug(quizSlug);
  if (!quiz) return null;

  const rows = await db
    .select()
    .from(questions)
    .where(and(eq(questions.quizId, quiz.id), eq(questions.order, order)))
    .limit(1);

  if (!rows[0]) return null;

  const ans = await db
    .select()
    .from(answers)
    .where(eq(answers.questionId, rows[0].id))
    .orderBy(asc(answers.order));

  return { ...rows[0], answers: ans, quiz };
}

/** Fetch all questions for a quiz (ordered) */
export async function getQuestionsByQuizId(quizId: string) {
  return db
    .select()
    .from(questions)
    .where(eq(questions.quizId, quizId))
    .orderBy(asc(questions.order));
}

/** Create a question */
export async function createQuestion(data: NewQuestion) {
  const rows = await db.insert(questions).values(data).returning();
  return rows[0];
}

/** Update a question */
export async function updateQuestion(id: string, data: Partial<NewQuestion>) {
  const rows = await db
    .update(questions)
    .set(data)
    .where(eq(questions.id, id))
    .returning();
  return rows[0] ?? null;
}

/** Delete a question */
export async function deleteQuestion(id: string) {
  await db.delete(questions).where(eq(questions.id, id));
}

// ─── Answers ──────────────────────────────────────────────────────────────────

/** Create an answer */
export async function createAnswer(data: NewAnswer) {
  const rows = await db.insert(answers).values(data).returning();
  return rows[0];
}

/** Update an answer */
export async function updateAnswer(id: string, data: Partial<NewAnswer>) {
  const rows = await db
    .update(answers)
    .set(data)
    .where(eq(answers.id, id))
    .returning();
  return rows[0] ?? null;
}

/**
 * Increment votes_count for an answer.
 * Called every time a user submits an answer — powers the "42% chose this" stats.
 * IMPORTANT: This must be called server-side to prevent client-side manipulation.
 */
export async function incrementAnswerVotes(answerId: string) {
  const rows = await db
    .update(answers)
    .set({ votesCount: sql`${answers.votesCount} + 1` })
    .where(eq(answers.id, answerId))
    .returning({ votesCount: answers.votesCount });
  return rows[0]?.votesCount ?? 0;
}

/** Fetch all answers for a question with vote percentages */
export async function getAnswersWithStats(questionId: string) {
  const ans = await db
    .select()
    .from(answers)
    .where(eq(answers.questionId, questionId))
    .orderBy(asc(answers.order));

  const totalVotes = ans.reduce((sum, a) => sum + a.votesCount, 0);

  return ans.map((a) => ({
    ...a,
    votePct: totalVotes > 0 ? Math.round((a.votesCount / totalVotes) * 100) : 0,
  }));
}

/** Delete an answer */
export async function deleteAnswer(id: string) {
  await db.delete(answers).where(eq(answers.id, id));
}

// ─── Quiz Sessions (Analytics) ────────────────────────────────────────────────

/**
 * Start a new quiz session.
 * Called on the first question page load.
 * session_id comes from the anonymous cookie set by the server.
 */
export async function startQuizSession(data: NewQuizSession) {
  const rows = await db.insert(quizSessions).values(data).returning();
  return rows[0];
}

/**
 * Update the last_question field as the user progresses.
 * Called on every question page load.
 */
export async function updateSessionProgress(
  sessionId: string,
  quizId: string,
  lastQuestion: number,
) {
  await db
    .update(quizSessions)
    .set({ lastQuestion })
    .where(
      and(
        eq(quizSessions.sessionId, sessionId),
        eq(quizSessions.quizId, quizId),
      ),
    );
}

/**
 * Mark a session as completed.
 * Called when the user reaches the /result page.
 */
export async function completeQuizSession(
  sessionId: string,
  quizId: string,
  score: number,
) {
  await db
    .update(quizSessions)
    .set({ completedAt: new Date(), score })
    .where(
      and(
        eq(quizSessions.sessionId, sessionId),
        eq(quizSessions.quizId, quizId),
        isNull(quizSessions.completedAt),
      ),
    );
}

// ─── Analytics Queries ────────────────────────────────────────────────────────

/** Completion rate for all quizzes (admin dashboard) */
export async function getCompletionRates() {
  return db.execute(sql`
    SELECT
      q.id,
      q.title,
      q.slug,
      COUNT(qs.id)                                                      AS total_starts,
      COUNT(qs.completed_at)                                            AS completions,
      ROUND(COUNT(qs.completed_at) * 100.0 / NULLIF(COUNT(qs.id), 0), 1) AS completion_rate,
      ROUND(AVG(
        CASE WHEN qs.completed_at IS NOT NULL
          THEN EXTRACT(EPOCH FROM (qs.completed_at - qs.started_at))
        END
      ))                                                                AS avg_seconds
    FROM quizzes q
    LEFT JOIN quiz_sessions qs ON qs.quiz_id = q.id
    GROUP BY q.id, q.title, q.slug
    ORDER BY total_starts DESC
  `);
}

/** Per-question drop-off for a specific quiz */
export async function getDropOffStats(quizId: string) {
  return db.execute(sql`
    SELECT
      q.title,
      qs.last_question,
      COUNT(*)                                                                          AS drop_off_count,
      ROUND(COUNT(*) * 100.0 / SUM(COUNT(*)) OVER (PARTITION BY qs.quiz_id), 1)        AS pct
    FROM quiz_sessions qs
    JOIN quizzes q ON q.id = qs.quiz_id
    WHERE qs.quiz_id = ${quizId}
      AND qs.completed_at IS NULL
    GROUP BY q.title, qs.last_question, qs.quiz_id
    ORDER BY qs.last_question
  `);
}

/** Daily stats for the last N days (admin analytics chart) */
export async function getDailyStats(days = 30) {
  return db.execute(sql`
    SELECT
      DATE(started_at AT TIME ZONE 'UTC')  AS date,
      COUNT(*)                             AS sessions,
      COUNT(completed_at)                  AS completions
    FROM quiz_sessions
    WHERE started_at >= NOW() - INTERVAL '${sql.raw(String(days))} days'
    GROUP BY DATE(started_at AT TIME ZONE 'UTC')
    ORDER BY date ASC
  `);
}

// ─── Site Settings ────────────────────────────────────────────────────────────

/** Fetch the single site settings row */
export async function getSiteSettings() {
  const rows = await db.select().from(siteSettings).limit(1);
  return rows[0] ?? null;
}

/** Update site settings (upsert pattern) */
export async function upsertSiteSettings(
  data: Partial<typeof siteSettings.$inferInsert>,
) {
  const existing = await getSiteSettings();

  if (existing) {
    const rows = await db
      .update(siteSettings)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(siteSettings.id, existing.id))
      .returning();
    return rows[0];
  } else {
    const rows = await db.insert(siteSettings).values(data).returning();
    return rows[0];
  }
}

// ─── Page Contents ────────────────────────────────────────────────────────────

/** Fetch all static pages */
export async function getAllPages() {
  return db.select().from(pageContents).orderBy(asc(pageContents.title));
}

/** Update a static page by id */
export async function updatePage(
  id: string,
  data: Partial<typeof pageContents.$inferInsert>,
) {
  const rows = await db
    .update(pageContents)
    .set({ ...data, updatedAt: new Date() })
    .where(eq(pageContents.id, id))
    .returning();
  return rows[0] ?? null;
}
