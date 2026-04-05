// Footer — Quizoi Light Theme
// AdSense compliance: Privacy Policy, Terms of Service, About/Contact links
import { Link } from 'wouter';
import { Brain } from 'lucide-react';
// Static category list for footer (no API call needed — just nav links)
const FOOTER_CATEGORIES = [
  { slug: 'science',       name: 'Science',       emoji: '🔬' },
  { slug: 'history',       name: 'History',       emoji: '📜' },
  { slug: 'geography',     name: 'Geography',     emoji: '🌍' },
  { slug: 'sports',        name: 'Sports',        emoji: '⚽' },
  { slug: 'entertainment', name: 'Entertainment', emoji: '🎬' },
  { slug: 'technology',    name: 'Technology',    emoji: '💻' },
];

export default function Footer() {
  return (
    <footer className="border-t border-gray-100 bg-gray-50 mt-auto">
      <div className="container py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="md:col-span-1">
            <Link href="/" className="flex items-center gap-2 mb-4">
              <div className="w-7 h-7 rounded-lg bg-primary flex items-center justify-center">
                <Brain className="w-4 h-4 text-white" />
              </div>
              <span className="font-display text-lg font-bold">
                <span className="text-foreground">Quiz</span>
                <span className="text-primary">oi</span>
              </span>
            </Link>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Challenge yourself with thousands of quizzes across 10+ categories. Learn something new with every question.
            </p>
          </div>

          {/* Categories */}
          <div>
            <h4 className="font-display font-semibold text-sm text-foreground mb-4 uppercase tracking-wider">Categories</h4>
            <ul className="space-y-2">
              {FOOTER_CATEGORIES.slice(0, 6).map(cat => (
                <li key={cat.slug}>
                  <Link
                    href={`/category/${cat.slug}`}
                    className="text-sm text-muted-foreground hover:text-primary transition-colors duration-200"
                  >
                    {cat.emoji} {cat.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-display font-semibold text-sm text-foreground mb-4 uppercase tracking-wider">Quick Links</h4>
            <ul className="space-y-2">
              <li><Link href="/" className="text-sm text-muted-foreground hover:text-primary transition-colors">Home</Link></li>
              <li><Link href="/categories" className="text-sm text-muted-foreground hover:text-primary transition-colors">All Categories</Link></li>
              <li><Link href="/about" className="text-sm text-muted-foreground hover:text-primary transition-colors">About Us</Link></li>
              <li><Link href="/contact" className="text-sm text-muted-foreground hover:text-primary transition-colors">Contact</Link></li>
            </ul>
          </div>

          {/* Legal — Required for AdSense */}
          <div>
            <h4 className="font-display font-semibold text-sm text-foreground mb-4 uppercase tracking-wider">Legal</h4>
            <ul className="space-y-2">
              <li><Link href="/privacy" className="text-sm text-muted-foreground hover:text-primary transition-colors">Privacy Policy</Link></li>
              <li><Link href="/terms" className="text-sm text-muted-foreground hover:text-primary transition-colors">Terms of Service</Link></li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-10 pt-6 border-t border-gray-200 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-muted-foreground">
            &copy; {new Date().getFullYear()} Quizoi. All rights reserved.
          </p>
          <p className="text-xs text-muted-foreground/60">
            Built for knowledge seekers everywhere.
          </p>
        </div>
      </div>
    </footer>
  );
}
