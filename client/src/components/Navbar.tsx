// Navbar — Quizoi Light Theme
// White background, deep navy text, vivid blue accents
import { Link, useLocation } from 'wouter';
import { Brain, Menu, X } from 'lucide-react';
import { useState } from 'react';

const navLinks = [
  { label: 'Home', href: '/' },
  { label: 'Categories', href: '/categories' },
  { label: 'About', href: '/about' },
];

export default function Navbar() {
  const [location] = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 w-full border-b border-gray-100 bg-white shadow-sm">
      <div className="container flex h-16 items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2.5 group">
          <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center shadow-sm">
            <Brain className="w-4 h-4 text-white" />
          </div>
          <span className="font-display text-xl font-bold tracking-tight">
            <span className="text-foreground">Quiz</span>
            <span className="text-primary">oi</span>
          </span>
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden md:flex items-center gap-1">
          {navLinks.map(link => (
            <Link
              key={link.href}
              href={link.href}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                location === link.href
                  ? 'text-primary bg-accent font-semibold'
                  : 'text-muted-foreground hover:text-foreground hover:bg-muted'
              }`}
            >
              {link.label}
            </Link>
          ))}
        </nav>

        {/* Desktop CTA */}
        <div className="hidden md:flex items-center gap-3">
          <Link
            href="/"
            className="px-5 py-2 bg-primary text-white rounded-xl text-sm font-display font-semibold hover:bg-primary/90 transition-all duration-200 shadow-sm"
          >
            Start a Quiz
          </Link>
        </div>

        {/* Mobile Menu Toggle */}
        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          className="md:hidden p-2 text-muted-foreground hover:text-foreground transition-colors rounded-lg hover:bg-muted"
          aria-label="Toggle menu"
        >
          {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {/* Mobile Menu */}
      {mobileOpen && (
        <div className="md:hidden border-t border-gray-100 bg-white">
          <nav className="container py-4 flex flex-col gap-1">
            {navLinks.map(link => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMobileOpen(false)}
                className={`px-4 py-3 rounded-lg text-sm font-medium transition-all duration-200 ${
                  location === link.href
                    ? 'text-primary bg-accent font-semibold'
                    : 'text-muted-foreground hover:text-foreground hover:bg-muted'
                }`}
              >
                {link.label}
              </Link>
            ))}
            <Link
              href="/"
              onClick={() => setMobileOpen(false)}
              className="mt-2 px-4 py-3 bg-primary text-white rounded-xl text-sm font-display font-semibold text-center hover:bg-primary/90 transition-all duration-200"
            >
              Start a Quiz
            </Link>
          </nav>
        </div>
      )}
    </header>
  );
}
