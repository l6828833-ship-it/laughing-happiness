// adminStore.ts — Quizoi Admin Data Layer
// Manages all admin state with localStorage persistence
// Auth: simple password-based (no backend required for static deployment)

import { quizzes as seedQuizzes, categories as seedCategories } from './data';
import type { Quiz, Category } from './data';

// ─── Auth ────────────────────────────────────────────────────────────────────

const ADMIN_PASSWORD = 'quizoi2026'; // Change this before going live
const AUTH_KEY = 'quizoi_admin_auth';

export function adminLogin(password: string): boolean {
  if (password === ADMIN_PASSWORD) {
    sessionStorage.setItem(AUTH_KEY, 'true');
    return true;
  }
  return false;
}

export function adminLogout() {
  sessionStorage.removeItem(AUTH_KEY);
}

export function isAdminAuthenticated(): boolean {
  return sessionStorage.getItem(AUTH_KEY) === 'true';
}

// ─── Quiz Store ───────────────────────────────────────────────────────────────

const QUIZZES_KEY = 'quizoi_admin_quizzes';

export function getAdminQuizzes(): Quiz[] {
  try {
    const stored = localStorage.getItem(QUIZZES_KEY);
    if (stored) return JSON.parse(stored);
  } catch { /* ignore */ }
  return seedQuizzes;
}

export function saveAdminQuizzes(quizzes: Quiz[]) {
  localStorage.setItem(QUIZZES_KEY, JSON.stringify(quizzes));
}

export function createQuiz(quiz: Omit<Quiz, 'id' | 'createdAt'>): Quiz {
  const quizzes = getAdminQuizzes();
  const newQuiz: Quiz = {
    ...quiz,
    id: `quiz-${Date.now()}`,
    createdAt: new Date().toISOString().split('T')[0],
  };
  saveAdminQuizzes([...quizzes, newQuiz]);
  return newQuiz;
}

export function updateQuiz(id: string, updates: Partial<Quiz>): Quiz | null {
  const quizzes = getAdminQuizzes();
  const idx = quizzes.findIndex(q => q.id === id);
  if (idx === -1) return null;
  const updated = { ...quizzes[idx], ...updates };
  quizzes[idx] = updated;
  saveAdminQuizzes(quizzes);
  return updated;
}

export function deleteQuiz(id: string): boolean {
  const quizzes = getAdminQuizzes();
  const filtered = quizzes.filter(q => q.id !== id);
  if (filtered.length === quizzes.length) return false;
  saveAdminQuizzes(filtered);
  return true;
}

export function toggleQuizStatus(id: string): Quiz | null {
  const quizzes = getAdminQuizzes();
  const quiz = quizzes.find(q => q.id === id);
  if (!quiz) return null;
  return updateQuiz(id, { status: quiz.status === 'PUBLISHED' ? 'DRAFT' : 'PUBLISHED' });
}

// ─── Category Store ───────────────────────────────────────────────────────────

const CATEGORIES_KEY = 'quizoi_admin_categories';

export function getAdminCategories(): Category[] {
  try {
    const stored = localStorage.getItem(CATEGORIES_KEY);
    if (stored) return JSON.parse(stored);
  } catch { /* ignore */ }
  return seedCategories;
}

export function saveAdminCategories(categories: Category[]) {
  localStorage.setItem(CATEGORIES_KEY, JSON.stringify(categories));
}

// ─── Analytics (simulated) ────────────────────────────────────────────────────

export interface DailyStats {
  date: string;
  pageviews: number;
  sessions: number;
  quizStarts: number;
  quizCompletions: number;
}

export function getAnalytics(): DailyStats[] {
  // Simulate 30 days of analytics data
  const data: DailyStats[] = [];
  const now = new Date();
  for (let i = 29; i >= 0; i--) {
    const d = new Date(now);
    d.setDate(d.getDate() - i);
    const base = 800 + Math.floor(Math.random() * 400);
    data.push({
      date: d.toISOString().split('T')[0],
      pageviews: base + Math.floor(Math.random() * 200),
      sessions: Math.floor(base * 0.6),
      quizStarts: Math.floor(base * 0.35),
      quizCompletions: Math.floor(base * 0.22),
    });
  }
  return data;
}

export interface AdStats {
  impressions: number;
  clicks: number;
  ctr: number;
  rpm: number;
  earnings: number;
}

export function getAdStats(): AdStats {
  return {
    impressions: 142800,
    clicks: 1284,
    ctr: 0.9,
    rpm: 3.42,
    earnings: 48.84,
  };
}

// ─── Settings Store ───────────────────────────────────────────────────────────

export interface SiteSettings {
  siteName: string;
  siteDescription: string;
  adsensePublisherId: string;
  adsenseAutoAds: boolean;
  adSlotLeaderboard: string;
  adSlotRectangle: string;
  adSlotLargeRectangle: string;
  adSlotBanner: string;
  maintenanceMode: boolean;
  analyticsId: string;
}

const SETTINGS_KEY = 'quizoi_admin_settings';

const defaultSettings: SiteSettings = {
  siteName: 'Quizoi',
  siteDescription: 'Challenge Your Mind — Free Online Quizzes',
  adsensePublisherId: '',
  adsenseAutoAds: false,
  adSlotLeaderboard: '',
  adSlotRectangle: '',
  adSlotLargeRectangle: '',
  adSlotBanner: '',
  maintenanceMode: false,
  analyticsId: '',
};

export function getSiteSettings(): SiteSettings {
  try {
    const stored = localStorage.getItem(SETTINGS_KEY);
    if (stored) return { ...defaultSettings, ...JSON.parse(stored) };
  } catch { /* ignore */ }
  return defaultSettings;
}

export function saveSiteSettings(settings: SiteSettings) {
  localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
}

// ─── Static Pages Store ───────────────────────────────────────────────────────

export interface PageContent {
  id: string;
  title: string;
  slug: string;
  content: string;  // HTML/rich text content
  metaTitle: string;
  metaDescription: string;
  lastUpdated: string;
}

const PAGES_KEY = 'quizoi_admin_pages';

const defaultPages: PageContent[] = [
  {
    id: 'privacy',
    title: 'Privacy Policy',
    slug: '/privacy',
    content: `<h2>Privacy Policy</h2><p>Last updated: March 2026</p><p>Quizoi ("we", "our", or "us") operates quizoi.com. This page informs you of our policies regarding the collection, use, and disclosure of personal data when you use our Service.</p><h3>Information We Collect</h3><p>We collect information you provide directly to us when you use our quizzes. This may include usage data such as your IP address, browser type, pages visited, and time spent on pages.</p><h3>Google AdSense</h3><p>We use Google AdSense to display advertisements. Google AdSense uses cookies to serve ads based on your prior visits to our website or other websites. You may opt out of personalized advertising by visiting <a href="https://www.google.com/settings/ads">Google Ads Settings</a>.</p><h3>Cookies</h3><p>We use cookies to improve your experience on our site. You can instruct your browser to refuse all cookies or to indicate when a cookie is being sent.</p><h3>Contact Us</h3><p>If you have any questions about this Privacy Policy, please contact us at privacy@quizoi.com.</p>`,
    metaTitle: 'Privacy Policy — Quizoi',
    metaDescription: 'Read the Quizoi privacy policy to understand how we collect and use your data.',
    lastUpdated: '2026-03-26',
  },
  {
    id: 'terms',
    title: 'Terms of Service',
    slug: '/terms',
    content: `<h2>Terms of Service</h2><p>Last updated: March 2026</p><p>By accessing and using Quizoi, you accept and agree to be bound by the terms and provision of this agreement.</p><h3>Use of Service</h3><p>Quizoi provides free online quizzes for entertainment and educational purposes. You agree to use the service only for lawful purposes and in a way that does not infringe the rights of others.</p><h3>Intellectual Property</h3><p>The content on Quizoi, including quiz questions, fact lab content, and design elements, is owned by Quizoi and protected by copyright law.</p><h3>Disclaimer</h3><p>The quizzes on Quizoi are for entertainment purposes. While we strive for accuracy, we make no warranties about the completeness or accuracy of the content.</p><h3>Contact</h3><p>Questions about the Terms of Service should be sent to legal@quizoi.com.</p>`,
    metaTitle: 'Terms of Service — Quizoi',
    metaDescription: 'Read the Quizoi terms of service before using our platform.',
    lastUpdated: '2026-03-26',
  },
  {
    id: 'about',
    title: 'About Us',
    slug: '/about',
    content: `<h2>About Quizoi</h2><p>Quizoi is a free online quiz platform designed to challenge your mind and help you learn something new with every question. We cover topics from science and geography to pop culture and history.</p><h3>Our Mission</h3><p>We believe learning should be fun. Every quiz on Quizoi is paired with a Fact Lab — a 150+ word deep-dive into the topic behind each question — so you always leave knowing more than when you arrived.</p><h3>Contact Us</h3><p>Have a suggestion for a quiz? Found an error? Reach out at hello@quizoi.com.</p>`,
    metaTitle: 'About Quizoi — Free Online Quizzes',
    metaDescription: 'Learn about Quizoi, the free online quiz platform that makes learning fun.',
    lastUpdated: '2026-03-26',
  },
  {
    id: 'contact',
    title: 'Contact',
    slug: '/contact',
    content: `<h2>Contact Us</h2><p>We\'d love to hear from you! Whether you have a question, a quiz suggestion, or found an error, please reach out.</p><h3>Email</h3><p>General enquiries: <a href="mailto:hello@quizoi.com">hello@quizoi.com</a></p><p>Advertising: <a href="mailto:ads@quizoi.com">ads@quizoi.com</a></p><p>Legal: <a href="mailto:legal@quizoi.com">legal@quizoi.com</a></p>`,
    metaTitle: 'Contact Quizoi',
    metaDescription: 'Get in touch with the Quizoi team.',
    lastUpdated: '2026-03-26',
  },
];

export function getAdminPages(): PageContent[] {
  try {
    const stored = localStorage.getItem(PAGES_KEY);
    if (stored) return JSON.parse(stored);
  } catch { /* ignore */ }
  return defaultPages;
}

export function saveAdminPages(pages: PageContent[]) {
  localStorage.setItem(PAGES_KEY, JSON.stringify(pages));
}

export function updatePage(id: string, updates: Partial<PageContent>): PageContent | null {
  const pages = getAdminPages();
  const idx = pages.findIndex(p => p.id === id);
  if (idx === -1) return null;
  const updated = { ...pages[idx], ...updates, lastUpdated: new Date().toISOString().split('T')[0] };
  pages[idx] = updated;
  saveAdminPages(pages);
  return updated;
}

// ─── Code Injection Store ─────────────────────────────────────────────────────

export interface CodeInjection {
  headerCode: string;   // Injected in <head> — AdSense script, analytics, etc.
  footerCode: string;   // Injected before </body> — chat widgets, etc.
  customCSS: string;    // Custom CSS overrides
}

const CODE_KEY = 'quizoi_admin_code';

const defaultCode: CodeInjection = {
  headerCode: '',
  footerCode: '',
  customCSS: '',
};

export function getCodeInjection(): CodeInjection {
  try {
    const stored = localStorage.getItem(CODE_KEY);
    if (stored) return { ...defaultCode, ...JSON.parse(stored) };
  } catch { /* ignore */ }
  return defaultCode;
}

export function saveCodeInjection(code: CodeInjection) {
  localStorage.setItem(CODE_KEY, JSON.stringify(code));
}
