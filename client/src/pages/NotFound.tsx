// 404 Not Found — Quizoi Light Theme
import { Link } from 'wouter';
import { Brain, Home } from 'lucide-react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col bg-white">
      <Navbar />
      <main className="flex-1 flex items-center justify-center container py-16">
        <div className="text-center max-w-md">
          <Brain className="w-16 h-16 text-primary mx-auto mb-6 opacity-30" />
          <h1 className="font-display text-7xl font-bold text-primary mb-4">404</h1>
          <h2 className="font-display text-2xl font-bold text-foreground mb-3">Page Not Found</h2>
          <p className="text-muted-foreground mb-8">
            Looks like this page went off-script. The quiz you're looking for doesn't exist — but there are plenty of great ones waiting for you!
          </p>
          <Link
            href="/"
            className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-white font-display font-bold rounded-xl hover:bg-primary/90 transition-all duration-200 shadow-sm"
          >
            <Home className="w-4 h-4" />
            Back to Home
          </Link>
        </div>
      </main>
      <Footer />
    </div>
  );
}
