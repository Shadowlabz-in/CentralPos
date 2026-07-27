import { useLocation, useNavigate } from 'react-router-dom';
import { Shield, Users, Store, Settings, LayoutDashboard, LogOut, ArrowLeft, Sun, Moon, MessageSquare, ShieldCheck } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useTheme } from '@/context/ThemeContext';

const navItems = [
  { path: '/admin', label: 'Dashboard', icon: LayoutDashboard },
  { path: '/admin/users', label: 'Users', icon: Users },
  { path: '/admin/roles', label: 'Roles', icon: ShieldCheck },
  { path: '/admin/stores', label: 'Stores', icon: Store },
  { path: '/admin/demo-requests', label: 'Demo Requests', icon: MessageSquare },
  { path: '/admin/settings', label: 'Settings', icon: Settings },
];

export function SuperAdminSidebar() {
  const location = useLocation();
  const navigate = useNavigate();
  const { logout } = useAuth();
  const { theme, toggleTheme } = useTheme();

  return (
    <aside className="fixed left-0 top-0 z-40 flex h-screen w-64 flex-col border-r border-border bg-card">
      <div className="flex items-center gap-3 px-6 py-5 border-b border-border">
        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 shadow-lg shadow-indigo-500/20">
          <Shield size={18} className="text-white" />
        </div>
        <div>
          <p className="text-sm font-bold text-foreground tracking-tight">Super Admin</p>
          <p className="text-[10px] text-muted-foreground font-medium tracking-widest uppercase">Panel</p>
        </div>
      </div>

      <nav className="flex-1 p-3 space-y-1">
        {navItems.map((item) => {
          const active = item.path === '/admin'
            ? location.pathname === '/admin'
            : location.pathname.startsWith(item.path);
          return (
            <button
              key={item.path}
              onClick={() => navigate(item.path)}
              className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition-all ${
                active
                  ? 'bg-primary/10 text-primary border border-primary/20'
                  : 'text-muted-foreground hover:text-foreground hover:bg-accent'
              }`}
            >
              <item.icon size={18} />
              {item.label}
            </button>
          );
        })}
      </nav>

      <div className="p-3 border-t border-border space-y-1">
        <button
          onClick={toggleTheme}
          className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-accent transition-all"
        >
          {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
          {theme === 'dark' ? 'Light Mode' : 'Dark Mode'}
        </button>
        <button
          onClick={() => navigate('/dashboard')}
          className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-accent transition-all"
        >
          <ArrowLeft size={18} />
          Back to App
        </button>
        <button
          onClick={async () => { await logout(); navigate('/login', { replace: true }); }}
          className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium text-red-500 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-500/5 transition-all"
        >
          <LogOut size={18} />
          Sign Out
        </button>
      </div>
    </aside>
  );
}
