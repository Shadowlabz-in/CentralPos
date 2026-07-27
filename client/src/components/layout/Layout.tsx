import { ReactNode, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Store, BookOpen, LogOut, User, Shield } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

const ROLE_LABELS: Record<string, string> = {
  SUPER_ADMIN: 'Super Admin',
  ADMIN: 'Admin',
  MANAGER: 'Manager',
  CASHIER: 'Cashier',
  INVENTORY_MANAGER: 'Inventory Manager',
};

function roleLabel(roles?: string[]): string {
  if (!roles || roles.length === 0) return 'User';
  const labels = roles.map((r) => ROLE_LABELS[r] || r);
  return labels.join(', ');
}

interface LayoutProps {
  children: ReactNode;
}

const tabs = [
  { label: 'Catalogue', path: '/catalogue', icon: BookOpen },
];

export function Layout({ children }: LayoutProps) {
  const location = useLocation();
  const navigate = useNavigate();
  const { auth, logout } = useAuth();
  const [profileOpen, setProfileOpen] = useState(false);

  const activeTab = tabs.find((t) => location.pathname.startsWith(t.path));

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-gray-950">
      {/* Topbar */}
      <header className="fixed top-0 left-0 right-0 z-50">
        <div className="absolute inset-0 bg-gray-950/80 backdrop-blur-xl border-b border-white/5" />
        <div className="relative flex items-center h-16 px-4 max-w-7xl mx-auto">
          {/* Logo */}
          <button
            onClick={() => {
              window.location.href = '/';
            }}
            className="flex items-center gap-2.5 group"
          >
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 shadow-lg shadow-indigo-500/20 group-hover:shadow-indigo-500/30 transition-shadow">
              <Store size={16} className="text-white" />
            </div>
            <span className="text-base font-bold text-white tracking-tight">Central One</span>
          </button>

          {/* Animated tabs */}
          <div className="flex items-center gap-1">
            {tabs.map((tab) => {
              const isActive = location.pathname.startsWith(tab.path);
              return (
                <button
                  key={tab.path}
                  onClick={() => navigate(tab.path)}
                  className={`relative flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300 ${
                    isActive
                      ? 'text-white'
                      : 'text-gray-500 hover:text-gray-300'
                  }`}
                >
                  {isActive && (
                    <span className="absolute inset-0 rounded-lg bg-indigo-500/10 border border-indigo-500/20 animate-[fadeIn_0.2s_ease-out]" />
                  )}
                  <tab.icon size={16} className="relative" />
                  <span className="relative">{tab.label}</span>
                </button>
              );
            })}
          </div>

          {/* Spacer */}
          <div className="flex-1" />

          {/* Profile */}
          <div className="relative">
            <button
              onClick={() => setProfileOpen(!profileOpen)}
              className="flex items-center gap-2.5 px-3 py-1.5 rounded-lg hover:bg-white/5 transition-colors"
            >
              <div className="flex h-7 w-7 items-center justify-center rounded-full bg-gradient-to-br from-indigo-500 to-purple-600">
                <User size={13} className="text-white" />
              </div>
              <span className="text-sm font-medium text-gray-300 hidden sm:block">
                {auth.user?.firstName || auth.user?.email?.split('@')[0] || 'User'}
              </span>
            </button>

            {profileOpen && (
              <>
                <div className="fixed inset-0 z-40" onClick={() => setProfileOpen(false)} />
                <div className="absolute right-0 top-full mt-2 w-56 rounded-xl bg-gray-900 border border-white/5 shadow-2xl shadow-black/50 z-50 py-2 animate-[fadeIn_0.15s_ease-out]">
                  <div className="px-4 py-2.5 border-b border-white/5">
                    <p className="text-sm font-medium text-white truncate">{auth.user?.email}</p>
                    <p className="text-xs text-gray-500 mt-0.5">
                      {roleLabel(auth.user?.roles)}
                    </p>
                  </div>
                  <button
                    onClick={async () => {
                      setProfileOpen(false);
                      await logout();
                      navigate('/login', { replace: true });
                    }}
                    className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-red-400 hover:text-red-300 hover:bg-red-500/5 transition-colors"
                  >
                    <LogOut size={15} />
                    Sign Out
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="pt-16 min-h-screen px-4">
        {children}
      </main>
    </div>
  );
}
