// ============================================================
// client/src/lib/api.ts — Quizoi API Client
// Replaces all localStorage-based data access with real API calls.
// All admin routes require the VITE_ADMIN_SECRET env variable.
// ============================================================

// ─── Types (mirrored from db/schema.ts for client use) ────────────────────────

export interface Category {
  id: string;
  name: string;
  slug: string;
  emoji: string;
  description: string;
  imageUrl: string | null;
  quizCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface Answer {
  id: string;
  questionId: string;
  text: string;
  isCorrect?: boolean; // only present on reveal page
  votesCount: number;
  order: number;
  imageUrl: string | null;
  votePct?: number; // computed on server for reveal page
}

export interface Question {
  id: string;
  quizId: string;
  order: number;
  questionText: string;
  mediaType: 'IMAGE' | 'YOUTUBE' | 'VIMEO' | 'NONE';
  mediaUrl: string;
  factLabTitle: string;
  factLabContent: string;
  answerType: 'TEXT' | 'IMAGE';
  previewImageUrl: string | null;
  showPreviewImage: boolean;
  adsEnabled: boolean;
  showSuggestions: boolean;
  showReveal: boolean;
  answers: Answer[];
}

export interface Quiz {
  id: string;
  title: string;
  slug: string;
  description: string;
  thumbnailUrl: string;
  categoryId: string;
  status: 'DRAFT' | 'PUBLISHED';
  questionCount: number;
  playCount: number;
  adsEnabled: boolean;
  createdAt: string;
  updatedAt: string;
  questions?: Question[];
}

export interface QuizWithQuestion {
  quiz: Quiz;
  question: Question;
  related: Quiz[];
}

export interface SiteSettings {
  siteName: string;
  siteDescription: string;
  adsensePublisherId: string;
  adsenseAutoAds: boolean;
  analyticsId?: string;
  headerCode: string;
  footerCode: string;
  customCss: string;
  maintenanceMode?: boolean;
}

export interface DailyStats {
  date: string;
  sessions: number;
  completions: number;
}

export interface CompletionRate {
  id: string;
  title: string;
  slug: string;
  total_starts: number;
  completions: number;
  completion_rate: number;
  avg_seconds: number;
}

export interface DropOffStat {
  title: string;
  last_question: number;
  drop_off_count: number;
  pct: number;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

const ADMIN_SECRET = import.meta.env.VITE_ADMIN_SECRET as string | undefined;

function adminHeaders(): Record<string, string> {
  return {
    'Content-Type': 'application/json',
    'X-Admin-Secret': ADMIN_SECRET ?? '',
  };
}

async function apiFetch<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`/api${path}`, options);
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: res.statusText }));
    throw new Error(err.error ?? `API error ${res.status}`);
  }
  return res.json() as Promise<T>;
}

// ─── Session ID (anonymous, stored in localStorage) ───────────────────────────

export function getSessionId(): string {
  const key = 'quizoi_session_id';
  let id = localStorage.getItem(key);
  if (!id) {
    id = crypto.randomUUID();
    localStorage.setItem(key, id);
  }
  return id;
}

export function getDeviceType(): 'desktop' | 'tablet' | 'mobile' {
  const w = window.innerWidth;
  if (w < 768) return 'mobile';
  if (w < 1024) return 'tablet';
  return 'desktop';
}

// ─── Local answer storage (per-question, per-quiz) ────────────────────────────
// Used to show correct/incorrect on reveal page without an extra API call.

interface LocalAnswer {
  answerId: string;
  isCorrect: boolean;
}

function answerKey(quizSlug: string, questionNum: number) {
  return `quizoi_ans_${quizSlug}_${questionNum}`;
}

export function saveLocalAnswer(quizSlug: string, questionNum: number, answerId: string, isCorrect: boolean) {
  localStorage.setItem(answerKey(quizSlug, questionNum), JSON.stringify({ answerId, isCorrect }));
}

export function getLocalAnswer(quizSlug: string, questionNum: number): LocalAnswer | null {
  try {
    const raw = localStorage.getItem(answerKey(quizSlug, questionNum));
    return raw ? JSON.parse(raw) : null;
  } catch { return null; }
}

export function clearLocalQuizAnswers(quizSlug: string, questionCount: number) {
  for (let i = 1; i <= questionCount + 5; i++) {
    localStorage.removeItem(answerKey(quizSlug, i));
  }
}

export function getQuizScore(quizSlug: string, questionCount: number): number {
  let score = 0;
  for (let i = 1; i <= questionCount; i++) {
    const ans = getLocalAnswer(quizSlug, i);
    if (ans?.isCorrect) score++;
  }
  return score;
}

// ─── Public API ───────────────────────────────────────────────────────────────

/** Homepage: { mostPlayed: Quiz[], latest: Quiz[] } */
export async function fetchHomepage(): Promise<{ mostPlayed: Quiz[]; latest: Quiz[] }> {
  return apiFetch('/quizzes');
}

/** All categories */
export async function fetchCategories(): Promise<Category[]> {
  return apiFetch('/categories');
}

/** Category + its quizzes */
export async function fetchCategory(slug: string): Promise<Category & { quizzes: Quiz[] }> {
  return apiFetch(`/categories/${slug}`);
}

/** Single quiz metadata */
export async function fetchQuiz(slug: string): Promise<Quiz> {
  return apiFetch(`/quiz/${slug}`);
}

/** Question page data (answers WITHOUT is_correct) */
export async function fetchQuestion(quizSlug: string, n: number): Promise<QuizWithQuestion> {
  return apiFetch(`/question/${quizSlug}/${n}`);
}

/** Public site settings */
export async function fetchReveal(quizSlug: string, n: number): Promise<{ quiz: Quiz; question: Question }> {
  return apiFetch(`/quiz/${quizSlug}/reveal/${n}`);
}

export async function fetchSettings(): Promise<SiteSettings> {
  return apiFetch('/settings');
}

// ─── Answer Submission ────────────────────────────────────────────────────────

export interface SubmitAnswerResult {
  stats: Array<Answer & { votePct: number; isCorrect: boolean }>;
}

export async function submitAnswer(params: {
  answerId: string;
  questionId: string;
  quizId: string;
  questionNumber: number;
}): Promise<SubmitAnswerResult> {
  const sessionId = getSessionId();
  return apiFetch('/answer', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ ...params, sessionId }),
  });
}

// ─── Session Tracking ─────────────────────────────────────────────────────────

export async function startSession(quizId: string): Promise<void> {
  const sessionId = getSessionId();
  const deviceType = getDeviceType();
  await apiFetch('/session/start', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ quizId, sessionId, deviceType }),
  }).catch(() => { /* non-critical — don't block quiz */ });
}

export async function completeSession(quizId: string, score: number): Promise<void> {
  const sessionId = getSessionId();
  await apiFetch('/session/complete', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ quizId, sessionId, score }),
  }).catch(() => { /* non-critical */ });
}

// ─── Admin Auth ───────────────────────────────────────────────────────────────

const AUTH_KEY = 'quizoi_admin_auth';

export function adminLogin(password: string): boolean {
  const expected = import.meta.env.VITE_ADMIN_PASSWORD as string | undefined;
  if (expected && password === expected) {
    sessionStorage.setItem(AUTH_KEY, 'true');
    return true;
  }
  // Fallback hardcoded password (change before going live)
  if (password === 'quizoi2026') {
    sessionStorage.setItem(AUTH_KEY, 'true');
    return true;
  }
  return false;
}

export function adminLogout() { sessionStorage.removeItem(AUTH_KEY); }
export function isAdminAuthenticated(): boolean {
  return sessionStorage.getItem(AUTH_KEY) === 'true';
}

// ─── Admin: Quizzes ───────────────────────────────────────────────────────────

export async function adminFetchQuizzes(): Promise<Quiz[]> {
  return apiFetch('/admin/quizzes', { headers: adminHeaders() });
}

export async function adminFetchQuiz(id: string): Promise<Quiz & { questions: Question[] }> {
  return apiFetch(`/admin/quiz/${id}`, { headers: adminHeaders() });
}

export async function adminCreateQuiz(data: Partial<Quiz>): Promise<Quiz> {
  return apiFetch('/admin/quiz', {
    method: 'POST',
    headers: adminHeaders(),
    body: JSON.stringify(data),
  });
}

export async function adminUpdateQuiz(id: string, data: Partial<Quiz>): Promise<Quiz> {
  return apiFetch(`/admin/quiz/${id}`, {
    method: 'PATCH',
    headers: adminHeaders(),
    body: JSON.stringify(data),
  });
}

export async function adminToggleQuizStatus(id: string): Promise<Quiz> {
  return apiFetch(`/admin/quiz/${id}/toggle`, {
    method: 'PATCH',
    headers: adminHeaders(),
  });
}

export async function adminDeleteQuiz(id: string): Promise<void> {
  await apiFetch(`/admin/quiz/${id}`, { method: 'DELETE', headers: adminHeaders() });
}

// ─── Admin: Questions ─────────────────────────────────────────────────────────

export async function adminCreateQuestion(data: Partial<Question>): Promise<Question> {
  return apiFetch('/admin/question', {
    method: 'POST',
    headers: adminHeaders(),
    body: JSON.stringify(data),
  });
}

export async function adminUpdateQuestion(id: string, data: Partial<Question>): Promise<Question> {
  return apiFetch(`/admin/question/${id}`, {
    method: 'PATCH',
    headers: adminHeaders(),
    body: JSON.stringify(data),
  });
}

export async function adminDeleteQuestion(id: string): Promise<void> {
  await apiFetch(`/admin/question/${id}`, { method: 'DELETE', headers: adminHeaders() });
}

// ─── Admin: Answers ───────────────────────────────────────────────────────────

export async function adminCreateAnswer(data: Partial<Answer>): Promise<Answer> {
  return apiFetch('/admin/answer', {
    method: 'POST',
    headers: adminHeaders(),
    body: JSON.stringify(data),
  });
}

export async function adminUpdateAnswer(id: string, data: Partial<Answer>): Promise<Answer> {
  return apiFetch(`/admin/answer/${id}`, {
    method: 'PATCH',
    headers: adminHeaders(),
    body: JSON.stringify(data),
  });
}

export async function adminDeleteAnswer(id: string): Promise<void> {
  await apiFetch(`/admin/answer/${id}`, { method: 'DELETE', headers: adminHeaders() });
}

// ─── Admin: Categories ────────────────────────────────────────────────────────

export async function adminFetchCategories(): Promise<Category[]> {
  return apiFetch('/admin/categories', { headers: adminHeaders() });
}

export async function adminCreateCategory(data: Partial<Category>): Promise<Category> {
  return apiFetch('/admin/category', {
    method: 'POST',
    headers: adminHeaders(),
    body: JSON.stringify(data),
  });
}

export async function adminUpdateCategory(id: string, data: Partial<Category>): Promise<Category> {
  return apiFetch(`/admin/category/${id}`, {
    method: 'PATCH',
    headers: adminHeaders(),
    body: JSON.stringify(data),
  });
}

export async function adminDeleteCategory(id: string): Promise<void> {
  await apiFetch(`/admin/category/${id}`, { method: 'DELETE', headers: adminHeaders() });
}

// ─── Admin: Analytics ────────────────────────────────────────────────────────

export async function adminFetchCompletionRates(): Promise<CompletionRate[]> {
  return apiFetch('/admin/analytics/completion', { headers: adminHeaders() });
}

export async function adminFetchDropOff(quizId: string): Promise<DropOffStat[]> {
  return apiFetch(`/admin/analytics/dropoff/${quizId}`, { headers: adminHeaders() });
}

export async function adminFetchDailyStats(days = 30): Promise<DailyStats[]> {
  return apiFetch(`/admin/analytics/daily?days=${days}`, { headers: adminHeaders() });
}

// ─── Admin: Settings ─────────────────────────────────────────────────────────

export async function adminFetchSettings(): Promise<SiteSettings & { id: string }> {
  return apiFetch('/admin/settings', { headers: adminHeaders() });
}

export async function adminSaveSettings(data: Partial<SiteSettings>): Promise<SiteSettings> {
  return apiFetch('/admin/settings', {
    method: 'PATCH',
    headers: adminHeaders(),
    body: JSON.stringify(data),
  });
}


// ─── Admin: Pages ─────────────────────────────────────────────────────────────

export interface PageContent {
  id:        string;
  title:     string;
  slug:      string;
  content:   string;
  updatedAt?: string;
}

export async function adminFetchPages(): Promise<PageContent[]> {
  return apiFetch('/admin/pages', { headers: adminHeaders() });
}

export async function adminUpdatePage(id: string, data: Partial<PageContent>): Promise<PageContent> {
  return apiFetch(`/admin/page/${id}`, {
    method: 'PATCH',
    headers: adminHeaders(),
    body: JSON.stringify(data),
  });
}

// ─── Utility ──────────────────────────────────────────────────────────────────

export function formatPlayCount(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`;
  return n.toString();
}

export function getScoreMessage(score: number, total: number): { title: string; message: string; emoji: string } {
  const pct = (score / total) * 100;
  if (pct === 100) return { title: 'Perfect Score!', message: "You're in the top 1%. Absolutely flawless.", emoji: '🏆' };
  if (pct >= 80)  return { title: 'Excellent!',      message: "You really know your stuff. Impressive result!", emoji: '🌟' };
  if (pct >= 60)  return { title: 'Good Job!',        message: "Above average! A few more questions and you'd ace it.", emoji: '👍' };
  if (pct >= 40)  return { title: 'Not Bad',           message: "You got the basics down. Room to improve though!", emoji: '📚' };
  return              { title: 'Keep Practising',    message: "Don't worry — now you know what to study!", emoji: '💪' };
}
