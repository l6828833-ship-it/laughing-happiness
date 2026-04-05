// QuizStart — Quizoi Platform
// Intro/start page shown before the first question of every quiz
// Design: Clean white/light — white bg, blue primary, gray borders
// Links to /quiz/:slug/question/1 via window.location.href (full page refresh)

import { useEffect, useState } from 'react';
import { useParams } from 'wouter';
import {
  Play, Clock, HelpCircle, Trophy, ChevronRight,
  BookOpen, Star, Users, ArrowLeft, CheckCircle2, Zap
} from 'lucide-react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { fetchQuiz, fetchCategories, formatPlayCount, clearLocalQuizAnswers, startSession, type Quiz, type Category } from '@/lib/api';

export default function QuizStart() {
  const params = useParams<{ slug: string }>();
  const slug = params.slug || '';
  const [quiz, setQuiz] = useState<Quiz | null>(null);

  const [category, setCategory] = useState<Category | null>(null);

  useEffect(() => {
    fetchQuiz(slug)
      .then(q => {
        setQuiz(q);
        return fetchCategories().then(cats => {
          setCategory(cats.find(cat => cat.id === q.categoryId) ?? null);
        });
      })
      .catch(() => setQuiz(null));
  }, [slug]);

  if (!quiz) {
    return (
      <div className="min-h-screen flex flex-col bg-white">
        <Navbar />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
            <p className="text-muted-foreground text-sm">Loading quiz...</p>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  // category loaded via useEffect
  const estimatedMinutes = Math.ceil(quiz.questionCount * 0.5);

  const handleStart = () => {
    clearLocalQuizAnswers(quiz.slug, quiz.questionCount);
    startSession(quiz.id).catch(() => {});
    window.location.href = `/quiz/${quiz.slug}/question/1`;
  };

  const handleBack = () => {
    window.history.back();
  };

  // Difficulty based on questionCount (just for display)
  const difficulty = quiz.questionCount <= 5 ? 'Easy' : quiz.questionCount <= 8 ? 'Medium' : 'Hard';
  const difficultyColor = difficulty === 'Easy'
    ? 'text-emerald-600 bg-emerald-50 border-emerald-200'
    : difficulty === 'Medium'
    ? 'text-amber-600 bg-amber-50 border-amber-200'
    : 'text-rose-600 bg-rose-50 border-rose-200';

  const rules = [
    `This quiz has ${quiz.questionCount} questions — answer them all to get your final score.`,
    'Each question has 4 possible answers. Only one is correct.',
    'After each answer, you\'ll see how others voted and a fun fact about the topic.',
    'Your score is calculated at the end. Can you score 10/10?',
  ];

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Navbar />

      <main className="flex-1 py-8">
        <div className="max-w-2xl mx-auto px-4">

          {/* Back button */}
          <button
            onClick={handleBack}
            className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors mb-6 group"
          >
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
            Back
          </button>

          {/* Quiz thumbnail hero */}
          <div className="relative rounded-2xl overflow-hidden mb-6 shadow-md border border-gray-200">
            <img
              src={quiz.thumbnailUrl}
              alt={quiz.title}
              className="w-full h-48 sm:h-64 object-cover"
              onError={e => {
                (e.currentTarget as HTMLImageElement).src =
                  'https://images.unsplash.com/photo-1606326608606-aa0b62935f2b?w=800&q=80';
              }}
            />
            {/* Gradient overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />

            {/* Category badge */}
            <div className="absolute top-4 left-4">
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white/90 backdrop-blur-sm rounded-full text-xs font-bold text-gray-800 shadow-sm">
                <span>{category?.emoji}</span>
                {category?.name}
              </span>
            </div>

            {/* Difficulty badge */}
            <div className="absolute top-4 right-4">
              <span className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-bold border ${difficultyColor} bg-white/90 backdrop-blur-sm shadow-sm`}>
                <Zap className="w-3 h-3" />
                {difficulty}
              </span>
            </div>

            {/* Bottom overlay info */}
            <div className="absolute bottom-0 left-0 right-0 px-5 py-4">
              <div className="flex items-center gap-3 text-white/80 text-xs">
                <span className="flex items-center gap-1">
                  <HelpCircle className="w-3.5 h-3.5" />
                  {quiz.questionCount} Questions
                </span>
                <span className="flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5" />
                  ~{estimatedMinutes} min
                </span>
                <span className="flex items-center gap-1">
                  <Users className="w-3.5 h-3.5" />
                  {formatPlayCount(quiz.playCount)} plays
                </span>
              </div>
            </div>
          </div>

          {/* Title and description */}
          <div className="mb-6">
            <h1 className="font-display text-2xl sm:text-3xl font-bold text-foreground leading-tight mb-3">
              {quiz.title}
            </h1>
            <p className="text-muted-foreground text-base leading-relaxed">
              {quiz.description}
            </p>
          </div>

          {/* Stats row */}
          <div className="grid grid-cols-3 gap-3 mb-6">
            <div className="bg-white rounded-xl border border-gray-200 p-4 text-center shadow-sm">
              <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center mx-auto mb-2">
                <HelpCircle className="w-4 h-4 text-primary" />
              </div>
              <p className="text-xl font-bold text-foreground">{quiz.questionCount}</p>
              <p className="text-xs text-muted-foreground mt-0.5">Questions</p>
            </div>
            <div className="bg-white rounded-xl border border-gray-200 p-4 text-center shadow-sm">
              <div className="w-8 h-8 bg-amber-100 rounded-lg flex items-center justify-center mx-auto mb-2">
                <Clock className="w-4 h-4 text-amber-600" />
              </div>
              <p className="text-xl font-bold text-foreground">~{estimatedMinutes}m</p>
              <p className="text-xs text-muted-foreground mt-0.5">Est. Time</p>
            </div>
            <div className="bg-white rounded-xl border border-gray-200 p-4 text-center shadow-sm">
              <div className="w-8 h-8 bg-emerald-100 rounded-lg flex items-center justify-center mx-auto mb-2">
                <Trophy className="w-4 h-4 text-emerald-600" />
              </div>
              <p className="text-xl font-bold text-foreground">10/10</p>
              <p className="text-xs text-muted-foreground mt-0.5">Perfect Score</p>
            </div>
          </div>

          {/* How it works */}
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5 mb-6">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-7 h-7 bg-primary/10 rounded-lg flex items-center justify-center">
                <BookOpen className="w-4 h-4 text-primary" />
              </div>
              <h2 className="font-display text-sm font-bold text-foreground uppercase tracking-wide">How It Works</h2>
            </div>
            <div className="space-y-3">
              {rules.map((rule, i) => (
                <div key={i} className="flex items-start gap-3">
                  <div className="w-5 h-5 rounded-full bg-primary/10 text-primary text-xs font-bold flex items-center justify-center shrink-0 mt-0.5">
                    {i + 1}
                  </div>
                  <p className="text-sm text-gray-700 leading-relaxed">{rule}</p>
                </div>
              ))}
            </div>
          </div>

          {/* What you'll learn */}
          <div className="bg-amber-50 border border-amber-200 rounded-2xl p-5 mb-8">
            <div className="flex items-center gap-2 mb-3">
              <Star className="w-4 h-4 text-amber-500" />
              <h2 className="font-display text-sm font-bold text-amber-800 uppercase tracking-wide">What You'll Learn</h2>
            </div>
            <div className="space-y-2">
              {[
                `Fascinating facts about ${category?.name || 'this topic'}`,
                'Surprising statistics and historical context',
                'Fun trivia to share with friends and family',
              ].map((item, i) => (
                <div key={i} className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-amber-500 shrink-0" />
                  <p className="text-sm text-amber-900">{item}</p>
                </div>
              ))}
            </div>
          </div>

          {/* START BUTTON */}
          <button
            onClick={handleStart}
            className="w-full flex items-center justify-center gap-3 px-8 py-5 bg-primary text-white font-display font-bold text-xl rounded-2xl hover:bg-primary/90 active:scale-[0.98] transition-all duration-200 shadow-lg shadow-primary/25 group"
          >
            <Play className="w-6 h-6 fill-white group-hover:scale-110 transition-transform" />
            Start Quiz
            <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </button>

          <p className="text-center text-xs text-muted-foreground mt-3">
            No sign-up required · Free to play · Learn something new
          </p>
        </div>
      </main>

      <Footer />
    </div>
  );
}
