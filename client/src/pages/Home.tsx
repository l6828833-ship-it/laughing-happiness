// Home — Quizoi Light Theme
// White background, blue primary, clean card grid, hero with subtle gradient
import { useState, useEffect } from 'react';
import { Link } from 'wouter';
import { Zap, Users, LayoutGrid, TrendingUp, ChevronRight, Sparkles, Loader2 } from 'lucide-react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import QuizCard from '@/components/QuizCard';
import AdSlot from '@/components/AdSlot';
import { fetchHomepage, fetchCategories, formatPlayCount, type Quiz, type Category } from '@/lib/api';

const HERO_BG = 'https://d2xsxph8kpxj0f.cloudfront.net/310419663026789360/Hr6WmrsMENHP9hB99engm5/hero-banner-M3W7arhS87G4r3mZJHRekH.webp';

export default function Home() {
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [mostPlayed, setMostPlayed]         = useState<Quiz[]>([]);
  const [newest, setNewest]                 = useState<Quiz[]>([]);
  const [categories, setCategories]         = useState<Category[]>([]);
  const [loading, setLoading]               = useState(true);

  useEffect(() => {
    Promise.all([fetchHomepage(), fetchCategories()])
      .then(([home, cats]) => {
        setMostPlayed(home.mostPlayed);
        setNewest(home.latest);
        setCategories(cats);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const allPublished = Array.from(new Map([...mostPlayed, ...newest].map(q => [q.id, q])).values());
  const totalPlays   = allPublished.reduce((sum, q) => sum + q.playCount, 0);
  const publishedQuizzes = allPublished;
  const filteredQuizzes  = activeCategory
    ? allPublished.filter(q => q.categoryId === activeCategory)
    : allPublished;

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <Navbar />

      {/* Hero Section */}
      <section className="relative overflow-hidden bg-white">
        <div className="absolute inset-0">
          <img src={HERO_BG} alt="" className="w-full h-full object-cover opacity-10" />
          <div className="absolute inset-0 bg-gradient-to-b from-blue-50/60 via-white/80 to-white" />
        </div>
        <div className="relative container py-16 md:py-24">
          <div className="max-w-2xl">
            <div className="flex items-center gap-2 mb-4">
              <Sparkles className="w-4 h-4 text-amber-500" />
              <span className="text-xs font-semibold text-amber-600 uppercase tracking-widest">Challenge Your Mind</span>
            </div>
            <h1 className="font-display text-4xl md:text-5xl lg:text-6xl font-bold text-foreground leading-[1.1] mb-5">
              How Much Do You{' '}
              <span className="text-primary">Really</span>{' '}
              Know?
            </h1>
            <p className="text-lg text-muted-foreground mb-8 max-w-lg leading-relaxed">
              Thousands of quizzes across 10+ categories. Learn something new with every question. Only the sharpest minds score 10/10.
            </p>
            <div className="flex flex-wrap gap-3 mb-10">
              <a
                href="#quizzes"
                className="px-6 py-3 bg-primary text-white font-display font-bold rounded-xl hover:bg-primary/90 transition-all duration-200 shadow-sm"
              >
                Start Playing
              </a>
              <Link
                href="/categories"
                className="px-6 py-3 bg-white text-foreground border border-gray-200 font-display font-medium rounded-xl hover:bg-gray-50 transition-all duration-200 shadow-sm"
              >
                Browse Categories
              </Link>
            </div>
            {/* Stats */}
            <div className="flex flex-wrap gap-6 md:gap-10">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center">
                  <Zap className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <div className="font-display text-lg font-bold text-foreground">{publishedQuizzes.length}</div>
                  <div className="text-xs text-muted-foreground">Quizzes</div>
                </div>
              </div>
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-xl bg-rose-50 flex items-center justify-center">
                  <Users className="w-5 h-5 text-rose-500" />
                </div>
                <div>
                  <div className="font-display text-lg font-bold text-foreground">{formatPlayCount(totalPlays)}</div>
                  <div className="text-xs text-muted-foreground">Total Plays</div>
                </div>
              </div>
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-xl bg-amber-50 flex items-center justify-center">
                  <LayoutGrid className="w-5 h-5 text-amber-500" />
                </div>
                <div>
                  <div className="font-display text-lg font-bold text-foreground">{categories.length}</div>
                  <div className="text-xs text-muted-foreground">Categories</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Category Filter Chips */}
      <section id="quizzes" className="container pt-8 pb-4">
        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-hide">
          <button
            onClick={() => setActiveCategory(null)}
            className={`shrink-0 px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 border ${
              !activeCategory
                ? 'bg-primary text-white border-primary shadow-sm'
                : 'bg-white text-muted-foreground border-gray-200 hover:border-gray-300 hover:text-foreground'
            }`}
          >
            All Quizzes
          </button>
          {categories.map(cat => (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(activeCategory === cat.id ? null : cat.id)}
              className={`shrink-0 px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 border ${
                activeCategory === cat.id
                  ? 'bg-primary text-white border-primary shadow-sm'
                  : 'bg-white text-muted-foreground border-gray-200 hover:border-gray-300 hover:text-foreground'
              }`}
            >
              {cat.emoji} {cat.name}
            </button>
          ))}
        </div>
      </section>

      {loading && (
        <div className="container py-16 flex items-center justify-center">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      )}
      {/* Filtered View or Default Sections */}
      {!loading && activeCategory ? (
        <section className="container py-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {filteredQuizzes.map(quiz => (
              <QuizCard key={quiz.id} quiz={quiz} />
            ))}
          </div>
          {filteredQuizzes.length === 0 && (
            <div className="text-center py-16">
              <p className="text-muted-foreground">No quizzes in this category yet. Check back soon!</p>
            </div>
          )}
        </section>
      ) : !loading ? (
        <>
          {/* New This Week */}
          <section className="container py-6">
            <div className="flex items-center justify-between mb-5">
              <div className="flex items-center gap-2.5">
                <Sparkles className="w-5 h-5 text-amber-500" />
                <h2 className="font-display text-xl font-bold text-foreground">New This Week</h2>
              </div>
            </div>
            <div className="space-y-5">
              {newest[0] && <QuizCard quiz={newest[0]} featured />}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                {newest.slice(1, 4).map(quiz => (
                  <QuizCard key={quiz.id} quiz={quiz} />
                ))}
              </div>
            </div>
          </section>

          {/* Ad Slot */}
          <div className="container">
            <AdSlot format="leaderboard" />
          </div>

          {/* Most Played */}
          <section className="container py-6">
            <div className="flex items-center justify-between mb-5">
              <div className="flex items-center gap-2.5">
                <TrendingUp className="w-5 h-5 text-rose-500" />
                <h2 className="font-display text-xl font-bold text-foreground">Most Played</h2>
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {mostPlayed.slice(0, 6).map(quiz => (
                <QuizCard key={quiz.id} quiz={quiz} />
              ))}
            </div>
          </section>

          {/* Ad Slot */}
          <div className="container">
            <AdSlot format="leaderboard" />
          </div>

          {/* Browse by Category */}
          <section className="container py-6 pb-12">
            <div className="flex items-center justify-between mb-5">
              <div className="flex items-center gap-2.5">
                <LayoutGrid className="w-5 h-5 text-primary" />
                <h2 className="font-display text-xl font-bold text-foreground">Browse by Category</h2>
              </div>
              <Link href="/categories" className="text-sm text-primary hover:text-primary/80 flex items-center gap-1 transition-colors font-medium">
                View All <ChevronRight className="w-4 h-4" />
              </Link>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
              {categories.map(cat => (
                <Link
                  key={cat.slug}
                  href={`/category/${cat.slug}`}
                  className="group relative overflow-hidden rounded-xl border border-gray-100 bg-white p-4 transition-all duration-300 hover:border-primary/20 hover:shadow-md hover:bg-blue-50/30"
                >
                  <div className="text-2xl mb-2">{cat.emoji}</div>
                  <h3 className="font-display text-sm font-semibold text-foreground group-hover:text-primary transition-colors">{cat.name}</h3>
                  <p className="text-xs text-muted-foreground mt-1">{cat.quizCount} quizzes</p>
                </Link>
              ))}
            </div>
          </section>
        </>
      ) : null}

      <Footer />
    </div>
  );
}
