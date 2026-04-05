// CategoryDetail Page — Quizoi (Supabase-connected)
import { useParams } from 'wouter';
import { useState, useEffect } from 'react';
import { ChevronLeft } from 'lucide-react';
import { Link } from 'wouter';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import QuizCard from '@/components/QuizCard';
import AdSlot from '@/components/AdSlot';
import { fetchCategory, type Category, type Quiz } from '@/lib/api';

export default function CategoryDetail() {
  const params = useParams<{ slug: string }>();
  const slug = params.slug || '';
  const [category,       setCategory]       = useState<Category | null>(null);
  const [categoryQuizzes, setCategoryQuizzes] = useState<Quiz[]>([]);
  const [loading,        setLoading]        = useState(true);

  useEffect(() => {
    fetchCategory(slug)
      .then(data => {
        setCategory(data);
        setCategoryQuizzes(data.quizzes);
      })
      .catch(() => setCategory(null))
      .finally(() => setLoading(false));
  }, [slug]);

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col bg-white">
        <Navbar />
        <div className="flex-1 flex items-center justify-center">
          <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin" />
        </div>
        <Footer />
      </div>
    );
  }

  if (!category) {
    return (
      <div className="min-h-screen flex flex-col bg-white">
        <Navbar />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <h1 className="font-display text-2xl font-bold text-foreground mb-2">Category Not Found</h1>
            <a href="/categories" className="mt-4 inline-block px-4 py-2 bg-primary text-white rounded-lg text-sm font-medium">Browse Categories</a>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <Navbar />

      {/* Category Header */}
      <section className="relative overflow-hidden bg-gradient-to-b from-blue-50 to-white">
        <div className="absolute inset-0 opacity-5">
          <img src={category.emoji} alt="" className="w-full h-full object-cover" />
        </div>
        <div className="relative container py-12">
          <Link href="/categories" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-primary transition-colors mb-4">
            <ChevronLeft className="w-4 h-4" /> All Categories
          </Link>
          <div className="flex items-center gap-3 mb-3">
            <span className="text-4xl">{category.emoji}</span>
            <h1 className="font-display text-3xl md:text-4xl font-bold text-foreground">{category.name}</h1>
          </div>
          <p className="text-muted-foreground max-w-lg">{category.description}</p>
          <span className="inline-block mt-3 text-sm text-primary font-semibold">{category.quizCount} quizzes available</span>
        </div>
      </section>

      <main className="container flex-1 py-6 pb-12">
        {categoryQuizzes.length > 0 ? (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {categoryQuizzes.map(quiz => (
                <QuizCard key={quiz.id} quiz={quiz} />
              ))}
            </div>
            <AdSlot format="leaderboard" />
          </>
        ) : (
          <div className="text-center py-16">
            <p className="text-muted-foreground text-lg mb-2">No quizzes in this category yet.</p>
            <p className="text-sm text-muted-foreground/70">Check back soon — new quizzes are added regularly!</p>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
