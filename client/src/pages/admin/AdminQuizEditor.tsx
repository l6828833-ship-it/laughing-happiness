// AdminQuizEditor — Quizoi Admin
// Create and edit quizzes with full question management
import { useState, useEffect } from 'react';
import { useParams, useLocation } from 'wouter';
import {
  ChevronLeft, Plus, Trash2, Save, Eye,
  ChevronDown, ChevronUp, CheckCircle2, AlertCircle,
  Image, Type, ToggleLeft, ToggleRight
} from 'lucide-react';
import { adminFetchQuiz, adminCreateQuiz, adminUpdateQuiz, adminFetchCategories, fetchCategories, type Quiz, type Question, type Answer, type Category } from '@/lib/api';
import { toast } from 'sonner';

const blankAnswer = (idx: number): Answer => ({
  id: `ans-${Date.now()}-${idx}`,
  text: '',
  isCorrect: idx === 0,
  votesCount: Math.floor(Math.random() * 5000) + 500,
  order: idx + 1,
  questionId: '',
  imageUrl: null,
});

const blankQuestion = (qIdx: number): Question => ({
  id: `q-${Date.now()}-${qIdx}`,
  quizId: '',
  order: qIdx + 1,
  questionText: '',
  mediaType: 'NONE',
  mediaUrl: '',
  factLabTitle: '',
  factLabContent: '',
  answers: [0, 1, 2, 3].map(blankAnswer),
  answerType: 'TEXT',
  previewImageUrl: '',
  showPreviewImage: false,
adsEnabled: true,
showSuggestions: true,
showReveal: true,
});

export default function AdminQuizEditor() {
  const params = useParams<{ id: string }>();
  const [, navigate] = useLocation();
  const isEdit = !!params.id && params.id !== 'new';

  const [form, setForm] = useState<Partial<Quiz>>({
    title: '',
    description: '',
    categoryId: 'pub-quiz',
    thumbnailUrl: '',
    status: 'DRAFT',
    playCount: 0,
    questionCount: 10,
    questions: Array.from({ length: 10 }, (_, i) => blankQuestion(i)),
  });

  const [expandedQ, setExpandedQ] = useState<number>(0);
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState<string[]>([]);

  const [categories, setApiCategories] = useState<Category[]>([]);

  useEffect(() => {
    fetchCategories().then(setApiCategories).catch(console.error);
    if (isEdit && params.id) {
      adminFetchQuiz(params.id).then(quiz => setForm(quiz)).catch(console.error);
    }
  }, [isEdit, params.id]);

  const updateField = (field: keyof Quiz, value: unknown) => {
    setForm(prev => ({ ...prev, [field]: value }));
  };

  const updateQuestion = (qIdx: number, field: keyof Question, value: unknown) => {
    const questions = [...(form.questions || [])];
    questions[qIdx] = { ...questions[qIdx], [field]: value };
    setForm(prev => ({ ...prev, questions }));
  };

  const updateAnswer = (qIdx: number, aIdx: number, field: keyof Answer, value: unknown) => {
    const questions = [...(form.questions || [])];
    const answers = [...questions[qIdx].answers];
    // If setting isCorrect, unset all others
    if (field === 'isCorrect' && value === true) {
      answers.forEach((a, i) => { answers[i] = { ...a, isCorrect: i === aIdx }; });
    } else {
      answers[aIdx] = { ...answers[aIdx], [field]: value };
    }
    questions[qIdx] = { ...questions[qIdx], answers };
    setForm(prev => ({ ...prev, questions }));
  };

  const addQuestion = () => {
    const questions = [...(form.questions || [])];
    questions.push(blankQuestion(questions.length));
    setForm(prev => ({ ...prev, questions, questionCount: questions.length }));
    setExpandedQ(questions.length - 1);
  };

  const removeQuestion = (qIdx: number) => {
    const questions = (form.questions || []).filter((_, i) => i !== qIdx);
    setForm(prev => ({ ...prev, questions, questionCount: questions.length }));
    if (expandedQ >= questions.length) setExpandedQ(Math.max(0, questions.length - 1));
  };

  const validate = (): string[] => {
    const errs: string[] = [];
    if (!form.title?.trim()) errs.push('Quiz title is required');
    if (!form.description?.trim()) errs.push('Quiz description is required');
    if (!form.thumbnailUrl?.trim()) errs.push('Thumbnail URL is required');
    const qs = form.questions || [];
    if (qs.length === 0) errs.push('At least one question is required');
    qs.forEach((q, i) => {
      if (!q.questionText?.trim()) errs.push(`Question ${i + 1}: question text is required`);
      if (!q.factLabTitle?.trim()) errs.push(`Question ${i + 1}: fact lab title is required`);
      const factWords = q.factLabContent?.trim().split(/\s+/).length || 0;
      if (factWords < 50) errs.push(`Question ${i + 1}: fact lab needs at least 150 words (currently ~${factWords})`);
      if (!q.answers.some(a => a.isCorrect)) errs.push(`Question ${i + 1}: mark one correct answer`);
      q.answers.forEach((a, ai) => {
        if (!a.text?.trim()) errs.push(`Question ${i + 1}, Answer ${ai + 1}: text is required`);
      });
    });
    return errs;
  };

  const handleSave = async (publish = false) => {
    const errs = validate();
    if (errs.length > 0) {
      setErrors(errs);
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }
    setErrors([]);
    setSaving(true);

    const slug = form.title!
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .slice(0, 60);

    const payload = {
      ...form,
      slug: (form as Quiz).slug || slug,
      status: publish ? 'PUBLISHED' as const : (form.status as 'PUBLISHED' | 'DRAFT'),
      questionCount: (form.questions || []).length,
    } as Omit<Quiz, 'id' | 'createdAt'>;

    try {
      if (isEdit) {
        await adminUpdateQuiz(params.id!, payload as Partial<Quiz>);
        toast.success('Quiz updated successfully');
      } else {
        await adminCreateQuiz(payload as Partial<Quiz>);
        toast.success('Quiz created successfully');
      }
      navigate('/admin/quizzes');
    } catch (e: unknown) {
      toast.error((e as Error).message);
    } finally {
      setSaving(false);
    }
  };

  const questions = form.questions || [];

  return (
    <div className="p-6 space-y-6 max-w-4xl">
      {/* Header */}
      <div className="flex items-center gap-4">
        <button
          onClick={() => navigate('/admin/quizzes')}
          className="p-2 rounded-xl text-muted-foreground hover:text-foreground hover:bg-gray-100 transition-colors"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>
        <div>
          <h1 className="font-display text-2xl font-bold text-foreground">
            {isEdit ? 'Edit Quiz' : 'Create New Quiz'}
          </h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            {isEdit ? `Editing: ${form.title}` : 'Fill in the details below to create a new quiz'}
          </p>
        </div>
      </div>

      {/* Validation Errors */}
      {errors.length > 0 && (
        <div className="bg-rose-50 border border-rose-100 rounded-2xl p-4">
          <div className="flex items-center gap-2 mb-2">
            <AlertCircle className="w-4 h-4 text-rose-600" />
            <span className="text-sm font-semibold text-rose-700">Please fix {errors.length} error{errors.length > 1 ? 's' : ''} before saving</span>
          </div>
          <ul className="space-y-1">
            {errors.slice(0, 5).map((e, i) => (
              <li key={i} className="text-xs text-rose-600">• {e}</li>
            ))}
            {errors.length > 5 && <li className="text-xs text-rose-500">...and {errors.length - 5} more</li>}
          </ul>
        </div>
      )}

      {/* Quiz Details */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-4">
        <h2 className="font-display text-base font-semibold text-foreground">Quiz Details</h2>

        <div>
          <label className="block text-sm font-medium text-foreground mb-1.5">Quiz Title *</label>
          <input
            type="text"
            value={form.title || ''}
            onChange={e => updateField('title', e.target.value)}
            placeholder="e.g. Can You Score 10/10 On This 90s Music Quiz?"
            className="w-full px-4 py-2.5 rounded-xl bg-gray-50 border border-gray-200 text-sm text-foreground focus:outline-none focus:border-primary/50 focus:ring-2 focus:ring-primary/10 transition-colors"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-foreground mb-1.5">Description *</label>
          <textarea
            value={form.description || ''}
            onChange={e => updateField('description', e.target.value)}
            placeholder="Short description shown on the quiz card (1-2 sentences)"
            rows={2}
            className="w-full px-4 py-2.5 rounded-xl bg-gray-50 border border-gray-200 text-sm text-foreground focus:outline-none focus:border-primary/50 focus:ring-2 focus:ring-primary/10 transition-colors resize-none"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-foreground mb-1.5">Category *</label>
            <select
              value={form.categoryId || ''}
              onChange={e => updateField('categoryId', e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl bg-gray-50 border border-gray-200 text-sm text-foreground focus:outline-none focus:border-primary/50 transition-colors"
            >
              {categories.map((c: import('@/lib/api').Category) => (
                <option key={c.id} value={c.id}>{c.emoji} {c.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-foreground mb-1.5">Status</label>
            <select
              value={form.status || 'DRAFT'}
              onChange={e => updateField('status', e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl bg-gray-50 border border-gray-200 text-sm text-foreground focus:outline-none focus:border-primary/50 transition-colors"
            >
              <option value="DRAFT">Draft</option>
              <option value="PUBLISHED">Published</option>
            </select>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-foreground mb-1.5">Thumbnail URL *</label>
          <input
            type="url"
            value={form.thumbnailUrl || ''}
            onChange={e => updateField('thumbnailUrl', e.target.value)}
            placeholder="https://images.unsplash.com/photo-XXXXX?w=800&q=80"
            className="w-full px-4 py-2.5 rounded-xl bg-gray-50 border border-gray-200 text-sm text-foreground focus:outline-none focus:border-primary/50 focus:ring-2 focus:ring-primary/10 transition-colors"
          />
          {form.thumbnailUrl && (
            <img src={form.thumbnailUrl} alt="Preview" className="mt-2 h-24 rounded-xl object-cover border border-gray-100" onError={e => (e.currentTarget.style.display = 'none')} />
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-foreground mb-1.5">Starting Play Count</label>
          <input
            type="number"
            value={form.playCount || 0}
            onChange={e => updateField('playCount', parseInt(e.target.value) || 0)}
            min={0}
            className="w-full px-4 py-2.5 rounded-xl bg-gray-50 border border-gray-200 text-sm text-foreground focus:outline-none focus:border-primary/50 transition-colors"
          />
          <p className="text-xs text-muted-foreground mt-1">Social proof number shown on the quiz card</p>
        </div>

        {/* Quiz-level Ad Master Switch */}
        <div className={`rounded-xl border-2 p-4 transition-colors ${
          form.adsEnabled !== false
            ? 'border-emerald-200 bg-emerald-50'
            : 'border-gray-200 bg-gray-50'
        }`}>
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-sm font-bold text-foreground">Ads on this Quiz</p>
              <p className="text-xs text-muted-foreground mt-0.5">
                Master switch — turns ads ON/OFF for ALL questions in this quiz
              </p>
            </div>
            <button
              type="button"
              onClick={() => updateField('adsEnabled', form.adsEnabled === false ? true : false)}
              className={`shrink-0 px-4 py-2 rounded-xl text-sm font-bold border-2 transition-all ${
                form.adsEnabled !== false
                  ? 'bg-emerald-500 text-white border-emerald-500 hover:bg-emerald-600'
                  : 'bg-white text-gray-500 border-gray-300 hover:border-gray-400'
              }`}
            >
              {form.adsEnabled !== false ? '✓ Ads ON' : '✗ Ads OFF'}
            </button>
          </div>
        </div>
      </div>

      {/* Questions */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="font-display text-base font-semibold text-foreground">
            Questions <span className="text-muted-foreground font-normal">({questions.length})</span>
          </h2>
          <button
            onClick={addQuestion}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-primary/10 text-primary text-sm font-semibold rounded-xl hover:bg-primary/20 transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
            Add Question
          </button>
        </div>

        {questions.map((q, qIdx) => {
          const isOpen = expandedQ === qIdx;
          const hasCorrect = q.answers.some(a => a.isCorrect);
          const wordCount = q.factLabContent?.trim().split(/\s+/).filter(Boolean).length || 0;

          return (
            <div key={q.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
              {/* Question header */}
              <button
                onClick={() => setExpandedQ(isOpen ? -1 : qIdx)}
                className="w-full flex items-center gap-3 px-5 py-4 text-left hover:bg-gray-50/50 transition-colors"
              >
                <span className={`w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold shrink-0 ${
                  hasCorrect && q.questionText ? 'bg-emerald-100 text-emerald-700' : 'bg-gray-100 text-gray-500'
                }`}>
                  {qIdx + 1}
                </span>
                <span className="flex-1 text-sm font-medium text-foreground truncate">
                  {q.questionText || <span className="text-muted-foreground italic">Untitled question</span>}
                </span>
                <div className="flex items-center gap-2 shrink-0">
                  {wordCount > 0 && (
                    <span className={`text-xs px-2 py-0.5 rounded-full ${wordCount >= 150 ? 'bg-emerald-50 text-emerald-600' : 'bg-amber-50 text-amber-600'}`}>
                      {wordCount}w
                    </span>
                  )}
                  <button
                    onClick={e => { e.stopPropagation(); removeQuestion(qIdx); }}
                    className="p-1 text-muted-foreground hover:text-rose-500 transition-colors"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                  {isOpen ? <ChevronUp className="w-4 h-4 text-muted-foreground" /> : <ChevronDown className="w-4 h-4 text-muted-foreground" />}
                </div>
              </button>

              {/* Question body */}
              {isOpen && (
                <div className="px-5 pb-5 space-y-4 border-t border-gray-50">
                  <div className="pt-4">
                    <label className="block text-sm font-medium text-foreground mb-1.5">Question Text *</label>
                    <textarea
                      value={q.questionText}
                      onChange={e => updateQuestion(qIdx, 'questionText', e.target.value)}
                      placeholder="Enter your question here..."
                      rows={2}
                      className="w-full px-4 py-2.5 rounded-xl bg-gray-50 border border-gray-200 text-sm text-foreground focus:outline-none focus:border-primary/50 focus:ring-2 focus:ring-primary/10 transition-colors resize-none"
                    />
                  </div>

                  {/* Preview Image Toggle */}
                  <div className="flex items-center gap-4 p-3 bg-gray-50 rounded-xl border border-gray-100">
                    <div className="flex-1">
                      <p className="text-sm font-medium text-foreground">Preview Image (hint image above answers)</p>
                      <p className="text-xs text-muted-foreground mt-0.5">Show an image above the answer options as a visual hint</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => updateQuestion(qIdx, 'showPreviewImage', !q.showPreviewImage)}
                      className="shrink-0"
                    >
                      {q.showPreviewImage
                        ? <ToggleRight className="w-8 h-8 text-primary" />
                        : <ToggleLeft className="w-8 h-8 text-gray-300" />
                      }
                    </button>
                  </div>
                  {q.showPreviewImage && (
                    <div>
                      <label className="block text-sm font-medium text-foreground mb-1.5">Preview Image URL</label>
                      <input
                        type="url"
                        value={q.previewImageUrl || ''}
                        onChange={e => updateQuestion(qIdx, 'previewImageUrl', e.target.value)}
                        placeholder="https://images.unsplash.com/photo-XXXXX?w=800&q=80"
                        className="w-full px-4 py-2.5 rounded-xl bg-gray-50 border border-gray-200 text-sm text-foreground focus:outline-none focus:border-primary/50 focus:ring-2 focus:ring-primary/10 transition-colors"
                      />
                      {q.previewImageUrl && (
                        <img src={q.previewImageUrl} alt="Preview" className="mt-2 h-32 w-full object-cover rounded-xl border border-gray-100" onError={e => (e.currentTarget.style.display='none')} />
                      )}
                    </div>
                  )}

                  {/* Answer Type Selector */}
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">Answer Format</label>
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => updateQuestion(qIdx, 'answerType', 'TEXT')}
                        className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium border-2 transition-colors ${
                          (q.answerType || 'TEXT') === 'TEXT'
                            ? 'border-primary bg-primary/5 text-primary'
                            : 'border-gray-200 text-muted-foreground hover:border-gray-300'
                        }`}
                      >
                        <Type className="w-4 h-4" />
                        Text Answers
                      </button>
                      <button
                        type="button"
                        onClick={() => updateQuestion(qIdx, 'answerType', 'IMAGE')}
                        className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium border-2 transition-colors ${
                          q.answerType === 'IMAGE'
                            ? 'border-primary bg-primary/5 text-primary'
                            : 'border-gray-200 text-muted-foreground hover:border-gray-300'
                        }`}
                      >
                        <Image className="w-4 h-4" />
                        Image Answers
                      </button>
                    </div>
                  </div>

                  {/* Answers */}
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">
                      Answers * <span className="text-xs text-muted-foreground font-normal">(click the circle to mark correct)</span>
                    </label>
                    {q.answerType === 'IMAGE' ? (
                      <div className="grid grid-cols-2 gap-3">
                        {q.answers.map((answer, aIdx) => (
                          <div key={answer.id} className={`rounded-xl border-2 overflow-hidden transition-colors ${
                            answer.isCorrect ? 'border-emerald-400' : 'border-gray-200'
                          }`}>
                            <div className="relative">
                              {answer.imageUrl ? (
                                <img src={answer.imageUrl} alt={`Answer ${['A','B','C','D'][aIdx]}`} className="w-full h-28 object-cover" onError={e => (e.currentTarget.style.display='none')} />
                              ) : (
                                <div className="w-full h-28 bg-gray-100 flex items-center justify-center">
                                  <Image className="w-8 h-8 text-gray-300" />
                                </div>
                              )}
                              <button
                                type="button"
                                onClick={() => updateAnswer(qIdx, aIdx, 'isCorrect', true)}
                                className={`absolute top-2 right-2 w-6 h-6 rounded-full border-2 flex items-center justify-center shadow-sm transition-colors ${
                                  answer.isCorrect ? 'border-emerald-500 bg-emerald-500' : 'border-white bg-white/80 hover:border-emerald-400'
                                }`}
                              >
                                {answer.isCorrect && <CheckCircle2 className="w-3.5 h-3.5 text-white" />}
                              </button>
                              <span className="absolute top-2 left-2 w-6 h-6 rounded-full bg-black/50 text-white text-xs font-bold flex items-center justify-center">
                                {['A','B','C','D'][aIdx]}
                              </span>
                            </div>
                            <div className="p-2 bg-white space-y-1.5">
                              <input
                                type="url"
                                value={answer.imageUrl || ''}
                                onChange={e => updateAnswer(qIdx, aIdx, 'imageUrl', e.target.value)}
                                placeholder="Image URL..."
                                className="w-full text-xs px-2 py-1.5 rounded-lg bg-gray-50 border border-gray-200 text-foreground focus:outline-none focus:border-primary/50 transition-colors"
                              />
                              <input
                                type="text"
                                value={answer.text}
                                onChange={e => updateAnswer(qIdx, aIdx, 'text', e.target.value)}
                                placeholder="Caption (optional)"
                                className="w-full text-xs px-2 py-1.5 rounded-lg bg-gray-50 border border-gray-200 text-foreground focus:outline-none focus:border-primary/50 transition-colors"
                              />
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {q.answers.map((answer, aIdx) => (
                          <div key={answer.id} className={`flex items-center gap-2 p-3 rounded-xl border-2 transition-colors ${
                            answer.isCorrect ? 'border-emerald-200 bg-emerald-50' : 'border-gray-100 bg-gray-50'
                          }`}>
                            <button
                              type="button"
                              onClick={() => updateAnswer(qIdx, aIdx, 'isCorrect', true)}
                              className={`shrink-0 w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors ${
                                answer.isCorrect ? 'border-emerald-500 bg-emerald-500' : 'border-gray-300 hover:border-emerald-400'
                              }`}
                            >
                              {answer.isCorrect && <CheckCircle2 className="w-3 h-3 text-white" />}
                            </button>
                            <span className="text-xs font-bold text-muted-foreground w-4">{['A','B','C','D'][aIdx]}</span>
                            <input
                              type="text"
                              value={answer.text}
                              onChange={e => updateAnswer(qIdx, aIdx, 'text', e.target.value)}
                              placeholder={`Answer ${['A','B','C','D'][aIdx]}`}
                              className="flex-1 bg-transparent text-sm text-foreground focus:outline-none placeholder:text-muted-foreground/50"
                            />
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Fact Lab */}
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-1.5">
                      Fact Lab Title *
                    </label>
                    <input
                      type="text"
                      value={q.factLabTitle}
                      onChange={e => updateQuestion(qIdx, 'factLabTitle', e.target.value)}
                      placeholder="e.g. The History of The Beatles"
                      className="w-full px-4 py-2.5 rounded-xl bg-gray-50 border border-gray-200 text-sm text-foreground focus:outline-none focus:border-primary/50 focus:ring-2 focus:ring-primary/10 transition-colors"
                    />
                  </div>
                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <label className="block text-sm font-medium text-foreground">
                        Fact Lab Content * <span className="text-xs text-muted-foreground font-normal">(150+ words required for AdSense)</span>
                      </label>
                      <span className={`text-xs font-semibold ${wordCount >= 150 ? 'text-emerald-600' : 'text-amber-600'}`}>
                        {wordCount} words
                      </span>
                    </div>
                    <textarea
                      value={q.factLabContent}
                      onChange={e => updateQuestion(qIdx, 'factLabContent', e.target.value)}
                      placeholder="Write 150+ words of original, educational content about this question's topic..."
                      rows={6}
                      className="w-full px-4 py-2.5 rounded-xl bg-gray-50 border border-gray-200 text-sm text-foreground focus:outline-none focus:border-primary/50 focus:ring-2 focus:ring-primary/10 transition-colors resize-none"
                    />
                  </div>

                  {/* Per-question Ad, Suggestion & Reveal Toggles */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    {/* Ads on this question */}
                    <div className={`flex items-center justify-between gap-3 p-3 rounded-xl border-2 transition-colors ${
                      q.adsEnabled !== false ? 'border-emerald-200 bg-emerald-50' : 'border-gray-200 bg-gray-50'
                    }`}>
                      <div>
                        <p className="text-xs font-bold text-foreground">Ads on Question</p>
                        <p className="text-[10px] text-muted-foreground mt-0.5">Override quiz-level ad setting</p>
                      </div>
                      <button
                        type="button"
                        onClick={() => updateQuestion(qIdx, 'adsEnabled', q.adsEnabled === false ? true : false)}
                        className={`shrink-0 px-3 py-1.5 rounded-lg text-xs font-bold border-2 transition-all ${
                          q.adsEnabled !== false
                            ? 'bg-emerald-500 text-white border-emerald-500 hover:bg-emerald-600'
                            : 'bg-white text-gray-500 border-gray-300 hover:border-gray-400'
                        }`}
                      >
                        {q.adsEnabled !== false ? '✓ ON' : '✗ OFF'}
                      </button>
                    </div>
                    {/* Suggestions on this question */}
                    <div className={`flex items-center justify-between gap-3 p-3 rounded-xl border-2 transition-colors ${
                      q.showSuggestions !== false ? 'border-blue-200 bg-blue-50' : 'border-gray-200 bg-gray-50'
                    }`}>
                      <div>
                        <p className="text-xs font-bold text-foreground">Related Quizzes</p>
                        <p className="text-[10px] text-muted-foreground mt-0.5">Show suggestions sidebar</p>
                      </div>
                      <button
                        type="button"
                        onClick={() => updateQuestion(qIdx, 'showSuggestions', q.showSuggestions === false ? true : false)}
                        className={`shrink-0 px-3 py-1.5 rounded-lg text-xs font-bold border-2 transition-all ${
                          q.showSuggestions !== false
                            ? 'bg-blue-500 text-white border-blue-500 hover:bg-blue-600'
                            : 'bg-white text-gray-500 border-gray-300 hover:border-gray-400'
                        }`}
                      >
                        {q.showSuggestions !== false ? '✓ ON' : '✗ OFF'}
                      </button>
                    </div>
                    {/* Reveal page for this question */}
                    <div className={`flex items-center justify-between gap-3 p-3 rounded-xl border-2 transition-colors ${
                      q.showReveal !== false ? 'border-violet-200 bg-violet-50' : 'border-gray-200 bg-gray-50'
                    }`}>
                      <div>
                        <p className="text-xs font-bold text-foreground">Reveal Page</p>
                        <p className="text-[10px] text-muted-foreground mt-0.5">Show correct/incorrect page</p>
                      </div>
                      <button
                        type="button"
                        onClick={() => updateQuestion(qIdx, 'showReveal', q.showReveal === false ? true : false)}
                        className={`shrink-0 px-3 py-1.5 rounded-lg text-xs font-bold border-2 transition-all ${
                          q.showReveal !== false
                            ? 'bg-violet-500 text-white border-violet-500 hover:bg-violet-600'
                            : 'bg-white text-gray-500 border-gray-300 hover:border-gray-400'
                        }`}
                      >
                        {q.showReveal !== false ? '✓ ON' : '✗ OFF'}
                      </button>
                    </div>
                  </div>

                  {/* Media (optional) */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-sm font-medium text-foreground mb-1.5">Media Type</label>
                      <select
                        value={q.mediaType}
                        onChange={e => updateQuestion(qIdx, 'mediaType', e.target.value)}
                        className="w-full px-4 py-2.5 rounded-xl bg-gray-50 border border-gray-200 text-sm text-foreground focus:outline-none focus:border-primary/50 transition-colors"
                      >
                        <option value="NONE">None</option>
                        <option value="IMAGE">Image</option>
                        <option value="YOUTUBE">YouTube</option>
                      </select>
                    </div>
                    {q.mediaType !== 'NONE' && (
                      <div>
                        <label className="block text-sm font-medium text-foreground mb-1.5">
                          {q.mediaType === 'IMAGE' ? 'Image URL' : 'YouTube Video ID'}
                        </label>
                        <input
                          type="text"
                          value={q.mediaUrl || ''}
                          onChange={e => updateQuestion(qIdx, 'mediaUrl', e.target.value)}
                          placeholder={q.mediaType === 'IMAGE' ? 'https://...' : 'dQw4w9WgXcQ'}
                          className="w-full px-4 py-2.5 rounded-xl bg-gray-50 border border-gray-200 text-sm text-foreground focus:outline-none focus:border-primary/50 transition-colors"
                        />
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          );
        })}

        <button
          onClick={addQuestion}
          className="w-full py-3 border-2 border-dashed border-gray-200 rounded-2xl text-sm text-muted-foreground hover:border-primary/30 hover:text-primary transition-colors flex items-center justify-center gap-2"
        >
          <Plus className="w-4 h-4" />
          Add Another Question
        </button>
      </div>

      {/* Save Actions */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 flex flex-col sm:flex-row items-center gap-3">
        <button
          onClick={() => handleSave(false)}
          disabled={saving}
          className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-2.5 bg-gray-100 text-foreground font-semibold text-sm rounded-xl hover:bg-gray-200 disabled:opacity-50 transition-colors"
        >
          <Save className="w-4 h-4" />
          Save as Draft
        </button>
        <button
          onClick={() => handleSave(true)}
          disabled={saving}
          className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-2.5 bg-primary text-white font-semibold text-sm rounded-xl hover:bg-primary/90 disabled:opacity-50 transition-colors shadow-sm"
        >
          <Eye className="w-4 h-4" />
          {saving ? 'Saving...' : 'Save & Publish'}
        </button>
        <button
          onClick={() => navigate('/admin/quizzes')}
          className="w-full sm:w-auto px-6 py-2.5 text-muted-foreground text-sm hover:text-foreground transition-colors"
        >
          Cancel
        </button>
      </div>
    </div>
  );
}
