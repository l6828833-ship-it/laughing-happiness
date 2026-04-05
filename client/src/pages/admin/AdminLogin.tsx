// AdminLogin — Quizoi Admin
// Simple password-based login for static deployment
import { useState } from 'react';
import { useLocation } from 'wouter';
import { Brain, Lock, Eye, EyeOff } from 'lucide-react';
import { adminLogin } from '@/lib/api';

export default function AdminLogin() {
  const [, navigate] = useLocation();
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setTimeout(() => {
      const ok = adminLogin(password);
      if (ok) {
        navigate('/admin/dashboard');
      } else {
        setError('Incorrect password. Please try again.');
        setLoading(false);
      }
    }, 600);
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="w-full max-w-sm">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 bg-primary rounded-2xl mb-4 shadow-sm">
            <Brain className="w-7 h-7 text-white" />
          </div>
          <h1 className="font-display text-2xl font-bold text-foreground">Quizoi Admin</h1>
          <p className="text-sm text-muted-foreground mt-1">Sign in to manage your platform</p>
        </div>

        {/* Card */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-foreground mb-1.5">
                <Lock className="inline w-3.5 h-3.5 mr-1.5 text-muted-foreground" />
                Admin Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="Enter admin password"
                  required
                  autoFocus
                  className="w-full px-4 py-2.5 pr-10 rounded-xl bg-gray-50 border border-gray-200 text-foreground text-sm focus:outline-none focus:border-primary/50 focus:ring-2 focus:ring-primary/10 transition-colors"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {error && (
              <div className="px-4 py-2.5 bg-rose-50 border border-rose-100 rounded-xl text-sm text-rose-700">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading || !password}
              className="w-full py-2.5 bg-primary text-white font-display font-bold rounded-xl hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-sm"
            >
              {loading ? 'Signing in...' : 'Sign In'}
            </button>
          </form>

          <div className="mt-4 pt-4 border-t border-gray-100 text-center">
            <a href="/" className="text-xs text-muted-foreground hover:text-primary transition-colors">
              ← Back to Quizoi
            </a>
          </div>
        </div>

        <p className="text-center text-xs text-muted-foreground mt-4">
          Default password: <code className="bg-gray-100 px-1.5 py-0.5 rounded text-foreground">quizoi2026</code>
        </p>
      </div>
    </div>
  );
}
