// QuizReveal Page — Quizoi Light Theme
// Shows correct answer, poll statistics, ad slots
// CRITICAL: "Next Question" uses window.location.href for full page refresh
import { useParams } from 'wouter';
import { useState, useEffect } from 'react';
import { CheckCircle2, XCircle, Users, ChevronRight, Trophy } from 'lucide-react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import ProgressBar from '@/components/ProgressBar';
import AdSlot from '@/components/AdSlot';
import { fetchReveal, getLocalAnswer, type Quiz, type Question, type Answer } from '@/lib/api';

const answerLabels = ['A', 'B', 'C', 'D'];

export default function QuizReveal() {
  const params = useParams<{ slug: string; n: string }>();
  const slug = params.slug || '';
  const questionNum = parseInt(params.n || '1', 10);
  const [quiz,     setQuiz]     = useState<Quiz | null>(null);
  const [question, setQuestion] = useState<Question | null>(null);
  const [loading,  setLoading]  = useState(true);

  useEffect(() => {
    fetchReveal(slug, questionNum)
      .then(data => { setQuiz(data.quiz); setQuestion(data.question); })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [slug, questionNum]);

  const userAnswer = getLocalAnswer(slug, questionNum);

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

  // Ad visibility: quiz-level master switch AND question-level override
  const showAds = (quiz?.adsEnabled !== false) && (question?.adsEnabled !== false);

  if (!quiz || !question) {
    return (
      <div className="min-h-screen flex flex-col bg-white">
        <Navbar />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <h1 className="font-display text-2xl font-bold text-foreground mb-2">Quiz Not Found</h1>
            <p className="text-muted-foreground">This quiz doesn't exist or has been removed.</p>
            <a href="/" className="mt-4 inline-block px-4 py-2 bg-primary text-white rounded-lg text-sm font-medium">Go Home</a>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  const isCorrect = userAnswer?.isCorrect ?? false;
  const totalVotes = question ? question.answers.reduce((s: number, a: Answer) => s + a.votesCount, 0) : 0;
  const isLastQuestion = questionNum >= quiz.questionCount;

  const handleNext = () => {
    // FULL PAGE REFRESH — NON-NEGOTIABLE for ad revenue
    if (isLastQuestion) {
      window.location.href = `/quiz/${quiz.slug}/result`;
    } else {
      window.location.href = `/quiz/${quiz.slug}/question/${questionNum + 1}`;
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Navbar />

      {/* Ad Slot 1: Header Banner — gated by quiz/question ad settings */}
      {showAds && (
        <div className="container">
          <AdSlot format="banner" />
        </div>
      )}

      {/* Progress Bar */}
      <div className="container pt-2 pb-4">
        <ProgressBar current={questionNum} total={quiz.questionCount} />
      </div>

      <main className="container flex-1 pb-8">
        <div className="max-w-3xl mx-auto">
          {/* Result Banner */}
          <div className={`rounded-xl border-2 p-5 mb-6 flex items-center gap-4 ${
            isCorrect
              ? 'border-emerald-200 bg-emerald-50'
              : 'border-rose-200 bg-rose-50'
          }`}>
            {isCorrect ? (
              <CheckCircle2 className="w-10 h-10 text-emerald-600 shrink-0" />
            ) : (
              <XCircle className="w-10 h-10 text-rose-600 shrink-0" />
            )}
            <div>
              <h2 className={`font-display text-xl font-bold ${isCorrect ? 'text-emerald-700' : 'text-rose-700'}`}>
                {isCorrect ? 'Correct!' : 'Incorrect!'}
              </h2>
              <p className="text-sm text-muted-foreground mt-0.5">
                {isCorrect
                  ? 'Great job! You nailed this one.'
                  : `The correct answer was: ${question.answers.find(a => a.isCorrect)?.text}`
                }
              </p>
            </div>
          </div>

          {/* Question Recap */}
          <div className="mb-6">
            <h3 className="font-display text-lg font-semibold text-foreground mb-1">
              {question.questionText}
            </h3>
          </div>

          {/* Poll Statistics */}
          <div className="rounded-xl border border-gray-200 bg-white p-5 mb-6 shadow-sm">
            <div className="flex items-center gap-2 mb-4">
              <Users className="w-4 h-4 text-primary" />
              <h4 className="font-display text-sm font-semibold text-foreground">How Others Answered</h4>
              <span className="text-xs text-muted-foreground ml-auto">{totalVotes.toLocaleString()} votes</span>
            </div>
            <div className="space-y-3">
              {question.answers.map((answer: Answer, idx: number) => {
                const pct = totalVotes > 0 ? Math.round((answer.votesCount / totalVotes) * 100) : 0;
                const isThisCorrect = answer.isCorrect;
                const isUserChoice = userAnswer?.answerId === answer.id;

                return (
                  <div key={answer.id} className="relative">
                    <div className={`relative flex items-center gap-3 p-3 rounded-lg border overflow-hidden ${
                      isThisCorrect
                        ? 'border-emerald-200 bg-emerald-50'
                        : isUserChoice && !isCorrect
                          ? 'border-rose-200 bg-rose-50'
                          : 'border-gray-100 bg-gray-50'
                    }`}>
                      {/* Background progress bar */}
                      <div
                        className={`absolute inset-y-0 left-0 transition-all duration-700 ease-out rounded-lg ${
                          isThisCorrect ? 'bg-emerald-100' : isUserChoice && !isCorrect ? 'bg-rose-100' : 'bg-gray-100'
                        }`}
                        style={{ width: `${pct}%` }}
                      />
                      {/* Label */}
                      <span className="relative shrink-0 w-7 h-7 rounded-md bg-gray-200 flex items-center justify-center text-xs font-display font-bold text-gray-600">
                        {answerLabels[idx]}
                      </span>
                      <span className={`relative flex-1 text-sm font-medium ${isThisCorrect ? 'text-emerald-800' : 'text-foreground'}`}>
                        {answer.text}
                        {isThisCorrect && <CheckCircle2 className="inline w-3.5 h-3.5 ml-1.5 text-emerald-600" />}
                        {isUserChoice && !isCorrect && <span className="ml-1.5 text-xs text-rose-600">(Your answer)</span>}
                        {isUserChoice && isCorrect && <span className="ml-1.5 text-xs text-emerald-600">(Your answer)</span>}
                      </span>
                      <span className={`relative text-sm font-display font-bold ${isThisCorrect ? 'text-emerald-700' : 'text-muted-foreground'}`}>
                        {pct}%
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Ad Slot 2 — gated */}
          {showAds && <AdSlot format="large-rectangle" />}

          {/* Ad Slot 3 — gated */}
          {showAds && <AdSlot format="rectangle" />}

          {/* Next Question / See Results Button */}
          <div className="pt-2">
            <button
              onClick={handleNext}
              className="w-full flex items-center justify-center gap-2 px-6 py-4 bg-primary text-white font-display font-bold text-lg rounded-xl hover:bg-primary/90 transition-all duration-200 shadow-sm"
            >
              {isLastQuestion ? (
                <>
                  <Trophy className="w-5 h-5" />
                  See Your Results
                </>
              ) : (
                <>
                  Next Question
                  <ChevronRight className="w-5 h-5" />
                </>
              )}
            </button>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
