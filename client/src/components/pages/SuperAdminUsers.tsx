import { useState, useEffect, useCallback } from 'react';
import { apiRequest } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { Dialog } from '@/components/ui/Dialog';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { SearchInput } from '@/components/ui/SearchInput';
import { Badge } from '@/components/ui/Badge';
import { Pagination } from '@/components/ui/Pagination';
import {
  Plus, Pencil, Trash2, Power, PowerOff, Calendar, ShieldCheck,
  User, Mail, Lock, Phone, Eye, EyeOff, ChevronDown, Globe,
  ChevronRight, Store,
} from 'lucide-react';

interface User {
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
  updatedAt: string;
}

interface StoreData {
  id: string;
  name: string;
  code: string;
  userCount: number;
  ownerName?: string;
  city?: string;
  state?: string;
  isActive: boolean;
  createdAt: string;
}

interface StoresResponse {
  status: string;
  data: StoreData[];
  meta: { total: number; page: number; limit: number; totalPages: number };
}

interface RolesResponse {
  status: string;
  data: Array<{ id: string; name: string; label: string; permissions: string[] }>;
}

interface UsersResponse {
  status: string;
  data: User[];
  meta: { total: number; page: number; limit: number; totalPages: number };
}

interface UserResponse {
  status: string;
  data: User;
}

interface StatusResponse {
  status: string;
}

const initialForm = {
  firstName: '',
  lastName: '',
  email: '',
  password: '',
  role: 'CASHIER',
  phoneCode: '+91',
  phone: '',
  permissions: [] as string[],
};

const countryCodes = [
  { code: '+1', label: 'US +1' },
  { code: '+44', label: 'UK +44' },
  { code: '+91', label: 'IN +91' },
  { code: '+86', label: 'CN +86' },
  { code: '+81', label: 'JP +81' },
  { code: '+49', label: 'DE +49' },
  { code: '+33', label: 'FR +33' },
  { code: '+61', label: 'AU +61' },
  { code: '+7', label: 'RU +7' },
  { code: '+55', label: 'BR +55' },
  { code: '+971', label: 'AE +971' },
  { code: '+966', label: 'SA +966' },
  { code: '+92', label: 'PK +92' },
  { code: '+880', label: 'BD +880' },
  { code: '+977', label: 'NP +977' },
  { code: '+94', label: 'LK +94' },
  { code: '+65', label: 'SG +65' },
  { code: '+852', label: 'HK +852' },
  { code: '+82', label: 'KR +82' },
  { code: '+39', label: 'IT +39' },
  { code: '+34', label: 'ES +34' },
  { code: '+31', label: 'NL +31' },
  { code: '+46', label: 'SE +46' },
  { code: '+41', label: 'CH +41' },
  { code: '+43', label: 'AT +43' },
  { code: '+32', label: 'BE +32' },
  { code: '+48', label: 'PL +48' },
  { code: '+30', label: 'GR +30' },
  { code: '+351', label: 'PT +351' },
  { code: '+353', label: 'IE +353' },
  { code: '+45', label: 'DK +45' },
  { code: '+358', label: 'FI +358' },
  { code: '+47', label: 'NO +47' },
  { code: '+60', label: 'MY +60' },
  { code: '+63', label: 'PH +63' },
  { code: '+62', label: 'ID +62' },
  { code: '+66', label: 'TH +66' },
  { code: '+84', label: 'VN +84' },
  { code: '+20', label: 'EG +20' },
  { code: '+27', label: 'ZA +27' },
  { code: '+234', label: 'NG +234' },
  { code: '+254', label: 'KE +254' },
];

const permissionLabels: Record<string, string> = {
  'dashboard:view': 'Dashboard Access',
  'product:view': 'View Products',
  'product:create': 'Create Products',
  'product:edit': 'Edit Products',
  'product:delete': 'Delete Products',
  'category:view': 'View Categories',
  'category:create': 'Create Categories',
  'category:edit': 'Edit Categories',
  'category:delete': 'Delete Categories',
  'brand:view': 'View Brands',
  'brand:create': 'Create Brands',
  'brand:edit': 'Edit Brands',
  'brand:delete': 'Delete Brands',
  'supplier:view': 'View Suppliers',
  'supplier:create': 'Create Suppliers',
  'supplier:edit': 'Edit Suppliers',
  'supplier:delete': 'Delete Suppliers',
  'inventory:view': 'View Inventory',
  'inventory:adjust': 'Adjust Inventory',
  'inventory:barcode:generate': 'Generate Barcodes',
  'inventory:stock:add': 'Add Stock',
  'inventory:history:view': 'View History',
  'inventory:item:manage': 'Manage Items',
  'purchase:view': 'View Purchases',
  'purchase:create': 'Create Purchases',
  'purchase:edit': 'Edit Purchases',
  'purchase:delete': 'Delete Purchases',
  'pos:access': 'POS Access',
  'pos:return': 'POS Returns',
  'pos:customer:manage': 'POS Customer Management',
  'pos:view:purchase-price': 'View Purchase Price',
  'customer:view': 'View Customers',
  'customer:create': 'Create Customers',
  'customer:edit': 'Edit Customers',
  'report:view': 'View Reports',
  'report:sales': 'Sales Reports',
  'report:gst': 'GST Reports',
  'report:inventory': 'Inventory Reports',
  'user:view': 'View Users',
  'user:create': 'Create Users',
  'user:edit': 'Edit Users',
  'user:delete': 'Delete Users',
  'user:manage-roles': 'Manage User Roles',
  'settings:view': 'View Settings',
  'settings:edit': 'Edit Settings',
  'system:configure': 'Configure System',
  'system:backup': 'Backup System',
  'system:restore': 'Restore System',
  'system:audit:log': 'Audit Log',
  'store:view': 'View Stores',
  'store:create': 'Create Stores',
  'store:edit': 'Edit Stores',
  'store:delete': 'Delete Stores',
  'plan:view': 'View Pricing Plans',
  'plan:create': 'Create Pricing Plans',
  'plan:edit': 'Edit Pricing Plans',
  'plan:delete': 'Delete Pricing Plans',
  'admin:access': 'Admin Panel Access',
};

function parsePhone(phone: string | null): { code: string; number: string } {
  if (!phone) return { code: '+91', number: '' };
  for (const cc of countryCodes) {
    if (phone.startsWith(cc.code)) {
      return { code: cc.code, number: phone.slice(cc.code.length).trim() };
    }
  }
  return { code: '+91', number: phone };
}

export default function SuperAdminUsers() {
  const [users, setUsers] = useState<User[]>([]);
  const [stores, setStores] = useState<StoreData[]>([]);
  const [roles, setRoles] = useState<Array<{ id: string; name: string; label: string; permissions: string[] }>>([]);
  const [meta, setMeta] = useState({ total: 0, page: 1, limit: 20, totalPages: 0 });
  const [expandedStores, setExpandedStores] = useState<Set<string>>(new Set());
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [createOpen, setCreateOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [form, setForm] = useState(initialForm);
  const [submitting, setSubmitting] = useState(false);

  const fetchUsers = useCallback(async (page: number, searchTerm: string) => {
    setLoading(true);
    setError('');
    try {
      const params = new URLSearchParams({ page: String(page), limit: '20' });
      if (searchTerm) params.append('search', searchTerm);
      const [usersRes, storesRes, rolesRes] = await Promise.all([
        apiRequest<UsersResponse>(`/users?${params}`),
        apiRequest<StoresResponse>('/stores?page=1&limit=999'),
        apiRequest<RolesResponse>('/roles'),
      ]);
      setUsers(usersRes.data);
      setMeta(usersRes.meta);
      setStores(storesRes.data);
      setRoles(rolesRes.data);
    } catch (err: any) {
      setError(err.message || 'Failed to load users');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchUsers(1, '');
  }, [fetchUsers]);

  const handleSearch = (value: string) => {
    setSearch(value);
    fetchUsers(1, value);
  };

  const handlePageChange = (page: number) => {
    fetchUsers(page, search);
  };

  const toggleStore = (storeId: string) => {
    setExpandedStores((prev) => {
      const next = new Set(prev);
      if (next.has(storeId)) next.delete(storeId);
      else next.add(storeId);
      return next;
    });
  };

  const getRequestBody = () => {
    const phone = form.phone ? `${form.phoneCode} ${form.phone}` : '';
    return {
      firstName: form.firstName,
      lastName: form.lastName || undefined,
      email: form.email,
      role: form.role,
      permissions: form.permissions,
      ...(form.password ? { password: form.password } : {}),
      ...(phone ? { phone } : {}),
    };
  };

  const handleCreate = async () => {
    setSubmitting(true);
    setError('');
    try {
      await apiRequest<UserResponse>('/users', {
        method: 'POST',
        body: JSON.stringify(getRequestBody()),
      });
      setCreateOpen(false);
      setForm({ ...initialForm, permissions: roles.find((r) => r.name === 'CASHIER')?.permissions || [] });
      fetchUsers(meta.page, search);
    } catch (err: any) {
      setError(err.message || 'Failed to create user');
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = async () => {
    if (!selectedUser) return;
    setSubmitting(true);
    setError('');
    try {
      await apiRequest<UserResponse>(`/users/${selectedUser.id}`, {
        method: 'PATCH',
        body: JSON.stringify(getRequestBody()),
      });
      setEditOpen(false);
      setSelectedUser(null);
      setForm({ ...initialForm, permissions: roles.find((r) => r.name === 'CASHIER')?.permissions || [] });
      fetchUsers(meta.page, search);
    } catch (err: any) {
      setError(err.message || 'Failed to update user');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!selectedUser) return;
    setSubmitting(true);
    setError('');
    try {
      await apiRequest<StatusResponse>(`/users/${selectedUser.id}`, {
        method: 'DELETE',
      });
      setDeleteOpen(false);
      setSelectedUser(null);
      fetchUsers(meta.page, search);
    } catch (err: any) {
      setError(err.message || 'Failed to delete user');
    } finally {
      setSubmitting(false);
    }
  };

  const toggleActive = async (user: User) => {
    try {
      setError('');
      await apiRequest<UserResponse>(`/users/${user.id}`, {
        method: 'PATCH',
        body: JSON.stringify({ isActive: !user.isActive }),
      });
      fetchUsers(meta.page, search);
    } catch (err: any) {
      setError(err.message || 'Failed to toggle user status');
    }
  };

  const openCreate = () => {
    setForm({ ...initialForm, permissions: roles.find((r) => r.name === 'CASHIER')?.permissions || [] });
    setCreateOpen(true);
  };

  const openEdit = (user: User) => {
    const parsed = parsePhone(user.phone);
    const role = user.roles[0] || 'CASHIER';
    setSelectedUser(user);
    setForm({
      firstName: user.firstName,
      lastName: user.lastName || '',
      email: user.email,
      password: '',
      role,
      phoneCode: parsed.code,
      phone: parsed.number,
      permissions: user.customPermissions && user.customPermissions.length > 0
        ? user.customPermissions
        : (roles.find((r) => r.name === role)?.permissions || []),
    });
    setEditOpen(true);
  };

  const openDelete = (user: User) => {
    setSelectedUser(user);
    setDeleteOpen(true);
  };

  const getRoleBadgeVariant = (role: string) => {
    if (role === 'SUPER_ADMIN') return 'danger';
    if (role === 'ADMIN') return 'info';
    if (role === 'MANAGER') return 'warning';
    if (role === 'INVENTORY_MANAGER') return 'success';
    if (role === 'BILLING') return 'default';
    return 'default';
  };

  const getRoleLabel = (role: string) => {
    const found = roles.find((r) => r.name === role);
    return found ? found.label : role;
  };

  return (
    <div className="animate-[fadeIn_0.4s_ease-out] space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Users</h1>
          <p className="text-sm text-muted-foreground mt-1">Manage all users and their roles.</p>
        </div>
        <Button onClick={openCreate}>
          <Plus size={16} className="mr-1.5" />
          Add User
        </Button>
      </div>

      <SearchInput
        value={search}
        onChange={handleSearch}
        placeholder="Search by name or email..."
      />

      {error && (
        <div className="rounded-lg bg-destructive/10 border border-destructive/30 px-4 py-3 text-sm text-destructive">
          {error}
        </div>
      )}

      {loading ? (
        <div className="text-center py-12 text-muted-foreground">Loading users...</div>
      ) : users.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground">No users found.</div>
      ) : (
        <div className="space-y-4">
          {(() => {
            const usersByStore = new Map<string, User[]>();
            const noStoreUsers: User[] = [];
            const superAdminUsers: User[] = [];
            for (const user of users) {
              if (user.roles.includes('SUPER_ADMIN')) {
                superAdminUsers.push(user);
                continue;
              }
              const storeId = user.storeId || '__none__';
              if (storeId === '__none__') {
                noStoreUsers.push(user);
              } else {
                if (!usersByStore.has(storeId)) usersByStore.set(storeId, []);
                usersByStore.get(storeId)!.push(user);
              }
            }

            const storeSections = stores
              .filter((s) => usersByStore.has(s.id))
              .map((store) => {
                const storeUsers = usersByStore.get(store.id) || [];
                const isOpen = expandedStores.has(store.id);
                return { store, users: storeUsers, isOpen };
              });

            return (
              <>
                {storeSections.map(({ store: s, users: storeUsers, isOpen }) => (
                  <div key={s.id} className="rounded-xl border bg-card overflow-hidden">
                    <button
                      onClick={() => toggleStore(s.id)}
                      className="w-full flex items-center justify-between px-5 py-4 hover:bg-accent transition-colors text-left"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 shrink-0">
                          <Store size={18} className="text-primary" />
                        </div>
                        <div className="min-w-0">
                          <p className="text-sm font-semibold text-foreground truncate">{s.name}</p>
                          <p className="text-xs text-muted-foreground">
                            {s.code} · {storeUsers.length} user{storeUsers.length !== 1 ? 's' : ''}
                            {s.city ? ` · ${s.city}` : ''}
                          </p>
                        </div>
                      </div>
                      <ChevronRight
                        size={18}
                        className={`shrink-0 text-muted-foreground transition-transform duration-200 ${
                          isOpen ? 'rotate-90' : ''
                        }`}
                      />
                    </button>

                    {isOpen && (
                      <div className="border-t">
                        <table className="w-full text-sm">
                          <thead>
                            <tr className="bg-muted/50">
                              <th className="text-left px-5 py-2.5 text-xs font-medium text-muted-foreground uppercase tracking-wider">User</th>
                              <th className="text-left px-5 py-2.5 text-xs font-medium text-muted-foreground uppercase tracking-wider">Roles</th>
                              <th className="text-left px-5 py-2.5 text-xs font-medium text-muted-foreground uppercase tracking-wider">Phone</th>
                              <th className="text-left px-5 py-2.5 text-xs font-medium text-muted-foreground uppercase tracking-wider">Status</th>
                              <th className="text-left px-5 py-2.5 text-xs font-medium text-muted-foreground uppercase tracking-wider">Joined</th>
                              <th className="text-right px-5 py-2.5 text-xs font-medium text-muted-foreground uppercase tracking-wider">Actions</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y">
                            {storeUsers.map((user) => (
                              <tr key={user.id} className="hover:bg-accent/50 transition-colors">
                                <td className="px-5 py-3">
                                  <div className="flex items-center gap-3">
                                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-sm font-semibold text-primary shrink-0">
                                      {user.firstName.charAt(0).toUpperCase()}
                                    </div>
                                    <div className="min-w-0">
                                      <p className="text-sm font-medium text-foreground truncate">
                                        {user.firstName} {user.lastName}
                                      </p>
                                      <p className="text-xs text-muted-foreground truncate">{user.email}</p>
                                    </div>
                                  </div>
                                </td>
                                <td className="px-5 py-3">
                                  <div className="flex flex-wrap gap-1.5">
                                    {user.roles.map((role) => (
                                      <Badge key={role} variant={getRoleBadgeVariant(role)}>
                                        {getRoleLabel(role)}
                                      </Badge>
                                    ))}
                                  </div>
                                </td>
                                <td className="px-5 py-3 text-xs text-muted-foreground">
                                  {user.phone || '-'}
                                </td>
                                <td className="px-5 py-3">
                                  <button
                                    onClick={() => toggleActive(user)}
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
                                <td className="px-5 py-3">
                                  <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                                    <Calendar size={12} />
                                    {new Date(user.createdAt).toLocaleDateString()}
                                  </div>
                                </td>
                                <td className="px-5 py-3 text-right">
                                  <div className="flex items-center justify-end gap-1">
                                    <button
                                      onClick={() => openEdit(user)}
                                      className="p-1.5 rounded-lg hover:bg-accent text-muted-foreground hover:text-foreground transition-colors"
                                      title="Edit"
                                    >
                                      <Pencil size={14} />
                                    </button>
                                    <button
                                      onClick={() => openDelete(user)}
                                      className="p-1.5 rounded-lg hover:bg-accent text-muted-foreground hover:text-red-600 dark:hover:text-red-400 transition-colors"
                                      title="Delete"
                                    >
                                      <Trash2 size={14} />
                                    </button>
                                  </div>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>
                ))}

                {superAdminUsers.length > 0 && (
                  <div className="rounded-xl border bg-card overflow-hidden">
                    <button
                      onClick={() => toggleStore('__super_admin__')}
                      className="w-full flex items-center justify-between px-5 py-4 hover:bg-accent transition-colors text-left"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-amber-500/10 shrink-0">
                          <ShieldCheck size={18} className="text-amber-500" />
                        </div>
                        <div className="min-w-0">
                          <p className="text-sm font-semibold text-foreground truncate">Super Admin</p>
                          <p className="text-xs text-muted-foreground">
                            {superAdminUsers.length} user{superAdminUsers.length !== 1 ? 's' : ''}
                          </p>
                        </div>
                      </div>
                      <ChevronRight
                        size={18}
                        className={`shrink-0 text-muted-foreground transition-transform duration-200 ${
                          expandedStores.has('__super_admin__') ? 'rotate-90' : ''
                        }`}
                      />
                    </button>

                    {expandedStores.has('__super_admin__') && (
                      <div className="border-t">
                        <table className="w-full text-sm">
                          <tbody className="divide-y">
                            {superAdminUsers.map((user) => (
                              <tr key={user.id} className="hover:bg-accent/50 transition-colors">
                                <td className="px-5 py-3">
                                  <div className="flex items-center gap-3">
                                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-sm font-semibold text-primary shrink-0">
                                      {user.firstName.charAt(0).toUpperCase()}
                                    </div>
                                    <div className="min-w-0">
                                      <p className="text-sm font-medium text-foreground truncate">
                                        {user.firstName} {user.lastName}
                                      </p>
                                      <p className="text-xs text-muted-foreground truncate">{user.email}</p>
                                    </div>
                                  </div>
                                </td>
                                <td className="px-5 py-3">
                                  <Badge variant="danger">SUPER_ADMIN</Badge>
                                </td>
                                <td className="px-5 py-3 text-xs text-muted-foreground">
                                  {user.phone || '-'}
                                </td>
                                <td className="px-5 py-3">
                                  <button
                                    onClick={() => toggleActive(user)}
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
                                <td className="px-5 py-3">
                                  <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                                    <Calendar size={12} />
                                    {new Date(user.createdAt).toLocaleDateString()}
                                  </div>
                                </td>
                                <td className="px-5 py-3 text-right">
                                  <div className="flex items-center justify-end gap-1">
                                    <button
                                      onClick={() => openEdit(user)}
                                      className="p-1.5 rounded-lg hover:bg-accent text-muted-foreground hover:text-foreground transition-colors"
                                      title="Edit"
                                    >
                                      <Pencil size={14} />
                                    </button>
                                    <button
                                      onClick={() => openDelete(user)}
                                      className="p-1.5 rounded-lg hover:bg-accent text-muted-foreground hover:text-red-600 dark:hover:text-red-400 transition-colors"
                                      title="Delete"
                                    >
                                      <Trash2 size={14} />
                                    </button>
                                  </div>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>
                )}

                {noStoreUsers.length > 0 && (
                  <div className="rounded-xl border bg-card overflow-hidden">
                    <div className="px-5 py-3 bg-muted/30 border-b">
                      <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                        Unassigned · {noStoreUsers.length} user{noStoreUsers.length !== 1 ? 's' : ''}
                      </p>
                    </div>
                    <table className="w-full text-sm">
                      <tbody className="divide-y">
                        {noStoreUsers.map((user) => (
                          <tr key={user.id} className="hover:bg-accent/50 transition-colors">
                            <td className="px-5 py-3">
                              <div className="flex items-center gap-3">
                                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-sm font-semibold text-primary shrink-0">
                                  {user.firstName.charAt(0).toUpperCase()}
                                </div>
                                <div className="min-w-0">
                                  <p className="text-sm font-medium text-foreground truncate">
                                    {user.firstName} {user.lastName}
                                  </p>
                                  <p className="text-xs text-muted-foreground truncate">{user.email}</p>
                                </div>
                              </div>
                            </td>
                            <td className="px-5 py-3">
                              <div className="flex flex-wrap gap-1.5">
                                {user.roles.map((role) => (
                                  <Badge key={role} variant={getRoleBadgeVariant(role)}>
                                    {getRoleLabel(role)}
                                  </Badge>
                                ))}
                              </div>
                            </td>
                            <td className="px-5 py-3 text-xs text-muted-foreground">
                              {user.phone || '-'}
                            </td>
                            <td className="px-5 py-3">
                              <button
                                onClick={() => toggleActive(user)}
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
                            <td className="px-5 py-3">
                              <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                                <Calendar size={12} />
                                {new Date(user.createdAt).toLocaleDateString()}
                              </div>
                            </td>
                            <td className="px-5 py-3 text-right">
                              <div className="flex items-center justify-end gap-1">
                                <button
                                  onClick={() => openEdit(user)}
                                  className="p-1.5 rounded-lg hover:bg-accent text-muted-foreground hover:text-foreground transition-colors"
                                  title="Edit"
                                >
                                  <Pencil size={14} />
                                </button>
                                <button
                                  onClick={() => openDelete(user)}
                                  className="p-1.5 rounded-lg hover:bg-accent text-muted-foreground hover:text-red-600 dark:hover:text-red-400 transition-colors"
                                  title="Delete"
                                >
                                  <Trash2 size={14} />
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}

                <Pagination
                  page={meta.page}
                  totalPages={meta.totalPages}
                  total={meta.total}
                  onPageChange={handlePageChange}
                />
              </>
            );
          })()}
        </div>
      )}

      <Dialog open={createOpen} onClose={() => setCreateOpen(false)} title="Create User" size="xl">
        <UserForm form={form} onChange={setForm} isCreate roles={roles} />
        <div className="flex justify-end gap-3 mt-8 pt-5 border-t">
          <Button variant="outline" onClick={() => setCreateOpen(false)}>Cancel</Button>
          <Button onClick={handleCreate} disabled={submitting}>
            {submitting ? 'Creating...' : 'Create User'}
          </Button>
        </div>
      </Dialog>

      <Dialog open={editOpen} onClose={() => setEditOpen(false)} title="Edit User" size="xl">
        <UserForm form={form} onChange={setForm} isCreate={false} roles={roles} />
        <div className="flex justify-end gap-3 mt-8 pt-5 border-t">
          <Button variant="outline" onClick={() => setEditOpen(false)}>Cancel</Button>
          <Button onClick={handleEdit} disabled={submitting}>
            {submitting ? 'Saving...' : 'Save Changes'}
          </Button>
        </div>
      </Dialog>

      <ConfirmDialog
        open={deleteOpen}
        onClose={() => setDeleteOpen(false)}
        onConfirm={handleDelete}
        title="Delete User"
        message={`Are you sure you want to delete ${selectedUser?.firstName} ${selectedUser?.lastName}? This action cannot be undone.`}
        confirmLabel="Delete"
        variant="danger"
        loading={submitting}
      />
    </div>
  );
}

const groupLabels: Record<string, string> = {
  dashboard: 'Dashboard',
  product: 'Products',
  category: 'Categories',
  brand: 'Brands',
  supplier: 'Suppliers',
  inventory: 'Inventory',
  purchase: 'Purchases',
  pos: 'POS / Billing',
  customer: 'Customers',
  report: 'Reports',
  user: 'User Management',
  settings: 'Settings',
  system: 'System',
  store: 'Stores',
  admin: 'Admin',
};

const groupOrder = [
  'dashboard', 'product', 'category', 'brand', 'supplier',
  'inventory', 'purchase', 'pos', 'customer', 'report',
  'user', 'settings', 'system', 'store', 'admin',
];

function UserForm({
  form,
  onChange,
  isCreate,
  roles,
}: {
  form: typeof initialForm;
  onChange: (f: typeof initialForm) => void;
  isCreate: boolean;
  roles: Array<{ id: string; name: string; label: string; permissions: string[] }>;
}) {
  const [showPassword, setShowPassword] = useState(false);
  const currentRole = roles.find((r) => r.name === form.role);
  const allPermissions = currentRole?.permissions || [];

  const groupedPermissions: Record<string, string[]> = {};
  for (const perm of allPermissions) {
    const group = perm.split(':')[0];
    if (!groupedPermissions[group]) groupedPermissions[group] = [];
    groupedPermissions[group].push(perm);
  }

  const togglePermission = (perm: string) => {
    const checked = form.permissions.includes(perm);
    onChange({
      ...form,
      permissions: checked
        ? form.permissions.filter((p: string) => p !== perm)
        : [...form.permissions, perm],
    });
  };

  const toggleGroup = (group: string, perms: string[]) => {
    const allChecked = perms.every((p) => form.permissions.includes(p));
    onChange({
      ...form,
      permissions: allChecked
        ? form.permissions.filter((p: string) => !perms.includes(p))
        : [...new Set([...form.permissions, ...perms])],
    });
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-5">
        <div className="space-y-1.5">
          <label className="text-sm font-semibold text-foreground flex items-center gap-1.5">
            <User size={14} className="text-muted-foreground" />
            First Name <span className="text-destructive">*</span>
          </label>
          <div className="relative group">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <User size={15} className="text-muted-foreground/60 group-focus-within:text-primary transition-colors" />
            </div>
            <input
              value={form.firstName}
              onChange={(e) => onChange({ ...form, firstName: e.target.value })}
              className="w-full rounded-xl border border-input bg-background pl-10 pr-4 py-3 text-sm text-foreground placeholder:text-muted-foreground/50 transition-all focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent"
              placeholder="John"
              required
            />
          </div>
        </div>
        <div className="space-y-1.5">
          <label className="text-sm font-semibold text-foreground">Last Name</label>
          <div className="relative group">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <User size={15} className="text-muted-foreground/60 group-focus-within:text-primary transition-colors" />
            </div>
            <input
              value={form.lastName}
              onChange={(e) => onChange({ ...form, lastName: e.target.value })}
              className="w-full rounded-xl border border-input bg-background pl-10 pr-4 py-3 text-sm text-foreground placeholder:text-muted-foreground/50 transition-all focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent"
              placeholder="Doe"
            />
          </div>
        </div>
      </div>

      <div className="space-y-1.5">
        <label className="text-sm font-semibold text-foreground flex items-center gap-1.5">
          <Mail size={14} className="text-muted-foreground" />
          Email Address <span className="text-destructive">*</span>
        </label>
        <div className="relative group">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Mail size={15} className="text-muted-foreground/60 group-focus-within:text-primary transition-colors" />
          </div>
          <input
            type="email"
            value={form.email}
            onChange={(e) => onChange({ ...form, email: e.target.value })}
            className="w-full rounded-xl border border-input bg-background pl-10 pr-4 py-3 text-sm text-foreground placeholder:text-muted-foreground/50 transition-all focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent"
            placeholder="john@example.com"
            required
          />
        </div>
      </div>

      <div className="space-y-1.5">
        <label className="text-sm font-semibold text-foreground flex items-center gap-1.5">
          <Lock size={14} className="text-muted-foreground" />
          Password
          {isCreate && <span className="text-destructive"> *</span>}
          {!isCreate && (
            <span className="text-xs text-muted-foreground font-normal ml-1">(leave blank to keep current)</span>
          )}
        </label>
        <div className="relative group">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Lock size={15} className="text-muted-foreground/60 group-focus-within:text-primary transition-colors" />
          </div>
          <input
            type={showPassword ? 'text' : 'password'}
            value={form.password}
            onChange={(e) => onChange({ ...form, password: e.target.value })}
            className="w-full rounded-xl border border-input bg-background pl-10 pr-11 py-3 text-sm text-foreground placeholder:text-muted-foreground/50 transition-all focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent"
            {...(isCreate ? { required: true } : {})}
            placeholder={isCreate ? 'Create a strong password (min 6 chars)' : 'New password (optional)'}
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute inset-y-0 right-0 pr-3 flex items-center text-muted-foreground/60 hover:text-foreground transition-colors"
          >
            {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-5">
        <div className="space-y-1.5">
          <label className="text-sm font-semibold text-foreground flex items-center gap-1.5">
            <ShieldCheck size={14} className="text-muted-foreground" />
            Role <span className="text-destructive">*</span>
          </label>
          <div className="relative">
            <select
              value={form.role}
              onChange={(e) => {
                const newRole = e.target.value;
                onChange({
                  ...form,
                  role: newRole,
                  permissions: roles.find((r) => r.name === newRole)?.permissions || [],
                });
              }}
              className="w-full appearance-none rounded-xl border border-input bg-background px-4 py-3 pr-10 text-sm text-foreground transition-all focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent"
            >
              {roles.filter((r) => r.name !== 'SUPER_ADMIN').map((r) => (
                <option key={r.name} value={r.name}>{r.label}</option>
              ))}
            </select>
            <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
              <ChevronDown size={16} className="text-muted-foreground/60" />
            </div>
          </div>
          {form.role && currentRole && (
            <div className="mt-2 inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-xs font-medium bg-primary/10 text-primary">
              <ShieldCheck size={12} />
              {currentRole.label}
            </div>
          )}
        </div>
        <div className="space-y-1.5">
          <label className="text-sm font-semibold text-foreground flex items-center gap-1.5">
            <Phone size={14} className="text-muted-foreground" />
            Phone Number
          </label>
          <div className="flex gap-2">
            <div className="relative w-[140px] shrink-0">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Globe size={14} className="text-muted-foreground/60" />
              </div>
              <select
                value={form.phoneCode}
                onChange={(e) => onChange({ ...form, phoneCode: e.target.value })}
                className="w-full appearance-none rounded-xl border border-input bg-background pl-9 pr-8 py-3 text-sm text-foreground transition-all focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent"
              >
                {countryCodes.map((cc) => (
                  <option key={cc.code} value={cc.code}>{cc.label}</option>
                ))}
              </select>
              <div className="absolute inset-y-0 right-0 pr-2.5 flex items-center pointer-events-none">
                <ChevronDown size={14} className="text-muted-foreground/60" />
              </div>
            </div>
            <input
              type="tel"
              value={form.phone}
              onChange={(e) => onChange({ ...form, phone: e.target.value.replace(/[^0-9]/g, '') })}
              placeholder="9876543210"
              className="w-full rounded-xl border border-input bg-background px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground/50 transition-all focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent"
            />
          </div>
        </div>
      </div>

      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
            <ShieldCheck size={16} className="text-primary" />
            Granular Permissions
            <span className="text-xs font-normal text-muted-foreground">
              ({form.permissions.length}/{allPermissions.length} enabled)
            </span>
          </div>
          <button
            type="button"
            onClick={() => {
              const allChecked = form.permissions.length === allPermissions.length;
              onChange({
                ...form,
                permissions: allChecked ? [] : [...allPermissions],
              });
            }}
            className="text-[10px] font-semibold uppercase tracking-wider transition-colors text-primary hover:text-primary/80"
          >
            {form.permissions.length === allPermissions.length ? 'Deselect All' : 'Select All'}
          </button>
        </div>
        <div className="rounded-xl border bg-card p-5 max-h-80 overflow-y-auto space-y-4">
          {groupOrder.map((group) => {
            const groupPerms = groupedPermissions[group];
            if (!groupPerms || groupPerms.length === 0) return null;
            const checkedCount = groupPerms.filter((p) => form.permissions.includes(p)).length;
            const allChecked = checkedCount === groupPerms.length;
            return (
              <div key={group}>
                <div className="flex items-center justify-between mb-2">
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
                    <span className="w-1 h-3 rounded-full bg-primary/60" />
                    {groupLabels[group] || group}
                    <span className="text-[10px] font-normal text-muted-foreground/60">
                      ({checkedCount}/{groupPerms.length})
                    </span>
                  </p>
                  <button
                    type="button"
                    onClick={() => toggleGroup(group, groupPerms)}
                    className={`text-[10px] font-medium uppercase tracking-wider transition-colors ${
                      allChecked
                        ? 'text-primary'
                        : 'text-muted-foreground/50 hover:text-muted-foreground'
                    }`}
                  >
                    {allChecked ? 'Deselect All' : 'Select All'}
                  </button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {groupPerms.map((perm) => {
                    const checked = form.permissions.includes(perm);
                    return (
                      <label
                        key={perm}
                        className={`inline-flex items-center gap-1.5 rounded-lg border px-2.5 py-1.5 text-xs font-medium cursor-pointer transition-all ${
                          checked
                            ? 'border-primary/30 bg-primary/10 text-primary'
                            : 'border-border bg-transparent text-muted-foreground hover:border-muted-foreground/30'
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={checked}
                          onChange={() => togglePermission(perm)}
                          className="sr-only"
                        />
                        <span
                          className={`w-3.5 h-3.5 rounded border flex items-center justify-center transition-colors ${
                            checked
                              ? 'bg-primary border-primary'
                              : 'border-muted-foreground/30'
                          }`}
                        >
                          {checked && (
                            <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                              <path d="M2 5L4 7L8 3" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                          )}
                        </span>
                        {permissionLabels[perm] || perm}
                      </label>
                    );
                  })}
                </div>
              </div>
            );
          })}
          {allPermissions.length === 0 && (
            <p className="text-sm text-muted-foreground text-center py-6">
              No permissions available for this role.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
