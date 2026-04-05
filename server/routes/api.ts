// ============================================================
// server/routes/api.ts — Quizoi REST API Routes
// Mount in server/index.ts:  app.use('/api', apiRouter)
// ============================================================
// All routes use the service role key (bypasses RLS) via db/client.ts.
// Public routes: /api/quizzes, /api/quiz/:slug, /api/question/:slug/:n
// Admin routes:  /api/admin/* — protected by ADMIN_SECRET header
// ============================================================

import { Router, type Request, type Response } from 'express';
import {
  getAllCategories,
  getCategoryBySlug,
  createCategory,
  updateCategory,
  deleteCategory,
  getPublishedQuizzes,
  getLatestQuizzes,
  getQuizzesByCategory,
  getPublishedQuizBySlug,
  getQuizWithQuestions,
  getAllQuizzes,
  createQuiz,
  updateQuiz,
  toggleQuizStatus,
  deleteQuiz,
  getQuestionByOrder,
  createQuestion,
  updateQuestion,
  deleteQuestion,
  createAnswer,
  updateAnswer,
  deleteAnswer,
  incrementAnswerVotes,
  getAnswersWithStats,
  startQuizSession,
  updateSessionProgress,
  completeQuizSession,
  getCompletionRates,
  getDropOffStats,
  getDailyStats,
  getSiteSettings,
  upsertSiteSettings,
  getAllPages,
  updatePage,
} from '../../db/queries';

export const apiRouter = Router();

// ─── Admin Auth Middleware ────────────────────────────────────────────────────
// Simple secret-based auth for admin routes.
// Set ADMIN_SECRET in your .env file.

function requireAdmin(req: Request, res: Response, next: () => void) {
  const secret = req.headers['x-admin-secret'] as string | undefined;
  if (!secret || secret !== process.env.ADMIN_SECRET) {
    res.status(401).json({ error: 'Unauthorized' });
    return;
  }
  next();
}

// ─── Public: Categories ───────────────────────────────────────────────────────

apiRouter.get('/categories', async (_req, res) => {
  try {
    const data = await getAllCategories();
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch categories' });
  }
});

apiRouter.get('/categories/:slug', async (req, res) => {
  try {
    const cat = await getCategoryBySlug(req.params.slug);
    if (!cat) return res.status(404).json({ error: 'Category not found' });
    const quizzesData = await getQuizzesByCategory(cat.id);
    res.json({ ...cat, quizzes: quizzesData });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch category' });
  }
});

// ─── Public: Quizzes ──────────────────────────────────────────────────────────

/** Homepage: most played + latest */
apiRouter.get('/quizzes', async (req, res) => {
  try {
    const [mostPlayed, latest] = await Promise.all([
      getPublishedQuizzes(12),
      getLatestQuizzes(6),
    ]);
    res.json({ mostPlayed, latest });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch quizzes' });
  }
});

/** Single quiz metadata (for quiz start page) */
apiRouter.get('/quiz/:slug', async (req, res) => {
  try {
    const quiz = await getPublishedQuizBySlug(req.params.slug);
    if (!quiz) return res.status(404).json({ error: 'Quiz not found' });
    res.json(quiz);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch quiz' });
  }
});

// ─── Public: Questions ────────────────────────────────────────────────────────

/**
 * GET /api/question/:slug/:n
 * Returns question data for the question page.
 * Answers are returned WITHOUT is_correct — that is only revealed on the
 * reveal page after the user has submitted their answer.
 */
apiRouter.get('/question/:slug/:n', async (req, res) => {
  try {
    const n = parseInt(req.params.n, 10);
    if (isNaN(n) || n < 1) return res.status(400).json({ error: 'Invalid question number' });

    const data = await getQuestionByOrder(req.params.slug, n);
    if (!data) return res.status(404).json({ error: 'Question not found' });

    // Strip is_correct from answers — never expose to client before submission
    const safeAnswers = data.answers.map(({ isCorrect: _ic, ...rest }) => rest);

    res.json({ ...data, answers: safeAnswers });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch question' });
  }
});

// ─── Public: Answer Submission ────────────────────────────────────────────────

/**
 * POST /api/answer
 * Body: { answerId, questionId, sessionId, quizId, questionNumber }
 *
 * 1. Increments votes_count on the chosen answer
 * 2. Updates session last_question
 * 3. Returns the full answer stats (with is_correct revealed)
 *
 * The client then does a full page redirect to /quiz/:slug/reveal/:n
 * — NEVER use AJAX navigation for quiz transitions (full refresh = ad impression).
 */
apiRouter.post('/answer', async (req, res) => {
  try {
    const { answerId, questionId, sessionId, quizId, questionNumber } =
      req.body as {
        answerId: string;
        questionId: string;
        sessionId: string;
        quizId: string;
        questionNumber: number;
      };

    if (!answerId || !questionId || !sessionId || !quizId) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Increment votes on the chosen answer
    await incrementAnswerVotes(answerId);

    // Update session progress
    await updateSessionProgress(sessionId, quizId, questionNumber);

    // Return full stats (with is_correct revealed for the reveal page)
    const stats = await getAnswersWithStats(questionId);

    res.json({ stats });
  } catch (err) {
    res.status(500).json({ error: 'Failed to submit answer' });
  }
});

// ─── Public: Sessions ─────────────────────────────────────────────────────────

/** POST /api/session/start — called on question 1 page load */
apiRouter.post('/session/start', async (req, res) => {
  try {
    const { quizId, sessionId, deviceType } = req.body as {
      quizId: string;
      sessionId: string;
      deviceType: 'desktop' | 'tablet' | 'mobile';
    };

    if (!quizId || !sessionId) {
      return res.status(400).json({ error: 'Missing quizId or sessionId' });
    }

    const session = await startQuizSession({
      quizId,
      sessionId,
      deviceType: deviceType ?? 'desktop',
    });

    res.json(session);
  } catch (err) {
    res.status(500).json({ error: 'Failed to start session' });
  }
});

/** POST /api/session/complete — called on the result page */
apiRouter.post('/session/complete', async (req, res) => {
  try {
    const { sessionId, quizId, score } = req.body as {
      sessionId: string;
      quizId: string;
      score: number;
    };

    if (!sessionId || !quizId || score === undefined) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    await completeQuizSession(sessionId, quizId, score);
    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ error: 'Failed to complete session' });
  }
});

// ─── Public: Site Settings (read-only) ───────────────────────────────────────

apiRouter.get('/settings', async (_req, res) => {
  try {
    const settings = await getSiteSettings();
    if (!settings) return res.json({});
    // Only expose safe public fields
    res.json({
      siteName: settings.siteName,
      siteDescription: settings.siteDescription,
      adsensePublisherId: settings.adsensePublisherId,
      adsenseAutoAds: settings.adsenseAutoAds,
      headerCode: settings.headerCode,
      footerCode: settings.footerCode,
      customCss: settings.customCss,
    });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch settings' });
  }
});

// ─── Admin: Quiz Management ───────────────────────────────────────────────────

apiRouter.get('/admin/quizzes', requireAdmin, async (_req, res) => {
  try {
    res.json(await getAllQuizzes());
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch quizzes' });
  }
});

apiRouter.get('/admin/quiz/:id', requireAdmin, async (req, res) => {
  try {
    const quiz = await getQuizWithQuestions(req.params.id);
    if (!quiz) return res.status(404).json({ error: 'Quiz not found' });
    res.json(quiz);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch quiz' });
  }
});

apiRouter.post('/admin/quiz', requireAdmin, async (req, res) => {
  try {
    const quiz = await createQuiz(req.body);
    res.status(201).json(quiz);
  } catch (err) {
    res.status(500).json({ error: 'Failed to create quiz' });
  }
});

apiRouter.patch('/admin/quiz/:id', requireAdmin, async (req, res) => {
  try {
    const quiz = await updateQuiz(req.params.id, req.body);
    if (!quiz) return res.status(404).json({ error: 'Quiz not found' });
    res.json(quiz);
  } catch (err) {
    res.status(500).json({ error: 'Failed to update quiz' });
  }
});

apiRouter.patch('/admin/quiz/:id/toggle', requireAdmin, async (req, res) => {
  try {
    const quiz = await toggleQuizStatus(req.params.id);
    if (!quiz) return res.status(404).json({ error: 'Quiz not found' });
    res.json(quiz);
  } catch (err) {
    res.status(500).json({ error: 'Failed to toggle quiz status' });
  }
});

apiRouter.delete('/admin/quiz/:id', requireAdmin, async (req, res) => {
  try {
    await deleteQuiz(req.params.id);
    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete quiz' });
  }
});

// ─── Admin: Category Management ──────────────────────────────────────────────

apiRouter.get('/admin/categories', requireAdmin, async (_req, res) => {
  try {
    res.json(await getAllCategories());
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch categories' });
  }
});

apiRouter.post('/admin/category', requireAdmin, async (req, res) => {
  try {
    const cat = await createCategory(req.body);
    res.status(201).json(cat);
  } catch (err) {
    res.status(500).json({ error: 'Failed to create category' });
  }
});

apiRouter.patch('/admin/category/:id', requireAdmin, async (req, res) => {
  try {
    const cat = await updateCategory(req.params.id, req.body);
    if (!cat) return res.status(404).json({ error: 'Category not found' });
    res.json(cat);
  } catch (err) {
    res.status(500).json({ error: 'Failed to update category' });
  }
});

apiRouter.delete('/admin/category/:id', requireAdmin, async (req, res) => {
  try {
    await deleteCategory(req.params.id);
    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete category' });
  }
});

// ─── Admin: Question & Answer Management ─────────────────────────────────────

apiRouter.post('/admin/question', requireAdmin, async (req, res) => {
  try {
    const q = await createQuestion(req.body);
    res.status(201).json(q);
  } catch (err) {
    res.status(500).json({ error: 'Failed to create question' });
  }
});

apiRouter.patch('/admin/question/:id', requireAdmin, async (req, res) => {
  try {
    const q = await updateQuestion(req.params.id, req.body);
    if (!q) return res.status(404).json({ error: 'Question not found' });
    res.json(q);
  } catch (err) {
    res.status(500).json({ error: 'Failed to update question' });
  }
});

apiRouter.delete('/admin/question/:id', requireAdmin, async (req, res) => {
  try {
    await deleteQuestion(req.params.id);
    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete question' });
  }
});

apiRouter.post('/admin/answer', requireAdmin, async (req, res) => {
  try {
    const a = await createAnswer(req.body);
    res.status(201).json(a);
  } catch (err) {
    res.status(500).json({ error: 'Failed to create answer' });
  }
});

apiRouter.patch('/admin/answer/:id', requireAdmin, async (req, res) => {
  try {
    const a = await updateAnswer(req.params.id, req.body);
    if (!a) return res.status(404).json({ error: 'Answer not found' });
    res.json(a);
  } catch (err) {
    res.status(500).json({ error: 'Failed to update answer' });
  }
});

apiRouter.delete('/admin/answer/:id', requireAdmin, async (req, res) => {
  try {
    await deleteAnswer(req.params.id);
    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete answer' });
  }
});

// ─── Admin: Analytics ────────────────────────────────────────────────────────

apiRouter.get('/admin/analytics/completion', requireAdmin, async (_req, res) => {
  try {
    res.json(await getCompletionRates());
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch completion rates' });
  }
});

apiRouter.get('/admin/analytics/dropoff/:quizId', requireAdmin, async (req, res) => {
  try {
    res.json(await getDropOffStats(req.params.quizId));
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch drop-off stats' });
  }
});

apiRouter.get('/admin/analytics/daily', requireAdmin, async (req, res) => {
  try {
    const days = parseInt(req.query.days as string, 10) || 30;
    res.json(await getDailyStats(days));
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch daily stats' });
  }
});

// ─── Admin: Login ────────────────────────────────────────────────────────────

/** POST /api/admin/login — verify password, return token */
apiRouter.post('/admin/login', (req, res) => {
  const { password } = req.body as { password: string };
  const expected = process.env.ADMIN_SECRET;
  if (expected && password === expected) {
    return res.json({ token: expected });
  }
  res.status(401).json({ error: 'Invalid password' });
});

// ─── Admin: Pages ─────────────────────────────────────────────────────────────

apiRouter.get('/admin/pages', requireAdmin, async (_req, res) => {
  try {
    res.json(await getAllPages());
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch pages' });
  }
});

apiRouter.patch('/admin/page/:id', requireAdmin, async (req, res) => {
  try {
    const page = await updatePage(req.params.id, req.body);
    if (!page) return res.status(404).json({ error: 'Page not found' });
    res.json(page);
  } catch (err) {
    res.status(500).json({ error: 'Failed to update page' });
  }
});

// ─── Admin: Site Settings ─────────────────────────────────────────────────────

apiRouter.get('/admin/settings', requireAdmin, async (_req, res) => {
  try {
    res.json(await getSiteSettings());
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch settings' });
  }
});

apiRouter.patch('/admin/settings', requireAdmin, async (req, res) => {
  try {
    const settings = await upsertSiteSettings(req.body);
    res.json(settings);
  } catch (err) {
    res.status(500).json({ error: 'Failed to update settings' });
  }
});
