import { ReactNode, useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard, ShoppingCart, Package, Tags, Users, Boxes, BarChart3,
  Truck, ClipboardList, Database, FileText, Receipt, LogOut, User,
  Store, Sun, Moon, ChevronRight,
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useTheme } from '@/context/ThemeContext';
import { apiRequest } from '@/context/AuthContext';

interface StoreData {
  id: string;
  name: string;
  code: string;
  ownerName?: string;
  city?: string;
  state?: string;
  phone?: string;
  email?: string;
  gstin?: string;
  logo?: string;
}

interface PlanFeature {
  key: string;
  label: string;
  included: boolean;
}

interface PlanData {
  id: string;
  name: string;
  code: string;
  features: PlanFeature[];
}

interface SubscriptionData {
  id: string;
  plan: PlanData;
  status: string;
}

const featureNavMap: Record<string, { path: string; label: string; icon: any }> = {
  pos_billing: { path: '/pos', label: 'POS / Billing', icon: ShoppingCart },
  product_management: { path: '/catalogue', label: 'Products', icon: Package },
  category_brand: { path: '/categories', label: 'Categories & Brands', icon: Tags },
  customer_management: { path: '/customers', label: 'Customers', icon: Users },
  inventory_management: { path: '/inventory', label: 'Inventory', icon: Boxes },
  basic_reports: { path: '/reports', label: 'Reports', icon: BarChart3 },
  supplier_management: { path: '/suppliers', label: 'Suppliers', icon: Truck },
  purchase_management: { path: '/purchases', label: 'Purchases', icon: ClipboardList },
  backup_restore: { path: '/backup', label: 'Backup & Restore', icon: Database },
  invoice_printing: { path: '/invoices', label: 'Invoices', icon: FileText },
  gst_compliance: { path: '/gst', label: 'GST', icon: Receipt },
};

interface StoreDashboardLayoutProps {
  children: ReactNode;
}

function cn(open: boolean, base: string, closed: string) {
  return open ? base : closed;
}

export function StoreDashboardLayout({ children }: StoreDashboardLayoutProps) {
  const location = useLocation();
  const navigate = useNavigate();
  const { auth, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const [store, setStore] = useState<StoreData | null>(null);
  const [subscription, setSubscription] = useState<SubscriptionData | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [profileOpen, setProfileOpen] = useState(false);

  useEffect(() => {
    if (auth.user?.storeId) {
      apiRequest<{ status: string; data: StoreData }>(`/stores/${auth.user.storeId}`)
        .then((res) => setStore(res.data))
        .catch(() => {});
      apiRequest<{ status: string; data: SubscriptionData }>(`/stores/${auth.user.storeId}/subscription`)
        .then((res) => setSubscription(res.data))
        .catch(() => {});
    }
  }, [auth.user?.storeId]);

  const includedFeatures = new Set<string>();
  if (subscription?.plan?.features) {
    for (const f of subscription.plan.features) {
      if (f.included) includedFeatures.add(f.key);
    }
  }

  const navItems = [
    { path: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    ...Object.entries(featureNavMap)
      .filter(([key]) => includedFeatures.has(key))
      .map(([, item]) => item),
  ];

  const roleLabel = (() => {
    if (!auth.user?.roles || auth.user.roles.length === 0) return 'User';
    const labels: Record<string, string> = {
      ADMIN: 'Owner',
      MANAGER: 'Manager',
      CASHIER: 'Cashier',
      INVENTORY_MANAGER: 'Inventory Manager',
      BILLING: 'Billing',
    };
    return auth.user.roles.map((r) => labels[r] || r).join(', ');
  })();

  return (
    <div className="flex min-h-screen bg-background">
      <aside className={`fixed left-0 top-0 z-40 flex h-screen flex-col border-r border-border bg-card transition-all duration-300 ${sidebarOpen ? 'w-64' : 'w-16'}`}>
        <div className={`flex items-center border-b border-border min-h-[65px] ${cn(sidebarOpen, 'gap-3 px-6', 'justify-center px-0')}`}>
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 shadow-lg shadow-indigo-500/20 shrink-0">
            <Store size={18} className="text-white" />
          </div>
          {sidebarOpen && (
            <div className="min-w-0">
              <p className="text-sm font-bold text-foreground tracking-tight truncate">{store?.name || 'Store'}</p>
              {store?.code && <p className="text-[10px] text-muted-foreground font-medium tracking-widest uppercase truncate">{store.code}</p>}
            </div>
          )}
        </div>

        <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
          {navItems.map((item) => {
            const active = item.path === '/dashboard'
              ? location.pathname === '/dashboard'
              : location.pathname.startsWith(item.path);
            return (
              <button
                key={item.path}
                onClick={() => navigate(item.path)}
                className={`w-full flex items-center rounded-xl text-sm font-medium transition-all ${
                  cn(sidebarOpen, 'gap-3 px-4 py-2.5', 'justify-center px-0 py-2.5')
                } ${
                  active
                    ? 'bg-primary/10 text-primary border border-primary/20'
                    : 'text-muted-foreground hover:text-foreground hover:bg-accent'
                }`}
                title={!sidebarOpen ? item.label : undefined}
              >
                <item.icon size={20} className="shrink-0" />
                {sidebarOpen && <span className="truncate">{item.label}</span>}
              </button>
            );
          })}
        </nav>

        <div className="p-3 border-t border-border space-y-1">
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className={`w-full flex items-center rounded-xl text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-accent transition-all ${
              cn(sidebarOpen, 'gap-3 px-4 py-2.5', 'justify-center px-0 py-2.5')
            }`}
            title={!sidebarOpen ? 'Expand' : undefined}
          >
            <ChevronRight size={20} className={`shrink-0 transition-transform duration-200 ${sidebarOpen ? 'rotate-180' : ''}`} />
            {sidebarOpen && 'Collapse'}
          </button>

          <button
            onClick={toggleTheme}
            className={`w-full flex items-center rounded-xl text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-accent transition-all ${
              cn(sidebarOpen, 'gap-3 px-4 py-2.5', 'justify-center px-0 py-2.5')
            }`}
            title={!sidebarOpen ? (theme === 'dark' ? 'Light Mode' : 'Dark Mode') : undefined}
          >
            {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
            {sidebarOpen && (theme === 'dark' ? 'Light Mode' : 'Dark Mode')}
          </button>

          <div className="relative">
            <button
              onClick={() => setProfileOpen(!profileOpen)}
              className={`w-full flex items-center rounded-xl text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-accent transition-all ${
                cn(sidebarOpen, 'gap-3 px-4 py-2.5', 'justify-center px-0 py-2.5')
              }`}
              title={!sidebarOpen ? 'Profile' : undefined}
            >
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 shrink-0">
                <User size={15} className="text-white" />
              </div>
              {sidebarOpen && (
                <div className="text-left min-w-0 flex-1">
                  <p className="text-sm font-medium text-foreground truncate">{auth.user?.firstName || 'User'}</p>
                  <p className="text-[10px] text-muted-foreground truncate">{roleLabel}</p>
                </div>
              )}
            </button>

            {profileOpen && (
              <>
                <div className="fixed inset-0 z-40" onClick={() => setProfileOpen(false)} />
                <div className="absolute bottom-full left-0 right-0 mb-1 mx-2 rounded-xl border border-border bg-card shadow-xl z-50 py-2 animate-[fadeIn_0.15s_ease-out]">
                  <div className="px-4 pb-2 border-b border-border">
                    <p className="text-sm font-medium text-foreground truncate">{auth.user?.firstName} {auth.user?.lastName}</p>
                    <p className="text-xs text-muted-foreground truncate">{auth.user?.email}</p>
                  </div>
                  <div className="px-4 py-2 space-y-1">
                    <p className="text-xs text-muted-foreground">Role: {roleLabel}</p>
                    {store && <p className="text-xs text-muted-foreground">Store: {store.name}</p>}
                    {subscription?.plan && <p className="text-xs text-muted-foreground">Plan: {subscription.plan.name}</p>}
                  </div>
                  <button
                    onClick={async () => {
                      setProfileOpen(false);
                      await logout();
                      navigate('/login', { replace: true });
                    }}
                    className="w-full flex items-center gap-2 px-4 py-2 text-sm text-red-500 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-500/5 transition-colors"
                  >
                    <LogOut size={14} />
                    Sign Out
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </aside>

      <main className={`flex-1 p-8 overflow-auto transition-all duration-300 ${sidebarOpen ? 'ml-64' : 'ml-16'}`}>
        {children}
      </main>
    </div>
  );
}
