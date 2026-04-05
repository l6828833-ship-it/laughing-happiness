// AdminPages — Quizoi Admin
// Edit static page content: Privacy Policy, Terms of Service, About, Contact
import { useState, useEffect } from 'react';
import { Save, ExternalLink, FileText, ChevronRight, CheckCircle2 } from 'lucide-react';
import { adminFetchPages, adminUpdatePage, type PageContent } from '@/lib/api';
import { toast } from 'sonner';

export default function AdminPages() {
  const [pages, setPages] = useState<PageContent[]>([]);

  useEffect(() => {
    adminFetchPages().then(setPages).catch(console.error);
  }, []);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<PageContent | null>(null);
  const [saving, setSaving] = useState(false);

  const activePage = pages.find(p => p.id === activeId);

  const selectPage = (page: PageContent) => {
    setActiveId(page.id);
    setEditForm({ ...page });
  };

  const handleSave = async () => {
    if (!editForm) return;
    setSaving(true);
    try {
      const updated = await adminUpdatePage(editForm.id, editForm);
      setPages(prev => prev.map(p => p.id === updated.id ? updated : p));
      setEditForm({ ...updated });
      toast.success(`${editForm.title} saved`);
    } catch (e: unknown) {
      toast.error((e as Error).message);
    } finally {
      setSaving(false);
    }
  };

  const updateField = (field: keyof PageContent, value: string) => {
    setEditForm(prev => prev ? { ...prev, [field]: value } : prev);
  };

  return (
    <div className="p-4 sm:p-6 h-full">
      <div className="mb-5">
        <h1 className="font-display text-2xl font-bold text-foreground">Pages</h1>
        <p className="text-sm text-muted-foreground mt-0.5">Edit your static pages — Privacy Policy, Terms, About, Contact</p>
      </div>

      <div className="flex gap-4 h-[calc(100vh-180px)]">
        {/* Sidebar — Page List */}
        <div className="w-56 shrink-0 space-y-1">
          {pages.map(page => (
            <button
              key={page.id}
              onClick={() => selectPage(page)}
              className={`w-full flex items-center gap-3 px-3 py-3 rounded-xl text-left transition-all ${
                activeId === page.id
                  ? 'bg-primary text-white shadow-sm'
                  : 'bg-white border border-gray-100 text-foreground hover:border-gray-200 hover:shadow-sm'
              }`}
            >
              <FileText className={`w-4 h-4 shrink-0 ${activeId === page.id ? 'text-white/80' : 'text-muted-foreground'}`} />
              <div className="flex-1 min-w-0">
                <p className={`text-sm font-medium truncate ${activeId === page.id ? 'text-white' : 'text-foreground'}`}>{page.title}</p>
                <p className={`text-xs truncate ${activeId === page.id ? 'text-white/70' : 'text-muted-foreground'}`}>{page.slug}</p>
              </div>
              <ChevronRight className={`w-3.5 h-3.5 shrink-0 ${activeId === page.id ? 'text-white/70' : 'text-muted-foreground'}`} />
            </button>
          ))}

          <div className="pt-3 border-t border-gray-100">
            <p className="text-xs text-muted-foreground px-1">
              These pages are required for Google AdSense approval. Keep them up to date.
            </p>
          </div>
        </div>

        {/* Editor */}
        {editForm ? (
          <div className="flex-1 bg-white rounded-2xl border border-gray-100 shadow-sm flex flex-col overflow-hidden">
            {/* Editor Header */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
              <div>
                <h2 className="font-display text-base font-semibold text-foreground">{editForm.title}</h2>
                <div className="flex items-center gap-2 mt-0.5">
                  <span className="text-xs text-muted-foreground">{editForm.slug}</span>
                  <span className="text-xs text-muted-foreground">·</span>
                  <span className="text-xs text-muted-foreground">Last updated: {editForm.updatedAt ?? "—"}</span>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <a
                  href={editForm.slug}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1.5 px-3 py-2 bg-gray-100 text-foreground text-sm font-medium rounded-xl hover:bg-gray-200 transition-colors"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  Preview
                </a>
                <button
                  onClick={handleSave}
                  disabled={saving}
                  className="flex items-center gap-1.5 px-4 py-2 bg-primary text-white text-sm font-semibold rounded-xl hover:bg-primary/90 disabled:opacity-50 transition-colors"
                >
                  <Save className="w-3.5 h-3.5" />
                  {saving ? 'Saving...' : 'Save'}
                </button>
              </div>
            </div>

            {/* Editor Body */}
            <div className="flex-1 overflow-y-auto p-5 space-y-4">
              {/* SEO Meta — title/description managed via page content */}
              <div className="bg-blue-50 border border-blue-100 rounded-xl p-4">
                <p className="text-xs text-blue-700">
                  Add your meta title and description inside the HTML content below using <code>&lt;title&gt;</code> and <code>&lt;meta&gt;</code> tags, or manage them via your hosting provider.
                </p>
              </div>

              {/* Page Content */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-sm font-medium text-foreground">Page Content (HTML)</label>
                  <div className="flex items-center gap-1 text-xs text-muted-foreground bg-gray-50 px-2 py-1 rounded-lg">
                    <CheckCircle2 className="w-3 h-3 text-emerald-500" />
                    HTML supported
                  </div>
                </div>
                <textarea
                  value={editForm.content}
                  onChange={e => updateField('content', e.target.value)}
                  rows={20}
                  className="w-full px-4 py-3 rounded-xl bg-gray-50 border border-gray-200 text-sm text-foreground font-mono focus:outline-none focus:border-primary/50 focus:ring-2 focus:ring-primary/10 transition-colors resize-none"
                  placeholder="<h2>Page Title</h2><p>Your content here...</p>"
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Use standard HTML tags: &lt;h2&gt;, &lt;h3&gt;, &lt;p&gt;, &lt;a&gt;, &lt;ul&gt;, &lt;li&gt;, &lt;strong&gt;, &lt;em&gt;
                </p>
              </div>

              {/* Live Preview */}
              <div>
                <h3 className="text-sm font-medium text-foreground mb-2">Live Preview</h3>
                <div
                  className="prose prose-sm max-w-none p-4 bg-gray-50 rounded-xl border border-gray-200 text-foreground"
                  dangerouslySetInnerHTML={{ __html: editForm.content }}
                />
              </div>
            </div>
          </div>
        ) : (
          <div className="flex-1 bg-white rounded-2xl border border-gray-100 shadow-sm flex items-center justify-center">
            <div className="text-center">
              <FileText className="w-10 h-10 text-gray-200 mx-auto mb-3" />
              <p className="text-base font-semibold text-foreground">Select a page to edit</p>
              <p className="text-sm text-muted-foreground mt-1">Choose from the list on the left</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
