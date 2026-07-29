import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { apiRequest } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { Dialog } from '@/components/ui/Dialog';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { SearchInput } from '@/components/ui/SearchInput';
import { Pagination } from '@/components/ui/Pagination';
import {
  Plus, Pencil, Trash2, Store, MapPin, Phone, Mail, Calendar,
  User, Building2, Hash, Globe, FileText, ChevronDown, Power, PowerOff,
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

interface StoresResponse {
  status: string;
  data: StoreData[];
  meta: { total: number; page: number; limit: number; totalPages: number };
}

interface StoreResponse {
  status: string;
  data: StoreData;
}

interface StatusResponse {
  status: string;
}

interface UserOption {
  id: string;
  firstName: string;
  lastName: string | null;
  email: string;
}

interface UsersListResponse {
  status: string;
  data: UserOption[];
  meta: { total: number; page: number; limit: number; totalPages: number };
}

const initialForm = {
  name: '',
  code: '',
  ownerId: '',
  ownerName: '',
  address: '',
  city: '',
  state: '',
  pincode: '',
  phone: '',
  email: '',
  website: '',
  gstin: '',
  panNumber: '',
  currency: 'INR',
  timezone: 'Asia/Kolkata',
  financialYear: '',
};

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

export default function SuperAdminStores() {
  const navigate = useNavigate();
  const [stores, setStores] = useState<StoreData[]>([]);
  const [meta, setMeta] = useState({ total: 0, page: 1, limit: 20, totalPages: 0 });
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [createOpen, setCreateOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [selectedStore, setSelectedStore] = useState<StoreData | null>(null);
  const [form, setForm] = useState(initialForm);
  const [submitting, setSubmitting] = useState(false);
  const [userOptions, setUserOptions] = useState<UserOption[]>([]);

  const fetchStores = useCallback(async (page: number, searchTerm: string) => {
    setLoading(true);
    setError('');
    try {
      const params = new URLSearchParams({ page: String(page), limit: '20' });
      if (searchTerm) params.append('search', searchTerm);
      const res = await apiRequest<StoresResponse>(`/stores?${params}`);
      setStores(res.data);
      setMeta(res.meta);
    } catch (err: any) {
      setError(err.message || 'Failed to load stores');
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchUsers = useCallback(async () => {
    try {
      const res = await apiRequest<UsersListResponse>('/users?limit=200');
      setUserOptions(res.data);
    } catch {
      // silently fail
    }
  }, []);

  useEffect(() => {
    fetchStores(1, '');
  }, [fetchStores]);

  const handleSearch = (value: string) => {
    setSearch(value);
    fetchStores(1, value);
  };

  const handlePageChange = (page: number) => {
    fetchStores(page, search);
  };

  const openCreate = () => {
    setForm(initialForm);
    fetchUsers();
    setCreateOpen(true);
  };

  const openEdit = (store: StoreData) => {
    setSelectedStore(store);
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
    fetchUsers();
    setEditOpen(true);
  };

  const openDelete = (store: StoreData) => {
    setSelectedStore(store);
    setDeleteOpen(true);
  };

  const getRequestBody = () => ({
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
  });

  const handleCreate = async () => {
    setSubmitting(true);
    setError('');
    try {
      await apiRequest<StoreResponse>('/stores', {
        method: 'POST',
        body: JSON.stringify(getRequestBody()),
      });
      setCreateOpen(false);
      setForm(initialForm);
      fetchStores(meta.page, search);
    } catch (err: any) {
      setError(err.message || 'Failed to create store');
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = async () => {
    if (!selectedStore) return;
    setSubmitting(true);
    setError('');
    try {
      await apiRequest<StoreResponse>(`/stores/${selectedStore.id}`, {
        method: 'PATCH',
        body: JSON.stringify(getRequestBody()),
      });
      setEditOpen(false);
      setSelectedStore(null);
      setForm(initialForm);
      fetchStores(meta.page, search);
    } catch (err: any) {
      setError(err.message || 'Failed to update store');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!selectedStore) return;
    setSubmitting(true);
    setError('');
    try {
      await apiRequest<StatusResponse>(`/stores/${selectedStore.id}`, {
        method: 'DELETE',
      });
      setDeleteOpen(false);
      setSelectedStore(null);
      fetchStores(meta.page, search);
    } catch (err: any) {
      setError(err.message || 'Failed to delete store');
    } finally {
      setSubmitting(false);
    }
  };

  const toggleActive = async (store: StoreData) => {
    try {
      setError('');
      await apiRequest<StatusResponse>(`/stores/${store.id}`, {
        method: 'PATCH',
        body: JSON.stringify({ isActive: !store.isActive }),
      });
      fetchStores(meta.page, search);
    } catch (err: any) {
      setError(err.message || 'Failed to toggle store status');
    }
  };

  return (
    <div className="animate-[fadeIn_0.4s_ease-out] space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Stores</h1>
          <p className="text-sm text-muted-foreground mt-1">Manage all stores and their owners.</p>
        </div>
        <Button onClick={openCreate}>
          <Plus size={16} className="mr-1.5" />
          Add Store
        </Button>
      </div>

      <SearchInput
        value={search}
        onChange={handleSearch}
        placeholder="Search by name, code, or city..."
      />

      {error && (
        <div className="rounded-lg bg-destructive/10 border border-destructive/30 px-4 py-3 text-sm text-destructive">
          {error}
        </div>
      )}

      {loading ? (
        <div className="text-center py-12 text-muted-foreground">Loading stores...</div>
      ) : stores.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground">No stores found.</div>
      ) : (
        <>
          <div className="grid gap-4">
            {stores.map((store) => (
              <div
                key={store.id}
                onClick={() => navigate(`/admin/stores/${store.id}`)}
                className="rounded-xl border bg-card p-5 hover:bg-accent/50 transition-all cursor-pointer"
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-4">
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
                      <Store size={22} className="text-primary" />
                    </div>
                    <div>
                      <h3 className="text-base font-semibold text-foreground">{store.name}</h3>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className="text-xs font-mono text-muted-foreground bg-muted px-1.5 py-0.5 rounded">
                          {store.code}
                        </span>
                        <span className="text-xs text-muted-foreground">{store.city}{store.city && store.state ? ', ' : ''}{store.state}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={(e) => { e.stopPropagation(); toggleActive(store); }}
                      className={`inline-flex items-center gap-1.5 text-xs font-medium ${
                        store.isActive
                          ? 'text-green-600 dark:text-green-400'
                          : 'text-red-600 dark:text-red-400'
                      } hover:underline`}
                    >
                      {store.isActive ? <Power size={12} /> : <PowerOff size={12} />}
                      {store.isActive ? 'Active' : 'Inactive'}
                    </button>
                    <button
                      onClick={(e) => { e.stopPropagation(); openEdit(store); }}
                      className="p-1.5 rounded-lg hover:bg-accent text-muted-foreground hover:text-foreground transition-colors"
                      title="Edit"
                    >
                      <Pencil size={14} />
                    </button>
                    <button
                      onClick={(e) => { e.stopPropagation(); openDelete(store); }}
                      className="p-1.5 rounded-lg hover:bg-accent text-muted-foreground hover:text-red-600 dark:hover:text-red-400 transition-colors"
                      title="Delete"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>

                <div className="mt-4 flex flex-wrap gap-x-6 gap-y-2 text-xs text-muted-foreground">
                  {store.owner && (
                    <span className="flex items-center gap-1.5">
                      <User size={13} />
                      {store.owner.firstName} {store.owner.lastName}
                    </span>
                  )}
                  {store.phone && (
                    <span className="flex items-center gap-1.5">
                      <Phone size={13} />
                      {store.phone}
                    </span>
                  )}
                  {store.email && (
                    <span className="flex items-center gap-1.5">
                      <Mail size={13} />
                      {store.email}
                    </span>
                  )}
                  {store.gstin && (
                    <span className="flex items-center gap-1.5">
                      <FileText size={13} />
                      {store.gstin}
                    </span>
                  )}
                  <span className="flex items-center gap-1.5">
                    <Calendar size={13} />
                    {new Date(store.createdAt).toLocaleDateString()}
                  </span>
                  <span className="flex items-center gap-1.5">
                    <Building2 size={13} />
                    {store.userCount} user{store.userCount !== 1 ? 's' : ''}
                  </span>
                </div>
              </div>
            ))}
          </div>
          <Pagination
            page={meta.page}
            totalPages={meta.totalPages}
            total={meta.total}
            onPageChange={handlePageChange}
          />
        </>
      )}

      <Dialog open={createOpen} onClose={() => setCreateOpen(false)} title="Create Store" size="xl">
        <StoreForm form={form} onChange={setForm} userOptions={userOptions} />
        <div className="flex justify-end gap-3 mt-8 pt-5 border-t">
          <Button variant="outline" onClick={() => setCreateOpen(false)}>Cancel</Button>
          <Button onClick={handleCreate} disabled={submitting}>
            {submitting ? 'Creating...' : 'Create Store'}
          </Button>
        </div>
      </Dialog>

      <Dialog open={editOpen} onClose={() => setEditOpen(false)} title="Edit Store" size="xl">
        <StoreForm form={form} onChange={setForm} userOptions={userOptions} />
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
        title="Delete Store"
        message={`Are you sure you want to delete ${selectedStore?.name} (${selectedStore?.code})? This action cannot be undone.`}
        confirmLabel="Delete"
        variant="danger"
        loading={submitting}
      />
    </div>
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

function StoreForm({
  form,
  onChange,
  userOptions,
}: {
  form: typeof initialForm;
  onChange: (f: typeof initialForm) => void;
  userOptions: UserOption[];
}) {
  return (
    <div className="space-y-5">
      <div className="grid grid-cols-2 gap-5">
        <div className="space-y-1.5">
          <label className="text-sm font-semibold text-foreground flex items-center gap-1.5">
            <Store size={14} className="text-muted-foreground" />
            Store Name <span className="text-destructive">*</span>
          </label>
          <div className="relative group">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Store size={15} className="text-muted-foreground/60 group-focus-within:text-primary transition-colors" />
            </div>
            <input
              value={form.name}
              onChange={(e) => onChange({ ...form, name: e.target.value })}
              className="w-full rounded-xl border border-input bg-background pl-10 pr-4 py-3 text-sm text-foreground placeholder:text-muted-foreground/50 transition-all focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent"
              placeholder="Kapda Fashion House"
              required
            />
          </div>
        </div>
        <div className="space-y-1.5">
          <label className="text-sm font-semibold text-foreground flex items-center gap-1.5">
            <Hash size={14} className="text-muted-foreground" />
            Store Code <span className="text-destructive">*</span>
          </label>
          <div className="relative group">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Hash size={15} className="text-muted-foreground/60 group-focus-within:text-primary transition-colors" />
            </div>
            <input
              value={form.code}
              onChange={(e) => onChange({ ...form, code: e.target.value.toUpperCase() })}
              className="w-full rounded-xl border border-input bg-background pl-10 pr-4 py-3 text-sm text-foreground placeholder:text-muted-foreground/50 font-mono uppercase transition-all focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent"
              placeholder="MAIN"
              required
            />
          </div>
        </div>
      </div>

      <div className="space-y-1.5">
        <label className="text-sm font-semibold text-foreground flex items-center gap-1.5">
          <User size={14} className="text-muted-foreground" />
          Store Owner
        </label>
        <div className="relative">
          <select
            value={form.ownerId}
            onChange={(e) => {
              const userId = e.target.value;
              const user = userOptions.find((u) => u.id === userId);
              onChange({
                ...form,
                ownerId: userId,
                ownerName: user ? `${user.firstName} ${user.lastName || ''}`.trim() : '',
              });
            }}
            className="w-full appearance-none rounded-xl border border-input bg-background px-4 py-3 pr-10 text-sm text-foreground transition-all focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent"
          >
            <option value="">No owner</option>
            {userOptions.map((u) => (
              <option key={u.id} value={u.id}>
                {u.firstName} {u.lastName || ''} ({u.email})
              </option>
            ))}
          </select>
          <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
            <ChevronDown size={16} className="text-muted-foreground/60" />
          </div>
        </div>
      </div>

      <div className="space-y-1.5">
        <label className="text-sm font-semibold text-foreground">Address</label>
        <input
          value={form.address}
          onChange={(e) => onChange({ ...form, address: e.target.value })}
          className="w-full rounded-xl border border-input bg-background px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground/50 transition-all focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent"
          placeholder="45, Lajpat Nagar Market"
        />
      </div>

      <div className="grid grid-cols-3 gap-5">
        <div className="space-y-1.5">
          <label className="text-sm font-semibold text-foreground">City</label>
          <input
            value={form.city}
            onChange={(e) => onChange({ ...form, city: e.target.value })}
            className="w-full rounded-xl border border-input bg-background px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground/50 transition-all focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent"
            placeholder="New Delhi"
          />
        </div>
        <div className="space-y-1.5">
          <label className="text-sm font-semibold text-foreground">State</label>
          <input
            value={form.state}
            onChange={(e) => onChange({ ...form, state: e.target.value })}
            className="w-full rounded-xl border border-input bg-background px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground/50 transition-all focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent"
            placeholder="Delhi"
          />
        </div>
        <div className="space-y-1.5">
          <label className="text-sm font-semibold text-foreground">Pincode</label>
          <input
            value={form.pincode}
            onChange={(e) => onChange({ ...form, pincode: e.target.value.replace(/[^0-9]/g, '') })}
            className="w-full rounded-xl border border-input bg-background px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground/50 transition-all focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent"
            placeholder="110024"
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-5">
        <div className="space-y-1.5">
          <label className="text-sm font-semibold text-foreground flex items-center gap-1.5">
            <Phone size={14} className="text-muted-foreground" />
            Phone
          </label>
          <input
            value={form.phone}
            onChange={(e) => onChange({ ...form, phone: e.target.value })}
            className="w-full rounded-xl border border-input bg-background px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground/50 transition-all focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent"
            placeholder="+91-9876543210"
          />
        </div>
        <div className="space-y-1.5">
          <label className="text-sm font-semibold text-foreground flex items-center gap-1.5">
            <Mail size={14} className="text-muted-foreground" />
            Email
          </label>
          <input
            type="email"
            value={form.email}
            onChange={(e) => onChange({ ...form, email: e.target.value })}
            className="w-full rounded-xl border border-input bg-background px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground/50 transition-all focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent"
            placeholder="info@centralonefashion.com"
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-5">
        <div className="space-y-1.5">
          <label className="text-sm font-semibold text-foreground flex items-center gap-1.5">
            <Globe size={14} className="text-muted-foreground" />
            Website
          </label>
          <input
            value={form.website}
            onChange={(e) => onChange({ ...form, website: e.target.value })}
            className="w-full rounded-xl border border-input bg-background px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground/50 transition-all focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent"
            placeholder="https://centralonefashion.com"
          />
        </div>
        <div className="space-y-1.5">
          <label className="text-sm font-semibold text-foreground flex items-center gap-1.5">
            <FileText size={14} className="text-muted-foreground" />
            GSTIN
          </label>
          <input
            value={form.gstin}
            onChange={(e) => onChange({ ...form, gstin: e.target.value.toUpperCase() })}
            className="w-full rounded-xl border border-input bg-background px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground/50 font-mono uppercase transition-all focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent"
            placeholder="07ABCDE1234F1Z5"
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-5">
        <div className="space-y-1.5">
          <label className="text-sm font-semibold text-foreground flex items-center gap-1.5">
            <FileText size={14} className="text-muted-foreground" />
            PAN Number
          </label>
          <input
            value={form.panNumber}
            onChange={(e) => onChange({ ...form, panNumber: e.target.value.toUpperCase() })}
            className="w-full rounded-xl border border-input bg-background px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground/50 font-mono uppercase transition-all focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent"
            placeholder="ABCDE1234F"
          />
        </div>
        <div className="space-y-1.5">
          <label className="text-sm font-semibold text-foreground flex items-center gap-1.5">
            <FileText size={14} className="text-muted-foreground" />
            Financial Year
          </label>
          <input
            value={form.financialYear}
            onChange={(e) => onChange({ ...form, financialYear: e.target.value })}
            className="w-full rounded-xl border border-input bg-background px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground/50 transition-all focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent"
            placeholder="2025-2026"
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-5">
        <div className="space-y-1.5">
          <label className="text-sm font-semibold text-foreground">Currency</label>
          <div className="relative">
            <select
              value={form.currency}
              onChange={(e) => onChange({ ...form, currency: e.target.value })}
              className="w-full appearance-none rounded-xl border border-input bg-background px-4 py-3 pr-10 text-sm text-foreground transition-all focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent"
            >
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
            <select
              value={form.timezone}
              onChange={(e) => onChange({ ...form, timezone: e.target.value })}
              className="w-full appearance-none rounded-xl border border-input bg-background px-4 py-3 pr-10 text-sm text-foreground transition-all focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent"
            >
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
