// AdminQuizzes — Quizoi Admin
// Full quiz management: list, search, filter, status toggle, delete
import { useState, useEffect } from 'react';
import { Link } from 'wouter';
import {
  Plus, Search, Filter, Eye, EyeOff, Pencil, Trash2,
  BookOpen, Users, Play, ChevronDown
} from 'lucide-react';
import { adminFetchQuizzes, adminFetchCategories, adminToggleQuizStatus, adminDeleteQuiz, fetchCategories, type Quiz, type Category } from '@/lib/api';
import { toast } from 'sonner';

export default function AdminQuizzes() {
  const [quizzes, setQuizzes]     = useState<Quiz[]>([]);
  const [cats,    setCats]        = useState<Category[]>([]);
  const [loading, setLoading]     = useState(true);

  useEffect(() => {
    Promise.all([adminFetchQuizzes(), fetchCategories()])
      .then(([q, c]) => { setQuizzes(q); setCats(c); })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'PUBLISHED' | 'DRAFT'>('ALL');
  const [categoryFilter, setCategoryFilter] = useState('ALL');
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);

  // categories come from cats state

  const filtered = quizzes.filter(q => {
    const matchSearch = q.title.toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === 'ALL' || q.status === statusFilter;
    const matchCat = categoryFilter === 'ALL' || q.categoryId === categoryFilter;
    return matchSearch && matchStatus && matchCat;
  });

  const handleToggleStatus = async (id: string) => {
    try {
      const updated = await adminToggleQuizStatus(id);
      setQuizzes(prev => prev.map(q => q.id === id ? updated : q));
      toast.success(`Quiz ${updated.status === 'PUBLISHED' ? 'published' : 'set to draft'}`);
    } catch (e: unknown) {
      toast.error((e as Error).message);
    }
  };

  const handleDelete = async (id: string) => {
    if (confirmDelete === id) {
      try {
        await adminDeleteQuiz(id);
        setQuizzes(prev => prev.filter(q => q.id !== id));
        setConfirmDelete(null);
        toast.success('Quiz deleted');
      } catch (e: unknown) {
        toast.error((e as Error).message);
      }
    } else {
      setConfirmDelete(id);
      setTimeout(() => setConfirmDelete(null), 3000);
    }
  };

  const published = quizzes.filter(q => q.status === 'PUBLISHED').length;
  const drafts = quizzes.filter(q => q.status === 'DRAFT').length;

  return (
    <div className="p-4 sm:p-6 space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="font-display text-2xl font-bold text-foreground">Quizzes</h1>
          <div className="flex items-center gap-3 mt-1">
            <span className="text-sm text-muted-foreground">{quizzes.length} total</span>
            <span className="w-1 h-1 rounded-full bg-gray-300" />
            <span className="text-sm text-emerald-600 font-medium">{published} published</span>
            <span className="w-1 h-1 rounded-full bg-gray-300" />
            <span className="text-sm text-amber-600 font-medium">{drafts} drafts</span>
          </div>
        </div>
        <Link
          href="/admin/quizzes/new"
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-primary text-white text-sm font-semibold rounded-xl hover:bg-primary/90 transition-colors shadow-sm whitespace-nowrap"
        >
          <Plus className="w-4 h-4" />
          New Quiz
        </Link>
      </div>

      {/* Search & Filters */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
            <input
              type="text"
              placeholder="Search quizzes by title..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2.5 rounded-xl bg-gray-50 border border-gray-200 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary/50 focus:ring-2 focus:ring-primary/10 transition-colors"
            />
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <Filter className="w-4 h-4 text-muted-foreground" />
            <div className="relative">
              <select
                value={statusFilter}
                onChange={e => setStatusFilter(e.target.value as 'ALL' | 'PUBLISHED' | 'DRAFT')}
                className="appearance-none pl-3 pr-8 py-2.5 rounded-xl bg-gray-50 border border-gray-200 text-sm text-foreground focus:outline-none focus:border-primary/50 transition-colors cursor-pointer"
              >
                <option value="ALL">All Status</option>
                <option value="PUBLISHED">Published</option>
                <option value="DRAFT">Draft</option>
              </select>
              <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground pointer-events-none" />
            </div>
            <div className="relative">
              <select
                value={categoryFilter}
                onChange={e => setCategoryFilter(e.target.value)}
                className="appearance-none pl-3 pr-8 py-2.5 rounded-xl bg-gray-50 border border-gray-200 text-sm text-foreground focus:outline-none focus:border-primary/50 transition-colors cursor-pointer"
              >
                <option value="ALL">All Categories</option>
                {cats.map((cat: Category) => (
                  <option key={cat.id} value={cat.id}>{cat.emoji} {cat.name}</option>
                ))}
              </select>
              <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground pointer-events-none" />
            </div>
          </div>
        </div>
      </div>

      {/* Quiz Cards */}
      {filtered.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm text-center py-16">
          <BookOpen className="w-10 h-10 text-gray-200 mx-auto mb-3" />
          <p className="text-base font-semibold text-foreground">No quizzes found</p>
          <p className="text-sm text-muted-foreground mt-1">Try adjusting your filters or create a new quiz</p>
          <Link
            href="/admin/quizzes/new"
            className="inline-flex items-center gap-2 mt-4 px-4 py-2 bg-primary text-white text-sm font-semibold rounded-xl hover:bg-primary/90 transition-colors"
          >
            <Plus className="w-4 h-4" />
            Create First Quiz
          </Link>
        </div>
      ) : (
        <div className="space-y-2">
          {filtered.map(quiz => {
            const category = cats.find((cat: Category) => cat.id === quiz.categoryId);
            const isConfirmingDelete = confirmDelete === quiz.id;

            return (
              <div
                key={quiz.id}
                className="bg-white rounded-2xl border border-gray-100 shadow-sm hover:border-gray-200 hover:shadow-md transition-all duration-150"
              >
                <div className="flex items-center gap-4 p-4">
                  {/* Thumbnail */}
                  <div className="w-16 h-16 rounded-xl overflow-hidden shrink-0 bg-gray-100 border border-gray-100">
                    <img
                      src={quiz.thumbnailUrl}
                      alt={quiz.title}
                      className="w-full h-full object-cover"
                      onError={e => {
                        (e.currentTarget as HTMLImageElement).src = 'https://images.unsplash.com/photo-1606326608606-aa0b62935f2b?w=200&q=60';
                      }}
                    />
                  </div>

                  {/* Main info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2 mb-1">
                      <h3 className="text-sm font-semibold text-foreground leading-snug line-clamp-1">
                        {quiz.title}
                      </h3>
                      <span className={`shrink-0 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wide ${
                        quiz.status === 'PUBLISHED'
                          ? 'bg-emerald-100 text-emerald-700'
                          : 'bg-amber-100 text-amber-700'
                      }`}>
                        {quiz.status === 'PUBLISHED' ? 'Live' : 'Draft'}
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground line-clamp-1 mb-2">{quiz.description}</p>
                    <div className="flex flex-wrap items-center gap-3">
                      <span className="flex items-center gap-1 text-xs text-muted-foreground">
                        <span className="text-sm">{category?.emoji}</span>
                        {category?.name}
                      </span>
                      <span className="w-1 h-1 rounded-full bg-gray-300" />
                      <span className="flex items-center gap-1 text-xs text-muted-foreground">
                        <BookOpen className="w-3 h-3" />
                        {quiz.questionCount} questions
                      </span>
                      <span className="w-1 h-1 rounded-full bg-gray-300" />
                      <span className="flex items-center gap-1 text-xs text-muted-foreground">
                        <Users className="w-3 h-3" />
                        {quiz.playCount.toLocaleString()} plays
                      </span>
                      <span className="w-1 h-1 rounded-full bg-gray-300" />
                      <span className="text-xs text-muted-foreground">{quiz.createdAt}</span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-1 shrink-0">
                    <a
                      href={`/quiz/${quiz.slug}/start`}
                      target="_blank"
                      rel="noopener noreferrer"
                      title="Preview quiz"
                      className="p-2 rounded-xl text-muted-foreground hover:text-blue-600 hover:bg-blue-50 transition-colors"
                    >
                      <Play className="w-4 h-4" />
                    </a>
                    <button
                      onClick={() => handleToggleStatus(quiz.id)}
                      title={quiz.status === 'PUBLISHED' ? 'Set to Draft' : 'Publish'}
                      className="p-2 rounded-xl text-muted-foreground hover:text-amber-600 hover:bg-amber-50 transition-colors"
                    >
                      {quiz.status === 'PUBLISHED'
                        ? <EyeOff className="w-4 h-4" />
                        : <Eye className="w-4 h-4" />
                      }
                    </button>
                    <Link
                      href={`/admin/quizzes/${quiz.id}/edit`}
                      title="Edit quiz"
                      className="p-2 rounded-xl text-muted-foreground hover:text-primary hover:bg-blue-50 transition-colors"
                    >
                      <Pencil className="w-4 h-4" />
                    </Link>
                    <button
                      onClick={() => handleDelete(quiz.id)}
                      title={isConfirmingDelete ? 'Click again to confirm delete' : 'Delete quiz'}
                      className={`p-2 rounded-xl transition-all duration-150 ${
                        isConfirmingDelete
                          ? 'bg-rose-500 text-white scale-110'
                          : 'text-muted-foreground hover:text-rose-600 hover:bg-rose-50'
                      }`}
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
                {isConfirmingDelete && (
                  <div className="px-4 pb-3 flex items-center gap-2">
                    <div className="flex-1 h-px bg-rose-100" />
                    <span className="text-xs text-rose-600 font-medium">Click the trash icon again to confirm deletion</span>
                    <div className="flex-1 h-px bg-rose-100" />
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
