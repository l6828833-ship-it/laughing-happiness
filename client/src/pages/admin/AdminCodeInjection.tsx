// AdminCodeInjection — Quizoi Admin
// Manage custom code: header scripts (AdSense, analytics), footer scripts, custom CSS
import { useState, useEffect } from 'react';
import { Save, Code2, AlertTriangle, CheckCircle2, Info, Copy, Check } from 'lucide-react';
import { adminFetchSettings, adminSaveSettings, type SiteSettings } from '@/lib/api';
type CodeInjection = Pick<SiteSettings, 'headerCode' | 'footerCode' | 'customCss'>;
import { toast } from 'sonner';

const ADSENSE_TEMPLATE = `<!-- Google AdSense -->
<script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-XXXXXXXXXXXXXXXX"
     crossorigin="anonymous"></script>`;

const GA4_TEMPLATE = `<!-- Google Analytics 4 -->
<script async src="https://www.googletagmanager.com/gtag/js?id=G-XXXXXXXXXX"></script>
<script>
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());
  gtag('config', 'G-XXXXXXXXXX');
</script>`;

const PREBID_TEMPLATE = `<!-- Prebid.js Header Bidding -->
<script async src="https://cdn.jsdelivr.net/npm/prebid.js@latest/dist/not-for-prod/prebid.js"></script>`;

export default function AdminCodeInjection() {
  const [code, setCode] = useState<CodeInjection>({ headerCode: '', footerCode: '', customCss: '' });

  useEffect(() => {
    adminFetchSettings()
      .then(s => setCode({ headerCode: s.headerCode, footerCode: s.footerCode, customCss: s.customCss }))
      .catch(console.error);
  }, []);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState<'header' | 'footer' | 'css'>('header');
  const [copied, setCopied] = useState<string | null>(null);

  const handleSave = async () => {
    setSaving(true);
    try {
      await adminSaveSettings(code);
      toast.success('Code injection saved');
    } catch (e: unknown) {
      toast.error((e as Error).message);
    } finally {
      setSaving(false);
    }
  };

  const copyTemplate = (template: string, id: string) => {
    navigator.clipboard.writeText(template).then(() => {
      setCopied(id);
      setTimeout(() => setCopied(null), 2000);
    });
  };

  const insertTemplate = (template: string, field: keyof CodeInjection) => {
    setCode(prev => ({
      ...prev,
      [field]: prev[field] ? prev[field] + '\n\n' + template : template,
    }));
    toast.success('Template inserted');
  };

  const tabs = [
    { id: 'header', label: 'Header Code', desc: 'Injected in <head>' },
    { id: 'footer', label: 'Footer Code', desc: 'Before </body>' },
    { id: 'css', label: 'Custom CSS', desc: 'Style overrides' },
  ] as const;

  const templates = [
    { id: 'adsense', label: 'Google AdSense', desc: 'Auto-ads script', code: ADSENSE_TEMPLATE, field: 'headerCode' as const },
    { id: 'ga4', label: 'Google Analytics 4', desc: 'GA4 tracking', code: GA4_TEMPLATE, field: 'headerCode' as const },
    { id: 'prebid', label: 'Prebid.js', desc: 'Header bidding', code: PREBID_TEMPLATE, field: 'headerCode' as const },
  ];

  return (
    <div className="p-4 sm:p-6 space-y-5 max-w-4xl">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold text-foreground">Code Injection</h1>
          <p className="text-sm text-muted-foreground mt-0.5">Add custom scripts, AdSense code, analytics, and CSS overrides</p>
        </div>
        <button
          onClick={handleSave}
          disabled={saving}
          className="flex items-center gap-2 px-5 py-2.5 bg-primary text-white text-sm font-semibold rounded-xl hover:bg-primary/90 disabled:opacity-50 transition-colors shadow-sm"
        >
          <Save className="w-4 h-4" />
          {saving ? 'Saving...' : 'Save Code'}
        </button>
      </div>

      {/* Warning */}
      <div className="bg-amber-50 border border-amber-100 rounded-2xl p-4 flex items-start gap-3">
        <AlertTriangle className="w-4 h-4 text-amber-600 mt-0.5 shrink-0" />
        <div>
          <p className="text-sm font-semibold text-amber-800">Handle with care</p>
          <p className="text-xs text-amber-700 mt-0.5">
            Code entered here runs on every page. Malformed scripts can break the site. Always test in a staging environment first.
            Code is saved to localStorage and applied on page load via a React effect.
          </p>
        </div>
      </div>

      {/* Quick Templates */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
        <div className="flex items-center gap-2 mb-4">
          <h2 className="font-display text-base font-semibold text-foreground">Quick Templates</h2>
          <div className="flex items-center gap-1 text-xs text-muted-foreground bg-gray-50 px-2 py-1 rounded-lg">
            <Info className="w-3 h-3" />
            Click to insert into header
          </div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {templates.map(t => (
            <div key={t.id} className="border border-gray-100 rounded-xl p-3 hover:border-gray-200 transition-colors">
              <div className="flex items-start justify-between gap-2 mb-2">
                <div>
                  <p className="text-sm font-semibold text-foreground">{t.label}</p>
                  <p className="text-xs text-muted-foreground">{t.desc}</p>
                </div>
                <button
                  onClick={() => copyTemplate(t.code, t.id)}
                  className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-gray-100 transition-colors shrink-0"
                  title="Copy to clipboard"
                >
                  {copied === t.id ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                </button>
              </div>
              <pre className="text-[10px] text-muted-foreground bg-gray-50 rounded-lg p-2 overflow-hidden line-clamp-3 font-mono leading-relaxed">
                {t.code}
              </pre>
              <button
                onClick={() => insertTemplate(t.code, t.field)}
                className="mt-2 w-full py-1.5 text-xs font-medium text-primary bg-primary/5 rounded-lg hover:bg-primary/10 transition-colors"
              >
                + Insert into Header
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Code Editors */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        {/* Tabs */}
        <div className="flex border-b border-gray-100">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex-1 flex flex-col items-center py-3 px-4 transition-colors border-b-2 ${
                activeTab === tab.id
                  ? 'border-primary text-primary bg-primary/5'
                  : 'border-transparent text-muted-foreground hover:text-foreground hover:bg-gray-50'
              }`}
            >
              <span className="text-sm font-semibold">{tab.label}</span>
              <span className="text-xs opacity-70">{tab.desc}</span>
            </button>
          ))}
        </div>

        {/* Editor */}
        <div className="p-5">
          {activeTab === 'header' && (
            <div>
              <div className="flex items-center gap-2 mb-3">
                <Code2 className="w-4 h-4 text-muted-foreground" />
                <p className="text-sm text-muted-foreground">
                  This code is injected into the <code className="bg-gray-100 px-1 rounded text-xs">&lt;head&gt;</code> of every page.
                  Ideal for AdSense auto-ads, Google Analytics, and Prebid.js.
                </p>
              </div>
              <textarea
                value={code.headerCode}
                onChange={e => setCode(prev => ({ ...prev, headerCode: e.target.value }))}
                rows={14}
                placeholder={`<!-- Paste your header scripts here -->\n<!-- Example: Google AdSense auto-ads -->\n<script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-XXXXXXXXXXXXXXXX"\n     crossorigin="anonymous"></script>`}
                className="w-full px-4 py-3 rounded-xl bg-gray-950 border border-gray-800 text-sm text-emerald-300 font-mono focus:outline-none focus:border-primary/50 transition-colors resize-none"
                spellCheck={false}
              />
              <div className="flex items-center gap-2 mt-2">
                {code.headerCode ? (
                  <span className="flex items-center gap-1 text-xs text-emerald-600">
                    <CheckCircle2 className="w-3 h-3" />
                    {code.headerCode.split('\n').length} lines of header code active
                  </span>
                ) : (
                  <span className="text-xs text-muted-foreground">No header code configured</span>
                )}
              </div>
            </div>
          )}

          {activeTab === 'footer' && (
            <div>
              <div className="flex items-center gap-2 mb-3">
                <Code2 className="w-4 h-4 text-muted-foreground" />
                <p className="text-sm text-muted-foreground">
                  Injected before <code className="bg-gray-100 px-1 rounded text-xs">&lt;/body&gt;</code> on every page.
                  Ideal for chat widgets, retargeting pixels, and deferred scripts.
                </p>
              </div>
              <textarea
                value={code.footerCode}
                onChange={e => setCode(prev => ({ ...prev, footerCode: e.target.value }))}
                rows={14}
                placeholder={`<!-- Paste your footer scripts here -->\n<!-- Example: Facebook Pixel -->\n<script>\n  !function(f,b,e,v,n,t,s){...}(window, document,'script',\n  'https://connect.facebook.net/en_US/fbevents.js');\n  fbq('init', 'YOUR_PIXEL_ID');\n  fbq('track', 'PageView');\n</script>`}
                className="w-full px-4 py-3 rounded-xl bg-gray-950 border border-gray-800 text-sm text-emerald-300 font-mono focus:outline-none focus:border-primary/50 transition-colors resize-none"
                spellCheck={false}
              />
              <div className="flex items-center gap-2 mt-2">
                {code.footerCode ? (
                  <span className="flex items-center gap-1 text-xs text-emerald-600">
                    <CheckCircle2 className="w-3 h-3" />
                    {code.footerCode.split('\n').length} lines of footer code active
                  </span>
                ) : (
                  <span className="text-xs text-muted-foreground">No footer code configured</span>
                )}
              </div>
            </div>
          )}

          {activeTab === 'css' && (
            <div>
              <div className="flex items-center gap-2 mb-3">
                <Code2 className="w-4 h-4 text-muted-foreground" />
                <p className="text-sm text-muted-foreground">
                  Custom CSS applied globally. Overrides the default styles. Use sparingly.
                </p>
              </div>
              <textarea
                value={code.customCss}
                onChange={e => setCode(prev => ({ ...prev, customCss: e.target.value }))}
                rows={14}
                placeholder={`/* Custom CSS overrides */\n\n/* Example: hide ad labels */\n.ad-label { display: none; }\n\n/* Example: custom font size */\nbody { font-size: 16px; }`}
                className="w-full px-4 py-3 rounded-xl bg-gray-950 border border-gray-800 text-sm text-blue-300 font-mono focus:outline-none focus:border-primary/50 transition-colors resize-none"
                spellCheck={false}
              />
              <div className="flex items-center gap-2 mt-2">
                {code.customCss ? (
                  <span className="flex items-center gap-1 text-xs text-emerald-600">
                    <CheckCircle2 className="w-3 h-3" />
                    {code.customCss.split('\n').length} lines of custom CSS active
                  </span>
                ) : (
                  <span className="text-xs text-muted-foreground">No custom CSS configured</span>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* How it works */}
      <div className="bg-blue-50 border border-blue-100 rounded-2xl p-4">
        <h3 className="text-sm font-semibold text-blue-900 mb-2">How Code Injection Works</h3>
        <div className="space-y-1.5">
          {[
            'Code is saved to localStorage and applied on every page load',
            'Header code is injected into <head> via a React effect on app mount',
            'Footer code is injected at the end of <body> similarly',
            'Custom CSS is injected as a <style> tag in <head>',
            'To remove code, clear the field and click Save',
          ].map((item, i) => (
            <div key={i} className="flex items-start gap-2">
              <span className="w-4 h-4 rounded-full bg-blue-200 text-blue-700 text-[10px] font-bold flex items-center justify-center shrink-0 mt-0.5">{i + 1}</span>
              <p className="text-xs text-blue-700">{item}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
