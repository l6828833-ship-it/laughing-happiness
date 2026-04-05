// AdminSettings — Quizoi Admin
// Site settings: AdSense config, site info, maintenance mode
import { useState, useEffect } from 'react';
import { Save, Settings, DollarSign, Globe, AlertTriangle, CheckCircle2, Info } from 'lucide-react';
import { adminFetchSettings, adminSaveSettings, type SiteSettings } from '@/lib/api';
import { toast } from 'sonner';

export default function AdminSettings() {
  const [settings, setSettings] = useState<SiteSettings>({
    siteName: 'Quizoi',
    siteDescription: 'Free online quizzes on every topic imaginable.',
    adsensePublisherId: '',
    adsenseAutoAds: false,
    headerCode: '',
    footerCode: '',
    customCss: '',
  });

  useEffect(() => {
    adminFetchSettings().then(s => setSettings(s)).catch(console.error);
  }, []);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState<'general' | 'adsense' | 'advanced'>('general');

  const update = (field: keyof SiteSettings, value: string | boolean) => {
    setSettings(prev => ({ ...prev, [field]: value }));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const updated = await adminSaveSettings(settings);
      setSettings(updated);
      toast.success('Settings saved successfully');
    } catch (e: unknown) {
      toast.error((e as Error).message);
    } finally {
      setSaving(false);
    }
  };

  const tabs = [
    { id: 'general', label: 'General', icon: Globe },
    { id: 'adsense', label: 'AdSense', icon: DollarSign },
    { id: 'advanced', label: 'Advanced', icon: Settings },
  ] as const;

  return (
    <div className="p-6 space-y-6 max-w-3xl">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold text-foreground">Settings</h1>
          <p className="text-sm text-muted-foreground mt-0.5">Configure your Quizoi platform</p>
        </div>
        <button
          onClick={handleSave}
          disabled={saving}
          className="flex items-center gap-2 px-5 py-2.5 bg-primary text-white text-sm font-semibold rounded-xl hover:bg-primary/90 disabled:opacity-50 transition-colors shadow-sm"
        >
          <Save className="w-4 h-4" />
          {saving ? 'Saving...' : 'Save Changes'}
        </button>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-gray-100 p-1 rounded-xl w-fit">
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              activeTab === tab.id
                ? 'bg-white text-foreground shadow-sm'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            <tab.icon className="w-3.5 h-3.5" />
            {tab.label}
          </button>
        ))}
      </div>

      {/* General Settings */}
      {activeTab === 'general' && (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-5">
          <h2 className="font-display text-base font-semibold text-foreground">Site Information</h2>

          <div>
            <label className="block text-sm font-medium text-foreground mb-1.5">Site Name</label>
            <input
              type="text"
              value={settings.siteName}
              onChange={e => update('siteName', e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl bg-gray-50 border border-gray-200 text-sm text-foreground focus:outline-none focus:border-primary/50 focus:ring-2 focus:ring-primary/10 transition-colors"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-1.5">Site Description</label>
            <textarea
              value={settings.siteDescription}
              onChange={e => update('siteDescription', e.target.value)}
              rows={2}
              className="w-full px-4 py-2.5 rounded-xl bg-gray-50 border border-gray-200 text-sm text-foreground focus:outline-none focus:border-primary/50 focus:ring-2 focus:ring-primary/10 transition-colors resize-none"
            />
            <p className="text-xs text-muted-foreground mt-1">Used in meta tags for SEO</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-1.5">Analytics ID (Umami / GA)</label>
            <input
              type="text"
              value={settings.analyticsId}
              onChange={e => update('analyticsId', e.target.value)}
              placeholder="UA-XXXXXXXXX-X or G-XXXXXXXXXX"
              className="w-full px-4 py-2.5 rounded-xl bg-gray-50 border border-gray-200 text-sm text-foreground focus:outline-none focus:border-primary/50 focus:ring-2 focus:ring-primary/10 transition-colors"
            />
          </div>
        </div>
      )}

      {/* AdSense Settings */}
      {activeTab === 'adsense' && (
        <div className="space-y-4">
          {/* Status Banner */}
          <div className={`rounded-2xl border p-4 flex items-start gap-3 ${
            settings.adsensePublisherId
              ? 'bg-emerald-50 border-emerald-100'
              : 'bg-amber-50 border-amber-100'
          }`}>
            {settings.adsensePublisherId
              ? <CheckCircle2 className="w-4 h-4 text-emerald-600 mt-0.5 shrink-0" />
              : <AlertTriangle className="w-4 h-4 text-amber-600 mt-0.5 shrink-0" />
            }
            <div>
              <p className={`text-sm font-semibold ${settings.adsensePublisherId ? 'text-emerald-800' : 'text-amber-800'}`}>
                {settings.adsensePublisherId ? 'AdSense Connected' : 'AdSense Not Configured'}
              </p>
              <p className={`text-xs mt-0.5 ${settings.adsensePublisherId ? 'text-emerald-600' : 'text-amber-600'}`}>
                {settings.adsensePublisherId
                  ? `Publisher ID: ${settings.adsensePublisherId}`
                  : 'Enter your Publisher ID below to enable ads. Ad slots are already placed on all quiz pages.'}
              </p>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-5">
            <h2 className="font-display text-base font-semibold text-foreground">Publisher Configuration</h2>

            <div>
              <label className="block text-sm font-medium text-foreground mb-1.5">AdSense Publisher ID</label>
              <input
                type="text"
                value={settings.adsensePublisherId}
                onChange={e => update('adsensePublisherId', e.target.value)}
                placeholder="ca-pub-XXXXXXXXXXXXXXXX"
                className="w-full px-4 py-2.5 rounded-xl bg-gray-50 border border-gray-200 text-sm text-foreground focus:outline-none focus:border-primary/50 focus:ring-2 focus:ring-primary/10 transition-colors font-mono"
              />
              <p className="text-xs text-muted-foreground mt-1">Found in your AdSense account → Account → Account information</p>
            </div>

            <div className="flex items-center justify-between py-3 border-t border-gray-50">
              <div>
                <p className="text-sm font-medium text-foreground">Auto Ads</p>
                <p className="text-xs text-muted-foreground">Let Google automatically place ads on all pages</p>
              </div>
              <button
                type="button"
                onClick={() => update('adsenseAutoAds', !settings.adsenseAutoAds)}
                className={`relative w-11 h-6 rounded-full transition-colors ${settings.adsenseAutoAds ? 'bg-primary' : 'bg-gray-200'}`}
              >
                <span className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow-sm transition-transform ${settings.adsenseAutoAds ? 'translate-x-5' : 'translate-x-0'}`} />
              </button>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-4">
            <div className="flex items-center gap-2">
              <h2 className="font-display text-base font-semibold text-foreground">Ad Slot IDs</h2>
              <div className="flex items-center gap-1 text-xs text-muted-foreground bg-gray-50 px-2 py-0.5 rounded-full">
                <Info className="w-3 h-3" />
                From AdSense → Ads → By ad unit
              </div>
            </div>

            {[
              { key: 'adSlotLeaderboard', label: 'Leaderboard (728×90)', desc: 'Top of quiz pages' },
              { key: 'adSlotRectangle', label: 'Medium Rectangle (300×250)', desc: 'Sidebar / between questions' },
              { key: 'adSlotLargeRectangle', label: 'Large Rectangle (336×280)', desc: 'Below fact lab content' },
              { key: 'adSlotBanner', label: 'Banner (468×60)', desc: 'Homepage and category pages' },
            ].map(slot => (
              <div key={slot.key}>
                <label className="block text-sm font-medium text-foreground mb-1">
                  {slot.label}
                  <span className="text-xs text-muted-foreground font-normal ml-2">{slot.desc}</span>
                </label>
                <input
                  type="text"
                  value={settings[slot.key as keyof SiteSettings] as string}
                  onChange={e => update(slot.key as keyof SiteSettings, e.target.value)}
                  placeholder="XXXXXXXXXX"
                  className="w-full px-4 py-2.5 rounded-xl bg-gray-50 border border-gray-200 text-sm text-foreground focus:outline-none focus:border-primary/50 focus:ring-2 focus:ring-primary/10 transition-colors font-mono"
                />
              </div>
            ))}
          </div>

          {/* AdSense Compliance Checklist */}
          <div className="bg-blue-50 border border-blue-100 rounded-2xl p-5">
            <h3 className="font-display text-sm font-semibold text-blue-900 mb-3">AdSense Approval Checklist</h3>
            <div className="space-y-2">
              {[
                { label: 'Privacy Policy page', href: '/privacy', done: true },
                { label: 'Terms of Service page', href: '/terms', done: true },
                { label: 'About / Contact page', href: '/about', done: true },
                { label: '150+ words of original content per quiz question', done: true },
                { label: 'No copyrighted images without license', done: true },
                { label: 'Site is publicly accessible (not under maintenance)', done: !settings.maintenanceMode },
                { label: 'Publisher ID configured above', done: !!settings.adsensePublisherId },
              ].map((item, i) => (
                <div key={i} className="flex items-center gap-2">
                  <div className={`w-4 h-4 rounded-full flex items-center justify-center shrink-0 ${item.done ? 'bg-emerald-500' : 'bg-gray-300'}`}>
                    {item.done && <CheckCircle2 className="w-3 h-3 text-white" />}
                  </div>
                  <span className={`text-xs ${item.done ? 'text-blue-800' : 'text-blue-500'}`}>{item.label}</span>
                  {item.href && (
                    <a href={item.href} target="_blank" rel="noopener noreferrer" className="text-xs text-blue-600 hover:underline ml-auto">View →</a>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Advanced Settings */}
      {activeTab === 'advanced' && (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-5">
          <h2 className="font-display text-base font-semibold text-foreground">Advanced Options</h2>

          <div className="flex items-center justify-between py-3 border border-amber-100 bg-amber-50 rounded-xl px-4">
            <div>
              <p className="text-sm font-semibold text-amber-900">Maintenance Mode</p>
              <p className="text-xs text-amber-700 mt-0.5">Disables the site for visitors. AdSense requires the site to be live for approval.</p>
            </div>
            <button
              type="button"
              onClick={() => update('maintenanceMode', !settings.maintenanceMode)}
              className={`relative w-11 h-6 rounded-full transition-colors shrink-0 ml-4 ${settings.maintenanceMode ? 'bg-amber-500' : 'bg-gray-200'}`}
            >
              <span className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow-sm transition-transform ${settings.maintenanceMode ? 'translate-x-5' : 'translate-x-0'}`} />
            </button>
          </div>

          <div className="pt-2 border-t border-gray-50">
            <h3 className="text-sm font-semibold text-foreground mb-3">Data Management</h3>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => {
                  localStorage.removeItem('quizoi_admin_quizzes');
                  localStorage.removeItem('quizoi_admin_categories');
                  localStorage.removeItem('quizoi_admin_settings');
                  toast.success('All admin data reset to defaults');
                  setTimeout(() => window.location.reload(), 1000);
                }}
                className="px-4 py-2 bg-rose-50 text-rose-700 text-sm font-medium rounded-xl hover:bg-rose-100 transition-colors border border-rose-100"
              >
                Reset to Defaults
              </button>
              <button
                onClick={() => {
                  const data = {
                    quizzes: JSON.parse(localStorage.getItem('quizoi_admin_quizzes') || '[]'),
                    categories: JSON.parse(localStorage.getItem('quizoi_admin_categories') || '[]'),
                    settings: JSON.parse(localStorage.getItem('quizoi_admin_settings') || '{}'),
                  };
                  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
                  const url = URL.createObjectURL(blob);
                  const a = document.createElement('a');
                  a.href = url;
                  a.download = `quizoi-backup-${new Date().toISOString().split('T')[0]}.json`;
                  a.click();
                  toast.success('Backup downloaded');
                }}
                className="px-4 py-2 bg-blue-50 text-blue-700 text-sm font-medium rounded-xl hover:bg-blue-100 transition-colors border border-blue-100"
              >
                Export Backup
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
