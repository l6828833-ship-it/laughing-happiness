// AdminCategories — Quizoi Admin
// Manage quiz categories: view, edit names/emojis/descriptions
import { useState, useEffect } from 'react';
import { LayoutGrid, Pencil, Save, X, BookOpen } from 'lucide-react';
import { adminFetchCategories, adminUpdateCategory, adminFetchQuizzes, type Category, type Quiz } from '@/lib/api';


import { toast } from 'sonner';

export default function AdminCategories() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [allQuizzes, setAllQuizzes]   = useState<Quiz[]>([]);

  useEffect(() => {
    Promise.all([adminFetchCategories(), adminFetchQuizzes()])
      .then(([c, q]) => { setCategories(c); setAllQuizzes(q); })
      .catch(console.error);
  }, []);
  const [editing, setEditing] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<Partial<Category>>({});
  

  const quizCountForCategory = (catId: string) =>
    allQuizzes.filter(q => q.categoryId === catId && q.status === 'PUBLISHED').length;

  const startEdit = (cat: Category) => {
    setEditing(cat.id);
    setEditForm({ ...cat });
  };

  const cancelEdit = () => {
    setEditing(null);
    setEditForm({});
  };

  const saveEdit = async (id: string) => {
    try {
      const updated = await adminUpdateCategory(id, editForm as Partial<Category>);
      setCategories(prev => prev.map(c => c.id === id ? updated : c));
      setEditing(null);
      toast.success('Category updated');
    } catch (e: unknown) {
      toast.error((e as Error).message);
    }
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold text-foreground">Categories</h1>
          <p className="text-sm text-muted-foreground mt-0.5">{categories.length} categories · manage names, emojis, and descriptions</p>
        </div>
      </div>

      {/* Categories Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {categories.map(cat => {
          const isEditing = editing === cat.id;
          const liveCount = quizCountForCategory(cat.id);

          return (
            <div key={cat.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
              {isEditing ? (
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <input
                      type="text"
                      value={editForm.emoji || ''}
                      onChange={e => setEditForm(f => ({ ...f, emoji: e.target.value }))}
                      className="w-14 text-center px-2 py-2 rounded-xl bg-gray-50 border border-gray-200 text-lg focus:outline-none focus:border-primary/50"
                      placeholder="🎵"
                    />
                    <input
                      type="text"
                      value={editForm.name || ''}
                      onChange={e => setEditForm(f => ({ ...f, name: e.target.value }))}
                      className="flex-1 px-3 py-2 rounded-xl bg-gray-50 border border-gray-200 text-sm font-semibold text-foreground focus:outline-none focus:border-primary/50"
                      placeholder="Category name"
                    />
                  </div>
                  <textarea
                    value={editForm.description || ''}
                    onChange={e => setEditForm(f => ({ ...f, description: e.target.value }))}
                    placeholder="Short description..."
                    rows={2}
                    className="w-full px-3 py-2 rounded-xl bg-gray-50 border border-gray-200 text-sm text-foreground focus:outline-none focus:border-primary/50 resize-none"
                  />
                  <input
                    type="text"
                    value={(editForm as any).thumbnailUrl || ''}
                      onChange={e => setEditForm(f => ({ ...f, thumbnailUrl: e.target.value }))}
                    placeholder="Image URL (optional)"
                    className="w-full px-3 py-2 rounded-xl bg-gray-50 border border-gray-200 text-sm text-foreground focus:outline-none focus:border-primary/50"
                  />
                  <div className="flex gap-2">
                    <button
                      onClick={() => saveEdit(cat.id)}
                      className="flex items-center gap-1.5 px-4 py-2 bg-primary text-white text-sm font-semibold rounded-xl hover:bg-primary/90 transition-colors"
                    >
                      <Save className="w-3.5 h-3.5" />
                      Save
                    </button>
                    <button
                      onClick={cancelEdit}
                      className="flex items-center gap-1.5 px-4 py-2 bg-gray-100 text-foreground text-sm font-semibold rounded-xl hover:bg-gray-200 transition-colors"
                    >
                      <X className="w-3.5 h-3.5" />
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <div className="flex items-start gap-4">
                  {/* Icon */}
                  <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center text-2xl shrink-0">
                    {cat.emoji}
                  </div>
                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <h3 className="font-display text-base font-semibold text-foreground">{cat.name}</h3>
                      <span className="text-xs text-muted-foreground bg-gray-50 px-2 py-0.5 rounded-full">
                        ID: {cat.id}
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground mt-0.5 line-clamp-2">{cat.description}</p>
                    <div className="flex items-center gap-3 mt-2">
                      <span className="flex items-center gap-1 text-xs text-muted-foreground">
                        <BookOpen className="w-3 h-3" />
                        {liveCount} live quiz{liveCount !== 1 ? 'zes' : ''}
                      </span>
                    </div>
                  </div>
                  {/* Edit button */}
                  <button
                    onClick={() => startEdit(cat)}
                    className="p-2 rounded-xl text-muted-foreground hover:text-primary hover:bg-blue-50 transition-colors shrink-0"
                  >
                    <Pencil className="w-4 h-4" />
                  </button>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Info note */}
      <div className="bg-blue-50 border border-blue-100 rounded-2xl p-4">
        <div className="flex items-start gap-3">
          <LayoutGrid className="w-4 h-4 text-blue-600 mt-0.5 shrink-0" />
          <div>
            <p className="text-sm font-semibold text-blue-800">Category IDs are fixed</p>
            <p className="text-xs text-blue-600 mt-0.5">
              Category IDs (e.g. <code className="bg-blue-100 px-1 rounded">music</code>, <code className="bg-blue-100 px-1 rounded">sports</code>) are used in quiz data and URLs — they cannot be changed. You can freely edit the display name, emoji, description, and image.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
