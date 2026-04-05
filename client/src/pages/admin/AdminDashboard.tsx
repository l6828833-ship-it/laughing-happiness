// AdminDashboard — Quizoi Admin
// Overview: stats cards, traffic chart, top quizzes, recent activity
import { useEffect, useMemo, useState } from 'react';
import { Link } from 'wouter';
import {
  BookOpen, Eye, TrendingUp, DollarSign,
  ArrowUpRight, Plus, BarChart3, Users, Loader2
} from 'lucide-react';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, BarChart, Bar
} from 'recharts';
import { adminFetchQuizzes, adminFetchDailyStats, type Quiz, type DailyStats } from '@/lib/api';

export default function AdminDashboard() {
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [stats,   setStats]   = useState<DailyStats[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([adminFetchQuizzes(), adminFetchDailyStats(30)])
      .then(([q, s]) => { setQuizzes(q); setStats(s); })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const published  = quizzes.filter(q => q.status === 'PUBLISHED').length;
  const drafts     = quizzes.filter(q => q.status === 'DRAFT').length;
  const totalPlays = quizzes.reduce((s, q) => s + q.playCount, 0);

  // Last 14 days for chart
  const chartData = stats.slice(-14).map(d => ({
    date:        d.date.slice(5),
    Sessions:    d.sessions,
    Completions: d.completions,
  }));

  const topQuizzes = [...quizzes]
    .sort((a, b) => b.playCount - a.playCount)
    .slice(0, 5);

  const statCards = [
    {
      label: 'Total Quizzes',
      value: quizzes.length,
      sub: `${published} published · ${drafts} drafts`,
      icon: BookOpen,
      color: 'bg-blue-50 text-blue-600',
      trend: '+2 this week',
    },
    {
      label: 'Total Plays',
      value: totalPlays.toLocaleString(),
      sub: 'All time',
      icon: Users,
      color: 'bg-violet-50 text-violet-600',
      trend: '+12% vs last week',
    },
    {
      label: 'Sessions (30d)',
      value: stats.reduce((s, d) => s + d.sessions, 0).toLocaleString(),
      sub: 'Last 30 days',
      icon: Eye,
      color: 'bg-emerald-50 text-emerald-600',
      trend: 'From analytics',
    },
    {
      label: 'Completions (30d)',
      value: stats.reduce((s, d) => s + d.completions, 0).toLocaleString(),
      sub: 'Quiz completions',
      icon: DollarSign,
      color: 'bg-amber-50 text-amber-600',
      trend: 'Last 30 days',
    },
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
          <h1 className="font-display text-2xl font-bold text-foreground">Dashboard</h1>
          <p className="text-sm text-muted-foreground mt-0.5">Welcome back, Admin</p>
        </div>
        <Link
          href="/admin/quizzes/new"
          className="flex items-center gap-2 px-4 py-2 bg-primary text-white text-sm font-semibold rounded-xl hover:bg-primary/90 transition-colors shadow-sm"
        >
          <Plus className="w-4 h-4" />
          New Quiz
        </Link>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {statCards.map(card => (
          <div key={card.label} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
            <div className="flex items-start justify-between mb-3">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${card.color}`}>
                <card.icon className="w-5 h-5" />
              </div>
              <span className="text-xs text-emerald-600 font-medium flex items-center gap-0.5">
                <ArrowUpRight className="w-3 h-3" />
                {card.trend}
              </span>
            </div>
            <div className="font-display text-2xl font-bold text-foreground">{card.value}</div>
            <div className="text-sm font-medium text-foreground mt-0.5">{card.label}</div>
            <div className="text-xs text-muted-foreground mt-0.5">{card.sub}</div>
          </div>
        ))}
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Traffic Chart */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="font-display text-base font-semibold text-foreground">Traffic (Last 14 Days)</h2>
              <p className="text-xs text-muted-foreground">Pageviews, sessions, and quiz completions</p>
            </div>
            <TrendingUp className="w-4 h-4 text-muted-foreground" />
          </div>
          <ResponsiveContainer width="100%" height={200}>
            <AreaChart data={chartData} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="pvGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.15} />
                  <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="compGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.15} />
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
              <XAxis dataKey="date" tick={{ fontSize: 11, fill: '#9ca3af' }} tickLine={false} axisLine={false} />
              <YAxis tick={{ fontSize: 11, fill: '#9ca3af' }} tickLine={false} axisLine={false} />
              <Tooltip
                contentStyle={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 12, fontSize: 12 }}
                labelStyle={{ fontWeight: 600 }}
              />
              <Area type="monotone" dataKey="Pageviews" stroke="#3b82f6" strokeWidth={2} fill="url(#pvGrad)" />
              <Area type="monotone" dataKey="Completions" stroke="#10b981" strokeWidth={2} fill="url(#compGrad)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Ad Performance */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-display text-base font-semibold text-foreground">Ad Performance</h2>
            <BarChart3 className="w-4 h-4 text-muted-foreground" />
          </div>
          <div className="space-y-4">
            {[
              { label: 'Impressions', value: "—".toLocaleString(), color: 'bg-blue-500' },
              { label: 'Clicks', value: "—".toLocaleString(), color: 'bg-emerald-500' },
              { label: 'CTR', value: `${"—"}%`, color: 'bg-amber-500' },
              { label: 'RPM', value: `$${"—"}`, color: 'bg-violet-500' },
              { label: 'Earnings', value: `$${"—"}`, color: 'bg-rose-500' },
            ].map(item => (
              <div key={item.label} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className={`w-2 h-2 rounded-full ${item.color}`} />
                  <span className="text-sm text-muted-foreground">{item.label}</span>
                </div>
                <span className="text-sm font-semibold text-foreground">{item.value}</span>
              </div>
            ))}
          </div>
          <div className="mt-4 pt-4 border-t border-gray-100">
            <div className="text-xs text-muted-foreground mb-2">Daily earnings (last 7 days)</div>
            <ResponsiveContainer width="100%" height={60}>
              <BarChart data={stats.slice(-7).map(d => ({ date: d.date.slice(8), earn: +(0).toFixed(2) }))}>
                <Bar dataKey="earn" fill="#3b82f6" radius={[3, 3, 0, 0]} />
                <XAxis dataKey="date" tick={{ fontSize: 10, fill: '#9ca3af' }} tickLine={false} axisLine={false} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Top Quizzes */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-display text-base font-semibold text-foreground">Top Quizzes by Plays</h2>
          <Link href="/admin/quizzes" className="text-xs text-primary hover:underline font-medium">View all</Link>
        </div>
        <div className="space-y-3">
          {topQuizzes.map((quiz, idx) => (
            <div key={quiz.id} className="flex items-center gap-4">
              <span className="w-6 text-center text-sm font-bold text-muted-foreground">{idx + 1}</span>
              <div className="flex-1 min-w-0">
                <div className="text-sm font-medium text-foreground truncate">{quiz.title}</div>
                <div className="text-xs text-muted-foreground">{quiz.categoryId} · {quiz.questionCount} questions</div>
              </div>
              <div className="text-right">
                <div className="text-sm font-semibold text-foreground">{quiz.playCount.toLocaleString()}</div>
                <div className="text-xs text-muted-foreground">plays</div>
              </div>
              <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                quiz.status === 'PUBLISHED' ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-700'
              }`}>
                {quiz.status}
              </span>
              <Link href={`/admin/quizzes/${quiz.id}/edit`} className="text-xs text-primary hover:underline">Edit</Link>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
