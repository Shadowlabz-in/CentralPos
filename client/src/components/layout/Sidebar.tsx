import { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  Store,
  LayoutDashboard,
  ShoppingCart,
  Package,
  Tags,
  Tag,
  BookOpen,
  ClipboardList,
  History,
  ChevronDown,
  ChevronRight,
  LogOut,
  Barcode,
  Undo2,
  Users,
  ShieldAlert,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/context/AuthContext';

const ALLOW_ALL = '__ALL__';

interface MenuItem {
  icon: JSX.Element;
  label: string;
  path: string;
  permission?: string;
}

const inventorySubItems: MenuItem[] = [
  {
    icon: <LayoutDashboard size={18} />,
    label: 'Dashboard',
    path: '/inventory/dashboard',
    permission: 'dashboard:view',
  },
  {
    icon: <Tags size={18} />,
    label: 'Categories',
    path: '/inventory/categories',
    permission: 'category:view',
  },
  { icon: <Tag size={18} />, label: 'Brands', path: '/inventory/brands', permission: 'brand:view' },
  {
    icon: <BookOpen size={18} />,
    label: 'Products',
    path: '/inventory/products',
    permission: 'product:view',
  },
  {
    icon: <ClipboardList size={18} />,
    label: 'Inventory List',
    path: '/inventory',
    permission: 'inventory:view',
  },
  {
    icon: <History size={18} />,
    label: 'Stock History',
    path: '/inventory/history',
    permission: 'inventory:history:view',
  },
  {
    icon: <Barcode size={18} />,
    label: 'Add Barcoded Stock',
    path: '/inventory/add-stock-barcode',
    permission: 'inventory:stock:add',
  },
  {
    icon: <Undo2 size={18} />,
    label: 'Return Scan',
    path: '/inventory/returns/scan',
    permission: 'pos:return',
  },
];

const inventoryPaths = inventorySubItems.map((i) => i.path);

function isActive(path: string, current: string) {
  if (path === '/inventory') return current === '/inventory' && !current.startsWith('/inventory/');
  return current.startsWith(path);
}

function filterItems(items: MenuItem[], hasPermission: (perm: string) => boolean): MenuItem[] {
  return items.filter((item) => !item.permission || hasPermission(item.permission));
}

export function Sidebar() {
  const location = useLocation();
  const navigate = useNavigate();
  const { logout, hasPermission, hasRole } = useAuth();
  const [invOpen, setInvOpen] = useState(
    inventoryPaths.some((p) => location.pathname.startsWith(p)),
  );

  const handleLogout = async () => {
    await logout();
    navigate('/login', { replace: true });
  };

  const visibleInventoryItems = filterItems(inventorySubItems, hasPermission);

  return (
    <aside className="fixed left-0 top-0 z-40 flex h-screen w-64 flex-col border-r bg-card">
      <div className="flex items-center gap-2 border-b px-6 py-5">
        <Store className="h-6 w-6 text-primary" />
        <span className="text-xl font-bold tracking-tight">Kapda POS</span>
      </div>

      <nav className="flex-1 space-y-1 overflow-y-auto p-4">
        {hasPermission('dashboard:view') && (
          <Button
            variant={location.pathname === '/' ? 'default' : 'ghost'}
            className="w-full justify-start gap-3"
            onClick={() => navigate('/')}
          >
            <LayoutDashboard size={20} />
            <span>Dashboard</span>
          </Button>
        )}

        {hasPermission('pos:access') && (
          <Button
            variant={location.pathname === '/pos' ? 'default' : 'ghost'}
            className="w-full justify-start gap-3"
            onClick={() => navigate('/pos')}
          >
            <ShoppingCart size={20} />
            <span>POS Billing</span>
          </Button>
        )}

        {visibleInventoryItems.length > 0 && (
          <div className="pt-2">
            <Button
              variant={
                inventoryPaths.some((p) => location.pathname.startsWith(p)) ? 'default' : 'ghost'
              }
              className="w-full justify-between gap-3"
              onClick={() => {
                setInvOpen(!invOpen);
                if (!invOpen) navigate('/inventory');
              }}
            >
              <span className="flex items-center gap-3">
                <Package size={20} />
                <span>Inventory</span>
              </span>
              {invOpen ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
            </Button>

            {invOpen && (
              <div className="ml-2 mt-1 space-y-0.5 border-l pl-2">
                {visibleInventoryItems.map((item) => (
                  <Button
                    key={item.label}
                    variant={isActive(item.path, location.pathname) ? 'default' : 'ghost'}
                    size="sm"
                    className="w-full justify-start gap-3"
                    onClick={() => navigate(item.path)}
                  >
                    {item.icon}
                    <span>{item.label}</span>
                  </Button>
                ))}
              </div>
            )}
          </div>
        )}

        {(hasPermission('user:view') ||
          hasPermission('settings:view') ||
          hasPermission('system:audit:log')) && (
          <div className="pt-2">
            <p className="px-3 text-xs font-medium text-gray-400 uppercase tracking-wider pb-1">
              Administration
            </p>
            {hasPermission('user:view') && (
              <Button
                variant={location.pathname === '/users' ? 'default' : 'ghost'}
                className="w-full justify-start gap-3"
                onClick={() => navigate('/users')}
              >
                <Users size={20} />
                <span>Users</span>
              </Button>
            )}
          </div>
        )}
      </nav>

      <div className="border-t p-4 space-y-1">
        <div className="text-xs text-gray-400 px-2 pb-1 truncate">
          {hasRole('ADMIN') && 'Admin'}
          {hasRole('MANAGER') && !hasRole('ADMIN') && 'Manager'}
          {hasRole('CASHIER') && !hasRole('ADMIN') && !hasRole('MANAGER') && 'Cashier'}
          {hasRole('INVENTORY_MANAGER') &&
            !hasRole('ADMIN') &&
            !hasRole('MANAGER') &&
            'Inventory Manager'}
        </div>
        <Button
          variant="ghost"
          className="w-full justify-start gap-3 text-muted-foreground"
          onClick={handleLogout}
        >
          <LogOut size={20} />
          <span>Sign Out</span>
        </Button>
      </div>
    </aside>
  );
}
