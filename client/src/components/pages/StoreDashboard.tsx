import { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { apiRequest } from '@/context/AuthContext';
import { Store, User, Package, ShoppingCart, TrendingUp, DollarSign } from 'lucide-react';

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
  userCount: number;
}

export default function StoreDashboard() {
  const { auth } = useAuth();
  const [store, setStore] = useState<StoreData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (auth.user?.storeId) {
      apiRequest<{ status: string; data: StoreData }>(`/stores/${auth.user.storeId}`)
        .then((res) => setStore(res.data))
        .catch(() => {})
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, [auth.user?.storeId]);

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

  if (loading) {
    return <div className="text-center py-12 text-muted-foreground">Loading dashboard...</div>;
  }

  const statsCards = [
    { label: 'Total Products', value: '—', icon: Package, color: 'from-blue-500 to-cyan-500' },
    { label: 'Today Sales', value: '₹0', icon: ShoppingCart, color: 'from-emerald-500 to-teal-500' },
    { label: 'Monthly Revenue', value: '₹0', icon: TrendingUp, color: 'from-violet-500 to-purple-500' },
    { label: 'Pending Orders', value: '0', icon: DollarSign, color: 'from-amber-500 to-orange-500' },
  ];

  return (
    <div className="animate-[fadeIn_0.4s_ease-out] space-y-6">
      {/* Welcome */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">
            Welcome back, {auth.user?.firstName || 'User'}
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            {store?.name || 'Store'} &middot; {roleLabel}
          </p>
        </div>
      </div>

      {/* Store info card */}
      {store && (
        <div className="rounded-xl border bg-card p-5">
          <div className="flex items-center gap-3 mb-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
              <Store size={20} className="text-primary" />
            </div>
            <div>
              <h2 className="text-base font-semibold text-foreground">{store.name}</h2>
              <p className="text-xs text-muted-foreground">{store.code}</p>
            </div>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            {store.city && (
              <div>
                <p className="text-xs text-muted-foreground">City</p>
                <p className="text-foreground font-medium">{store.city}</p>
              </div>
            )}
            {store.state && (
              <div>
                <p className="text-xs text-muted-foreground">State</p>
                <p className="text-foreground font-medium">{store.state}</p>
              </div>
            )}
            {store.phone && (
              <div>
                <p className="text-xs text-muted-foreground">Phone</p>
                <p className="text-foreground font-medium">{store.phone}</p>
              </div>
            )}
            {store.email && (
              <div>
                <p className="text-xs text-muted-foreground">Email</p>
                <p className="text-foreground font-medium">{store.email}</p>
              </div>
            )}
            {store.gstin && (
              <div>
                <p className="text-xs text-muted-foreground">GSTIN</p>
                <p className="text-foreground font-medium">{store.gstin}</p>
              </div>
            )}
            <div>
              <p className="text-xs text-muted-foreground">Users</p>
              <p className="text-foreground font-medium">{store.userCount}</p>
            </div>
          </div>
        </div>
      )}

      {/* Stats cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {statsCards.map((card) => (
          <div key={card.label} className="rounded-xl border bg-card p-5">
            <div className="flex items-center justify-between mb-3">
              <p className="text-sm font-medium text-muted-foreground">{card.label}</p>
              <div className={`flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br ${card.color} shadow-lg`}>
                <card.icon size={16} className="text-white" />
              </div>
            </div>
            <p className="text-2xl font-bold text-foreground">{card.value}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
