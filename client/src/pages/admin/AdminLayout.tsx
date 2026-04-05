// AdminLayout — Quizoi Admin
// Sidebar layout with auth guard — redirects to login if not authenticated
import { useEffect, useState } from 'react';
import { useLocation, Link } from 'wouter';
import {
  Brain, LayoutDashboard, BookOpen, LayoutGrid,
  BarChart3, Settings, LogOut, Menu, X, ExternalLink,
  ChevronRight, FileText, Code2
} from 'lucide-react';
import { isAdminAuthenticated, adminLogout } from '@/lib/api';

const navItems = [
  { href: '/admin/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/admin/quizzes', label: 'Quizzes', icon: BookOpen },
  { href: '/admin/categories', label: 'Categories', icon: LayoutGrid },
  { href: '/admin/analytics', label: 'Analytics', icon: BarChart3 },
  { href: '/admin/pages', label: 'Pages', icon: FileText },
  { href: '/admin/code', label: 'Code Injection', icon: Code2 },
  { href: '/admin/settings', label: 'Settings', icon: Settings },
];

interface AdminLayoutProps {
  children: React.ReactNode;
}

export default function AdminLayout({ children }: AdminLayoutProps) {
  const [, navigate] = useLocation();
  const [location] = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    if (!isAdminAuthenticated()) {
      navigate('/admin/login');
    }
  }, [navigate]);

  const handleLogout = () => {
    adminLogout();
    navigate('/admin/login');
  };

  if (!isAdminAuthenticated()) return null;

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/30 z-20 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`
        fixed inset-y-0 left-0 z-30 w-60 bg-white border-r border-gray-100 flex flex-col
        transform transition-transform duration-300 ease-in-out
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
        lg:translate-x-0 lg:static lg:z-auto
      `}>
        {/* Logo */}
        <div className="h-16 flex items-center px-5 border-b border-gray-100">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
              <Brain className="w-4 h-4 text-white" />
            </div>
            <div>
              <span className="font-display text-sm font-bold text-foreground">Quizoi</span>
              <span className="block text-[10px] text-muted-foreground leading-none">Admin Panel</span>
            </div>
          </div>
          <button
            onClick={() => setSidebarOpen(false)}
            className="ml-auto lg:hidden text-muted-foreground hover:text-foreground"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
          {navItems.map(item => {
            const isActive = location === item.href || location.startsWith(item.href + '/');
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setSidebarOpen(false)}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-150 group ${
                  isActive
                    ? 'bg-primary text-white shadow-sm'
                    : 'text-muted-foreground hover:bg-gray-50 hover:text-foreground'
                }`}
              >
                <item.icon className="w-4 h-4 shrink-0" />
                {item.label}
                {isActive && <ChevronRight className="w-3.5 h-3.5 ml-auto opacity-70" />}
              </Link>
            );
          })}
        </nav>

        {/* Bottom actions */}
        <div className="px-3 py-4 border-t border-gray-100 space-y-0.5">
          <a
            href="/"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-muted-foreground hover:bg-gray-50 hover:text-foreground transition-all duration-150"
          >
            <ExternalLink className="w-4 h-4" />
            View Site
          </a>
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-rose-600 hover:bg-rose-50 transition-all duration-150"
          >
            <LogOut className="w-4 h-4" />
            Sign Out
          </button>
        </div>
      </aside>

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top bar */}
        <header className="h-16 bg-white border-b border-gray-100 flex items-center px-4 lg:px-6 gap-4 sticky top-0 z-10">
          <button
            onClick={() => setSidebarOpen(true)}
            className="lg:hidden text-muted-foreground hover:text-foreground"
          >
            <Menu className="w-5 h-5" />
          </button>
          <div className="flex-1" />
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
              <span className="text-xs font-bold text-primary">A</span>
            </div>
            <span className="text-sm font-medium text-foreground hidden sm:block">Admin</span>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
