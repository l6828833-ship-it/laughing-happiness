// QuizQuestion — Quizoi
// CRITICAL: Full page refresh on answer selection (window.location.href) — maximizes ad impressions
// Ad placement rule: NO ads directly above or below answer buttons (AdSense policy)
// Per-quiz adsEnabled: master switch; per-question adsEnabled: question-level override
// showSuggestions per question: controls related quiz sidebar visibility
// Related quizzes: Section 1 = same category, Section 2 = random other categories
import { useEffect, useRef, useState } from 'react';
import { useParams } from 'wouter';
import { Lightbulb, BookOpen, ChevronRight, Zap, Play, ArrowRight } from 'lucide-react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import ProgressBar from '@/components/ProgressBar';
import AdSlot from '@/components/AdSlot';
import { fetchQuestion, submitAnswer, saveLocalAnswer, formatPlayCount, type Quiz, type Question, type Answer } from '@/lib/api';

const answerLabels = ['A', 'B', 'C', 'D'];
const answerColors = [
  'border-blue-200 hover:border-blue-400 hover:bg-blue-50',
  'border-rose-200 hover:border-rose-400 hover:bg-rose-50',
  'border-amber-200 hover:border-amber-400 hover:bg-amber-50',
  'border-emerald-200 hover:border-emerald-400 hover:bg-emerald-50',
];
const labelColors = [
  'bg-blue-100 text-blue-700',
  'bg-rose-100 text-rose-700',
  'bg-amber-100 text-amber-700',
  'bg-emerald-100 text-emerald-700',
];
const imageBorderColors = [
  'border-blue-300 hover:ring-blue-200',
  'border-rose-300 hover:ring-rose-200',
  'border-amber-300 hover:ring-amber-200',
  'border-emerald-300 hover:ring-emerald-200',
];

export default function QuizQuestion() {
  const params = useParams<{ slug: string; n: string }>();
  const slug = params.slug || '';
  const questionNum = parseInt(params.n || '1', 10);
  const navigatingRef = useRef(false);
  const [selected, setSelected] = useState<string | null>(null);

  const [quiz,      setQuiz]      = useState<Quiz | null>(null);
  const [question,  setQuestion]  = useState<Question | null>(null);
  const [related,   setRelated]   = useState<Quiz[]>([]);
  const [loading,   setLoading]   = useState(true);

  useEffect(() => {
    fetchQuestion(slug, questionNum)
      .then(data => {
        setQuiz(data.quiz);
        setQuestion(data.question);
        setRelated(data.related ?? []);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [slug, questionNum]);

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

  // ── Ad visibility logic ──
  // Quiz-level master switch (default: ads ON)
  const quizAdsOn = quiz.adsEnabled !== false;
  // Question-level override (default: ads ON)
  const questionAdsOn = question.adsEnabled !== false;
  const showAds = quizAdsOn && questionAdsOn;

  // ── Suggestions visibility logic ──
  // Per-question toggle (default: suggestions ON)
  const showSuggestions = question.showSuggestions !== false;

  const sameCategory    = related.filter(q => q.categoryId === quiz.categoryId).slice(0, 5);
  const otherCategories = related.filter(q => q.categoryId !== quiz.categoryId).slice(0, 5);
  const quizCategory    = null; // category name/emoji resolved server-side

  const handleAnswer = async (answer: Answer) => {
    if (navigatingRef.current || selected) return;
    navigatingRef.current = true;
    setSelected(answer.id);
    // Submit to server — increments votes, returns stats with isCorrect
    try {
      const result = await submitAnswer({
        answerId:       answer.id,
        questionId:     question.id,
        quizId:         quiz.id,
        questionNumber: questionNum,
      });
      const correct = result.stats.find(s => s.id === answer.id)?.isCorrect ?? false;
      saveLocalAnswer(quiz.slug, questionNum, answer.id, correct);
    } catch {
      saveLocalAnswer(quiz.slug, questionNum, answer.id, answer.isCorrect ?? false);
    }
    // FULL PAGE REFRESH — NON-NEGOTIABLE for ad revenue
    const showRevealPage = question.showReveal !== false;
    const isLastQuestion = questionNum >= quiz.questionCount;
    setTimeout(() => {
      if (showRevealPage) {
        window.location.href = `/quiz/${quiz.slug}/reveal/${questionNum}`;
      } else if (isLastQuestion) {
        window.location.href = `/quiz/${quiz.slug}/result`;
      } else {
        window.location.href = `/quiz/${quiz.slug}/question/${questionNum + 1}`;
      }
    }, 250);
  };

  const isImageAnswers = question.answerType === 'IMAGE';

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Navbar />

      {/* Ad Slot 1: Header Banner — safe distance above answers */}
      {showAds && (
        <div className="bg-white border-b border-gray-100">
          <div className="container py-2 flex justify-center">
            <AdSlot format="banner" />
          </div>
        </div>
      )}

      {/* Progress Bar */}
      <div className="container pt-3 pb-4">
        <ProgressBar current={questionNum} total={quiz.questionCount} />
      </div>

      <main className="container flex-1 pb-10">
        <div className="flex gap-6 items-start">

          {/* ── Main Content ── */}
          <div className="flex-1 min-w-0">

            {/* Question card */}
            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm mb-5 overflow-hidden">
              <div className="px-6 pt-6 pb-2">
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-xs font-bold text-primary uppercase tracking-wider bg-primary/8 px-2.5 py-1 rounded-full">
                    Question {questionNum} of {quiz.questionCount}
                  </span>
                  {questionNum === quiz.questionCount && (
                    <span className="text-xs font-bold text-amber-600 bg-amber-50 px-2.5 py-1 rounded-full">
                      Final Question!
                    </span>
                  )}
                </div>
                <h1 className="font-display text-xl sm:text-2xl md:text-3xl font-bold text-foreground leading-tight">
                  {question.questionText}
                </h1>
              </div>

              {/* Media */}
              {question.mediaType === 'IMAGE' && question.mediaUrl && (
                <div className="px-6 pb-4">
                  <div className="rounded-xl overflow-hidden border border-gray-100">
                    <img src={question.mediaUrl} alt="Question media" className="w-full" loading="lazy" />
                  </div>
                </div>
              )}
              {question.mediaType === 'YOUTUBE' && question.mediaUrl && (
                <div className="px-6 pb-4">
                  <div className="rounded-xl overflow-hidden border border-gray-100 aspect-video">
                    <iframe
                      src={`https://www.youtube.com/embed/${question.mediaUrl}`}
                      className="w-full h-full"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                      title="Question video"
                    />
                  </div>
                </div>
              )}

              {/* Preview Image hint */}
              {question.showPreviewImage && question.previewImageUrl && (
                <div className="px-6 pb-4">
                  <div className="rounded-xl overflow-hidden border border-amber-100 shadow-sm">
                    <img
                      src={question.previewImageUrl}
                      alt="Visual hint"
                      className="w-full max-h-72 object-cover"
                      loading="lazy"
                    />
                    <div className="px-3 py-2 bg-amber-50 border-t border-amber-100">
                      <p className="text-xs text-amber-700 flex items-center gap-1">
                        <Lightbulb className="w-3 h-3" />
                        Visual hint — which answer does this image suggest?
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* ── ANSWERS — NO ADS directly above or below (AdSense policy) ── */}
              <div className="px-6 pb-6">
                {/* TEXT answers */}
                {!isImageAnswers && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {question.answers.map((answer: Answer, idx: number) => (
                      <button
                        key={answer.id}
                        onClick={() => handleAnswer(answer)}
                        disabled={!!selected}
                        className={`
                          relative flex items-center gap-3 p-4 rounded-xl border-2 bg-white
                          transition-all duration-200 text-left group shadow-sm hover:shadow-md
                          disabled:cursor-not-allowed
                          ${selected === answer.id
                            ? `${answerColors[idx].split(' ')[0]} ring-2 ring-offset-1 scale-[0.99] opacity-100`
                            : answerColors[idx]
                          }
                          ${selected && selected !== answer.id ? 'opacity-40' : ''}
                        `}
                      >
                        <span className={`shrink-0 w-9 h-9 rounded-lg flex items-center justify-center font-display font-bold text-sm transition-colors ${
                          selected === answer.id ? labelColors[idx] : labelColors[idx]
                        }`}>
                          {answerLabels[idx]}
                        </span>
                        <span className="font-medium text-sm text-foreground">{answer.text}</span>
                        {selected === answer.id && (
                          <ChevronRight className="w-4 h-4 text-primary ml-auto animate-pulse" />
                        )}
                      </button>
                    ))}
                  </div>
                )}

                {/* IMAGE answers */}
                {isImageAnswers && (
                  <div className="grid grid-cols-2 gap-3">
                    {question.answers.map((answer: Answer, idx: number) => (
                      <button
                        key={answer.id}
                        onClick={() => handleAnswer(answer)}
                        disabled={!!selected}
                        className={`
                          relative rounded-xl border-2 bg-white overflow-hidden shadow-sm
                          hover:shadow-md hover:ring-4 transition-all duration-200
                          disabled:cursor-not-allowed
                          ${selected === answer.id ? `${imageBorderColors[idx].split(' ')[0]} ring-4` : imageBorderColors[idx]}
                          ${selected && selected !== answer.id ? 'opacity-40' : ''}
                        `}
                      >
                        {answer.imageUrl ? (
                          <div className="aspect-video w-full overflow-hidden">
                            <img
                              src={answer.imageUrl}
                              alt={answer.text || `Answer ${answerLabels[idx]}`}
                              className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                              loading="lazy"
                            />
                          </div>
                        ) : (
                          <div className="aspect-video w-full bg-gray-100 flex items-center justify-center">
                            <span className={`text-3xl font-display font-bold ${labelColors[idx].split(' ')[1]}`}>
                              {answerLabels[idx]}
                            </span>
                          </div>
                        )}
                        <div className="absolute top-2 left-2">
                          <span className={`w-7 h-7 rounded-lg flex items-center justify-center font-display font-bold text-xs shadow-sm ${labelColors[idx]}`}>
                            {answerLabels[idx]}
                          </span>
                        </div>
                        {answer.text && (
                          <div className="px-3 py-2 bg-white border-t border-gray-100">
                            <p className="text-xs font-medium text-foreground text-center">{answer.text}</p>
                          </div>
                        )}
                      </button>
                    ))}
                  </div>
                )}

                {/* Loading indicator after selection */}
                {selected && (
                  <div className="mt-4 flex items-center justify-center gap-2 text-sm text-muted-foreground">
                    <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                    <span>Loading result...</span>
                  </div>
                )}
              </div>
            </div>

            {/* ── Fact Lab — MANDATORY for AdSense (150+ words) ── */}
            <div className="rounded-xl border border-amber-100 bg-amber-50 overflow-hidden mb-5">
              <div className="px-5 py-3 bg-amber-100/60 border-b border-amber-100 flex items-center gap-2.5">
                <Lightbulb className="w-4 h-4 text-amber-600" />
                <h3 className="font-display text-sm font-semibold text-amber-800">{question.factLabTitle}</h3>
              </div>
              <div className="p-5">
                <div className="flex items-start gap-2 mb-3">
                  <BookOpen className="w-4 h-4 text-amber-500 mt-0.5 shrink-0" />
                  <span className="text-[10px] uppercase tracking-widest text-amber-600 font-semibold">Did You Know?</span>
                </div>
                <p className="text-sm text-amber-900/80 leading-relaxed">{question.factLabContent}</p>
              </div>
            </div>

            {/* Ad Slot 2: After Fact Lab — safe distance from answer buttons */}
            {showAds && (
              <div className="flex justify-center mb-6">
                <AdSlot format="large-rectangle" />
              </div>
            )}

            {/* ── Related Quizzes — Mobile (below fact lab) ── */}
            {showSuggestions && (
              <div className="lg:hidden space-y-4">
                {sameCategory.length > 0 && (
                  <RelatedSection
                    title={`More ${quiz.categoryId} Quizzes`}
                    emoji={'📚'}
                    quizList={sameCategory}
                  />
                )}
                {otherCategories.length > 0 && (
                  <RelatedSection
                    title="You May Also Like"
                    emoji="✨"
                    quizList={otherCategories}
                  />
                )}
              </div>
            )}
          </div>

          {/* ── Sidebar (desktop only) ── */}
          <aside className="hidden lg:flex flex-col gap-4 w-64 shrink-0">

            {/* Sidebar ad — in separate column, safe from answer buttons */}
            {showAds && (
              <div className="flex justify-center">
                <AdSlot format="rectangle" />
              </div>
            )}

            {/* Same-category quizzes */}
            {showSuggestions && sameCategory.length > 0 && (
              <RelatedSection
                title={`More ${quiz.categoryId} Quizzes`}
                emoji={'📚'}
                quizList={sameCategory}
                compact
              />
            )}

            {/* Other-category quizzes */}
            {showSuggestions && otherCategories.length > 0 && (
              <RelatedSection
                title="You May Also Like"
                emoji="✨"
                quizList={otherCategories}
                compact
              />
            )}

            {/* Fallback: show all published quizzes if no related found */}
            {showSuggestions && sameCategory.length === 0 && otherCategories.length === 0 && (
              <RelatedSection
                title="More Quizzes"
                emoji="🎯"
                quizList={[]}
                compact
              />
            )}
          </aside>
        </div>
      </main>

      <Footer />
    </div>
  );
}

// ── Related Section Component ──
interface RelatedSectionProps {
  title: string;
  emoji: string;
  quizList: Quiz[];
  compact?: boolean;
}

function RelatedSection({ title, emoji, quizList, compact }: RelatedSectionProps) {
  if (quizList.length === 0) return null;
  return (
    <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
      <div className="px-4 py-3 border-b border-gray-100 flex items-center gap-2">
        <span className="text-base">{emoji}</span>
        <h3 className="text-sm font-bold text-gray-800">{title}</h3>
      </div>
      <div className="divide-y divide-gray-50">
        {quizList.map(q => (
          <a
            key={q.id}
            href={`/quiz/${q.slug}/start`}
            className="flex items-center gap-3 px-4 py-3 hover:bg-gray-50 transition-colors group"
          >
            <img
              src={q.thumbnailUrl}
              alt={q.title}
              className="w-12 h-12 rounded-lg object-cover shrink-0 border border-gray-100"
              onError={e => (e.currentTarget.style.display = 'none')}
            />
            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold text-gray-800 leading-tight line-clamp-2 group-hover:text-primary transition-colors">
                {q.title}
              </p>
              {!compact && (
                <p className="text-xs text-muted-foreground mt-0.5 flex items-center gap-1">
                  <Play className="w-2.5 h-2.5" />
                  {formatPlayCount(q.playCount)} plays
                </p>
              )}
            </div>
            <ArrowRight className="w-3.5 h-3.5 text-gray-300 group-hover:text-primary shrink-0 transition-colors" />
          </a>
        ))}
      </div>
      <div className="px-4 py-2.5 bg-gray-50 border-t border-gray-100">
        <a
          href="/categories"
          className="text-xs text-primary font-medium hover:underline flex items-center gap-1"
        >
          Browse all categories <ArrowRight className="w-3 h-3" />
        </a>
      </div>
    </div>
  );
}
