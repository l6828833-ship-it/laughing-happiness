// QuizCard — Quizoi Light Theme
// White cards with subtle shadow, blue accents, clean hover states
import { Link } from 'wouter';
import { Play, Users } from 'lucide-react';
import type { Quiz } from '@/lib/api';
import { formatPlayCount } from '@/lib/api';

interface QuizCardProps {
  quiz: Quiz;
  featured?: boolean;
}

export default function QuizCard({ quiz, featured = false }: QuizCardProps) {
  // Category display uses categoryId as fallback since QuizCard receives pre-fetched quiz data
  const category = null; // Category info not included in quiz list — use categoryId

  if (featured) {
    return (
      <Link href={`/quiz/${quiz.slug}/start`} className="block group">
        <div className="relative overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm transition-all duration-300 hover:shadow-md hover:border-primary/20">
          <div className="flex flex-col md:flex-row">
            {/* Image */}
            <div className="relative md:w-1/2 aspect-video md:aspect-auto">
              <img
                src={quiz.thumbnailUrl}
                alt={quiz.title}
                className="w-full h-full object-cover"
                loading="lazy"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent md:bg-gradient-to-r md:from-transparent md:to-black/20" />
              
            </div>
            {/* Content */}
            <div className="p-6 md:w-1/2 flex flex-col justify-center">
              <div className="flex items-center gap-3 mb-3">
                <span className="px-2.5 py-0.5 bg-amber-50 text-amber-600 text-xs font-bold rounded-md uppercase tracking-wider border border-amber-100">Featured</span>
                <span className="text-xs text-muted-foreground">{quiz.questionCount} Questions</span>
              </div>
              <h3 className="font-display text-xl md:text-2xl font-bold text-foreground mb-3 leading-tight group-hover:text-primary transition-colors duration-200 line-clamp-2">
                {quiz.title}
              </h3>
              <p className="text-sm text-muted-foreground mb-4 line-clamp-2">{quiz.description}</p>
              <div className="flex items-center gap-4">
                <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
                  <Users className="w-3.5 h-3.5" />
                  {formatPlayCount(quiz.playCount)} plays
                </span>
                <span className="flex items-center gap-1.5 text-xs text-primary font-semibold">
                  <Play className="w-3.5 h-3.5 fill-current" />
                  Play Now
                </span>
              </div>
            </div>
          </div>
        </div>
      </Link>
    );
  }

  return (
    <Link href={`/quiz/${quiz.slug}/start`} className="block group">
      <div className="relative overflow-hidden rounded-xl border border-gray-100 bg-white shadow-sm transition-all duration-300 hover:shadow-md hover:border-primary/20 h-full">
        {/* Image */}
        <div className="relative aspect-video overflow-hidden">
          <img
            src={quiz.thumbnailUrl}
            alt={quiz.title}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
            loading="lazy"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-black/10 to-transparent" />
          
          <div className="absolute bottom-2.5 right-2.5 px-2 py-0.5 bg-black/50 backdrop-blur-sm rounded-md text-[11px] text-white font-medium">
            {quiz.questionCount}Q
          </div>
        </div>
        {/* Content */}
        <div className="p-4">
          <h3 className="font-display text-sm font-semibold text-foreground mb-2 leading-snug line-clamp-2 group-hover:text-primary transition-colors duration-200">
            {quiz.title}
          </h3>
          <div className="flex items-center justify-between">
            <span className="flex items-center gap-1 text-xs text-muted-foreground">
              <Users className="w-3 h-3" />
              {formatPlayCount(quiz.playCount)}
            </span>
            <span className="flex items-center gap-1 text-xs text-primary font-semibold opacity-0 group-hover:opacity-100 transition-opacity duration-200">
              <Play className="w-3 h-3 fill-current" />
              Play
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
}
