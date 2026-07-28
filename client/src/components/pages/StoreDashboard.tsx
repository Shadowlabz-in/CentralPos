import { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { apiRequest } from '@/context/AuthContext';
import { Store, User, Package, ShoppingCart, TrendingUp, DollarSign, ToggleLeft, ToggleRight } from 'lucide-react';

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

interface UserData {
  id: string;
  firstName: string;
  lastName?: string;
  email: string;
  phone?: string;
  isActive: boolean;
  roles: string[];
  store?: { id: string; name: string; code: string } | null;
}

const roleLabels: Record<string, string> = {
  ADMIN: 'Owner',
  MANAGER: 'Manager',
  CASHIER: 'Cashier',
  INVENTORY_MANAGER: 'Inventory Manager',
  BILLING: 'Billing',
};

export default function StoreDashboard() {
  const { auth } = useAuth();
  const [store, setStore] = useState<StoreData | null>(null);
  const [users, setUsers] = useState<UserData[]>([]);
  const [loading, setLoading] = useState(true);
  const [toggling, setToggling] = useState<string | null>(null);

  const isOwner = auth.user?.roles?.includes('ADMIN') ?? false;

  const fetchData = () => {
    if (!auth.user?.storeId) { setLoading(false); return; }
    setLoading(true);
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 8000);
    Promise.all([
      apiRequest<{ status: string; data: StoreData }>(`/stores/${auth.user.storeId}`, { signal: controller.signal }),
      apiRequest<{ status: string; data: UserData[] }>(`/users?storeId=${auth.user.storeId}`, { signal: controller.signal }),
    ])
      .then(([storeRes, usersRes]) => {
        setStore(storeRes.data);
        setUsers(usersRes.data);
      })
      .catch(() => {})
      .finally(() => { clearTimeout(timeoutId); setLoading(false); });
  };

  useEffect(() => { fetchData(); }, [auth.user?.storeId]);

  async function toggleUserActive(user: UserData) {
    if (toggling) return;
    setToggling(user.id);
    try {
      await apiRequest(`/users/${user.id}`, {
        method: 'PATCH',
        body: JSON.stringify({ isActive: !user.isActive }),
      });
      setUsers((prev) => prev.map((u) => (u.id === user.id ? { ...u, isActive: !u.isActive } : u)));
    } catch {}
    finally { setToggling(null); }
  }

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

      {/* Users section */}
      {store && isOwner && (
        <div className="rounded-xl border bg-card p-5">
          <div className="flex items-center gap-3 mb-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
              <User size={20} className="text-primary" />
            </div>
            <div>
              <h2 className="text-base font-semibold text-foreground">Staff Users</h2>
              <p className="text-xs text-muted-foreground">{users.length} user{users.length !== 1 ? 's' : ''} in this store</p>
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left py-2 px-3 text-muted-foreground font-medium">Name</th>
                  <th className="text-left py-2 px-3 text-muted-foreground font-medium">Email</th>
                  <th className="text-left py-2 px-3 text-muted-foreground font-medium">Role</th>
                  <th className="text-center py-2 px-3 text-muted-foreground font-medium">Active</th>
                </tr>
              </thead>
              <tbody>
                {users.length === 0 && (
                  <tr><td colSpan={4} className="py-8 text-center text-muted-foreground">No staff users found</td></tr>
                )}
                {users.map((user) => {
                  const roleName = user.roles?.[0] || '';
                  const isToggling = toggling === user.id;
                  const isSelf = user.id === auth.user?.id;
                  return (
                    <tr key={user.id} className="border-b border-border hover:bg-accent/50 transition-colors">
                      <td className="py-2.5 px-3">
                        <div className="flex items-center gap-2">
                          <div className="flex h-7 w-7 items-center justify-center rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 shrink-0">
                            <span className="text-[10px] text-white font-bold">
                              {(user.firstName?.[0] || '').toUpperCase()}
                            </span>
                          </div>
                          <span className="font-medium text-foreground">
                            {user.firstName} {user.lastName || ''}
                            {isSelf && <span className="text-xs text-muted-foreground ml-1">(you)</span>}
                          </span>
                        </div>
                      </td>
                      <td className="py-2.5 px-3 text-muted-foreground">{user.email}</td>
                      <td className="py-2.5 px-3">
                        <span className="inline-flex items-center rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-medium text-primary">
                          {roleLabels[roleName] || roleName || '—'}
                        </span>
                      </td>
                      <td className="py-2.5 px-3 text-center">
                        <button
                          onClick={() => toggleUserActive(user)}
                          disabled={isToggling || isSelf}
                          className={`inline-flex items-center gap-1.5 text-xs font-medium transition-colors ${
                            isSelf
                              ? 'text-muted-foreground cursor-not-allowed'
                              : user.isActive
                                ? 'text-emerald-500 hover:text-emerald-600'
                                : 'text-red-400 hover:text-red-500'
                          } ${isToggling ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
                          title={isSelf ? 'Cannot deactivate yourself' : user.isActive ? 'Deactivate user' : 'Activate user'}
                        >
                          {isToggling ? (
                            <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                          ) : user.isActive ? (
                            <ToggleRight size={18} />
                          ) : (
                            <ToggleLeft size={18} />
                          )}
                          {user.isActive ? 'Active' : 'Inactive'}
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
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
