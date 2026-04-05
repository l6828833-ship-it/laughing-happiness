// AdminAnalytics — Quizoi Admin
// Full analytics: traffic trends, quiz performance, completion rates, ad revenue
import { useEffect, useState } from 'react';
import { TrendingUp, Users, Target, BarChart3, Loader2 } from 'lucide-react';
import {
  AreaChart, Area, BarChart, Bar, LineChart, Line,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from 'recharts';
import { adminFetchDailyStats, adminFetchCompletionRates, adminFetchQuizzes, type Quiz, type DailyStats, type CompletionRate } from '@/lib/api';

export default function AdminAnalytics() {
  const [period, setPeriod] = useState<7 | 14 | 30>(30);
  const [rawStats, setRawStats]   = useState<DailyStats[]>([]);
  const [rates,    setRates]      = useState<CompletionRate[]>([]);
  const [quizzes,  setQuizzes]    = useState<Quiz[]>([]);
  const [loading,  setLoading]    = useState(true);

  useEffect(() => {
    Promise.all([
      adminFetchDailyStats(30),
      adminFetchCompletionRates(),
      adminFetchQuizzes(),
    ])
      .then(([s, r, q]) => { setRawStats(s); setRates(r); setQuizzes(q); })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const data = rawStats.slice(-period);

  const totals = data.reduce(
    (acc: { sessions: number; completions: number }, d: DailyStats) => ({
      sessions:    acc.sessions    + d.sessions,
      completions: acc.completions + d.completions,
    }),
    { sessions: 0, completions: 0 }
  );

  const completionRate = totals.sessions > 0
    ? ((totals.completions / totals.sessions) * 100).toFixed(1)
    : '0';

  const chartData = data.map((d: DailyStats) => ({
    date:        d.date.slice(5),
    Sessions:    d.sessions,
    Completions: d.completions,
  }));

  const topQuizzes = [...quizzes]
    .sort((a, b) => b.playCount - a.playCount)
    .slice(0, 8)
    .map(q => ({ name: q.title.slice(0, 28) + (q.title.length > 28 ? '...' : ''), plays: q.playCount }));

  const statCards = [
    { label: 'Sessions',        value: totals.sessions.toLocaleString(),    icon: Users,      color: 'text-blue-600 bg-blue-50',    change: '' },
    { label: 'Completions',     value: totals.completions.toLocaleString(), icon: Target,     color: 'text-emerald-600 bg-emerald-50', change: '' },
    { label: 'Completion Rate', value: `${completionRate}%`,                icon: TrendingUp, color: 'text-amber-600 bg-amber-50',  change: '' },
    { label: 'Total Quizzes',   value: quizzes.length.toString(),           icon: BarChart3,  color: 'text-rose-600 bg-rose-50',    change: '' },
  ];

  if (loading) {
    return (
      <div className="p-6 flex items-center justify-center min-h-[300px]">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold text-foreground">Analytics</h1>
          <p className="text-sm text-muted-foreground mt-0.5">Platform performance overview</p>
        </div>
        <div className="flex gap-1 bg-gray-100 p-1 rounded-xl">
          {([7, 14, 30] as const).map(p => (
            <button
              key={p}
              onClick={() => setPeriod(p)}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                period === p ? 'bg-white text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              {p}d
            </button>
          ))}
        </div>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-3">
        {statCards.map(card => (
          <div key={card.label} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
            <div className={`w-8 h-8 rounded-lg flex items-center justify-center mb-3 ${card.color}`}>
              <card.icon className="w-4 h-4" />
            </div>
            <div className="font-display text-xl font-bold text-foreground">{card.value}</div>
            <div className="text-xs text-muted-foreground mt-0.5">{card.label}</div>
            <div className="text-xs text-emerald-600 font-medium mt-1">{card.change} vs prev</div>
          </div>
        ))}
      </div>

      {/* Traffic Chart */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
        <h2 className="font-display text-base font-semibold text-foreground mb-4">Traffic Overview</h2>
        <ResponsiveContainer width="100%" height={240}>
          <AreaChart data={chartData} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id="pvG" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.15} />
                <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="sessG" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.15} />
                <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
            <XAxis dataKey="date" tick={{ fontSize: 11, fill: '#9ca3af' }} tickLine={false} axisLine={false} />
            <YAxis tick={{ fontSize: 11, fill: '#9ca3af' }} tickLine={false} axisLine={false} />
            <Tooltip contentStyle={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 12, fontSize: 12 }} />
            <Legend wrapperStyle={{ fontSize: 12 }} />
            <Area type="monotone" dataKey="Pageviews" stroke="#3b82f6" strokeWidth={2} fill="url(#pvG)" />
            <Area type="monotone" dataKey="Sessions" stroke="#8b5cf6" strokeWidth={2} fill="url(#sessG)" />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Two column charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Quiz Engagement */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
          <h2 className="font-display text-base font-semibold text-foreground mb-4">Quiz Engagement</h2>
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={chartData} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
              <XAxis dataKey="date" tick={{ fontSize: 11, fill: '#9ca3af' }} tickLine={false} axisLine={false} />
              <YAxis tick={{ fontSize: 11, fill: '#9ca3af' }} tickLine={false} axisLine={false} />
              <Tooltip contentStyle={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 12, fontSize: 12 }} />
              <Legend wrapperStyle={{ fontSize: 12 }} />
              <Line type="monotone" dataKey="Quiz Starts" stroke="#f59e0b" strokeWidth={2} dot={false} />
              <Line type="monotone" dataKey="Completions" stroke="#10b981" strokeWidth={2} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Ad Revenue */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
          <h2 className="font-display text-base font-semibold text-foreground mb-4">Daily Ad Earnings ($)</h2>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={chartData} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
              <XAxis dataKey="date" tick={{ fontSize: 11, fill: '#9ca3af' }} tickLine={false} axisLine={false} />
              <YAxis tick={{ fontSize: 11, fill: '#9ca3af' }} tickLine={false} axisLine={false} />
              <Tooltip contentStyle={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 12, fontSize: 12 }} />
              <Bar dataKey="Earnings" fill="#3b82f6" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Top Quizzes Bar Chart */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
        <h2 className="font-display text-base font-semibold text-foreground mb-4">Top Quizzes by Plays</h2>
        <ResponsiveContainer width="100%" height={220}>
          <BarChart data={topQuizzes} layout="vertical" margin={{ top: 0, right: 20, left: 0, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" horizontal={false} />
            <XAxis type="number" tick={{ fontSize: 11, fill: '#9ca3af' }} tickLine={false} axisLine={false} />
            <YAxis type="category" dataKey="name" tick={{ fontSize: 11, fill: '#6b7280' }} tickLine={false} axisLine={false} width={160} />
            <Tooltip contentStyle={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 12, fontSize: 12 }} />
            <Bar dataKey="plays" fill="#3b82f6" radius={[0, 4, 4, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
