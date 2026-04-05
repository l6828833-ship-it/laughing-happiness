// App.tsx — Quizoi Platform
// Light theme — white background, blue primary
// All quiz transitions use window.location.href (full page refresh) for ad revenue
import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Route, Switch } from "wouter";
import { useEffect } from "react";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import { getCodeInjection } from "./lib/adminStore";

// Public Pages
import Home from "./pages/Home";
import Categories from "./pages/Categories";
import CategoryDetail from "./pages/CategoryDetail";
import QuizStart from "./pages/QuizStart";
import QuizQuestion from "./pages/QuizQuestion";
import QuizReveal from "./pages/QuizReveal";
import QuizResult from "./pages/QuizResult";
import About from "./pages/About";
import Contact from "./pages/Contact";
import Privacy from "./pages/Privacy";
import Terms from "./pages/Terms";
import NotFound from "./pages/NotFound";

// Admin Pages
import AdminLogin from "./pages/admin/AdminLogin";
import AdminLayout from "./pages/admin/AdminLayout";
import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminQuizzes from "./pages/admin/AdminQuizzes";
import AdminQuizEditor from "./pages/admin/AdminQuizEditor";
import AdminCategories from "./pages/admin/AdminCategories";
import AdminSettings from "./pages/admin/AdminSettings";
import AdminAnalytics from "./pages/admin/AdminAnalytics";
import AdminPages from "./pages/admin/AdminPages";
import AdminCodeInjection from "./pages/admin/AdminCodeInjection";

// Code injection: apply header/footer/CSS from admin settings on every page load
function CodeInjectionEffect() {
  useEffect(() => {
    const code = getCodeInjection();

    // Header code (scripts, AdSense, analytics)
    if (code.headerCode) {
      const existing = document.getElementById('quizoi-header-inject');
      if (!existing) {
        const container = document.createElement('div');
        container.id = 'quizoi-header-inject';
        container.innerHTML = code.headerCode;
        // Properly execute scripts
        container.querySelectorAll('script').forEach(oldScript => {
          const newScript = document.createElement('script');
          Array.from(oldScript.attributes).forEach(attr => newScript.setAttribute(attr.name, attr.value));
          newScript.textContent = oldScript.textContent;
          document.head.appendChild(newScript);
          oldScript.remove();
        });
        // Append non-script elements to head
        Array.from(container.children).forEach(el => document.head.appendChild(el));
      }
    }

    // Footer code
    if (code.footerCode) {
      const existing = document.getElementById('quizoi-footer-inject');
      if (!existing) {
        const container = document.createElement('div');
        container.id = 'quizoi-footer-inject';
        container.innerHTML = code.footerCode;
        container.querySelectorAll('script').forEach(oldScript => {
          const newScript = document.createElement('script');
          Array.from(oldScript.attributes).forEach(attr => newScript.setAttribute(attr.name, attr.value));
          newScript.textContent = oldScript.textContent;
          document.body.appendChild(newScript);
          oldScript.remove();
        });
        document.body.appendChild(container);
      }
    }

    // Custom CSS
    if (code.customCSS) {
      let styleEl = document.getElementById('quizoi-custom-css') as HTMLStyleElement | null;
      if (!styleEl) {
        styleEl = document.createElement('style');
        styleEl.id = 'quizoi-custom-css';
        document.head.appendChild(styleEl);
      }
      styleEl.textContent = code.customCSS;
    }
  }, []);

  return null;
}

function Router() {
  return (
    <Switch>
      {/* Homepage */}
      <Route path="/" component={Home} />

      {/* Category pages */}
      <Route path="/categories" component={Categories} />
      <Route path="/category/:slug" component={CategoryDetail} />

      {/* Quiz flow — full page refresh between each step */}
      <Route path="/quiz/:slug/start" component={QuizStart} />
      <Route path="/quiz/:slug/question/:n" component={QuizQuestion} />
      <Route path="/quiz/:slug/reveal/:n" component={QuizReveal} />
      <Route path="/quiz/:slug/result" component={QuizResult} />

      {/* Static / legal pages — required for AdSense */}
      <Route path="/about" component={About} />
      <Route path="/contact" component={Contact} />
      <Route path="/privacy" component={Privacy} />
      <Route path="/terms" component={Terms} />

      {/* Admin */}
      <Route path="/admin/login" component={AdminLogin} />
      <Route path="/admin" component={() => <AdminLayout><AdminDashboard /></AdminLayout>} />
      <Route path="/admin/dashboard" component={() => <AdminLayout><AdminDashboard /></AdminLayout>} />
      <Route path="/admin/quizzes" component={() => <AdminLayout><AdminQuizzes /></AdminLayout>} />
      <Route path="/admin/quizzes/new" component={() => <AdminLayout><AdminQuizEditor /></AdminLayout>} />
      <Route path="/admin/quizzes/:id/edit" component={() => <AdminLayout><AdminQuizEditor /></AdminLayout>} />
      <Route path="/admin/categories" component={() => <AdminLayout><AdminCategories /></AdminLayout>} />
      <Route path="/admin/analytics" component={() => <AdminLayout><AdminAnalytics /></AdminLayout>} />
      <Route path="/admin/settings" component={() => <AdminLayout><AdminSettings /></AdminLayout>} />
      <Route path="/admin/pages" component={() => <AdminLayout><AdminPages /></AdminLayout>} />
      <Route path="/admin/code" component={() => <AdminLayout><AdminCodeInjection /></AdminLayout>} />

      {/* 404 */}
      <Route path="/404" component={NotFound} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider defaultTheme="light">
        <TooltipProvider>
          <Toaster richColors position="top-center" />
          <CodeInjectionEffect />
          <Router />
        </TooltipProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
