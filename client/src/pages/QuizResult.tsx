// QuizResult Page — Quizoi Light Theme
// Highest-value ad placement page
// Shows score, message, sharing options, and ad slots
import { useParams } from 'wouter';
import { useState, useEffect } from 'react';
import { Trophy, RotateCcw, Share2, Home, Star } from 'lucide-react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import AdSlot from '@/components/AdSlot';
import QuizCard from '@/components/QuizCard';
import { fetchQuiz, fetchHomepage, getQuizScore, getScoreMessage, clearLocalQuizAnswers, completeSession, type Quiz } from '@/lib/api';
import { toast } from 'sonner';

export default function QuizResult() {
  const params = useParams<{ slug: string }>();
  const slug = params.slug || '';
    const [quiz,         setQuiz]         = useState<Quiz | null>(null);
  const [otherQuizzes, setOtherQuizzes] = useState<Quiz[]>([]);
  const [loading,      setLoading]      = useState(true);

  useEffect(() => {
    Promise.all([fetchQuiz(slug), fetchHomepage()])
      .then(([q, home]) => {
        setQuiz(q);
        setOtherQuizzes(home.mostPlayed.filter((x: Quiz) => x.id !== q.id).slice(0, 3));
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [slug]);

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col bg-white">
        <Navbar />
        <div className="flex-1 flex items-center justify-center">
          <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
        </div>
        <Footer />
      </div>
    );
  }

  if (!quiz) {
    return (
      <div className="min-h-screen flex flex-col bg-white">
        <Navbar />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <h1 className="font-display text-2xl font-bold text-foreground mb-2">Quiz Not Found</h1>
            <a href="/" className="mt-4 inline-block px-4 py-2 bg-primary text-white rounded-lg text-sm font-medium">Go Home</a>
          </div>
        </div>
        <Footer />
      </div>
    );
  }
  const score = getQuizScore(quiz.slug, quiz.questionCount);
  const result = getScoreMessage(score, quiz.questionCount);
  const pct = Math.round((score / quiz.questionCount) * 100);

  const handleShare = async () => {
    const shareText = `I scored ${score}/${quiz.questionCount} on "${quiz.title}" at Quizoi! Can you beat me?`;
    const shareUrl = `${window.location.origin}/quiz/${quiz.slug}/start`;
    if (navigator.share) {
      try {
        await navigator.share({ title: quiz.title, text: shareText, url: shareUrl });
      } catch { /* cancelled */ }
    } else {
      await navigator.clipboard.writeText(`${shareText}\n${shareUrl}`);
      toast.success('Link copied to clipboard!');
    }
  };

  const handleRetry = () => {
    clearLocalQuizAnswers(quiz.slug, quiz.questionCount);
    window.location.href = `/quiz/${quiz.slug}/start`;
  };

  const circumference = 2 * Math.PI * 54;
  const strokeDashoffset = circumference - (pct / 100) * circumference;
  const ringColor = pct >= 60 ? '#16a34a' : pct >= 40 ? '#d97706' : '#dc2626';

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Navbar />

      {/* Ad Slot 1: Header Banner */}
      <div className="container">
        <AdSlot format="banner" />
      </div>

      <main className="container flex-1 py-8">
        <div className="max-w-3xl mx-auto">
          {/* Score Card */}
          <div className="rounded-2xl border border-gray-100 bg-white shadow-sm overflow-hidden mb-6">
            <div className="p-8 text-center">
              {/* Animated Score Ring */}
              <div className="relative w-36 h-36 mx-auto mb-6">
                <svg className="w-full h-full -rotate-90" viewBox="0 0 120 120">
                  <circle cx="60" cy="60" r="54" fill="none" stroke="#f3f4f6" strokeWidth="8" />
                  <circle
                    cx="60" cy="60" r="54" fill="none"
                    stroke={ringColor}
                    strokeWidth="8"
                    strokeLinecap="round"
                    strokeDasharray={circumference}
                    strokeDashoffset={strokeDashoffset}
                    style={{ transition: 'stroke-dashoffset 1.5s ease-out' }}
                  />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="font-display text-3xl font-bold text-foreground">{score}/{quiz.questionCount}</span>
                  <span className="text-xs text-muted-foreground">{pct}%</span>
                </div>
              </div>

              {/* Result Message */}
              <div className="text-4xl mb-3">{result.emoji}</div>
              <h1 className="font-display text-2xl md:text-3xl font-bold text-foreground mb-2">{result.title}</h1>
              <p className="text-muted-foreground max-w-md mx-auto mb-6">{result.message}</p>

              {/* Star Rating */}
              <div className="flex items-center justify-center gap-1 mb-6">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star
                    key={i}
                    className={`w-6 h-6 ${i < Math.ceil(pct / 20) ? 'text-amber-400 fill-amber-400' : 'text-gray-200 fill-gray-200'}`}
                  />
                ))}
              </div>

              {/* Quiz Title */}
              <p className="text-sm text-muted-foreground mb-6">
                <span className="text-foreground font-medium">{quiz.title}</span>
              </p>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
                <button
                  onClick={handleRetry}
                  className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3 bg-primary text-white font-display font-bold rounded-xl hover:bg-primary/90 transition-all duration-200 shadow-sm"
                >
                  <RotateCcw className="w-4 h-4" />
                  Play Again
                </button>
                <button
                  onClick={handleShare}
                  className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3 bg-white text-foreground border border-gray-200 font-display font-semibold rounded-xl hover:bg-gray-50 transition-all duration-200 shadow-sm"
                >
                  <Share2 className="w-4 h-4" />
                  Share Score
                </button>
                <a
                  href="/"
                  className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3 bg-white text-muted-foreground border border-gray-200 font-display font-medium rounded-xl hover:bg-gray-50 transition-all duration-200"
                >
                  <Home className="w-4 h-4" />
                  Home
                </a>
              </div>
            </div>
          </div>

          {/* Ad Slot 2: Large rectangle — highest value */}
          <AdSlot format="large-rectangle" />

          {/* More Quizzes */}
          {otherQuizzes.length > 0 && (
            <div className="mt-8">
              <h2 className="font-display text-xl font-bold text-foreground mb-5 flex items-center gap-2">
                <Trophy className="w-5 h-5 text-amber-500" />
                Try Another Quiz
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {otherQuizzes.map((q: Quiz) => (
                  <QuizCard key={q.id} quiz={q} />
                ))}
              </div>
            </div>
          )}

          {/* Ad Slot 3 */}
          <AdSlot format="leaderboard" />
        </div>
      </main>

      <Footer />
    </div>
  );
}
