import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { apiRequest } from '@/context/AuthContext';
import CataloguePage from '@/components/pages/CataloguePage';
import { Button } from '@/components/ui/button';
import { Dialog } from '@/components/ui/Dialog';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { Badge } from '@/components/ui/Badge';
import { Pagination } from '@/components/ui/Pagination';
import {
  ArrowLeft, Store, MapPin, Phone, Mail, Globe, User, Hash,
  FileText, Calendar, Building2, Clock, CreditCard, Package,
  Settings, Users, ShieldCheck, Power, PowerOff, Plus, Pencil,
  Trash2, Lock, Eye, EyeOff, ChevronDown,
  Printer, Barcode, Percent, DollarSign, Image, Check, X,
  AlertTriangle, Receipt,
} from 'lucide-react';

interface StoreData {
  id: string;
  name: string;
  code: string;
  ownerId: string | null;
  owner: { id: string; firstName: string; lastName: string; email: string } | null;
  ownerName: string | null;
  panNumber: string | null;
  address: string | null;
  city: string | null;
  state: string | null;
  pincode: string | null;
  phone: string | null;
  email: string | null;
  website: string | null;
  gstin: string | null;
  logo: string | null;
  currency: string;
  timezone: string;
  language: string;
  financialYear: string | null;
  isActive: boolean;
  userCount: number;
  createdAt: string;
  updatedAt: string;
}

interface UserData {
  id: string;
  email: string;
  firstName: string;
  lastName: string | null;
  phone: string | null;
  isActive: boolean;
  storeId: string | null;
  store: { id: string; name: string; code: string } | null;
  roles: string[];
  customPermissions?: string[];
  createdAt: string;
};

const tabs = [
  { id: 'info', label: 'Info', icon: Store },
  { id: 'address', label: 'Address', icon: MapPin },
  { id: 'subscription', label: 'Subscription', icon: CreditCard },
  { id: 'users', label: 'Users', icon: Users },
  { id: 'catalogue', label: 'Catalogue', icon: Package },
  { id: 'settings', label: 'Settings', icon: Settings },
];

const roleOptions = [
  { value: 'ADMIN', label: 'Owner' },
  { value: 'MANAGER', label: 'Manager' },
  { value: 'CASHIER', label: 'Cashier' },
  { value: 'INVENTORY_MANAGER', label: 'Inventory Manager' },
  { value: 'BILLING', label: 'Billing' },
];

const roleBadgeVariants: Record<string, 'default' | 'success' | 'danger' | 'warning' | 'info'> = {
  ADMIN: 'info',
  MANAGER: 'warning',
  CASHIER: 'success',
  INVENTORY_MANAGER: 'default',
  BILLING: 'default',
};

export default function StoreDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [store, setStore] = useState<StoreData | null>(null);
  const [activeTab, setActiveTab] = useState('info');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [editOpen, setEditOpen] = useState(false);
  const [form, setForm] = useState<any>({});
  const [submitting, setSubmitting] = useState(false);

  const [users, setUsers] = useState<UserData[]>([]);
  const [usersMeta, setUsersMeta] = useState({ total: 0, page: 1, limit: 20, totalPages: 0 });
  const [usersSearch, setUsersSearch] = useState('');
  const [usersLoading, setUsersLoading] = useState(false);

  const [userFormOpen, setUserFormOpen] = useState(false);
  const [userEditOpen, setUserEditOpen] = useState(false);
  const [userDeleteOpen, setUserDeleteOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<UserData | null>(null);
  const [userForm, setUserForm] = useState({
    firstName: '', lastName: '', email: '', password: '', role: 'CASHIER',
  });
  const [userSubmitting, setUserSubmitting] = useState(false);
  const [addUserKey, setAddUserKey] = useState(0);

  const [subscription, setSubscription] = useState<any>(null);
  const [plans, setPlans] = useState<any[]>([]);
  const [subLoading, setSubLoading] = useState(false);
  const [subEditOpen, setSubEditOpen] = useState(false);
  const [selectedPlanId, setSelectedPlanId] = useState('');

  const [catBrandLoading, setCatBrandLoading] = useState(false);

  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});

  const fetchStore = useCallback(async () => {
    if (!id) return;
    setLoading(true);
    setError('');
    try {
      const res = await apiRequest<{ status: string; data: StoreData }>(`/stores/${id}`);
      setStore(res.data);
    } catch (err: any) {
      setError(err.message || 'Failed to load store');
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchStore();
  }, [fetchStore]);

  const fetchUsers = useCallback(async (page: number, searchTerm: string) => {
    if (!id) return;
    setUsersLoading(true);
    try {
      const params = new URLSearchParams({ page: String(page), limit: '20', storeId: id });
      if (searchTerm) params.append('search', searchTerm);
      const res = await apiRequest<{ status: string; data: UserData[]; meta: any }>(`/users?${params}`);
      setUsers(res.data);
      setUsersMeta(res.meta);
    } catch {
      // silent
    } finally {
      setUsersLoading(false);
    }
  }, [id]);

  const fetchSubscription = useCallback(async () => {
    if (!id) return;
    setSubLoading(true);
    try {
      const [subRes, plansRes] = await Promise.all([
        apiRequest<{ status: string; data: any }>(`/stores/${id}/subscription`),
        fetch('/api/plans').then((r) => r.json()),
      ]);
      setSubscription(subRes.data);
      setPlans(plansRes.data || []);
    } catch {
      // silent
    } finally {
      setSubLoading(false);
    }
  }, [id]);

  useEffect(() => {
    if (activeTab === 'users') fetchUsers(1, '');
    if (activeTab === 'subscription') fetchSubscription();
  }, [activeTab, fetchUsers]);

  const openEdit = () => {
    if (!store) return;
    setForm({
      name: store.name,
      code: store.code,
      ownerId: store.ownerId || '',
      ownerName: store.ownerName || '',
      address: store.address || '',
      city: store.city || '',
      state: store.state || '',
      pincode: store.pincode || '',
      phone: store.phone || '',
      email: store.email || '',
      website: store.website || '',
      gstin: store.gstin || '',
      panNumber: store.panNumber || '',
      currency: store.currency,
      timezone: store.timezone,
      financialYear: store.financialYear || '',
    });
    setEditOpen(true);
  };

  const handleEdit = async () => {
    if (!store) return;
    setSubmitting(true);
    setError('');
    try {
      const body: any = {
        name: form.name,
        code: form.code,
        ownerId: form.ownerId || null,
        ownerName: form.ownerName || null,
        address: form.address || null,
        city: form.city || null,
        state: form.state || null,
        pincode: form.pincode || null,
        phone: form.phone || null,
        email: form.email || null,
        website: form.website || null,
        gstin: form.gstin || null,
        panNumber: form.panNumber || null,
        currency: form.currency,
        timezone: form.timezone,
        financialYear: form.financialYear || null,
      };
      await apiRequest(`/stores/${store.id}`, {
        method: 'PATCH',
        body: JSON.stringify(body),
      });
      setEditOpen(false);
      fetchStore();
    } catch (err: any) {
      setError(err.message || 'Failed to update store');
    } finally {
      setSubmitting(false);
    }
  };

  const validateUserForm = (isCreate: boolean) => {
    const errors: Record<string, string> = {};
    if (!userForm.firstName.trim()) errors.firstName = 'First name is required';
    if (!userForm.email.trim()) errors.email = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(userForm.email)) errors.email = 'Invalid email format';
    if (isCreate && !userForm.password) errors.password = 'Password is required';
    else if (userForm.password && userForm.password.length < 6) errors.password = 'Password must be at least 6 characters';
    if (!userForm.role) errors.role = 'Role is required';
    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const openCreateUser = () => {
    setUserForm({ firstName: '', lastName: '', email: '', password: '', role: '' });
    setValidationErrors({});
    setAddUserKey((k) => k + 1);
    setUserFormOpen(true);
  };

  const openEditUser = (user: UserData) => {
    setSelectedUser(user);
    setUserForm({
      firstName: user.firstName,
      lastName: user.lastName || '',
      email: user.email,
      password: '',
      role: user.roles[0] || 'CASHIER',
    });
    setValidationErrors({});
    setUserEditOpen(true);
  };

  const openDeleteUser = (user: UserData) => {
    setSelectedUser(user);
    setUserDeleteOpen(true);
  };

  const handleCreateUser = async () => {
    if (!validateUserForm(true)) return;
    setUserSubmitting(true);
    try {
      await apiRequest('/users', {
        method: 'POST',
        body: JSON.stringify({
          firstName: userForm.firstName,
          lastName: userForm.lastName || undefined,
          email: userForm.email,
          password: userForm.password,
          role: userForm.role,
          storeId: id,
        }),
      });
      setUserFormOpen(false);
      setUserForm({ firstName: '', lastName: '', email: '', password: '', role: '' });
      setValidationErrors({});
      fetchUsers(usersMeta.page, usersSearch);
    } catch (err: any) {
      setError(err.message || 'Failed to create user');
    } finally {
      setUserSubmitting(false);
    }
  };

  const handleEditUser = async () => {
    if (!selectedUser || !validateUserForm(false)) return;
    setUserSubmitting(true);
    try {
      const body: any = {
        firstName: userForm.firstName,
        lastName: userForm.lastName || undefined,
        email: userForm.email,
        role: userForm.role,
        storeId: id,
      };
      if (userForm.password) body.password = userForm.password;
      await apiRequest(`/users/${selectedUser.id}`, {
        method: 'PATCH',
        body: JSON.stringify(body),
      });
      setUserEditOpen(false);
      setSelectedUser(null);
      fetchUsers(usersMeta.page, usersSearch);
    } catch (err: any) {
      setError(err.message || 'Failed to update user');
    } finally {
      setUserSubmitting(false);
    }
  };

  const handleDeleteUser = async () => {
    if (!selectedUser) return;
    setUserSubmitting(true);
    try {
      await apiRequest(`/users/${selectedUser.id}`, { method: 'DELETE' });
      setUserDeleteOpen(false);
      setSelectedUser(null);
      fetchUsers(usersMeta.page, usersSearch);
    } catch (err: any) {
      setError(err.message || 'Failed to delete user');
    } finally {
      setUserSubmitting(false);
    }
  };

  const toggleUserActive = async (user: UserData) => {
    try {
      await apiRequest(`/users/${user.id}`, {
        method: 'PATCH',
        body: JSON.stringify({ isActive: !user.isActive }),
      });
      fetchUsers(usersMeta.page, usersSearch);
    } catch (err: any) {
      setError(err.message || 'Failed to toggle user status');
    }
  };

  const handleSetSubscription = async () => {
    if (!selectedPlanId) return;
    setSubmitting(true);
    try {
      await apiRequest(`/stores/${id}/subscription`, {
        method: 'POST',
        body: JSON.stringify({ planId: selectedPlanId }),
      });
      setSubEditOpen(false);
      fetchSubscription();
    } catch (err: any) {
      setError(err.message || 'Failed to update subscription');
    } finally {
      setSubmitting(false);
    }
  };

  const handleRemoveSubscription = async () => {
    try {
      await apiRequest(`/stores/${id}/subscription`, { method: 'DELETE' });
      fetchSubscription();
    } catch (err: any) {
      setError(err.message || 'Failed to remove subscription');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="h-8 w-8 rounded-full border-2 border-primary border-t-transparent animate-spin" />
      </div>
    );
  }

  if (error && !store) {
    return (
      <div className="text-center py-16">
        <p className="text-destructive mb-4">{error}</p>
        <Button variant="outline" onClick={() => navigate('/admin/stores')}>
          <ArrowLeft size={16} className="mr-1.5" /> Back to Stores
        </Button>
      </div>
    );
  }

  if (!store) return null;

  const TabIcon = tabs.find((t) => t.id === activeTab)?.icon || Store;

  return (
    <div className="animate-[fadeIn_0.4s_ease-out]">
      <div className="flex items-center gap-3 mb-6">
        <button
          onClick={() => navigate('/admin/stores')}
          className="p-2 rounded-xl hover:bg-accent text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft size={20} />
        </button>
        <div className="flex items-center gap-3 flex-1">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
            <Store size={22} className="text-primary" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold text-foreground">{store.name}</h1>
              <span className="text-xs font-mono text-muted-foreground bg-muted px-1.5 py-0.5 rounded">{store.code}</span>
              <Badge variant={store.isActive ? 'success' : 'danger'}>
                {store.isActive ? 'Active' : 'Inactive'}
              </Badge>
            </div>
            <p className="text-sm text-muted-foreground mt-0.5">{store.city}{store.city && store.state ? ', ' : ''}{store.state}</p>
          </div>
        </div>
        <Button onClick={openEdit} variant="outline" size="sm">
          <Pencil size={14} className="mr-1.5" /> Edit Store
        </Button>
      </div>

      {error && (
        <div className="rounded-lg bg-destructive/10 border border-destructive/30 px-4 py-3 text-sm text-destructive mb-6">
          {error}
        </div>
      )}

      <div className="border-b mb-6">
        <nav className="flex gap-1 overflow-x-auto">
          {tabs.map((tab) => {
            const TabIconNav = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-all whitespace-nowrap ${
                  isActive
                    ? 'border-primary text-primary'
                    : 'border-transparent text-muted-foreground hover:text-foreground hover:border-muted-foreground/30'
                }`}
              >
                <TabIconNav size={16} />
                {tab.label}
              </button>
            );
          })}
        </nav>
      </div>

      {activeTab === 'info' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <InfoCard icon={Hash} label="Store Code" value={store.code} />
          <InfoCard icon={User} label="Owner" value={store.owner ? `${store.owner.firstName} ${store.owner.lastName || ''}` : '-'} />
          <InfoCard icon={FileText} label="GSTIN" value={store.gstin || '-'} />
          <InfoCard icon={FileText} label="PAN" value={store.panNumber || '-'} />
          <InfoCard icon={DollarSign} label="Currency" value={store.currency} />
          <InfoCard icon={Clock} label="Timezone" value={store.timezone} />
          <InfoCard icon={Calendar} label="Financial Year" value={store.financialYear || '-'} />
          <InfoCard icon={Building2} label="Users" value={String(store.userCount)} />
          <InfoCard icon={Calendar} label="Created" value={new Date(store.createdAt).toLocaleDateString()} />
        </div>
      )}

      {activeTab === 'address' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <InfoCard icon={MapPin} label="Address" value={store.address || '-'} span />
          <InfoCard icon={MapPin} label="City" value={store.city || '-'} />
          <InfoCard icon={MapPin} label="State" value={store.state || '-'} />
          <InfoCard icon={Hash} label="Pincode" value={store.pincode || '-'} />
          <InfoCard icon={Phone} label="Phone" value={store.phone || '-'} />
          <InfoCard icon={Mail} label="Email" value={store.email || '-'} />
          <InfoCard icon={Globe} label="Website" value={store.website || '-'} />
        </div>
      )}

      {activeTab === 'subscription' && (
        <SubscriptionTabContent
          store={store}
          subscription={subscription}
          plans={plans}
          loading={subLoading}
          onRefresh={fetchSubscription}
          onEdit={() => {
            setSelectedPlanId(subscription?.planId || plans.find((p) => p.code === 'essentials')?.id || '');
            setSubEditOpen(true);
          }}
          onRemove={handleRemoveSubscription}
        />
      )}

      {activeTab === 'users' && (
        <UsersTabContent
          storeId={id!}
          users={users}
          meta={usersMeta}
          loading={usersLoading}
          search={usersSearch}
          onSearch={(val) => { setUsersSearch(val); fetchUsers(1, val); }}
          onPageChange={(page) => fetchUsers(page, usersSearch)}
          onCreate={openCreateUser}
          onEdit={openEditUser}
          onDelete={openDeleteUser}
          onToggleActive={toggleUserActive}
        />
      )}

      {activeTab === 'catalogue' && <CataloguePage />}

      {activeTab === 'settings' && (
        <SettingsTabContent store={store} />
      )}

      <Dialog open={editOpen} onClose={() => setEditOpen(false)} title="Edit Store" size="xl">
        <StoreEditForm form={form} onChange={setForm} />
        <div className="flex justify-end gap-3 mt-8 pt-5 border-t">
          <Button variant="outline" onClick={() => setEditOpen(false)}>Cancel</Button>
          <Button onClick={handleEdit} disabled={submitting}>
            {submitting ? 'Saving...' : 'Save Changes'}
          </Button>
        </div>
      </Dialog>

      <Dialog key={addUserKey} open={userFormOpen} onClose={() => { setUserFormOpen(false); setUserForm({ firstName: '', lastName: '', email: '', password: '', role: '' }); setValidationErrors({}); }} title="Add User to Store" size="lg">
        <div className="space-y-5">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-sm font-semibold text-foreground">First Name <span className="text-destructive">*</span></label>
              <input value={userForm.firstName} onChange={(e) => setUserForm({ ...userForm, firstName: e.target.value })}
                className="w-full rounded-xl border border-input bg-background px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-ring"
                placeholder="John" />
              {validationErrors.firstName && <p className="text-xs text-destructive">{validationErrors.firstName}</p>}
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-semibold text-foreground">Last Name</label>
              <input value={userForm.lastName} onChange={(e) => setUserForm({ ...userForm, lastName: e.target.value })}
                className="w-full rounded-xl border border-input bg-background px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-ring"
                placeholder="Doe" />
            </div>
          </div>
          <div className="space-y-1.5">
            <label className="text-sm font-semibold text-foreground">Email <span className="text-destructive">*</span></label>
            <input type="email" autoComplete="off" value={userForm.email} onChange={(e) => setUserForm({ ...userForm, email: e.target.value })}
              className="w-full rounded-xl border border-input bg-background px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-ring"
              placeholder="user@example.com" />
            {validationErrors.email && <p className="text-xs text-destructive">{validationErrors.email}</p>}
          </div>
          <div className="space-y-1.5">
            <label className="text-sm font-semibold text-foreground">
              Password <span className="text-destructive">*</span>
            </label>
            <input type="password" autoComplete="new-password" value={userForm.password} onChange={(e) => setUserForm({ ...userForm, password: e.target.value })}
              className="w-full rounded-xl border border-input bg-background px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-ring"
              placeholder="Min 6 characters" />
            {validationErrors.password && <p className="text-xs text-destructive">{validationErrors.password}</p>}
          </div>
          <div className="space-y-1.5">
            <label className="text-sm font-semibold text-foreground">Role</label>
            <div className="relative">
              <select value={userForm.role} onChange={(e) => setUserForm({ ...userForm, role: e.target.value })}
                className="w-full appearance-none rounded-xl border border-input bg-background px-4 py-3 pr-10 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring">
                <option value="" disabled>Select a role</option>
                {roleOptions.map((opt) => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
              <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                <ChevronDown size={16} className="text-muted-foreground/60" />
              </div>
            </div>
          </div>
          <div className="text-xs bg-muted rounded-lg px-3 py-2 text-muted-foreground flex items-center gap-1.5">
            <Building2 size={12} />
            This user will be assigned to <strong className="text-foreground">{store?.name}</strong> automatically.
          </div>
        </div>
        <div className="flex justify-end gap-3 mt-8 pt-5 border-t">
          <Button variant="outline" onClick={() => { setUserFormOpen(false); setUserForm({ firstName: '', lastName: '', email: '', password: '', role: '' }); setValidationErrors({}); }}>Cancel</Button>
          <Button onClick={handleCreateUser} disabled={userSubmitting}>
            {userSubmitting ? 'Creating...' : 'Create User'}
          </Button>
        </div>
      </Dialog>

      <Dialog open={userEditOpen} onClose={() => setUserEditOpen(false)} title="Edit User" size="lg">
        <div className="space-y-5">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-sm font-semibold text-foreground">First Name <span className="text-destructive">*</span></label>
              <input value={userForm.firstName} onChange={(e) => setUserForm({ ...userForm, firstName: e.target.value })}
                className="w-full rounded-xl border border-input bg-background px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-ring"
                placeholder="John" />
              {validationErrors.firstName && <p className="text-xs text-destructive">{validationErrors.firstName}</p>}
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-semibold text-foreground">Last Name</label>
              <input value={userForm.lastName} onChange={(e) => setUserForm({ ...userForm, lastName: e.target.value })}
                className="w-full rounded-xl border border-input bg-background px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-ring"
                placeholder="Doe" />
            </div>
          </div>
          <div className="space-y-1.5">
            <label className="text-sm font-semibold text-foreground">Email <span className="text-destructive">*</span></label>
            <input type="email" autoComplete="off" value={userForm.email} onChange={(e) => setUserForm({ ...userForm, email: e.target.value })}
              className="w-full rounded-xl border border-input bg-background px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-ring"
              placeholder="user@example.com" />
            {validationErrors.email && <p className="text-xs text-destructive">{validationErrors.email}</p>}
          </div>
          <div className="space-y-1.5">
            <label className="text-sm font-semibold text-foreground">
              Password
              <span className="text-xs text-muted-foreground font-normal ml-1">(leave blank to keep current)</span>
            </label>
            <input type="password" autoComplete="new-password" value={userForm.password} onChange={(e) => setUserForm({ ...userForm, password: e.target.value })}
              className="w-full rounded-xl border border-input bg-background px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-ring"
              placeholder="New password (optional)" />
            {validationErrors.password && <p className="text-xs text-destructive">{validationErrors.password}</p>}
          </div>
          <div className="space-y-1.5">
            <label className="text-sm font-semibold text-foreground">Role</label>
            <div className="relative">
              <select value={userForm.role} onChange={(e) => setUserForm({ ...userForm, role: e.target.value })}
                className="w-full appearance-none rounded-xl border border-input bg-background px-4 py-3 pr-10 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring">
                <option value="" disabled>Select a role</option>
                {roleOptions.map((opt) => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
              <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                <ChevronDown size={16} className="text-muted-foreground/60" />
              </div>
            </div>
          </div>
        </div>
        <div className="flex justify-end gap-3 mt-8 pt-5 border-t">
          <Button variant="outline" onClick={() => setUserEditOpen(false)}>Cancel</Button>
          <Button onClick={handleEditUser} disabled={userSubmitting}>
            {userSubmitting ? 'Saving...' : 'Save Changes'}
          </Button>
        </div>
      </Dialog>

      <ConfirmDialog
        open={userDeleteOpen}
        onClose={() => setUserDeleteOpen(false)}
        onConfirm={handleDeleteUser}
        title="Delete User"
        message={`Are you sure you want to delete ${selectedUser?.firstName} ${selectedUser?.lastName}? This action cannot be undone.`}
        confirmLabel="Delete"
        variant="danger"
        loading={userSubmitting}
      />

      <Dialog open={subEditOpen} onClose={() => setSubEditOpen(false)} title="Change Subscription Plan" size="md">
        <div className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Select a plan for <strong className="text-foreground">{store.name}</strong>.
          </p>
          <div className="space-y-2">
            {plans.map((plan) => {
              const isCurrent = subscription?.planId === plan.id;
              let priceLabel = 'Free';
              if (plan.price > 0 && plan.billingPeriod === 'one-time') {
                priceLabel = `₹${plan.price.toLocaleString('en-IN')} one-time`;
              } else if (plan.yearlyPrice) {
                priceLabel = `₹${plan.yearlyPrice.toLocaleString('en-IN')}/year`;
              } else if (plan.price > 0) {
                priceLabel = `₹${plan.price.toLocaleString('en-IN')}/mo`;
              }
              return (
                <label
                  key={plan.id}
                  className={`flex items-center gap-3 rounded-xl border p-4 cursor-pointer transition-all ${
                    selectedPlanId === plan.id
                      ? 'border-primary bg-primary/5'
                      : 'border-border hover:bg-accent'
                  }`}
                >
                  <input
                    type="radio"
                    name="plan"
                    value={plan.id}
                    checked={selectedPlanId === plan.id}
                    onChange={(e) => setSelectedPlanId(e.target.value)}
                    className="h-4 w-4 text-primary"
                  />
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-semibold text-foreground">{plan.name}</span>
                      <span className="text-sm font-medium text-foreground">{priceLabel}</span>
                    </div>
                    <p className="text-xs text-muted-foreground mt-0.5">{plan.description}</p>
                  </div>
                  {isCurrent && (
                    <Badge variant="info">Current</Badge>
                  )}
                </label>
              );
            })}
          </div>
        </div>
        <div className="flex justify-end gap-3 mt-8 pt-5 border-t">
          <Button variant="outline" onClick={() => setSubEditOpen(false)}>Cancel</Button>
          <Button onClick={handleSetSubscription} disabled={submitting || !selectedPlanId}>
            {submitting ? 'Saving...' : 'Update Plan'}
          </Button>
        </div>
      </Dialog>
    </div>
  );
}

function InfoCard({
  icon: Icon, label, value, span,
}: {
  icon: any; label: string; value: string; span?: boolean;
}) {
  return (
    <div className={`rounded-xl border bg-card p-4 ${span ? 'md:col-span-2' : ''}`}>
      <div className="flex items-center gap-3">
        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10 shrink-0">
          <Icon size={16} className="text-primary" />
        </div>
        <div className="min-w-0">
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">{label}</p>
          <p className="text-sm font-semibold text-foreground mt-0.5 truncate">{value}</p>
        </div>
      </div>
    </div>
  );
}

function UsersTabContent({
  storeId, users, meta, loading, search, onSearch, onPageChange,
  onCreate, onEdit, onDelete, onToggleActive,
}: {
  storeId: string;
  users: UserData[];
  meta: { total: number; page: number; limit: number; totalPages: number };
  loading: boolean;
  search: string;
  onSearch: (val: string) => void;
  onPageChange: (page: number) => void;
  onCreate: () => void;
  onEdit: (user: UserData) => void;
  onDelete: (user: UserData) => void;
  onToggleActive: (user: UserData) => void;
}) {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">{meta.total} user{meta.total !== 1 ? 's' : ''} in this store</p>
        <Button onClick={onCreate} size="sm">
          <Plus size={14} className="mr-1.5" /> Add User
        </Button>
      </div>

      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <Users size={14} className="text-muted-foreground/60" />
        </div>
        <input
          value={search}
          onChange={(e) => onSearch(e.target.value)}
          placeholder="Search users by name or email..."
          className="w-full rounded-xl border border-input bg-background pl-9 pr-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-ring"
        />
      </div>

      {loading ? (
        <div className="text-center py-8 text-muted-foreground">Loading users...</div>
      ) : users.length === 0 ? (
        <div className="text-center py-12 border rounded-xl bg-card">
          <Users size={32} className="mx-auto text-muted-foreground/40 mb-3" />
          <p className="text-sm text-muted-foreground">No users assigned to this store yet.</p>
          <Button onClick={onCreate} variant="outline" size="sm" className="mt-3">
            <Plus size={14} className="mr-1.5" /> Add First User
          </Button>
        </div>
      ) : (
        <>
          <div className="rounded-xl border overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-muted border-b">
                  <th className="text-left px-4 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wider">User</th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wider">Role</th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wider">Status</th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wider">Joined</th>
                  <th className="text-right px-4 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {users.map((user) => (
                  <tr key={user.id} className="hover:bg-accent transition-colors">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-xs font-semibold text-primary">
                          {user.firstName.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <p className="text-sm font-medium text-foreground">{user.firstName} {user.lastName}</p>
                          <p className="text-xs text-muted-foreground">{user.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <Badge variant={(roleBadgeVariants[user.roles[0]] || 'default') as 'default' | 'success' | 'danger' | 'warning' | 'info'}>
                        {roleOptions.find((r) => r.value === user.roles[0])?.label || user.roles[0]}
                      </Badge>
                    </td>
                    <td className="px-4 py-3">
                      <button
                        onClick={() => onToggleActive(user)}
                        className={`inline-flex items-center gap-1.5 text-xs font-medium ${
                          user.isActive
                            ? 'text-green-600 dark:text-green-400'
                            : 'text-red-600 dark:text-red-400'
                        } hover:underline`}
                      >
                        {user.isActive ? <Power size={12} /> : <PowerOff size={12} />}
                        {user.isActive ? 'Active' : 'Inactive'}
                      </button>
                    </td>
                    <td className="px-4 py-3 text-xs text-muted-foreground">
                      {new Date(user.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button onClick={() => onEdit(user)}
                          className="p-1.5 rounded-lg hover:bg-accent text-muted-foreground hover:text-foreground transition-colors" title="Edit">
                          <Pencil size={14} />
                        </button>
                        <button onClick={() => onDelete(user)}
                          className="p-1.5 rounded-lg hover:bg-accent text-muted-foreground hover:text-red-600 dark:hover:text-red-400 transition-colors" title="Delete">
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <Pagination page={meta.page} totalPages={meta.totalPages} total={meta.total} onPageChange={onPageChange} />
        </>
      )}
    </div>
  );
}


function SettingsTabContent({ store }: { store: StoreData }) {
  const settingsSections = [
    {
      icon: Printer,
      title: 'Invoice Settings',
      description: 'Invoice prefix, numbering format, receipt footer',
      fields: [
        { label: 'Invoice Prefix', value: `${store.code}-INV-` },
        { label: 'Receipt Footer', value: 'Thank you for your business!' },
      ],
    },
    {
      icon: Percent,
      title: 'Tax Settings',
      description: 'Default GST rates, tax registration details',
      fields: [
        { label: 'Default GST', value: store.gstin ? 'Registered (GSTIN available)' : 'Unregistered' },
        { label: 'Tax Type', value: 'GST (India)' },
      ],
    },
    {
      icon: Barcode,
      title: 'Barcode / SKU Settings',
      description: 'Barcode format, SKU prefix, numbering scheme',
      fields: [
        { label: 'SKU Prefix', value: store.code },
        { label: 'Barcode Format', value: 'CODE128' },
      ],
    },
    {
      icon: CreditCard,
      title: 'Payment Methods',
      description: 'Available payment methods for POS billing',
      fields: [
        { label: 'Cash', value: 'Enabled' },
        { label: 'Card', value: 'Enabled' },
        { label: 'UPI', value: 'Enabled' },
      ],
    },
    {
      icon: Clock,
      title: 'Business Hours',
      description: 'Store operating hours and holidays',
      fields: [
        { label: 'Timezone', value: store.timezone },
        { label: 'Financial Year', value: store.financialYear || 'Not set' },
      ],
    },
    {
      icon: Image,
      title: 'Branding',
      description: 'Store logo, receipt header, color theme',
      fields: [
        { label: 'Logo', value: store.logo ? 'Uploaded' : 'Not uploaded' },
        { label: 'Store Name', value: store.name },
      ],
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {settingsSections.map((section) => {
        const SectionIcon = section.icon;
        return (
          <div key={section.title} className="rounded-xl border bg-card p-5">
            <div className="flex items-center gap-2 mb-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10">
                <SectionIcon size={16} className="text-primary" />
              </div>
              <div>
                <h3 className="text-sm font-semibold text-foreground">{section.title}</h3>
                <p className="text-[10px] text-muted-foreground">{section.description}</p>
              </div>
            </div>
            <div className="space-y-2">
              {section.fields.map((field) => (
                <div key={field.label} className="flex items-center justify-between text-xs">
                  <span className="text-muted-foreground">{field.label}</span>
                  <span className="font-medium text-foreground">{field.value}</span>
                </div>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}

function SubscriptionTabContent({
  store, subscription, plans, loading, onRefresh, onEdit, onRemove,
}: {
  store: StoreData;
  subscription: any;
  plans: any[];
  loading: boolean;
  onRefresh: () => void;
  onEdit: () => void;
  onRemove: () => void;
}) {
  const [manageOpen, setManageOpen] = useState(false);
  const [paymentOpen, setPaymentOpen] = useState(false);
  const [paymentForm, setPaymentForm] = useState({ amount: '', date: new Date().toISOString().split('T')[0], method: 'cash', status: 'paid' });
  const [paymentSubmitting, setPaymentSubmitting] = useState(false);
  const [subUsers, setSubUsers] = useState<any[]>([]);
  const [subUsersLoading, setSubUsersLoading] = useState(false);
  const [subError, setSubError] = useState('');

  const essentialsPlanId = plans.find((p) => p.code === 'essentials')?.id;
  const carePlanId = plans.find((p) => p.code === 'care')?.id;

  const payments: { type: string; amount: number; date: string; method: string; status: string }[] = (() => {
    if (!subscription?.notes) return [];
    try { return JSON.parse(subscription.notes).payments || []; } catch { return []; }
  })();

  useEffect(() => {
    if (!store) return;
    setSubUsersLoading(true);
    apiRequest<{ status: string; data: any[] }>(`/users?storeId=${store.id}&limit=100`)
      .then((res) => setSubUsers(res.data || []))
      .catch(() => {})
      .finally(() => setSubUsersLoading(false));
  }, [store]);

  const purchaseDate = subscription?.startDate ? new Date(subscription.startDate) : null;
  const now = new Date();
  const supportEnd = purchaseDate ? new Date(purchaseDate.getTime() + 180 * 24 * 60 * 60 * 1000) : null;
  const totalSupportDays = 180;
  const supportDaysElapsed = purchaseDate ? Math.floor((now.getTime() - purchaseDate.getTime()) / (24 * 60 * 60 * 1000)) : 0;
  const supportDaysRemaining = Math.max(0, totalSupportDays - supportDaysElapsed);
  const supportPercent = Math.min(Math.round((supportDaysElapsed / totalSupportDays) * 100), 100);
  const isSupportExpired = purchaseDate ? now > supportEnd! : false;
  const isNearExpiry = supportEnd && !isSupportExpired && supportDaysRemaining <= 30;

  const isCare = subscription?.plan?.code === 'care';
  const careStart = isCare && subscription?.startDate ? new Date(subscription.startDate) : null;
  const careEnd = isCare && subscription?.endDate ? new Date(subscription.endDate) : null;
  const totalCareDays = 365;
  const careDaysElapsed = careStart ? Math.floor((now.getTime() - careStart.getTime()) / (24 * 60 * 60 * 1000)) : 0;
  const careDaysRemaining = careEnd ? Math.max(0, Math.floor((careEnd.getTime() - now.getTime()) / (24 * 60 * 60 * 1000))) : 0;
  const carePercent = Math.min(Math.round((careDaysElapsed / totalCareDays) * 100), 100);
  const isCareExpired = careEnd ? now > careEnd : false;
  const isCareNearExpiry = careEnd && !isCareExpired && careDaysRemaining <= 30;

  const handleAddPayment = async () => {
    setPaymentSubmitting(true);
    setSubError('');
    try {
      const existing = payments;
      const newPayment = { ...paymentForm, amount: Number(paymentForm.amount), type: isCare ? 'care' : 'essentials' };
      const updated = [...existing, newPayment];
      await apiRequest(`/stores/${store.id}/subscription`, {
        method: 'PATCH',
        body: JSON.stringify({ notes: JSON.stringify({ payments: updated }) }),
      });
      setPaymentOpen(false);
      setPaymentForm({ amount: '', date: new Date().toISOString().split('T')[0], method: 'cash', status: 'paid' });
      onRefresh();
    } catch (e: any) {
      setSubError(e.message || 'Failed to record payment');
    } finally {
      setPaymentSubmitting(false);
    }
  };

  const handleActivate = async (planId: string, paymentAmount: number) => {
    if (!planId) { setSubError('Plan not found. Please refresh and try again.'); return; }
    setPaymentSubmitting(true);
    setSubError('');
    try {
      const newPayment = {
        type: planId === carePlanId ? 'care' : 'essentials',
        amount: paymentAmount,
        date: new Date().toISOString(),
        method: 'cash',
        status: 'paid',
      };
      await apiRequest(`/stores/${store.id}/subscription`, {
        method: 'POST',
        body: JSON.stringify({
          planId,
          notes: JSON.stringify({ payments: [newPayment] }),
          startDate: new Date().toISOString(),
          endDate: planId === carePlanId ? new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString() : undefined,
        }),
      });
      setManageOpen(false);
      onRefresh();
    } catch (e: any) {
      setSubError(e.message || 'Failed to activate plan');
    } finally {
      setPaymentSubmitting(false);
    }
  };

  const formatDate = (d: Date) =>
    d.toLocaleDateString('en-IN', { year: 'numeric', month: 'short', day: 'numeric' });

  if (loading) {
    return <div className="text-center py-12 text-muted-foreground">Loading subscription...</div>;
  }

  const hasSubscription = !!subscription;
  const isEssentials = subscription?.plan?.code === 'essentials' || isCare;

  const statsCards = [
    { label: 'Created', value: store.createdAt ? formatDate(new Date(store.createdAt)) : '—', icon: Calendar },
    { label: 'Updated', value: store.updatedAt ? formatDate(new Date(store.updatedAt)) : '—', icon: Clock },
    { label: 'Users', value: String(subUsers.length), icon: Users },
    { label: 'Products', value: String(subscription?.metrics?.productCount ?? '—'), icon: Package },
  ];

  return (
    <>
      {isNearExpiry && (
        <div className="rounded-xl border border-amber-200 bg-amber-50 dark:border-amber-800 dark:bg-amber-950/30 px-4 py-3 flex items-center gap-2.5 text-sm text-amber-700 dark:text-amber-300 mb-6">
          <AlertTriangle size={16} className="shrink-0" />
          Support expires in <strong>{supportDaysRemaining} days</strong> ({supportEnd ? formatDate(supportEnd) : '—'}). Purchase the Central Care Plan to continue receiving updates and support.
          <Button onClick={() => { setManageOpen(true); }} size="sm" variant="outline" className="ml-auto shrink-0 text-amber-700 border-amber-300 hover:bg-amber-100 dark:text-amber-300 dark:border-amber-700 dark:hover:bg-amber-900/50">
            Activate Care Plan
          </Button>
        </div>
      )}
      {isSupportExpired && !isCare && (
        <div className="rounded-xl border border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-950/30 px-4 py-3 flex items-center gap-2.5 text-sm text-red-700 dark:text-red-300 mb-6">
          <AlertTriangle size={16} className="shrink-0" />
          Your 6-month support period has ended. Activate the Central Care Plan to restore support and updates.
          <Button onClick={() => { setManageOpen(true); }} size="sm" variant="outline" className="ml-auto shrink-0 text-red-700 border-red-300 hover:bg-red-100 dark:text-red-300 dark:border-red-700 dark:hover:bg-red-900/50">
            Activate Care Plan
          </Button>
        </div>
      )}
      {isCareNearExpiry && (
        <div className="rounded-xl border border-amber-200 bg-amber-50 dark:border-amber-800 dark:bg-amber-950/30 px-4 py-3 flex items-center gap-2.5 text-sm text-amber-700 dark:text-amber-300 mb-6">
          <AlertTriangle size={16} className="shrink-0" />
          Central Care Plan expires in <strong>{careDaysRemaining} days</strong> ({careEnd ? formatDate(careEnd) : '—'}). Renew to continue coverage.
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div className="rounded-xl border bg-card p-5">
            <div className="flex items-start justify-between mb-5">
              <div className="flex items-start gap-4">
                <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-emerald-500/10 shrink-0">
                  <Check size={24} className="text-emerald-500" />
                </div>
                <div>
                  <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Plan</p>
                  <h2 className="text-xl font-bold text-foreground mt-1">Business Essentials</h2>
                  <p className="text-sm text-muted-foreground">One-time · ₹15,000 (inclusive of all taxes)</p>
                </div>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                {hasSubscription ? (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium border text-emerald-600 bg-emerald-500/10 border-emerald-500/20 dark:text-emerald-400">
                    Active
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium border text-muted-foreground bg-muted border-border">
                    Inactive
                  </span>
                )}
                <Button onClick={() => setManageOpen(true)} size="sm" variant="outline">
                  {hasSubscription ? 'Manage' : 'Activate'}
                </Button>
              </div>
            </div>

            {purchaseDate && (
              <div className="mb-5">
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-3">Support Timeline</p>
                <div className="flex items-center justify-between text-sm mb-1.5">
                  <span className="text-muted-foreground">Progress</span>
                  <span className="font-medium text-foreground">
                    {isSupportExpired ? '180 / 180 days' : `${Math.min(supportDaysElapsed, 180)} / 180 days`}
                  </span>
                </div>
                <div className="h-3 rounded-full bg-muted overflow-hidden mb-2">
                  <div
                    className={`h-full rounded-full transition-all ${
                      isSupportExpired ? 'bg-red-500' : isNearExpiry ? 'bg-amber-500' : 'bg-emerald-500'
                    }`}
                    style={{ width: `${isSupportExpired ? 100 : supportPercent}%` }}
                  />
                </div>
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <span>Started: {formatDate(purchaseDate)}</span>
                  <span>Ends: {supportEnd ? formatDate(supportEnd) : '—'}</span>
                </div>
              </div>
            )}

            {isSupportExpired && !isCare && (
              <div className="rounded-xl border border-dashed border-red-200 dark:border-red-800 bg-red-50/50 dark:bg-red-950/20 p-4">
                <p className="text-sm font-medium text-red-700 dark:text-red-300 mb-2">Support period ended</p>
                <p className="text-xs text-red-600/70 dark:text-red-400/70 mb-3">
                  Your 6-month support and updates period has ended. Activate the Central Care Plan to continue.
                </p>
                <Button onClick={() => setManageOpen(true)} size="sm">
                  Activate Central Care Plan — ₹5,999/year
                </Button>
              </div>
            )}
          </div>

          <div className="rounded-xl border bg-card p-5">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-500/10">
                  <ShieldCheck size={18} className="text-blue-500" />
                </div>
                <div>
                  <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Add-on</p>
                  <h3 className="text-base font-semibold text-foreground mt-0.5">Central Care Plan</h3>
                </div>
              </div>
              <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium border ${
                isCare && !isCareExpired
                  ? 'text-emerald-600 bg-emerald-500/10 border-emerald-500/20 dark:text-emerald-400'
                  : 'text-muted-foreground bg-muted border-border'
              }`}>
                {isCare && !isCareExpired ? 'Active' : isCareExpired ? 'Expired' : 'Not Active'}
              </span>
            </div>
            <p className="text-sm text-muted-foreground mb-3">₹5,999 / year — Priority support, software updates, GST compliance updates</p>

            {isCare && careStart && careEnd && (
              <div className="mb-3">
                <div className="flex items-center justify-between text-sm mb-1.5">
                  <span className="text-muted-foreground">Plan Timeline</span>
                  <span className="font-medium text-foreground">
                    {isCareExpired ? '365 / 365 days' : `${Math.min(careDaysElapsed, 365)} / 365 days`}
                  </span>
                </div>
                <div className="h-3 rounded-full bg-muted overflow-hidden mb-2">
                  <div
                    className={`h-full rounded-full transition-all ${
                      isCareExpired ? 'bg-red-500' : isCareNearExpiry ? 'bg-amber-500' : 'bg-primary'
                    }`}
                    style={{ width: `${isCareExpired ? 100 : carePercent}%` }}
                  />
                </div>
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <span>Started: {formatDate(careStart)}</span>
                  <span>Expires: {formatDate(careEnd)}</span>
                </div>
              </div>
            )}

            {isCareExpired && (
              <p className="text-xs text-red-600 dark:text-red-400 italic mt-2">
                Care Plan has expired. Renew to continue coverage.
              </p>
            )}

            {!isCare && purchaseDate && !isSupportExpired && (
              <p className="text-xs text-muted-foreground italic">
                Available for purchase after {supportEnd ? formatDate(supportEnd) : '6 months'} when your initial support period ends.
              </p>
            )}

            {!purchaseDate && (
              <p className="text-xs text-muted-foreground italic">
                Purchase Business Essentials first to unlock the Central Care Plan.
              </p>
            )}
          </div>

          <div className="rounded-xl border bg-card p-5">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Receipt size={16} className="text-muted-foreground" />
                <p className="text-sm font-semibold text-foreground">Payment History</p>
              </div>
              <Button onClick={() => { setPaymentOpen(true); setSubError(''); }} size="sm" variant="outline">
                <Plus size={14} className="mr-1" /> Add Payment
              </Button>
            </div>
            {payments.length === 0 ? (
              <p className="text-xs text-muted-foreground text-center py-4">No payments recorded yet.</p>
            ) : (
              <div className="space-y-2">
                {payments.map((p, i) => (
                  <div key={i} className="flex items-center justify-between rounded-lg border px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className={`flex h-8 w-8 items-center justify-center rounded-lg ${
                        p.status === 'paid' ? 'bg-emerald-500/10' : 'bg-amber-500/10'
                      }`}>
                        {p.status === 'paid' ? (
                          <Check size={14} className="text-emerald-500" />
                        ) : (
                          <Clock size={14} className="text-amber-500" />
                        )}
                      </div>
                      <div>
                        <p className="text-sm font-medium text-foreground capitalize">{p.type === 'care' ? 'Central Care Plan' : 'Business Essentials'}</p>
                        <p className="text-xs text-muted-foreground">
                          {p.date ? new Date(p.date).toLocaleDateString('en-IN') : '—'} · {p.method}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-semibold text-foreground">₹{Number(p.amount).toLocaleString('en-IN')}</p>
                      <span className={`text-[10px] font-medium uppercase ${
                        p.status === 'paid' ? 'text-emerald-500' : 'text-amber-500'
                      }`}>{p.status}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="space-y-4">
          <div className="rounded-xl border bg-card p-5">
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-4">Usage & Limits</p>
            <div className="space-y-5">
              <div>
                <div className="flex items-center justify-between text-sm mb-1">
                  <span className="text-muted-foreground">Stores</span>
                  <span className="font-medium text-foreground">1 / 1</span>
                </div>
                <div className="h-2 rounded-full bg-muted overflow-hidden">
                  <div className="h-full rounded-full bg-primary" style={{ width: '100%' }} />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between text-sm mb-1">
                  <span className="text-muted-foreground">Users</span>
                  <span className="font-medium text-foreground">{subUsers.length} / 2</span>
                </div>
                <div className="h-2 rounded-full bg-muted overflow-hidden mb-2">
                  <div
                    className={`h-full rounded-full transition-all ${subUsers.length >= 2 ? 'bg-amber-500' : 'bg-primary'}`}
                    style={{ width: `${Math.min((subUsers.length / 2) * 100, 100)}%` }}
                  />
                </div>
                {subUsersLoading ? (
                  <p className="text-[10px] text-muted-foreground">Loading...</p>
                ) : subUsers.length > 0 ? (
                  <div className="space-y-1.5">
                    {subUsers.slice(0, 5).map((u: any) => (
                      <div key={u.id} className="flex items-center gap-2 text-xs">
                        <div className="flex h-5 w-5 items-center justify-center rounded bg-primary/10 text-[9px] font-semibold text-primary">
                          {u.firstName?.charAt(0) || '?'}
                        </div>
                        <span className="text-foreground">{u.firstName} {u.lastName || ''}</span>
                        <span className="text-muted-foreground ml-auto">{u.roles?.[0] || ''}</span>
                      </div>
                    ))}
                    {subUsers.length > 5 && (
                      <p className="text-[10px] text-muted-foreground">+{subUsers.length - 5} more</p>
                    )}
                  </div>
                ) : (
                  <p className="text-[10px] text-muted-foreground">No users assigned</p>
                )}
              </div>

              <div>
                <div className="flex items-center justify-between text-sm mb-1">
                  <span className="text-muted-foreground">Products</span>
                  <span className="font-medium text-foreground">{subscription?.metrics?.productCount ?? '—'} / Unlimited</span>
                </div>
                <div className="h-2 rounded-full bg-muted overflow-hidden">
                  <div className="h-full rounded-full bg-primary" style={{ width: '30%' }} />
                </div>
              </div>
            </div>

            <div className="border-t mt-5 pt-4 space-y-2.5">
              {statsCards.map((s) => {
                const SIcon = s.icon;
                return (
                  <div key={s.label} className="flex items-center gap-2.5 text-xs">
                    <SIcon size={12} className="text-muted-foreground shrink-0" />
                    <span className="text-muted-foreground">{s.label}</span>
                    <span className="font-medium text-foreground ml-auto">{s.value}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      <Dialog open={manageOpen} onClose={() => { setManageOpen(false); setSubError(''); }} title="Manage Plan" size="md">
        <div className="space-y-5">
          {subError && (
            <div className="rounded-lg bg-destructive/10 border border-destructive/30 px-4 py-3 text-sm text-destructive">{subError}</div>
          )}
          {!hasSubscription ? (
            <div className="space-y-4">
              <div className="rounded-xl border border-emerald-200 dark:border-emerald-800 bg-emerald-50/50 dark:bg-emerald-950/20 p-5">
                <h3 className="text-base font-bold text-foreground mb-1">Business Essentials</h3>
                <p className="text-sm text-muted-foreground mb-4">One-time · ₹15,000 — Includes software, hardware, installation & training</p>
                <Button onClick={() => handleActivate(essentialsPlanId || '', 15000)} disabled={paymentSubmitting || !essentialsPlanId} className="w-full">
                  {paymentSubmitting ? 'Activating...' : `Activate Business Essentials — ₹15,000`}
                </Button>
              </div>
            </div>
          ) : isSupportExpired && !isCare ? (
            <div className="space-y-4">
              <div className="rounded-xl border border-blue-200 dark:border-blue-800 bg-blue-50/50 dark:bg-blue-950/20 p-5">
                <h3 className="text-base font-bold text-foreground mb-1">Central Care Plan</h3>
                <p className="text-sm text-muted-foreground mb-1">₹5,999 / year — Priority support, updates & GST compliance</p>
                <p className="text-xs text-muted-foreground mb-4">Renew annually to stay covered.</p>
                <Button onClick={() => handleActivate(carePlanId || '', 5999)} disabled={paymentSubmitting || !carePlanId} className="w-full">
                  {paymentSubmitting ? 'Activating...' : 'Activate Central Care Plan — ₹5,999'}
                </Button>
              </div>
            </div>
          ) : isCare && !isCareExpired ? (
            <div className="space-y-4">
              <div className="rounded-xl border bg-card p-5">
                <h3 className="text-sm font-bold text-foreground mb-2">Current Plan: Central Care Plan</h3>
                <div className="flex items-center justify-between text-sm mb-1.5">
                  <span className="text-muted-foreground">Timeline</span>
                  <span className="font-medium text-foreground">{Math.min(careDaysElapsed, 365)} / 365 days</span>
                </div>
                <div className="h-2 rounded-full bg-muted overflow-hidden mb-2">
                  <div className={`h-full rounded-full ${isCareNearExpiry ? 'bg-amber-500' : 'bg-primary'}`} style={{ width: `${Math.min(carePercent, 100)}%` }} />
                </div>
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <span>Started: {careStart ? formatDate(careStart) : '—'}</span>
                  <span>Expires: {careEnd ? formatDate(careEnd) : '—'}</span>
                </div>
              </div>
              <Button onClick={onRemove} variant="outline" className="w-full text-red-500 border-red-200 hover:bg-red-500/10 dark:border-red-800">
                Cancel Care Plan
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="rounded-xl border bg-card p-5">
                <h3 className="text-sm font-bold text-foreground mb-2">Current Plan: Business Essentials</h3>
                <div className="flex items-center justify-between text-sm mb-1.5">
                  <span className="text-muted-foreground">Support Timeline</span>
                  <span className="font-medium text-foreground">{Math.min(supportDaysElapsed, 180)} / 180 days</span>
                </div>
                <div className="h-2 rounded-full bg-muted overflow-hidden mb-2">
                  <div className={`h-full rounded-full ${isNearExpiry ? 'bg-amber-500' : 'bg-emerald-500'}`} style={{ width: `${Math.min(supportPercent, 100)}%` }} />
                </div>
                <div className="text-xs text-muted-foreground">
                  {supportDaysRemaining > 0
                    ? `${supportDaysRemaining} days remaining (ends ${supportEnd ? formatDate(supportEnd) : '—'})`
                    : 'Support period has ended'}
                </div>
              </div>
              {!isCare && isSupportExpired && (
                <Button onClick={() => handleActivate(carePlanId || '', 5999)} disabled={paymentSubmitting || !carePlanId} className="w-full">
                  {paymentSubmitting ? 'Activating...' : 'Upgrade to Central Care Plan — ₹5,999/year'}
                </Button>
              )}
            </div>
          )}
        </div>
      </Dialog>

      <Dialog open={paymentOpen} onClose={() => { setPaymentOpen(false); setSubError(''); }} title="Record Payment" size="sm">
        <div className="space-y-4">
          {subError && (
            <div className="rounded-lg bg-destructive/10 border border-destructive/30 px-4 py-3 text-sm text-destructive">{subError}</div>
          )}
          <div className="space-y-1.5">
            <label className="text-sm font-semibold text-foreground">Amount (₹)</label>
            <input type="number" value={paymentForm.amount} onChange={(e) => setPaymentForm({ ...paymentForm, amount: e.target.value })}
              className="w-full rounded-xl border border-input bg-background px-4 py-3 text-sm text-foreground"
              placeholder="15000" />
          </div>
          <div className="space-y-1.5">
            <label className="text-sm font-semibold text-foreground">Date</label>
            <input type="date" value={paymentForm.date} onChange={(e) => setPaymentForm({ ...paymentForm, date: e.target.value })}
              className="w-full rounded-xl border border-input bg-background px-4 py-3 text-sm text-foreground" />
          </div>
          <div className="space-y-1.5">
            <label className="text-sm font-semibold text-foreground">Payment Method</label>
            <div className="relative">
              <select value={paymentForm.method} onChange={(e) => setPaymentForm({ ...paymentForm, method: e.target.value })}
                className="w-full appearance-none rounded-xl border border-input bg-background px-4 py-3 pr-10 text-sm text-foreground">
                <option value="cash">Cash</option>
                <option value="upi">UPI</option>
                <option value="card">Card</option>
                <option value="bank_transfer">Bank Transfer</option>
              </select>
              <ChevronDown size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground/60 pointer-events-none" />
            </div>
          </div>
          <div className="space-y-1.5">
            <label className="text-sm font-semibold text-foreground">Status</label>
            <div className="relative">
              <select value={paymentForm.status} onChange={(e) => setPaymentForm({ ...paymentForm, status: e.target.value })}
                className="w-full appearance-none rounded-xl border border-input bg-background px-4 py-3 pr-10 text-sm text-foreground">
                <option value="paid">Paid</option>
                <option value="pending">Pending</option>
              </select>
              <ChevronDown size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground/60 pointer-events-none" />
            </div>
          </div>
        </div>
        <div className="flex justify-end gap-3 mt-8 pt-5 border-t">
          <Button variant="outline" onClick={() => setPaymentOpen(false)}>Cancel</Button>
          <Button onClick={handleAddPayment} disabled={paymentSubmitting || !paymentForm.amount}>
            {paymentSubmitting ? 'Saving...' : 'Record Payment'}
          </Button>
        </div>
      </Dialog>
    </>
  );
}

const timezones = [
  'Asia/Kolkata', 'Asia/Dubai', 'Asia/Karachi', 'Asia/Dhaka',
  'Asia/Kathmandu', 'Asia/Colombo', 'Asia/Singapore', 'Asia/Kuala_Lumpur',
  'Asia/Bangkok', 'Asia/Shanghai', 'Asia/Tokyo', 'Asia/Riyadh',
  'Europe/London', 'Europe/Paris', 'Europe/Berlin',
  'America/New_York', 'America/Chicago', 'America/Los_Angeles',
  'Australia/Sydney', 'Pacific/Auckland',
];

const currencies = [
  { value: 'INR', label: 'INR (₹)' },
  { value: 'USD', label: 'USD ($)' },
  { value: 'EUR', label: 'EUR (€)' },
  { value: 'GBP', label: 'GBP (£)' },
  { value: 'AED', label: 'AED (د.إ)' },
  { value: 'SAR', label: 'SAR (﷼)' },
  { value: 'PKR', label: 'PKR (₨)' },
  { value: 'BDT', label: 'BDT (৳)' },
  { value: 'NPR', label: 'NPR (₨)' },
  { value: 'LKR', label: 'LKR (₨)' },
  { value: 'SGD', label: 'SGD (S$)' },
  { value: 'MYR', label: 'MYR (RM)' },
];

function StoreEditForm({
  form, onChange,
}: {
  form: any;
  onChange: (f: any) => void;
}) {
  return (
    <div className="space-y-5">
      <div className="grid grid-cols-2 gap-5">
        <div className="space-y-1.5">
          <label className="text-sm font-semibold text-foreground">Store Name <span className="text-destructive">*</span></label>
          <input value={form.name} onChange={(e) => onChange({ ...form, name: e.target.value })}
            className="w-full rounded-xl border border-input bg-background px-4 py-3 text-sm text-foreground"
            required />
        </div>
        <div className="space-y-1.5">
          <label className="text-sm font-semibold text-foreground">Store Code <span className="text-destructive">*</span></label>
          <input value={form.code} onChange={(e) => onChange({ ...form, code: e.target.value.toUpperCase() })}
            className="w-full rounded-xl border border-input bg-background px-4 py-3 text-sm text-foreground font-mono uppercase"
            required />
        </div>
      </div>
      <div className="space-y-1.5">
        <label className="text-sm font-semibold text-foreground">Address</label>
        <input value={form.address} onChange={(e) => onChange({ ...form, address: e.target.value })}
          className="w-full rounded-xl border border-input bg-background px-4 py-3 text-sm text-foreground" />
      </div>
      <div className="grid grid-cols-3 gap-5">
        <div className="space-y-1.5">
          <label className="text-sm font-semibold text-foreground">City</label>
          <input value={form.city} onChange={(e) => onChange({ ...form, city: e.target.value })}
            className="w-full rounded-xl border border-input bg-background px-4 py-3 text-sm text-foreground" />
        </div>
        <div className="space-y-1.5">
          <label className="text-sm font-semibold text-foreground">State</label>
          <input value={form.state} onChange={(e) => onChange({ ...form, state: e.target.value })}
            className="w-full rounded-xl border border-input bg-background px-4 py-3 text-sm text-foreground" />
        </div>
        <div className="space-y-1.5">
          <label className="text-sm font-semibold text-foreground">Pincode</label>
          <input value={form.pincode} onChange={(e) => onChange({ ...form, pincode: e.target.value.replace(/[^0-9]/g, '') })}
            className="w-full rounded-xl border border-input bg-background px-4 py-3 text-sm text-foreground" />
        </div>
      </div>
      <div className="grid grid-cols-2 gap-5">
        <div className="space-y-1.5">
          <label className="text-sm font-semibold text-foreground">Phone</label>
          <input value={form.phone} onChange={(e) => onChange({ ...form, phone: e.target.value })}
            className="w-full rounded-xl border border-input bg-background px-4 py-3 text-sm text-foreground" />
        </div>
        <div className="space-y-1.5">
          <label className="text-sm font-semibold text-foreground">Email</label>
          <input type="email" value={form.email} onChange={(e) => onChange({ ...form, email: e.target.value })}
            className="w-full rounded-xl border border-input bg-background px-4 py-3 text-sm text-foreground" />
        </div>
      </div>
      <div className="grid grid-cols-2 gap-5">
        <div className="space-y-1.5">
          <label className="text-sm font-semibold text-foreground">Website</label>
          <input value={form.website} onChange={(e) => onChange({ ...form, website: e.target.value })}
            className="w-full rounded-xl border border-input bg-background px-4 py-3 text-sm text-foreground" />
        </div>
        <div className="space-y-1.5">
          <label className="text-sm font-semibold text-foreground">GSTIN</label>
          <input value={form.gstin} onChange={(e) => onChange({ ...form, gstin: e.target.value.toUpperCase() })}
            className="w-full rounded-xl border border-input bg-background px-4 py-3 text-sm text-foreground font-mono uppercase" />
        </div>
      </div>
      <div className="grid grid-cols-2 gap-5">
        <div className="space-y-1.5">
          <label className="text-sm font-semibold text-foreground">PAN Number</label>
          <input value={form.panNumber} onChange={(e) => onChange({ ...form, panNumber: e.target.value.toUpperCase() })}
            className="w-full rounded-xl border border-input bg-background px-4 py-3 text-sm text-foreground font-mono uppercase" />
        </div>
        <div className="space-y-1.5">
          <label className="text-sm font-semibold text-foreground">Financial Year</label>
          <input value={form.financialYear} onChange={(e) => onChange({ ...form, financialYear: e.target.value })}
            className="w-full rounded-xl border border-input bg-background px-4 py-3 text-sm text-foreground" />
        </div>
      </div>
      <div className="grid grid-cols-2 gap-5">
        <div className="space-y-1.5">
          <label className="text-sm font-semibold text-foreground">Currency</label>
          <div className="relative">
            <select value={form.currency} onChange={(e) => onChange({ ...form, currency: e.target.value })}
              className="w-full appearance-none rounded-xl border border-input bg-background px-4 py-3 pr-10 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring">
              {currencies.map((c) => (
                <option key={c.value} value={c.value}>{c.label}</option>
              ))}
            </select>
            <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
              <ChevronDown size={16} className="text-muted-foreground/60" />
            </div>
          </div>
        </div>
        <div className="space-y-1.5">
          <label className="text-sm font-semibold text-foreground">Timezone</label>
          <div className="relative">
            <select value={form.timezone} onChange={(e) => onChange({ ...form, timezone: e.target.value })}
              className="w-full appearance-none rounded-xl border border-input bg-background px-4 py-3 pr-10 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring">
              {timezones.map((tz) => (
                <option key={tz} value={tz}>{tz}</option>
              ))}
            </select>
            <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
              <ChevronDown size={16} className="text-muted-foreground/60" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
