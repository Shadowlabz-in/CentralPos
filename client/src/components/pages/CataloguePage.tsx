import { useState, useMemo, useEffect, useRef, useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useLocation } from 'react-router-dom';
import {
  Plus,
  Edit2,
  Trash2,
  Tag,
  Barcode,
  Printer,
  RefreshCw,
  Package,
  X,
  Star,
  ImageIcon,
  ShoppingBag,
  Eye,
  ChevronRight,
} from 'lucide-react';
import BarcodeLib from 'react-barcode';
import JsBarcode from 'jsbarcode';
import { apiRequest } from '@/context/AuthContext';
import type { Category, Brand, Product, ProductVariant, ProductImage, HsnCode, Fabric, Occasion, Country, Size, Color, Supplier } from '@/types';
import { Table } from '@/components/ui/Table';
import { Dialog } from '@/components/ui/Dialog';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { SearchInput } from '@/components/ui/SearchInput';
import { Select } from '@/components/ui/Select';
import { Badge } from '@/components/ui/Badge';
import { PageSpinner } from '@/components/ui/Spinner';
import { Button } from '@/components/ui/button';
import Input from '@/components/ui/Input';
import { Tabs } from '@/components/ui/Tabs';

function FullScreenOverlay({ children, onClose, title }: { children: React.ReactNode; onClose: () => void; title: string }) {
  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-background/95 backdrop-blur-sm">
      <div className="shrink-0 border-b border-border bg-card">
        <div className="flex items-center justify-between px-8 py-5 max-w-5xl mx-auto">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center">
              <Package size={18} className="text-primary" />
            </div>
            <h2 className="text-xl font-bold text-foreground">{title}</h2>
          </div>
          <button onClick={onClose} className="p-2.5 rounded-xl hover:bg-accent text-muted-foreground hover:text-foreground transition-all duration-200" title="Close">
            <X size={20} />
          </button>
        </div>
      </div>
      <div className="flex-1 overflow-y-auto px-4 py-6">
        {children}
      </div>
    </div>
  );
}

const API_BASE = import.meta.env.VITE_API_URL || '/api';

function getBarcodeImageUrl(path?: string | null): string | null {
  if (!path) return null;
  if (path.startsWith('http')) return path;
  const base = API_BASE.replace(/\/api$/, '');
  return `${base}${path}`;
}

function generateSKU(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  return Array.from({ length: 10 }, () => chars[Math.floor(Math.random() * chars.length)]).join('');
}

type Section = 'brands' | 'categories' | 'products' | 'hsn-codes' | 'fabrics' | 'occasions' | 'countries' | 'sizes' | 'colors' | 'suppliers';

const ADD_LABELS: Record<string, string> = {
  products: 'Create Product',
  categories: 'Add Category',
  brands: 'Add Brand',
  'hsn-codes': 'Add HSN Code',
  fabrics: 'Add Fabric',
  occasions: 'Add Occasion',
  countries: 'Add Country',
  sizes: 'Add Size',
  colors: 'Add Color',
  suppliers: 'Add Supplier',
};

export default function CataloguePage() {
  const queryClient = useQueryClient();
  const location = useLocation();
  const pathSection = location.pathname.split('/').pop();
  const [section, setSection] = useState<Section>(
    pathSection === 'categories' ? 'categories' : pathSection === 'brands' ? 'brands' : 'products',
  );
  const [sectionSearch, setSectionSearch] = useState<Record<string, string>>({});
  const [addTrigger, setAddTrigger] = useState<Record<string, number>>({});

  useEffect(() => {
    const p = location.pathname.split('/').pop() || '';
    const valid: Record<string, Section> = {
      categories: 'categories', brands: 'brands',
      'hsn-codes': 'hsn-codes', fabrics: 'fabrics',
      occasions: 'occasions', countries: 'countries',
      sizes: 'sizes', colors: 'colors',
    };
    setSection(valid[p] || 'products');
  }, [location.pathname]);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-3 min-w-0">
          <h1 className="text-lg font-bold shrink-0">Catalogue</h1>
          <span className="text-xs text-muted-foreground hidden sm:inline">/</span>
          <p className="text-xs text-muted-foreground truncate hidden sm:block">Manage your product catalogue</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="w-56">
            <SearchInput value={sectionSearch[section] || ''} onChange={(v) => setSectionSearch(prev => ({ ...prev, [section]: v }))} placeholder="Search..." />
          </div>
          <Button size="sm" onClick={() => setAddTrigger(prev => ({ ...prev, [section]: (prev[section] || 0) + 1 }))}>
            <Plus size={14} className="mr-1" /> {ADD_LABELS[section]}
          </Button>
        </div>
      </div>

      <div className="flex overflow-x-auto scrollbar-none gap-1 bg-muted/50 rounded-xl p-1 border border-border">
        {[
          { id: 'products' as const, label: 'Products' },
          { id: 'categories' as const, label: 'Categories' },
          { id: 'brands' as const, label: 'Brands' },
          { id: 'hsn-codes' as const, label: 'HSN Codes' },
          { id: 'fabrics' as const, label: 'Fabrics' },
          { id: 'occasions' as const, label: 'Occasions' },
          { id: 'countries' as const, label: 'Countries' },
          { id: 'sizes' as const, label: 'Sizes' },
          { id: 'colors' as const, label: 'Colors' },
          { id: 'suppliers' as const, label: 'Suppliers' },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setSection(tab.id)}
            className={`relative px-3 py-1.5 text-xs font-medium whitespace-nowrap rounded-lg transition-all duration-200 ${
              section === tab.id
                ? 'bg-card text-foreground shadow-sm border border-border'
                : 'text-muted-foreground hover:text-foreground border border-transparent'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div className={section === 'brands' ? '' : 'hidden'}><BrandSection addTrigger={addTrigger['brands'] || 0} search={sectionSearch['brands'] || ''} onSearch={(v) => setSectionSearch(prev => ({ ...prev, brands: v }))} /></div>
      <div className={section === 'categories' ? '' : 'hidden'}><CategorySection addTrigger={addTrigger['categories'] || 0} search={sectionSearch['categories'] || ''} onSearch={(v) => setSectionSearch(prev => ({ ...prev, categories: v }))} /></div>
      <div className={section === 'products' ? '' : 'hidden'}><ProductSection addTrigger={addTrigger['products'] || 0} search={sectionSearch['products'] || ''} onSearch={(v) => setSectionSearch(prev => ({ ...prev, products: v }))} /></div>
      <div className={section === 'hsn-codes' ? '' : 'hidden'}><HsnCodeSection addTrigger={addTrigger['hsn-codes'] || 0} search={sectionSearch['hsn-codes'] || ''} onSearch={(v) => setSectionSearch(prev => ({ ...prev, 'hsn-codes': v }))} /></div>
      <div className={section === 'fabrics' ? '' : 'hidden'}><FabricSection addTrigger={addTrigger['fabrics'] || 0} search={sectionSearch['fabrics'] || ''} onSearch={(v) => setSectionSearch(prev => ({ ...prev, fabrics: v }))} /></div>
      <div className={section === 'occasions' ? '' : 'hidden'}><OccasionSection addTrigger={addTrigger['occasions'] || 0} search={sectionSearch['occasions'] || ''} onSearch={(v) => setSectionSearch(prev => ({ ...prev, occasions: v }))} /></div>
      <div className={section === 'countries' ? '' : 'hidden'}><CountrySection addTrigger={addTrigger['countries'] || 0} search={sectionSearch['countries'] || ''} onSearch={(v) => setSectionSearch(prev => ({ ...prev, countries: v }))} /></div>
      <div className={section === 'sizes' ? '' : 'hidden'}><SizeSection addTrigger={addTrigger['sizes'] || 0} search={sectionSearch['sizes'] || ''} onSearch={(v) => setSectionSearch(prev => ({ ...prev, sizes: v }))} /></div>
      <div className={section === 'colors' ? '' : 'hidden'}><ColorSection addTrigger={addTrigger['colors'] || 0} search={sectionSearch['colors'] || ''} onSearch={(v) => setSectionSearch(prev => ({ ...prev, colors: v }))} /></div>
      <div className={section === 'suppliers' ? '' : 'hidden'}><SupplierSection addTrigger={addTrigger['suppliers'] || 0} search={sectionSearch['suppliers'] || ''} onSearch={(v) => setSectionSearch(prev => ({ ...prev, suppliers: v }))} /></div>
    </div>
  );
}

function BrandSection({ addTrigger, search, onSearch }: { addTrigger: number; search: string; onSearch: (v: string) => void }) {
  const queryClient = useQueryClient();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<Brand | null>(null);
  const [form, setForm] = useState({ name: '', description: '' });
  const [formError, setFormError] = useState('');
  const [deleteTarget, setDeleteTarget] = useState<Brand | null>(null);

  const { data: brands, isLoading, error } = useQuery({
    queryKey: ['brands'],
    queryFn: async () => {
      const res = await apiRequest<{ status: string; data: Brand[] }>('/brands');
      return res.data;
    },
  });

  const filtered = useMemo(() => {
    if (!brands) return [];
    if (!search.trim()) return brands;
    const q = search.toLowerCase();
    return brands.filter((b) => b.name.toLowerCase().includes(q));
  }, [brands, search]);

  const invalidate = () => queryClient.invalidateQueries({ queryKey: ['brands'] });

  const createMutation = useMutation({
    mutationFn: (data: { name: string; description?: string }) =>
      apiRequest('/brands', { method: 'POST', body: JSON.stringify(data) }),
    onSuccess: () => { invalidate(); closeDialog(); },
    onError: (e: Error) => setFormError(e.message),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: { name?: string; description?: string } }) =>
      apiRequest(`/brands/${id}`, { method: 'PATCH', body: JSON.stringify(data) }),
    onSuccess: () => { invalidate(); closeDialog(); },
    onError: (e: Error) => setFormError(e.message),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => apiRequest(`/brands/${id}`, { method: 'DELETE' }),
    onSuccess: () => { invalidate(); setDeleteTarget(null); },
  });

  function openAdd() {
    setEditing(null);
    setForm({ name: '', description: '' });
    setFormError('');
    setDialogOpen(true);
  }

  function openEdit(brand: Brand) {
    setEditing(brand);
    setForm({ name: brand.name, description: brand.description || '' });
    setFormError('');
    setDialogOpen(true);
  }

  function closeDialog() {
    setDialogOpen(false);
    setEditing(null);
    setForm({ name: '', description: '' });
    setFormError('');
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setFormError('');
    if (!form.name.trim()) { setFormError('Name is required'); return; }
    const payload: { name: string; description?: string } = { name: form.name.trim() };
    if (form.description.trim()) payload.description = form.description.trim();
    if (editing) {
      updateMutation.mutate({ id: editing.id, data: payload });
    } else {
      createMutation.mutate(payload);
    }
  }

  const submitting = createMutation.isPending || updateMutation.isPending;

  const prevTriggerRef = useRef(0);
  useEffect(() => {
    if (addTrigger > prevTriggerRef.current) { prevTriggerRef.current = addTrigger; openAdd(); }
  }, [addTrigger]);

  if (isLoading) return <PageSpinner />;
  if (error) return <p className="text-red-500">Failed to load brands</p>;

  return (
    <div className="space-y-4">

      <Table
        columns={[
          { key: 'name', header: 'Name', render: (b: Brand) => (
            <span className="flex items-center gap-2 font-medium">
              <Tag size={14} className="text-muted-foreground" /> {b.name}
            </span>
          )},
          { key: 'description', header: 'Description', render: (b: Brand) => b.description || '-' },
          { key: 'productCount', header: 'Products', render: (b: Brand) => (
            <Badge variant={b.productCount && b.productCount > 0 ? 'default' : 'info'}>{b.productCount || 0}</Badge>
          )},
          { key: 'actions', header: 'Actions', render: (b: Brand) => (
            <div className="flex gap-1">
              <Button size="sm" variant="ghost" onClick={(e) => { e.stopPropagation(); openEdit(b); }}>
                <Edit2 size={14} />
              </Button>
              <Button size="sm" variant="ghost" onClick={(e) => { e.stopPropagation(); setDeleteTarget(b); }}>
                <Trash2 size={14} className="text-red-500" />
              </Button>
            </div>
          )},
        ]}
        data={filtered}
        keyExtractor={(b) => b.id}
        emptyMessage="No brands found. Create your first brand."
      />

      <Dialog open={dialogOpen} onClose={closeDialog} title={editing ? 'Edit Brand' : 'Add Brand'}>
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input label="Name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Brand name" />
          <div className="space-y-1">
            <label className="block text-sm font-medium text-foreground">Description</label>
            <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })}
              placeholder="Optional description" rows={3}
              className="w-full rounded-lg border border-border px-3 py-2 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-primary" />
          </div>
          {formError && <p className="text-sm text-red-500">{formError}</p>}
          <div className="flex justify-end gap-3 pt-2">
            <Button variant="outline" type="button" onClick={closeDialog}>Cancel</Button>
            <Button type="submit" disabled={submitting}>{submitting ? 'Saving...' : editing ? 'Update' : 'Create'}</Button>
          </div>
        </form>
      </Dialog>

      <ConfirmDialog
        open={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={() => deleteTarget && deleteMutation.mutate(deleteTarget.id)}
        title="Delete Brand"
        message={deleteTarget && (deleteTarget.productCount ?? 0) > 0
          ? `Cannot delete "${deleteTarget.name}" — it has ${deleteTarget.productCount} product(s) assigned.`
          : `Are you sure you want to delete "${deleteTarget?.name}"?`}
        confirmLabel="Delete" variant="danger" loading={deleteMutation.isPending} />
    </div>
  );
}

function CategorySection({ addTrigger, search, onSearch }: { addTrigger: number; search: string; onSearch: (v: string) => void }) {
  const queryClient = useQueryClient();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<Category | null>(null);
  const [form, setForm] = useState({ name: '', description: '', parentId: '' });
  const [formError, setFormError] = useState('');
  const [deleteTarget, setDeleteTarget] = useState<Category | null>(null);

  const { data: categories, isLoading, error } = useQuery({
    queryKey: ['categories'],
    queryFn: async () => {
      const res = await apiRequest<{ status: string; data: Category[] }>('/categories');
      return res.data;
    },
    staleTime: 60000,
  });

  const filtered = useMemo(() => {
    if (!categories) return [];
    if (!search.trim()) return categories;
    const q = search.toLowerCase();
    return categories.filter((c) => c.name.toLowerCase().includes(q));
  }, [categories, search]);

  const parentOptions = useMemo(() =>
    (categories || []).filter((c) => c.id !== editing?.id).map((c) => ({ value: c.id, label: c.name })),
    [categories, editing],
  );

  const invalidate = () => queryClient.invalidateQueries({ queryKey: ['categories'] });

  const createMutation = useMutation({
    mutationFn: (data: { name: string; description?: string; parentId?: string }) =>
      apiRequest('/categories', { method: 'POST', body: JSON.stringify(data) }),
    onSuccess: () => { invalidate(); closeDialog(); },
    onError: (e: Error) => setFormError(e.message),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: { name?: string; description?: string; parentId?: string | null } }) =>
      apiRequest(`/categories/${id}`, { method: 'PATCH', body: JSON.stringify(data) }),
    onSuccess: () => { invalidate(); closeDialog(); },
    onError: (e: Error) => setFormError(e.message),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => apiRequest(`/categories/${id}`, { method: 'DELETE' }),
    onSuccess: () => { invalidate(); setDeleteTarget(null); },
  });

  function openAdd() {
    setEditing(null);
    setForm({ name: '', description: '', parentId: '' });
    setFormError(''); setDialogOpen(true);
  }

  function openEdit(cat: Category) {
    setEditing(cat);
    setForm({ name: cat.name, description: cat.description || '', parentId: cat.parentId || '' });
    setFormError(''); setDialogOpen(true);
  }

  function closeDialog() {
    setDialogOpen(false); setEditing(null);
    setForm({ name: '', description: '', parentId: '' }); setFormError('');
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setFormError('');
    if (!form.name.trim()) { setFormError('Name is required'); return; }
    const payload: any = { name: form.name.trim() };
    if (form.description.trim()) payload.description = form.description.trim();
    if (form.parentId) payload.parentId = form.parentId;
    if (editing) {
      updateMutation.mutate({ id: editing.id, data: payload });
    } else {
      createMutation.mutate(payload);
    }
  }

  const submitting = createMutation.isPending || updateMutation.isPending;

  const prevTriggerRef = useRef(0);
  useEffect(() => {
    if (addTrigger > prevTriggerRef.current) { prevTriggerRef.current = addTrigger; openAdd(); }
  }, [addTrigger]);

  if (isLoading) return <PageSpinner />;
  if (error) return <p className="text-red-500">Failed to load categories</p>;

  return (
    <div className="space-y-4">

      <Table
        columns={[
          { key: 'name', header: 'Name', render: (c: Category) => <span className="font-medium">{c.name}</span> },
          { key: 'parent', header: 'Parent', render: (c: Category) => c.parent?.name || '-' },
          { key: 'productCount', header: 'Products', render: (c: Category) => (
            <Badge variant={c.productCount && c.productCount > 0 ? 'default' : 'info'}>{c.productCount || 0}</Badge>
          )},
          { key: 'childCount', header: 'Subcategories', render: (c: Category) => c.childCount || 0 },
          { key: 'actions', header: 'Actions', render: (c: Category) => (
            <div className="flex gap-1">
              <Button size="sm" variant="ghost" onClick={(e) => { e.stopPropagation(); openEdit(c); }}>
                <Edit2 size={14} />
              </Button>
              <Button size="sm" variant="ghost" onClick={(e) => { e.stopPropagation(); setDeleteTarget(c); }}>
                <Trash2 size={14} className="text-red-500" />
              </Button>
            </div>
          )},
        ]}
        data={filtered}
        keyExtractor={(c) => c.id}
        emptyMessage="No categories found. Create your first category."
      />

      <Dialog open={dialogOpen} onClose={closeDialog} title={editing ? 'Edit Category' : 'Add Category'}>
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input label="Name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Category name" />
          <Select label="Parent Category" value={form.parentId} onChange={(e) => setForm({ ...form, parentId: e.target.value })}
            options={parentOptions} placeholder="None (Top level)" />
          <div className="space-y-1">
            <label className="block text-sm font-medium text-foreground">Description</label>
            <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })}
              placeholder="Optional description" rows={3}
              className="w-full rounded-lg border border-border px-3 py-2 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-primary" />
          </div>
          {formError && <p className="text-sm text-red-500">{formError}</p>}
          <div className="flex justify-end gap-3 pt-2">
            <Button variant="outline" type="button" onClick={closeDialog}>Cancel</Button>
            <Button type="submit" disabled={submitting}>{submitting ? 'Saving...' : editing ? 'Update' : 'Create'}</Button>
          </div>
        </form>
      </Dialog>

      <ConfirmDialog
        open={!!deleteTarget} onClose={() => setDeleteTarget(null)}
        onConfirm={() => deleteTarget && deleteMutation.mutate(deleteTarget.id)}
        title="Delete Category"
        message={deleteTarget && (deleteTarget.productCount ?? 0) > 0
          ? `Cannot delete "${deleteTarget.name}" — it has ${deleteTarget.productCount} product(s).`
          : `Are you sure you want to delete "${deleteTarget?.name}"?`}
        confirmLabel="Delete" variant="danger" loading={deleteMutation.isPending} />
    </div>
  );
}

function MasterSection<T extends { id: string; productCount?: number }>({
  title,
  items,
  isLoading,
  fields,
  onSave,
  onDelete,
}: {
  title: string;
  items: T[];
  isLoading: boolean;
  fields: { key: keyof T; label: string; placeholder?: string }[];
  onSave: (data: Record<string, string>) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
}) {
  const [search, setSearch] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<T | null>(null);
  const [form, setForm] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState('');
  const [deleteTarget, setDeleteTarget] = useState<T | null>(null);

  const filtered = useMemo(() => {
    if (!search) return items;
    const q = search.toLowerCase();
    return items.filter((item) =>
      fields.some((f) => String(item[f.key] || '').toLowerCase().includes(q)),
    );
  }, [items, search, fields]);

  function openCreate() {
    setEditing(null);
    setForm(Object.fromEntries(fields.map((f) => [f.key as string, ''])));
    setFormError('');
    setDialogOpen(true);
  }

  function openEdit(item: T) {
    setEditing(item);
    setForm(Object.fromEntries(fields.map((f) => [f.key as string, String(item[f.key] || '')])));
    setFormError('');
    setDialogOpen(true);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form[fields[0].key as string]?.trim()) {
      setFormError(`${fields[0].label} is required`);
      return;
    }
    setSubmitting(true);
    setFormError('');
    try {
      await onSave(form);
      setDialogOpen(false);
    } catch (err: any) {
      setFormError(err.message || 'Failed to save');
    } finally {
      setSubmitting(false);
    }
  }

  if (isLoading) return <PageSpinner />;

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <SearchInput value={search} onChange={setSearch} placeholder={`Search ${title.toLowerCase()}...`} />
        <Button size="sm" onClick={openCreate}><Plus size={14} className="mr-1" />Add {title.slice(0, -1)}</Button>
      </div>
      <div className="grid gap-2">
        {filtered.length === 0 ? (
          <p className="text-muted-foreground text-sm py-4 text-center">No {title.toLowerCase()} found.</p>
        ) : (
          filtered.map((item) => (
            <div key={item.id} className="flex items-center justify-between px-4 py-3 bg-card border border-border rounded-lg hover:border-border">
              <div>
                <p className="font-medium text-sm">{fields.map((f) => String(item[f.key] || '')).join(' — ')}</p>
                {(item as any).productCount !== undefined && (
                  <p className="text-xs text-muted-foreground">{(item as any).productCount} product(s)</p>
                )}
              </div>
              <div className="flex items-center gap-1">
                <button onClick={() => openEdit(item)} className="p-1.5 rounded-lg hover:bg-accent text-muted-foreground hover:text-primary"><Edit2 size={14} /></button>
                <button onClick={() => setDeleteTarget(item)} className="p-1.5 rounded-lg hover:bg-accent text-muted-foreground hover:text-destructive"><Trash2 size={14} /></button>
              </div>
            </div>
          ))
        )}
      </div>

      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} title={editing ? `Edit ${title.slice(0, -1)}` : `Add ${title.slice(0, -1)}`} size="sm">
        <form onSubmit={handleSubmit} className="space-y-4">
          {fields.map((f) => (
            <Input key={f.key as string} label={f.label} value={form[f.key as string] || ''} onChange={(e) => setForm({ ...form, [f.key as string]: e.target.value })} placeholder={f.placeholder} />
          ))}
          {formError && <p className="text-sm text-red-500">{formError}</p>}
          <div className="flex justify-end gap-3 pt-2">
            <Button variant="outline" type="button" onClick={() => setDialogOpen(false)}>Cancel</Button>
            <Button type="submit" disabled={submitting}>{submitting ? 'Saving...' : editing ? 'Update' : 'Create'}</Button>
          </div>
        </form>
      </Dialog>

      <ConfirmDialog
        open={!!deleteTarget} onClose={() => setDeleteTarget(null)}
        onConfirm={async () => { if (deleteTarget) { await onDelete(deleteTarget.id); setDeleteTarget(null); } }}
        title={`Delete ${title.slice(0, -1)}`}
        message={deleteTarget && (deleteTarget.productCount ?? 0) > 0
          ? `Cannot delete "${fields.map((f) => String(deleteTarget[f.key] || '')).join(' ')}" — it has ${deleteTarget.productCount} product(s).`
          : `Are you sure you want to delete "${fields.map((f) => String(deleteTarget?.[f.key] || '')).join(' ')}"?`}
        confirmLabel="Delete" variant="danger" />
    </div>
  );
}

function HsnCodeSection({ addTrigger, search, onSearch }: { addTrigger: number; search: string; onSearch: (v: string) => void }) {
  const queryClient = useQueryClient();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<HsnCode | null>(null);
  const [form, setForm] = useState({ code: '', description: '' });
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState('');
  const [deleteTarget, setDeleteTarget] = useState<HsnCode | null>(null);

  const { data, isLoading } = useQuery({
    queryKey: ['hsn-codes'],
    queryFn: async () => { const r = await apiRequest<{ data: HsnCode[] }>('/hsn-codes'); return r.data; },
  });

  const filtered = useMemo(() => {
    if (!search) return data || [];
    const q = search.toLowerCase();
    return (data || []).filter((h) => h.code.toLowerCase().includes(q) || (h.description || '').toLowerCase().includes(q));
  }, [data, search]);

  const prevTriggerRef = useRef(0);
  useEffect(() => {
    if (addTrigger > prevTriggerRef.current) { prevTriggerRef.current = addTrigger; setEditing(null); setForm({ code: '', description: '' }); setFormError(''); setDialogOpen(true); }
  }, [addTrigger]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.code.trim()) { setFormError('Code is required'); return; }
    setSubmitting(true); setFormError('');
    try {
      if (editing) {
        await apiRequest(`/hsn-codes/${editing.id}`, { method: 'PATCH', body: JSON.stringify({ code: form.code.trim(), description: form.description.trim() || undefined }) });
      } else {
        await apiRequest('/hsn-codes', { method: 'POST', body: JSON.stringify({ code: form.code.trim(), description: form.description.trim() || undefined }) });
      }
      setDialogOpen(false);
      queryClient.invalidateQueries({ queryKey: ['hsn-codes'] });
    } catch (e: any) { setFormError(e.message); }
    finally { setSubmitting(false); }
  }

  async function handleDelete(id: string) {
    await apiRequest(`/hsn-codes/${id}`, { method: 'DELETE' });
    queryClient.invalidateQueries({ queryKey: ['hsn-codes'] });
    setDeleteTarget(null);
  }

  return masterSectionLayout({
    title: 'HSN Codes', items: filtered, isLoading,
    fields: [
      { key: 'code', label: 'Code' },
      { key: 'description', label: 'Description' },
    ],
    onAdd: () => { setEditing(null); setForm({ code: '', description: '' }); setFormError(''); setDialogOpen(true); },
    onEdit: (item) => { setEditing(item); setForm({ code: item.code, description: item.description || '' }); setFormError(''); setDialogOpen(true); },
    onDelete: (item) => setDeleteTarget(item),
    dialog: (
      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} title={editing ? 'Edit HSN Code' : 'Add HSN Code'} size="sm">
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input label="Code" value={form.code} onChange={(e) => setForm({ ...form, code: e.target.value })} placeholder="e.g. 6204" />
          <Input label="Description" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="Optional description" />
          {formError && <p className="text-sm text-red-500">{formError}</p>}
          <div className="flex justify-end gap-3 pt-2">
            <Button variant="outline" type="button" onClick={() => setDialogOpen(false)}>Cancel</Button>
            <Button type="submit" disabled={submitting}>{submitting ? 'Saving...' : editing ? 'Update' : 'Create'}</Button>
          </div>
        </form>
      </Dialog>
    ),
    deleteDialog: (
      <ConfirmDialog open={!!deleteTarget} onClose={() => setDeleteTarget(null)} onConfirm={() => deleteTarget && handleDelete(deleteTarget.id)}
        title="Delete HSN Code"
        message={deleteTarget && (deleteTarget.productCount ?? 0) > 0
          ? `Cannot delete "${deleteTarget.code}" — it has ${deleteTarget.productCount} product(s).`
          : `Delete "${deleteTarget?.code}"?`}
        confirmLabel="Delete" variant="danger" />
    ),
  });
}

function FabricSection({ addTrigger, search, onSearch }: { addTrigger: number; search: string; onSearch: (v: string) => void }) {
  const queryClient = useQueryClient();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<Fabric | null>(null);
  const [form, setForm] = useState({ name: '', description: '' });
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState('');
  const [deleteTarget, setDeleteTarget] = useState<Fabric | null>(null);
  const prevTriggerRef = useRef(0);
  useEffect(() => {
    if (addTrigger > prevTriggerRef.current) { prevTriggerRef.current = addTrigger; setEditing(null); setForm({ name: '', description: '' }); setFormError(''); setDialogOpen(true); }
  }, [addTrigger]);

  const { data, isLoading } = useQuery({
    queryKey: ['fabrics'],
    queryFn: async () => { const r = await apiRequest<{ data: Fabric[] }>('/fabrics'); return r.data; },
  });

  const filtered = useMemo(() => {
    if (!search) return data || [];
    const q = search.toLowerCase();
    return (data || []).filter((f) => f.name.toLowerCase().includes(q));
  }, [data, search]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.name.trim()) { setFormError('Name is required'); return; }
    setSubmitting(true); setFormError('');
    try {
      if (editing) {
        await apiRequest(`/fabrics/${editing.id}`, { method: 'PATCH', body: JSON.stringify({ name: form.name.trim(), description: form.description.trim() || undefined }) });
      } else {
        await apiRequest('/fabrics', { method: 'POST', body: JSON.stringify({ name: form.name.trim(), description: form.description.trim() || undefined }) });
      }
      setDialogOpen(false);
      queryClient.invalidateQueries({ queryKey: ['fabrics'] });
    } catch (e: any) { setFormError(e.message); }
    finally { setSubmitting(false); }
  }

  async function handleDelete(id: string) {
    await apiRequest(`/fabrics/${id}`, { method: 'DELETE' });
    queryClient.invalidateQueries({ queryKey: ['fabrics'] });
    setDeleteTarget(null);
  }

  return masterSectionLayout({
    title: 'Fabrics', items: filtered, isLoading,
    fields: [{ key: 'name', label: 'Name' }, { key: 'description', label: 'Description' }],
    onAdd: () => { setEditing(null); setForm({ name: '', description: '' }); setFormError(''); setDialogOpen(true); },
    onEdit: (item) => { setEditing(item); setForm({ name: item.name, description: item.description || '' }); setFormError(''); setDialogOpen(true); },
    onDelete: (item) => setDeleteTarget(item),
    dialog: (
      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} title={editing ? 'Edit Fabric' : 'Add Fabric'} size="sm">
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input label="Name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="e.g. Cotton" />
          <Input label="Description" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="Optional" />
          {formError && <p className="text-sm text-red-500">{formError}</p>}
          <div className="flex justify-end gap-3 pt-2">
            <Button variant="outline" type="button" onClick={() => setDialogOpen(false)}>Cancel</Button>
            <Button type="submit" disabled={submitting}>{submitting ? 'Saving...' : editing ? 'Update' : 'Create'}</Button>
          </div>
        </form>
      </Dialog>
    ),
    deleteDialog: (
      <ConfirmDialog open={!!deleteTarget} onClose={() => setDeleteTarget(null)} onConfirm={() => deleteTarget && handleDelete(deleteTarget.id)}
        title="Delete Fabric"
        message={deleteTarget && (deleteTarget.productCount ?? 0) > 0
          ? `Cannot delete "${deleteTarget.name}" — it has ${deleteTarget.productCount} product(s).`
          : `Delete "${deleteTarget?.name}"?`}
        confirmLabel="Delete" variant="danger" />
    ),
  });
}

function OccasionSection({ addTrigger, search, onSearch }: { addTrigger: number; search: string; onSearch: (v: string) => void }) {
  const queryClient = useQueryClient();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<Occasion | null>(null);
  const [form, setForm] = useState({ name: '', description: '' });
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState('');
  const [deleteTarget, setDeleteTarget] = useState<Occasion | null>(null);
  const prevTriggerRef = useRef(0);
  useEffect(() => {
    if (addTrigger > prevTriggerRef.current) { prevTriggerRef.current = addTrigger; setEditing(null); setForm({ name: '', description: '' }); setFormError(''); setDialogOpen(true); }
  }, [addTrigger]);

  const { data, isLoading } = useQuery({
    queryKey: ['occasions'],
    queryFn: async () => { const r = await apiRequest<{ data: Occasion[] }>('/occasions'); return r.data; },
  });

  const filtered = useMemo(() => {
    if (!search) return data || [];
    const q = search.toLowerCase();
    return (data || []).filter((o) => o.name.toLowerCase().includes(q));
  }, [data, search]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.name.trim()) { setFormError('Name is required'); return; }
    setSubmitting(true); setFormError('');
    try {
      if (editing) {
        await apiRequest(`/occasions/${editing.id}`, { method: 'PATCH', body: JSON.stringify({ name: form.name.trim(), description: form.description.trim() || undefined }) });
      } else {
        await apiRequest('/occasions', { method: 'POST', body: JSON.stringify({ name: form.name.trim(), description: form.description.trim() || undefined }) });
      }
      setDialogOpen(false);
      queryClient.invalidateQueries({ queryKey: ['occasions'] });
    } catch (e: any) { setFormError(e.message); }
    finally { setSubmitting(false); }
  }

  async function handleDelete(id: string) {
    await apiRequest(`/occasions/${id}`, { method: 'DELETE' });
    queryClient.invalidateQueries({ queryKey: ['occasions'] });
    setDeleteTarget(null);
  }

  return masterSectionLayout({
    title: 'Occasions', items: filtered, isLoading,
    fields: [{ key: 'name', label: 'Name' }, { key: 'description', label: 'Description' }],
    onAdd: () => { setEditing(null); setForm({ name: '', description: '' }); setFormError(''); setDialogOpen(true); },
    onEdit: (item) => { setEditing(item); setForm({ name: item.name, description: item.description || '' }); setFormError(''); setDialogOpen(true); },
    onDelete: (item) => setDeleteTarget(item),
    dialog: (
      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} title={editing ? 'Edit Occasion' : 'Add Occasion'} size="sm">
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input label="Name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="e.g. Wedding" />
          <Input label="Description" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="Optional" />
          {formError && <p className="text-sm text-red-500">{formError}</p>}
          <div className="flex justify-end gap-3 pt-2">
            <Button variant="outline" type="button" onClick={() => setDialogOpen(false)}>Cancel</Button>
            <Button type="submit" disabled={submitting}>{submitting ? 'Saving...' : editing ? 'Update' : 'Create'}</Button>
          </div>
        </form>
      </Dialog>
    ),
    deleteDialog: (
      <ConfirmDialog open={!!deleteTarget} onClose={() => setDeleteTarget(null)} onConfirm={() => deleteTarget && handleDelete(deleteTarget.id)}
        title="Delete Occasion"
        message={deleteTarget && (deleteTarget.productCount ?? 0) > 0
          ? `Cannot delete "${deleteTarget.name}" — it has ${deleteTarget.productCount} product(s).`
          : `Delete "${deleteTarget?.name}"?`}
        confirmLabel="Delete" variant="danger" />
    ),
  });
}

function CountrySection({ addTrigger, search, onSearch }: { addTrigger: number; search: string; onSearch: (v: string) => void }) {
  const queryClient = useQueryClient();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<Country | null>(null);
  const [form, setForm] = useState({ name: '', code: '' });
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState('');
  const [deleteTarget, setDeleteTarget] = useState<Country | null>(null);
  const prevTriggerRef = useRef(0);
  useEffect(() => {
    if (addTrigger > prevTriggerRef.current) { prevTriggerRef.current = addTrigger; setEditing(null); setForm({ name: '', code: '' }); setFormError(''); setDialogOpen(true); }
  }, [addTrigger]);

  const { data, isLoading } = useQuery({
    queryKey: ['countries'],
    queryFn: async () => { const r = await apiRequest<{ data: Country[] }>('/countries'); return r.data; },
  });

  const filtered = useMemo(() => {
    if (!search) return data || [];
    const q = search.toLowerCase();
    return (data || []).filter((c) => c.name.toLowerCase().includes(q) || c.code.toLowerCase().includes(q));
  }, [data, search]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.name.trim()) { setFormError('Name is required'); return; }
    if (!form.code.trim()) { setFormError('Code is required'); return; }
    setSubmitting(true); setFormError('');
    try {
      if (editing) {
        await apiRequest(`/countries/${editing.id}`, { method: 'PATCH', body: JSON.stringify({ name: form.name.trim(), code: form.code.trim().toUpperCase() }) });
      } else {
        await apiRequest('/countries', { method: 'POST', body: JSON.stringify({ name: form.name.trim(), code: form.code.trim().toUpperCase() }) });
      }
      setDialogOpen(false);
      queryClient.invalidateQueries({ queryKey: ['countries'] });
    } catch (e: any) { setFormError(e.message); }
    finally { setSubmitting(false); }
  }

  async function handleDelete(id: string) {
    await apiRequest(`/countries/${id}`, { method: 'DELETE' });
    queryClient.invalidateQueries({ queryKey: ['countries'] });
    setDeleteTarget(null);
  }

  return masterSectionLayout({
    title: 'Countries', items: filtered, isLoading,
    fields: [{ key: 'name', label: 'Name' }, { key: 'code', label: 'Code' }],
    onAdd: () => { setEditing(null); setForm({ name: '', code: '' }); setFormError(''); setDialogOpen(true); },
    onEdit: (item) => { setEditing(item); setForm({ name: item.name, code: item.code }); setFormError(''); setDialogOpen(true); },
    onDelete: (item) => setDeleteTarget(item),
    dialog: (
      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} title={editing ? 'Edit Country' : 'Add Country'} size="sm">
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input label="Name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="e.g. India" />
          <Input label="Code (ISO 2-letter)" value={form.code} onChange={(e) => setForm({ ...form, code: e.target.value.toUpperCase() })} placeholder="e.g. IN" maxLength={2} />
          {formError && <p className="text-sm text-red-500">{formError}</p>}
          <div className="flex justify-end gap-3 pt-2">
            <Button variant="outline" type="button" onClick={() => setDialogOpen(false)}>Cancel</Button>
            <Button type="submit" disabled={submitting}>{submitting ? 'Saving...' : editing ? 'Update' : 'Create'}</Button>
          </div>
        </form>
      </Dialog>
    ),
    deleteDialog: (
      <ConfirmDialog open={!!deleteTarget} onClose={() => setDeleteTarget(null)} onConfirm={() => deleteTarget && handleDelete(deleteTarget.id)}
        title="Delete Country"
        message={deleteTarget && (deleteTarget.productCount ?? 0) > 0
          ? `Cannot delete "${deleteTarget.name}" — it has ${deleteTarget.productCount} product(s).`
          : `Delete "${deleteTarget?.name}"?`}
        confirmLabel="Delete" variant="danger" />
    ),
  });
}

function SizeSection({ addTrigger, search, onSearch }: { addTrigger: number; search: string; onSearch: (v: string) => void }) {
  const queryClient = useQueryClient();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<Size | null>(null);
  const [form, setForm] = useState({ name: '', sortOrder: '0' });
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState('');
  const [deleteTarget, setDeleteTarget] = useState<Size | null>(null);
  const prevTriggerRef = useRef(0);
  useEffect(() => {
    if (addTrigger > prevTriggerRef.current) { prevTriggerRef.current = addTrigger; setEditing(null); setForm({ name: '', sortOrder: '0' }); setFormError(''); setDialogOpen(true); }
  }, [addTrigger]);

  const { data, isLoading } = useQuery({
    queryKey: ['sizes'],
    queryFn: async () => { const r = await apiRequest<{ data: Size[] }>('/sizes'); return r.data; },
  });
  const filtered = useMemo(() => {
    if (!search) return data || [];
    return (data || []).filter((s) => s.name.toLowerCase().includes(search.toLowerCase()));
  }, [data, search]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.name.trim()) { setFormError('Name is required'); return; }
    setSubmitting(true); setFormError('');
    try {
      const payload: any = { name: form.name.trim() };
      if (form.sortOrder) payload.sortOrder = parseInt(form.sortOrder, 10);
      if (editing) { await apiRequest(`/sizes/${editing.id}`, { method: 'PATCH', body: JSON.stringify(payload) }); }
      else { await apiRequest('/sizes', { method: 'POST', body: JSON.stringify(payload) }); }
      setDialogOpen(false);
      queryClient.invalidateQueries({ queryKey: ['sizes'] });
    } catch (e: any) { setFormError(e.message); }
    finally { setSubmitting(false); }
  }
  async function handleDelete(id: string) {
    await apiRequest(`/sizes/${id}`, { method: 'DELETE' });
    queryClient.invalidateQueries({ queryKey: ['sizes'] });
    setDeleteTarget(null);
  }

  return masterSectionLayout({
    title: 'Sizes', items: filtered, isLoading,
    fields: [{ key: 'name', label: 'Name' }, { key: 'sortOrder', label: 'Order' }],
    onAdd: () => { setEditing(null); setForm({ name: '', sortOrder: '0' }); setFormError(''); setDialogOpen(true); },
    onEdit: (item) => { setEditing(item); setForm({ name: item.name, sortOrder: String(item.sortOrder) }); setFormError(''); setDialogOpen(true); },
    onDelete: (item) => setDeleteTarget(item),
    dialog: (
      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} title={editing ? 'Edit Size' : 'Add Size'} size="sm">
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input label="Name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="e.g. M, XL, 42" />
          <Input label="Sort Order" type="number" value={form.sortOrder} onChange={(e) => setForm({ ...form, sortOrder: e.target.value })} placeholder="0" />
          {formError && <p className="text-sm text-red-500">{formError}</p>}
          <div className="flex justify-end gap-3 pt-2">
            <Button variant="outline" type="button" onClick={() => setDialogOpen(false)}>Cancel</Button>
            <Button type="submit" disabled={submitting}>{submitting ? 'Saving...' : editing ? 'Update' : 'Create'}</Button>
          </div>
        </form>
      </Dialog>
    ),
    deleteDialog: (
      <ConfirmDialog open={!!deleteTarget} onClose={() => setDeleteTarget(null)} onConfirm={() => deleteTarget && handleDelete(deleteTarget.id)}
        title="Delete Size" message={`Delete "${deleteTarget?.name}"?`}
        confirmLabel="Delete" variant="danger" />
    ),
  });
}

function ColorSection({ addTrigger, search, onSearch }: { addTrigger: number; search: string; onSearch: (v: string) => void }) {
  const queryClient = useQueryClient();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<Color | null>(null);
  const [form, setForm] = useState({ name: '', hex: '' });
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState('');
  const [deleteTarget, setDeleteTarget] = useState<Color | null>(null);
  const prevTriggerRef = useRef(0);
  useEffect(() => {
    if (addTrigger > prevTriggerRef.current) { prevTriggerRef.current = addTrigger; setEditing(null); setForm({ name: '', hex: '' }); setFormError(''); setDialogOpen(true); }
  }, [addTrigger]);

  const { data, isLoading } = useQuery({
    queryKey: ['colors'],
    queryFn: async () => { const r = await apiRequest<{ data: Color[] }>('/colors'); return r.data; },
  });
  const filtered = useMemo(() => {
    if (!search) return data || [];
    return (data || []).filter((c) => c.name.toLowerCase().includes(search.toLowerCase()));
  }, [data, search]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.name.trim()) { setFormError('Name is required'); return; }
    setSubmitting(true); setFormError('');
    try {
      const payload = { name: form.name.trim(), hex: form.hex };
      if (editing) { await apiRequest(`/colors/${editing.id}`, { method: 'PATCH', body: JSON.stringify(payload) }); }
      else { await apiRequest('/colors', { method: 'POST', body: JSON.stringify(payload) }); }
      setDialogOpen(false);
      queryClient.invalidateQueries({ queryKey: ['colors'] });
    } catch (e: any) { setFormError(e.message); }
    finally { setSubmitting(false); }
  }
  async function handleDelete(id: string) {
    await apiRequest(`/colors/${id}`, { method: 'DELETE' });
    queryClient.invalidateQueries({ queryKey: ['colors'] });
    setDeleteTarget(null);
  }

  return masterSectionLayout({
    title: 'Colors', items: filtered, isLoading,
    fields: [{ key: 'name', label: 'Name' }],
    onAdd: () => { setEditing(null); setForm({ name: '', hex: '#000000' }); setFormError(''); setDialogOpen(true); },
    onEdit: (item) => { setEditing(item); setForm({ name: item.name, hex: item.hex }); setFormError(''); setDialogOpen(true); },
    onDelete: (item) => setDeleteTarget(item),
    dialog: (
      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} title={editing ? 'Edit Color' : 'Add Color'} size="sm">
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input label="Name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="e.g. Red" />
          <div>
            <label className="block text-sm font-medium text-foreground mb-1">Hex Color</label>
            <div className="flex items-center gap-2">
              <input type="color" value={form.hex} onChange={(e) => setForm({ ...form, hex: e.target.value })} className="w-10 h-10 rounded border border-border cursor-pointer p-0.5" />
              <input type="text" value={form.hex} onChange={(e) => setForm({ ...form, hex: e.target.value })} placeholder="#000000" className="flex-1 rounded-lg border border-border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary font-mono" />
            </div>
          </div>
          {formError && <p className="text-sm text-red-500">{formError}</p>}
          <div className="flex justify-end gap-3 pt-2">
            <Button variant="outline" type="button" onClick={() => setDialogOpen(false)}>Cancel</Button>
            <Button type="submit" disabled={submitting}>{submitting ? 'Saving...' : editing ? 'Update' : 'Create'}</Button>
          </div>
        </form>
      </Dialog>
    ),
    deleteDialog: (
      <ConfirmDialog open={!!deleteTarget} onClose={() => setDeleteTarget(null)} onConfirm={() => deleteTarget && handleDelete(deleteTarget.id)}
        title="Delete Color" message={`Delete "${deleteTarget?.name}"?`}
        confirmLabel="Delete" variant="danger" />
    ),
  });
}

function masterSectionLayout<T extends { id: string }>({
  title, items, isLoading, fields, onAdd, onEdit, onDelete, dialog, deleteDialog,
}: {
  title: string; items: T[]; isLoading: boolean;
  fields: { key: keyof T; label: string }[];
  onAdd: () => void; onEdit: (item: T) => void; onDelete: (item: T) => void;
  dialog: React.ReactNode; deleteDialog: React.ReactNode;
}) {
  if (isLoading) return <PageSpinner />;
  return (
    <div className="space-y-4">
      <div className="grid gap-2">
        {items.length === 0 ? (
          <p className="text-muted-foreground text-sm py-4 text-center">No {title.toLowerCase()} found.</p>
        ) : (
          items.map((item) => (
            <div key={item.id} className="flex items-center justify-between px-4 py-3 bg-card border border-border rounded-lg hover:border-border">
              <div>
                <p className="font-medium text-sm">{fields.map((f) => String(item[f.key] ?? '')).filter(Boolean).join(' — ')}</p>
              </div>
              <div className="flex items-center gap-1">
                <button onClick={() => onEdit(item)} className="p-1.5 rounded-lg hover:bg-accent text-muted-foreground hover:text-primary"><Edit2 size={14} /></button>
                <button onClick={() => onDelete(item)} className="p-1.5 rounded-lg hover:bg-accent text-muted-foreground hover:text-destructive"><Trash2 size={14} /></button>
              </div>
            </div>
          ))
        )}
      </div>
      {dialog}
      {deleteDialog}
    </div>
  );
}

function SupplierSection({ addTrigger, search, onSearch }: { addTrigger: number; search: string; onSearch: (v: string) => void }) {
  const queryClient = useQueryClient();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<Supplier | null>(null);
  const [form, setForm] = useState({ name: '', contactPerson: '', email: '', phone: '', gstin: '', address: '' });
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState('');
  const [deleteTarget, setDeleteTarget] = useState<Supplier | null>(null);
  const prevTriggerRef = useRef(0);
  useEffect(() => {
    if (addTrigger > prevTriggerRef.current) { prevTriggerRef.current = addTrigger; setEditing(null); setForm({ name: '', contactPerson: '', email: '', phone: '', gstin: '', address: '' }); setFormError(''); setDialogOpen(true); }
  }, [addTrigger]);

  const { data, isLoading } = useQuery({
    queryKey: ['suppliers'],
    queryFn: async () => { const r = await apiRequest<{ data: Supplier[] }>('/suppliers'); return r.data; },
  });
  const filtered = useMemo(() => {
    if (!search) return data || [];
    return (data || []).filter((s) => s.name.toLowerCase().includes(search.toLowerCase()) || (s.contactPerson || '').toLowerCase().includes(search.toLowerCase()));
  }, [data, search]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.name.trim()) { setFormError('Name is required'); return; }
    setSubmitting(true); setFormError('');
    try {
      const payload = { ...form, name: form.name.trim() };
      if (editing) { await apiRequest(`/suppliers/${editing.id}`, { method: 'PATCH', body: JSON.stringify(payload) }); }
      else { await apiRequest('/suppliers', { method: 'POST', body: JSON.stringify(payload) }); }
      setDialogOpen(false);
      queryClient.invalidateQueries({ queryKey: ['suppliers'] });
    } catch (e: any) { setFormError(e.message); }
    finally { setSubmitting(false); }
  }
  async function handleDelete(id: string) {
    await apiRequest(`/suppliers/${id}`, { method: 'DELETE' });
    queryClient.invalidateQueries({ queryKey: ['suppliers'] });
    setDeleteTarget(null);
  }

  return masterSectionLayout({
    title: 'Suppliers', items: filtered, isLoading,
    fields: [{ key: 'name', label: 'Name' }, { key: 'contactPerson', label: 'Contact' }],
    onAdd: () => { setEditing(null); setForm({ name: '', contactPerson: '', email: '', phone: '', gstin: '', address: '' }); setFormError(''); setDialogOpen(true); },
    onEdit: (item) => { setEditing(item); setForm({ name: item.name, contactPerson: item.contactPerson || '', email: item.email || '', phone: item.phone || '', gstin: item.gstin || '', address: item.address || '' }); setFormError(''); setDialogOpen(true); },
    onDelete: (item) => setDeleteTarget(item),
    dialog: (
      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} title={editing ? 'Edit Supplier' : 'Add Supplier'} size="sm">
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input label="Name *" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="e.g. Fabrics India" />
          <Input label="Contact Person" value={form.contactPerson} onChange={(e) => setForm({ ...form, contactPerson: e.target.value })} placeholder="e.g. Rajesh Kumar" />
          <div className="grid grid-cols-2 gap-3">
            <Input label="Email" type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="email@example.com" />
            <Input label="Phone" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} placeholder="+91-9876543210" />
          </div>
          <Input label="GSTIN" value={form.gstin} onChange={(e) => setForm({ ...form, gstin: e.target.value })} placeholder="22AAAAA0000A1Z5" />
          <Input label="Address" value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} placeholder="Full address" />
          {formError && <p className="text-sm text-red-500">{formError}</p>}
          <div className="flex justify-end gap-3 pt-2">
            <Button variant="outline" type="button" onClick={() => setDialogOpen(false)}>Cancel</Button>
            <Button type="submit" disabled={submitting}>{submitting ? 'Saving...' : editing ? 'Update' : 'Create'}</Button>
          </div>
        </form>
      </Dialog>
    ),
    deleteDialog: (
      <ConfirmDialog open={!!deleteTarget} onClose={() => setDeleteTarget(null)} onConfirm={() => deleteTarget && handleDelete(deleteTarget.id)}
        title="Delete Supplier" message={`Delete supplier "${deleteTarget?.name}"?`}
        confirmLabel="Delete" variant="danger" />
    ),
  });
}

interface VariantEntry {
  id: string;
  size: string;
  color: string;
  colorHex: string;
  fabric: string;
  sku: string;
  ean: string;
  supplierId: string;
  purchasePrice: string;
  sellingPrice: string;
  mrp: string;
  gstPercentage: string;
  initialStock: string;
  reorderLevel: string;
  rackLocation: string;
}

let variantIdCounter = Date.now();
function newVariantId() { variantIdCounter++; return `v_${variantIdCounter}`; }

const emptyVariant = (): VariantEntry => ({
  id: newVariantId(), size: '', color: '', colorHex: '', fabric: '', sku: generateSKU(),
  ean: '', supplierId: '',
  purchasePrice: '', sellingPrice: '', mrp: '', gstPercentage: '18',
  initialStock: '0', reorderLevel: '0', rackLocation: '',
});

const GST_OPTIONS = [
  { value: '0', label: '0%' }, { value: '5', label: '5%' },
  { value: '12', label: '12%' }, { value: '18', label: '18%' }, { value: '28', label: '28%' },
];

function ProductSection({ addTrigger, search, onSearch }: { addTrigger: number; search: string; onSearch: (v: string) => void }) {
  const queryClient = useQueryClient();

  const { data: categoriesData, isLoading: catsLoading } = useQuery({
    queryKey: ['categories'],
    queryFn: async () => {
      const res = await apiRequest<{ status: string; data: Category[] }>('/categories');
      return res.data;
    },
    staleTime: 60000,
  });

  const { data: brandsData } = useQuery({
    queryKey: ['brands'],
    queryFn: async () => {
      const res = await apiRequest<{ status: string; data: Brand[] }>('/brands');
      return res.data;
    },
    staleTime: 60000,
  });

  const { data: suppliersData } = useQuery({
    queryKey: ['suppliers'],
    queryFn: async () => {
      const res = await apiRequest<{ status: string; data: Supplier[] }>('/suppliers');
      return res.data;
    },
    staleTime: 60000,
  });

  const { data: productsData, isLoading: prodLoading } = useQuery({
    queryKey: ['products-catalogue'],
    queryFn: () => apiRequest<{ data: Product[] }>('/products?limit=500'),
    staleTime: 30000,
  });

  const categories = categoriesData || [];
  const brands = brandsData || [];
  const suppliers = suppliersData || [];
  const products = productsData?.data || [];

  const [deleteTarget, setDeleteTarget] = useState<Product | null>(null);
  const deleteMutation = useMutation({
    mutationFn: (id: string) => apiRequest(`/products/${id}`, { method: 'DELETE' }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products-catalogue'] });
      setDeleteTarget(null);
    },
  });

  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [editProductId, setEditProductId] = useState<string | null>(null);

  const categoryTabs = useMemo(() => {
    const catMap = new Map<string, Category>();
    categories.forEach((c) => catMap.set(c.id, c));

    const tabs = categories.map((cat) => ({
      id: cat.id,
      label: cat.name,
      content: (
        <CategoryProducts
          key={cat.id}
          categoryId={cat.id}
          products={products.filter((p) => p.categoryId === cat.id)}
          brands={brands}
          search={search}
          onEdit={(pid) => setEditProductId(pid)}
          onDelete={(p) => setDeleteTarget(p)}
          onRefresh={() => queryClient.invalidateQueries({ queryKey: ['products-catalogue'] })}
        />
      ),
    }));

    tabs.unshift({
      id: 'all',
      label: `All (${products.length})`,
      content: (
        <CategoryProducts
          categoryId="all"
          products={products}
          brands={brands}
          search={search}
          onEdit={(pid) => setEditProductId(pid)}
          onDelete={(p) => setDeleteTarget(p)}
          onRefresh={() => queryClient.invalidateQueries({ queryKey: ['products-catalogue'] })}
        />
      ),
    });

    return tabs;
  }, [categories, products, brands, search]);

  const prevTriggerRef = useRef(0);
  useEffect(() => {
    if (addTrigger > prevTriggerRef.current) { prevTriggerRef.current = addTrigger; setCreateDialogOpen(true); }
  }, [addTrigger]);

  if (catsLoading || prodLoading) return <PageSpinner />;

  return (
    <div className="space-y-4">
      <Tabs tabs={categoryTabs} defaultTab="all" />

      {createDialogOpen && (
        <FullScreenOverlay onClose={() => setCreateDialogOpen(false)} title="Create Product">
          <ProductForm
            categories={categories}
            brands={brands}
            suppliers={suppliers}
            onSuccess={() => {
              setCreateDialogOpen(false);
              queryClient.invalidateQueries({ queryKey: ['products-catalogue'] });
            }}
            onCancel={() => setCreateDialogOpen(false)}
          />
        </FullScreenOverlay>
      )}

      {editProductId && (
        <FullScreenOverlay onClose={() => setEditProductId(null)} title="Edit Product">
          <ProductForm
            categories={categories}
            brands={brands}
            suppliers={suppliers}
            productId={editProductId}
            onSuccess={() => {
              setEditProductId(null);
              queryClient.invalidateQueries({ queryKey: ['products-catalogue'] });
            }}
            onCancel={() => setEditProductId(null)}
          />
        </FullScreenOverlay>
      )}

      <ConfirmDialog
        open={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={() => deleteTarget && deleteMutation.mutate(deleteTarget.id)}
        title="Delete Product"
        message={`Are you sure you want to delete "${deleteTarget?.name}"? This will also remove all its variants.`}
        confirmLabel="Delete"
        variant="danger"
        loading={deleteMutation.isPending}
      />
    </div>
  );
}

const GRADIENTS = [
  'from-violet-500 to-purple-600',
  'from-emerald-500 to-teal-600',
  'from-rose-500 to-pink-600',
  'from-amber-500 to-orange-600',
  'from-sky-500 to-blue-600',
  'from-fuchsia-500 to-pink-600',
  'from-lime-500 to-green-600',
  'from-cyan-500 to-sky-600',
  'from-indigo-500 to-violet-600',
  'from-red-500 to-rose-600',
];

function ProductImagePlaceholder({ name, category }: { name: string; category?: string }) {
  const hash = name.split('').reduce((a, c) => a + c.charCodeAt(0), 0);
  const grad = GRADIENTS[hash % GRADIENTS.length];
  const initial = name.charAt(0).toUpperCase();
  return (
    <div className={`w-full h-full bg-gradient-to-br ${grad} flex items-center justify-center relative overflow-hidden`}>
      <div className="absolute inset-0 bg-card/10" />
      <span className="text-4xl font-bold text-white/90 drop-shadow-lg">{initial}</span>
      {category && (
        <span className="absolute bottom-2 left-2 text-[10px] font-medium text-white/70 bg-black/20 px-2 py-0.5 rounded-full">
          {category}
        </span>
      )}
    </div>
  );
}

function CategoryProducts({
  categoryId,
  products,
  brands,
  onEdit,
  onDelete,
  onRefresh,
  search,
}: {
  categoryId: string;
  products: Product[];
  brands: Brand[];
  onEdit: (id: string) => void;
  onDelete: (p: Product) => void;
  onRefresh: () => void;
  search: string;
}) {
  const [hoveredId, setHoveredId] = useState<string | null>(null);

  const filtered = useMemo(() => {
    if (!search.trim()) return products;
    const q = search.toLowerCase();
    return products.filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        p.brand?.name?.toLowerCase().includes(q) ||
        p.variants.some((v) => v.sku.toLowerCase().includes(q) || v.barcode.toLowerCase().includes(q)),
    );
  }, [products, search]);

  const totalStock = (variants: ProductVariant[]) =>
    variants.reduce((s, v) => s + (v.stockQuantity || 0), 0);

  const priceRange = (variants: ProductVariant[]) => {
    const prices = variants.map((v) => Number(v.sellingPrice)).filter((p) => !isNaN(p));
    if (prices.length === 0) return null;
    const min = Math.min(...prices);
    const max = Math.max(...prices);
    return min === max ? `₹${min.toFixed(0)}` : `₹${min.toFixed(0)} – ₹${max.toFixed(0)}`;
  };

  const lowestStock = (variants: ProductVariant[]) =>
    Math.min(...variants.map((v) => v.stockQuantity || 0));

  if (products.length === 0) {
    return (
      <div className="text-center py-16 text-muted-foreground">
        <div className="w-20 h-20 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center">
          <Package size={36} className="text-muted-foreground" />
        </div>
        <p className="text-lg font-medium text-muted-foreground mb-1">No products in this category</p>
        <p className="text-sm text-muted-foreground">Create a product to get started</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <span className="text-sm text-muted-foreground font-medium shrink-0">
          {filtered.length} product{filtered.length !== 1 ? 's' : ''}
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {filtered.map((product) => {
          const stock = totalStock(product.variants);
          const range = priceRange(product.variants);
          const lowStock = lowestStock(product.variants);
          const isHovered = hoveredId === product.id;
          const hash = product.name.split('').reduce((a, c) => a + c.charCodeAt(0), 0);
          const grad = GRADIENTS[hash % GRADIENTS.length];

          return (
            <div
              key={product.id}
              className="group bg-card rounded-2xl border border-border overflow-hidden transition-all duration-300 hover:shadow-xl hover:shadow-gray-200/60 hover:-translate-y-0.5"
              onMouseEnter={() => setHoveredId(product.id)}
              onMouseLeave={() => setHoveredId(null)}
            >
              <div className="relative h-52 overflow-hidden bg-muted/50">
                {(() => {
                  const primaryImg = product.images?.find((i) => i.isPrimary) || product.images?.[0];
                  if (primaryImg) {
                    const src = primaryImg.url.startsWith('http') ? primaryImg.url : API_BASE.replace(/\/api$/, '') + primaryImg.url;
                    return <img src={src} alt={primaryImg.alt || product.name} className="w-full h-full object-cover" />;
                  }
                  return <ProductImagePlaceholder name={product.name} category={product.category?.name} />;
                })()}
                <div className={`absolute inset-0 bg-black/40 flex items-center justify-center gap-3 transition-all duration-300 ${isHovered ? 'opacity-100' : 'opacity-0'}`}>
                  <button
                    onClick={() => onEdit(product.id)}
                    className="p-3 bg-card/90 backdrop-blur rounded-xl text-foreground hover:bg-card hover:scale-105 transition-all shadow-lg"
                    title="Edit product"
                  >
                    <Edit2 size={18} />
                  </button>
                  <button
                    onClick={() => onDelete(product)}
                    className="p-3 bg-card/90 backdrop-blur rounded-xl text-red-500 hover:bg-card hover:scale-105 transition-all shadow-lg"
                    title="Delete product"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
                <div className="absolute top-3 right-3 flex gap-1.5">
                  <span className="text-[11px] font-medium text-white/90 bg-card/20 backdrop-blur px-2.5 py-1 rounded-full">
                    {product.variants.length}v
                  </span>
                </div>
              </div>

              <div className="p-4 space-y-3">
                <div>
                  <h3 className="font-semibold text-foreground leading-tight line-clamp-1 group-hover:text-indigo-600 transition-colors">
                    {product.name}
                  </h3>
                  <div className="flex items-center gap-2 mt-1">
                    {product.brand?.name && (
                      <span className="text-xs text-muted-foreground font-medium">{product.brand.name}</span>
                    )}
                    {product.fabric && (
                      <>
                        <span className="text-muted-foreground text-xs">·</span>
                        <span className="text-xs text-muted-foreground">{product.fabric?.name || ''}</span>
                      </>
                    )}
                  </div>
                </div>

                <div className="flex items-end justify-between">
                  <div>
                    {range ? (
                      <span className="text-lg font-bold text-foreground">{range}</span>
                    ) : (
                      <span className="text-sm text-muted-foreground">No price set</span>
                    )}
                  </div>
                  <div className="flex items-center gap-1 text-xs text-muted-foreground">
                    <ShoppingBag size={12} />
                    <span className={stock <= 5 ? 'text-red-500 font-medium' : ''}>
                      {stock} left
                    </span>
                  </div>
                </div>

                {product.occasion && (
                  <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                    <span className="w-1 h-1 rounded-full bg-gray-300" />
                    {product.occasion.name}
                  </div>
                )}

                <div className="pt-1 flex items-center justify-between border-t border-gray-50">
                  <div className="flex -space-x-1.5">
                    {product.variants.slice(0, 4).map((v) => (
                      <span
                        key={v.id}
                        className="w-5 h-5 rounded-full border-2 border-white inline-block shadow-sm"
                        style={{ backgroundColor: v.colorHex || '#e5e7eb' }}
                        title={v.color || undefined}
                      />
                    ))}
                    {product.variants.length > 4 && (
                      <span className="w-5 h-5 rounded-full border-2 border-white bg-gray-100 text-[9px] font-medium text-muted-foreground flex items-center justify-center">
                        +{product.variants.length - 4}
                      </span>
                    )}
                  </div>
                  <button
                    onClick={() => onEdit(product.id)}
                    className="text-xs font-medium text-indigo-600 hover:text-indigo-700 flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    Quick Edit <ChevronRight size={12} />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function ProductForm({
  categories,
  brands,
  suppliers,
  onSuccess,
  onCancel,
  initial,
  productId,
}: {
  categories: Category[];
  brands: Brand[];
  suppliers: Supplier[];
  onSuccess: () => void;
  onCancel: () => void;
  initial?: {
    product?: Product;
    name?: string; categoryId?: string; brandId?: string; supplierId?: string;
    description?: string; hsnCode?: string; fabric?: string;
    occasion?: string; careInstructions?: string; countryOfOrigin?: string;
    modelNumber?: string; gtin?: string;
  };
  productId?: string;
}) {
  const queryClient = useQueryClient();

  const { data: editProductData } = useQuery({
    queryKey: ['product', productId],
    queryFn: () => apiRequest<{ data: Product }>(`/products/${productId}`),
    enabled: !!productId,
  });
  const editProduct = editProductData?.data;

  const [name, setName] = useState(initial?.name || '');
  const [categoryId, setCategoryId] = useState(initial?.categoryId || '');
  const [brandId, setBrandId] = useState(initial?.brandId || '');
  const [supplierId, setSupplierId] = useState(initial?.supplierId || '');
  const [description, setDescription] = useState(initial?.description || '');
  const [hsnCode, setHsnCode] = useState(initial?.hsnCode || '');
  const [fabric, setFabric] = useState(initial?.fabric || '');
  const [occasion, setOccasion] = useState(initial?.occasion || '');
  const [careInstructions, setCareInstructions] = useState(initial?.careInstructions || '');
  const [countryOfOrigin, setCountryOfOrigin] = useState(initial?.countryOfOrigin || 'India');
  const [modelNumber, setModelNumber] = useState(initial?.modelNumber || '');
  const [gtin, setGtin] = useState(initial?.gtin || '');

  useEffect(() => {
    if (editProduct) {
      setName(editProduct.name);
      setCategoryId(editProduct.categoryId);
      setBrandId(editProduct.brandId || '');
      setSupplierId(editProduct.supplierId || '');
      setDescription(editProduct.description || '');
      setHsnCode(editProduct.hsnCode?.id || '');
      setFabric(editProduct.fabric?.id || '');
      setOccasion(editProduct.occasion?.id || '');
      setCareInstructions(editProduct.careInstructions || '');
      setCountryOfOrigin(editProduct.countryOfOrigin?.id || '');
      setModelNumber(editProduct.modelNumber || '');
      setGtin(editProduct.gtin || '');
      const firstVariant = editProduct.variants?.[0];
      if (firstVariant) {
        setPurchasePrice(String(firstVariant.purchasePrice ?? ''));
        setSellingPrice(String(firstVariant.sellingPrice ?? ''));
        setMrp(String(firstVariant.mrp ?? ''));
        setGstPercentage(String(firstVariant.gstPercentage ?? '18'));
      }
    }
  }, [editProduct]);

  const { data: hsnCodes } = useQuery({
    queryKey: ['hsn-codes'],
    queryFn: async () => { const r = await apiRequest<{ data: HsnCode[] }>('/hsn-codes'); return r.data; },
  });
  const { data: fabrics } = useQuery({
    queryKey: ['fabrics'],
    queryFn: async () => { const r = await apiRequest<{ data: Fabric[] }>('/fabrics'); return r.data; },
  });
  const { data: occasions } = useQuery({
    queryKey: ['occasions'],
    queryFn: async () => { const r = await apiRequest<{ data: Occasion[] }>('/occasions'); return r.data; },
  });
  const { data: countries } = useQuery({
    queryKey: ['countries'],
    queryFn: async () => { const r = await apiRequest<{ data: Country[] }>('/countries'); return r.data; },
  });

  const hsnOptions = useMemo(
    () => (hsnCodes || []).map((h) => ({ value: h.id, label: `${h.code}${h.description ? ` — ${h.description}` : ''}` })),
    [hsnCodes],
  );
  const fabricOptions = useMemo(
    () => (fabrics || []).map((f) => ({ value: f.id, label: f.name })),
    [fabrics],
  );
  const occasionOptions = useMemo(
    () => [{ value: '', label: 'Any' }, ...(occasions || []).map((o) => ({ value: o.id, label: o.name }))],
    [occasions],
  );
  const countryOptions = useMemo(
    () => (countries || []).map((c) => ({ value: c.id, label: `${c.name} (${c.code})` })),
    [countries],
  );

  const { data: sizes } = useQuery({
    queryKey: ['sizes'],
    queryFn: async () => { const r = await apiRequest<{ data: Size[] }>('/sizes'); return r.data; },
  });
  const { data: colors } = useQuery({
    queryKey: ['colors'],
    queryFn: async () => { const r = await apiRequest<{ data: Color[] }>('/colors'); return r.data; },
  });

  const sizeOptions = useMemo(() => (sizes || []).map((s) => ({ value: s.name, label: s.name })), [sizes]);
  const colorOptions = useMemo(() => (colors || []).map((c) => ({ value: c.name, label: c.name })), [colors]);

  const [variants, setVariants] = useState<VariantEntry[]>([emptyVariant()]);
  const [variantDialogOpen, setVariantDialogOpen] = useState(false);
  const [editingVariant, setEditingVariant] = useState<VariantEntry | null>(null);
  const [variantForm, setVariantForm] = useState<VariantEntry>(emptyVariant());
  const [variantFormError, setVariantFormError] = useState('');

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});

  const [purchasePrice, setPurchasePrice] = useState('');
  const [sellingPrice, setSellingPrice] = useState('');
  const [mrp, setMrp] = useState('');
  const [gstPercentage, setGstPercentage] = useState('18');

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [selectedImageIdx, setSelectedImageIdx] = useState(0);

  const uploadImageMutation = useMutation({
    mutationFn: async (file: File) => {
      if (!productId) throw new Error('Save product first');
      const formData = new FormData();
      formData.append('image', file);
      return apiRequest<{ data: ProductImage }>(`/products/${productId}/images`, {
        method: 'POST',
        body: formData as any,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['product', productId] });
      setUploading(false);
    },
    onError: (err) => {
      setSubmitError(err instanceof Error ? err.message : 'Upload failed');
      setUploading(false);
    },
  });

  const deleteImageMutation = useMutation({
    mutationFn: (imageId: string) =>
      apiRequest(`/products/${productId}/images/${imageId}`, { method: 'DELETE' }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['product', productId] });
      setSelectedImageIdx(0);
    },
  });

  const setPrimaryMutation = useMutation({
    mutationFn: (imageId: string) =>
      apiRequest(`/products/${productId}/images/${imageId}/primary`, { method: 'PATCH' }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['product', productId] });
    },
  });

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!productId) {
      setSubmitError('Save the product first, then add images.');
      return;
    }
    setUploading(true);
    uploadImageMutation.mutate(file);
    if (e.target) e.target.value = '';
  };

  const productImages: ProductImage[] = editProduct?.images || [];
  const primaryImage = productImages.find((img) => img.isPrimary) || productImages[selectedImageIdx];

  const categoryOptions = useMemo(
    () => [
      ...categories.map((c) => ({ value: c.id, label: c.name })),
      { value: '__add_new__', label: '+ Add New Category' },
    ],
    [categories],
  );

  const brandOptions = useMemo(
    () => [
      ...brands.map((b) => ({ value: b.id, label: b.name })),
      { value: '__add_new__', label: '+ Add New Brand' },
    ],
    [brands],
  );

  const supplierOptions = useMemo(
    () => [{ value: '', label: 'None (default)' }, ...suppliers.map((s) => ({ value: s.id, label: s.name })), { value: '__add_new__', label: '+ Add New Supplier' }],
    [suppliers],
  );

  const [categoryDialogOpen, setCategoryDialogOpen] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [brandDialogOpen, setBrandDialogOpen] = useState(false);
  const [newBrandName, setNewBrandName] = useState('');
  const [supplierDialogOpen, setSupplierDialogOpen] = useState(false);
  const [supplierFormError, setSupplierFormError] = useState('');
  const [newSupplierForm, setNewSupplierForm] = useState({ name: '', contactPerson: '', email: '', phone: '', gstin: '', address: '' });
  const [creatingSupplier, setCreatingSupplier] = useState(false);

  const [editVariants, setEditVariants] = useState<ProductVariant[]>([]);
  const [editVariantDialogOpen, setEditVariantDialogOpen] = useState(false);
  const [editingEditVariant, setEditingEditVariant] = useState<ProductVariant | null>(null);
  const [editVariantForm, setEditVariantForm] = useState<any>({});
  const [editVariantFormError, setEditVariantFormError] = useState('');
  const [deleteEditVariantTarget, setDeleteEditVariantTarget] = useState<ProductVariant | null>(null);

  useEffect(() => {
    if (editProduct) setEditVariants(editProduct.variants || []);
  }, [editProduct]);

  const createVariantMutation = useMutation({
    mutationFn: (data: Record<string, unknown>) =>
      apiRequest<{ data: ProductVariant }>(`/products/${productId}/variants`, { method: 'POST', body: JSON.stringify(data) }),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['product', productId] }); setEditVariantDialogOpen(false); },
    onError: (e: Error) => setEditVariantFormError(e.message),
  });
  const updateVariantMutation = useMutation({
    mutationFn: ({ variantId, data }: { variantId: string; data: Record<string, unknown> }) =>
      apiRequest(`/variants/${variantId}`, { method: 'PATCH', body: JSON.stringify(data) }),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['product', productId] }); setEditVariantDialogOpen(false); },
    onError: (e: Error) => setEditVariantFormError(e.message),
  });
  const deleteVariantMutation = useMutation({
    mutationFn: (vid: string) => apiRequest(`/variants/${vid}`, { method: 'DELETE' }),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['product', productId] }); setDeleteEditVariantTarget(null); },
    onError: (e: Error) => setEditVariantFormError(e.message),
  });
  const [barcodeImages, setBarcodeImages] = useState<Record<string, string>>({});
  const regenerateBarcodeMutation = useMutation({
    mutationFn: async (variantId: string) => {
      const res = await apiRequest<{ data: { barcodeImagePath: string } }>(`/barcodes/regenerate/${variantId}`, { method: 'POST' });
      return { variantId, path: res.data.barcodeImagePath };
    },
    onSuccess: (data) => setBarcodeImages((prev) => ({ ...prev, [data.variantId]: data.path })),
  });

  const handlePrintLabel = useCallback((sku: string, productName: string) => {
    const canvas = document.createElement('canvas');
    try {
      JsBarcode(canvas, sku.slice(0, 12), { format: 'CODE128', width: 2, height: 60, displayValue: true, fontSize: 16, margin: 10 });
    } catch {
      return;
    }
    const dataUrl = canvas.toDataURL('image/png');
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;
    printWindow.document.write(`<!DOCTYPE html>
<html>
<head>
  <style>
    @page { size: 50mm 30mm; margin: 0; }
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { display: flex; align-items: center; justify-content: center; width: 50mm; height: 30mm; font-family: Arial, sans-serif; }
    .label { text-align: center; padding: 2mm; width: 100%; }
    .name { font-size: 7px; font-weight: 600; color: #333; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; margin-bottom: 1mm; }
    .barcode-img { max-width: 100%; height: auto; }
    @media print { body { -webkit-print-color-adjust: exact; } }
  </style>
</head>
<body>
  <div class="label">
    <div class="name">${productName}</div>
    <img class="barcode-img" src="${dataUrl}" alt="barcode" />
    <div style="font-size:6px;color:#666;margin-top:0.5mm">${sku}</div>
  </div>
</body>
</html>`);
    printWindow.document.close();
    setTimeout(() => { printWindow.focus(); printWindow.print(); }, 300);
  }, []);

  const gstEnumToNumber = (val: string) => {
    const map: Record<string, string> = { GST_0: '0', GST_5: '5', GST_12: '12', GST_18: '18', GST_28: '28' };
    return map[val] ?? val;
  };

  const createCategoryMutation = useMutation({
    mutationFn: (data: { name: string }) =>
      apiRequest<{ data: Category }>('/categories', { method: 'POST', body: JSON.stringify(data) }),
    onSuccess: (res) => {
      setCategoryId(res.data.id);
      setCategoryDialogOpen(false);
      setNewCategoryName('');
      queryClient.invalidateQueries({ queryKey: ['categories'] });
    },
    onError: (e: Error) => setErrors((prev) => ({ ...prev, category: e.message })),
  });

  const createBrandMutation = useMutation({
    mutationFn: (data: { name: string }) =>
      apiRequest<{ data: Brand }>('/brands', { method: 'POST', body: JSON.stringify(data) }),
    onSuccess: (res) => {
      setBrandId(res.data.id);
      setBrandDialogOpen(false);
      setNewBrandName('');
      queryClient.invalidateQueries({ queryKey: ['brands'] });
    },
    onError: (e: Error) => setErrors((prev) => ({ ...prev, brand: e.message })),
  });

  const createSupplierMutation = useMutation({
    mutationFn: async (data: { name: string; contactPerson?: string; email?: string; phone?: string; gstin?: string; address?: string }) => {
      const res = await apiRequest<{ data: Supplier }>('/suppliers', { method: 'POST', body: JSON.stringify(data) });
      return res.data;
    },
    onSuccess: (res) => {
      setSupplierId(res.id);
      setSupplierDialogOpen(false);
      setNewSupplierForm({ name: '', contactPerson: '', email: '', phone: '', gstin: '', address: '' });
      setSupplierFormError('');
      queryClient.invalidateQueries({ queryKey: ['suppliers'] });
    },
    onError: (e: Error) => setSupplierFormError(e.message),
  });

  function handleCategoryChange(value: string) {
    if (value === '__add_new__') { setCategoryDialogOpen(true); }
    else { setCategoryId(value); }
  }

  function handleBrandChange(value: string) {
    if (value === '__add_new__') { setBrandDialogOpen(true); }
    else { setBrandId(value); }
  }

  function handleSupplierChange(value: string) {
    if (value === '__add_new__') { setNewSupplierForm({ name: '', contactPerson: '', email: '', phone: '', gstin: '', address: '' }); setSupplierFormError(''); setSupplierDialogOpen(true); }
    else { setSupplierId(value); }
  }

  function validate(): boolean {
    const errs: Record<string, string> = {};
    if (!name.trim()) errs.name = 'Product name is required';
    if (!categoryId) errs.category = 'Category is required';
    if (mrp && sellingPrice && parseFloat(mrp) < parseFloat(sellingPrice)) {
      errs.mrp = 'MRP must be >= Selling Price';
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  }

  async function handleSubmit() {
    if (!validate()) return;
    setIsSubmitting(true);
    setSubmitError('');

    try {
      const payload: Record<string, unknown> = {
        name: name.trim(),
        categoryId,
        brandId: brandId || null,
        supplierId: supplierId || null,
        hsnCodeId: hsnCode || null,
        fabricId: fabric || null,
        occasionId: occasion || null,
        countryOfOriginId: countryOfOrigin || null,
        careInstructions: careInstructions.trim() || undefined,
        modelNumber: modelNumber.trim() || undefined,
        gtin: gtin.trim() || undefined,
        description: description.trim() || undefined,
      };

      if (productId) {
        await apiRequest(`/products/${productId}`, {
          method: 'PATCH',
          body: JSON.stringify(payload),
        });
      } else {
        Object.assign(payload, {
          purchasePrice: purchasePrice ? parseFloat(purchasePrice) : undefined,
          sellingPrice: sellingPrice ? parseFloat(sellingPrice) : undefined,
          mrp: mrp ? parseFloat(mrp) : undefined,
          gstPercentage: parseInt(gstPercentage, 10),
          isActive: true,
          variants: variants.map((v) => ({
            size: v.size || undefined,
            color: v.color || undefined,
            colorHex: v.colorHex || undefined,
            fabric: v.fabric || undefined,
            sku: v.sku || undefined,
            ean: v.ean || undefined,
            supplierId: v.supplierId || undefined,
            purchasePrice: v.purchasePrice ? parseFloat(v.purchasePrice) : undefined,
            sellingPrice: v.sellingPrice ? parseFloat(v.sellingPrice) : undefined,
            mrp: v.mrp ? parseFloat(v.mrp) : undefined,
            gstPercentage: v.gstPercentage ? parseInt(v.gstPercentage, 10) : undefined,
            initialStock: parseInt(v.initialStock, 10) || 0,
            reorderLevel: parseInt(v.reorderLevel, 10) || 0,
            rackLocation: v.rackLocation || undefined,
          })),
        });

        await apiRequest('/products/with-variants', {
          method: 'POST',
          body: JSON.stringify(payload),
        });
      }

      onSuccess();
    } catch (e: any) {
      setSubmitError(e.message || 'Failed to create product');
    } finally {
      setIsSubmitting(false);
    }
  }

  function openAddVariant() {
    setEditingVariant(null);
    setVariantForm({ ...emptyVariant(), sku: generateSKU() });
    setVariantFormError('');
    setVariantDialogOpen(true);
  }

  function openEditVariant(v: VariantEntry) {
    setEditingVariant(v);
    setVariantForm({ ...v });
    setVariantFormError('');
    setVariantDialogOpen(true);
  }

  function handleSaveVariant() {
    setVariantFormError('');
    if (!variantForm.sku.trim()) { setVariantFormError('SKU is required'); return; }
    if (editingVariant) {
      setVariants((prev) => prev.map((v) => (v.id === editingVariant.id ? variantForm : v)));
    } else {
      setVariants((prev) => [...prev, variantForm]);
    }
    setVariantDialogOpen(false);
  }

  function removeVariant(id: string) {
    setVariants((prev) => prev.filter((v) => v.id !== id));
  }

  function setVariantFormField(field: keyof VariantEntry, value: string) {
    setVariantForm((prev) => ({ ...prev, [field]: value }));
  }

  function regenerateSku() {
    setVariantForm((prev) => ({ ...prev, sku: generateSKU() }));
  }

  const variantTableHeaders = ['SKU', 'Size', 'Color', '', 'Fabric', 'EAN', 'Purchase', 'Selling', 'MRP', 'GST', 'Stock', 'Rack', ''];

  const categoryName = categories.find((c) => c.id === categoryId)?.name;
  const selectedBrand = brands.find((b) => b.id === brandId)?.name;
  const selectedFabric = fabricOptions.find((f) => f.value === fabric)?.label;
  const selectedOccasion = occasionOptions.find((o) => o.value === occasion)?.label;

  return (
    <div className="flex gap-4 items-start">
      {submitError && (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 z-[60] bg-red-50/95 backdrop-blur border border-red-200 text-red-700 px-5 py-3 rounded-xl text-sm flex items-center gap-2.5 shadow-lg shadow-red-200/50">
          <span className="w-1.5 h-1.5 rounded-full bg-red-500 shrink-0" />
          {submitError}
        </div>
      )}

      {/* LEFT: Product Image Gallery */}
      <div className="w-[280px] shrink-0 space-y-2.5">
        <div className="rounded-xl overflow-hidden shadow-md border border-border aspect-square relative group/image">
          {primaryImage ? (
            <img
              src={getBarcodeImageUrl(primaryImage.url) || primaryImage.url}
              alt={primaryImage.alt || name}
              className="w-full h-full object-cover"
            />
          ) : name ? (
            <ProductImagePlaceholder name={name} category={categoryName} />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-gray-50 to-gray-100 flex flex-col items-center justify-center gap-2">
              <div className="w-12 h-12 rounded-xl bg-card shadow-sm border border-border flex items-center justify-center">
                <ImageIcon size={22} className="text-muted-foreground" />
              </div>
              <p className="text-xs text-muted-foreground font-medium">Product Image</p>
            </div>
          )}

          {productId && (
            <div className="absolute top-2 right-2 flex gap-1">
              {uploading && (
                <span className="text-[10px] bg-black/60 text-white px-2 py-0.5 rounded-full">Uploading…</span>
              )}
            </div>
          )}
        </div>

        <div className="grid grid-cols-4 gap-1.5">
          {productImages.map((img, i) => (
            <button
              key={img.id}
              onClick={() => setSelectedImageIdx(i)}
              className={`aspect-square rounded-lg overflow-hidden border-2 transition-all relative group/thumb ${
                i === selectedImageIdx || img.isPrimary ? 'border-indigo-500' : 'border-transparent'
              }`}
            >
              <img
                src={getBarcodeImageUrl(img.url) || img.url}
                alt={img.alt || ''}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-black/0 group-hover/thumb:bg-black/30 transition-all flex items-center justify-center gap-1 opacity-0 group-hover/thumb:opacity-100">
                {!img.isPrimary && (
                  <button
                    onClick={(e) => { e.stopPropagation(); setPrimaryMutation.mutate(img.id); }}
                    className="p-1 bg-card/90 rounded text-[10px] text-foreground hover:bg-card"
                    title="Set as primary"
                  >
                    <Star size={10} />
                  </button>
                )}
                <button
                  onClick={(e) => { e.stopPropagation(); deleteImageMutation.mutate(img.id); }}
                  className="p-1 bg-card/90 rounded text-[10px] text-red-500 hover:bg-card"
                  title="Delete image"
                >
                  <Trash2 size={10} />
                </button>
              </div>
              {img.isPrimary && (
                <span className="absolute top-0.5 left-0.5 bg-indigo-500 text-white rounded-sm px-1 text-[8px] font-medium">Primary</span>
              )}
            </button>
          ))}
          {productImages.length < 6 && (
            <>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp"
                className="hidden"
                onChange={handleImageUpload}
              />
              <button
                onClick={() => fileInputRef.current?.click()}
                disabled={uploading}
                className="aspect-square rounded-lg border-2 border-dashed border-border hover:border-indigo-300 hover:bg-indigo-50/50 flex items-center justify-center transition-all group disabled:opacity-50"
                title={productId ? 'Upload image' : 'Save product first'}
              >
                <Plus size={14} className="text-muted-foreground group-hover:text-indigo-500 transition-colors" />
              </button>
            </>
          )}
        </div>

        {productImages.length > 0 && (
          <div className="text-[11px] text-muted-foreground text-center">{productImages.length} image{productImages.length > 1 ? 's' : ''}</div>
        )}

        {!productId && (
          <div className="text-[11px] text-muted-foreground text-center italic">Save the product to add images.</div>
        )}

        {productId && (
          <div className="text-[11px] text-muted-foreground">ID: <span className="font-mono text-muted-foreground">{productId}</span></div>
        )}
      </div>

      {/* RIGHT: Product Details */}
      <div className="flex-1 min-w-0 space-y-3">

        {/* Product Name & Identity */}
        <div className="bg-card rounded-xl shadow-sm border border-border px-3 py-4 space-y-3">
          <div className="grid grid-cols-[120px_1fr] gap-x-3 gap-y-2.5 items-start">
            <div className="text-sm font-medium text-foreground text-right pt-2">Product Name *</div>
            <div>
              <Input
                value={name}
                onChange={(e) => { setName(e.target.value); setErrors((prev) => { const { name: _, ...rest } = prev; return rest; }); }}
                placeholder="Enter product name"
                error={errors.name}
                className="font-semibold border-0 px-0 shadow-none focus:ring-0 bg-transparent"
              />
              <div className="flex items-center gap-1.5 flex-wrap min-h-[22px] mt-1">
                {categoryName && (
                  <span className="text-[11px] font-medium bg-indigo-50 text-indigo-700 px-2.5 py-0.5 rounded-full border border-indigo-100">{categoryName}</span>
                )}
                {selectedBrand && (
                  <span className="text-[11px] font-medium bg-amber-50 text-amber-700 px-2.5 py-0.5 rounded-full border border-amber-100">{selectedBrand}</span>
                )}
                {selectedFabric && (
                  <span className="text-[11px] font-medium bg-emerald-50 text-emerald-700 px-2.5 py-0.5 rounded-full border border-emerald-100">{selectedFabric}</span>
                )}
                {selectedOccasion && (
                  <span className="text-[11px] font-medium bg-rose-50 text-rose-700 px-2.5 py-0.5 rounded-full border border-rose-100">{selectedOccasion}</span>
                )}
              </div>
            </div>

            <div className="text-sm font-medium text-foreground text-right pt-2">Category *</div>
            <Select value={categoryId} onChange={(e) => handleCategoryChange(e.target.value)} options={categoryOptions} placeholder="Select category" error={errors.category} />

            <div className="text-sm font-medium text-foreground text-right pt-2">Brand</div>
            <Select value={brandId} onChange={(e) => handleBrandChange(e.target.value)} options={brandOptions} placeholder="Select brand" />

            <div className="text-sm font-medium text-foreground text-right pt-2">Supplier</div>
            <Select value={supplierId} onChange={(e) => handleSupplierChange(e.target.value)} options={supplierOptions} placeholder="Select supplier" />

            <div className="text-sm font-medium text-foreground text-right pt-2">Fabric</div>
            <Select value={fabric} onChange={(e) => setFabric(e.target.value)} options={fabricOptions} placeholder="Select fabric" />

            <div className="text-sm font-medium text-foreground text-right pt-2">Occasion</div>
            <Select value={occasion} onChange={(e) => setOccasion(e.target.value)} options={occasionOptions} placeholder="Select occasion" />

            <div className="text-sm font-medium text-foreground text-right pt-2">Country of Origin</div>
            <Select value={countryOfOrigin} onChange={(e) => setCountryOfOrigin(e.target.value)} options={countryOptions} placeholder="Select country" />

            <div className="text-sm font-medium text-foreground text-right pt-2">Model Number</div>
            <Input value={modelNumber} onChange={(e) => setModelNumber(e.target.value)} placeholder="Manufacturer model no." />

            <div className="text-sm font-medium text-foreground text-right pt-2">GTIN</div>
            <Input value={gtin} onChange={(e) => setGtin(e.target.value)} placeholder="Global Trade Item Number" />

            <div className="text-sm font-medium text-foreground text-right pt-2">HSN Code</div>
            <Select value={hsnCode} onChange={(e) => setHsnCode(e.target.value)} options={hsnOptions} placeholder="Select HSN code" />
          </div>

          <div className="space-y-1 pt-1 border-t border-gray-50">
            <label className="text-sm font-medium text-foreground">Description</label>
            <textarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Product description" rows={2} className="w-full rounded-lg border border-border px-3 py-2 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400 transition-all bg-muted/50 hover:bg-card" />
          </div>

          <div className="space-y-1">
            <label className="text-sm font-medium text-foreground">Care Instructions</label>
            <textarea value={careInstructions} onChange={(e) => setCareInstructions(e.target.value)} placeholder="e.g. Dry clean only. Do not bleach." rows={1} className="w-full rounded-lg border border-border px-3 py-2 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400 transition-all bg-muted/50 hover:bg-card" />
          </div>
        </div>

        {/* Default Pricing */}
        <div className="bg-card rounded-xl shadow-sm border border-border px-3 py-4 space-y-3">
          <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Default Pricing</div>
          <div className="grid grid-cols-4 gap-3">
            <Input label="Purchase Price" type="number" min="0" step="0.01" value={purchasePrice} onChange={(e) => setPurchasePrice(e.target.value)} placeholder="0.00" />
            <Input label="Selling Price" type="number" min="0" step="0.01" value={sellingPrice} onChange={(e) => setSellingPrice(e.target.value)} placeholder="0.00" />
            <Input label="MRP" type="number" min="0" step="0.01" value={mrp} onChange={(e) => setMrp(e.target.value)} placeholder="0.00" error={errors.mrp} />
            <Select label="GST Rate" value={gstPercentage} onChange={(e) => setGstPercentage(e.target.value)} options={GST_OPTIONS} />
          </div>
        </div>

        {/* Variants */}
        <div className="bg-card rounded-xl shadow-sm border border-border px-3 py-4 space-y-3">
          <div className="flex items-center justify-between pb-2 border-b border-gray-50">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-lg bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center">
                <Barcode size={12} className="text-white" />
              </div>
              <h3 className="text-xs font-semibold text-foreground uppercase tracking-wider">Variants ({productId ? editVariants.length : variants.length})</h3>
            </div>
            {productId ? (
              <Button variant="outline" size="sm" onClick={() => {
                setEditingEditVariant(null);
                setEditVariantForm({ size: '', color: '', colorHex: '', fabric: '', sku: generateSKU(), ean: '', barcode: '', supplierId: '', purchasePrice: '', sellingPrice: '', gstPercentage: '18', stockQuantity: '0', reorderLevel: '0' });
                setEditVariantFormError('');
                setEditVariantDialogOpen(true);
              }}>
                <Plus size={12} className="mr-1" /> Add Variant
              </Button>
            ) : (
              <Button variant="outline" size="sm" onClick={openAddVariant}>
                <Plus size={12} className="mr-1" /> Add Variant
              </Button>
            )}
          </div>

        {productId ? (
          editVariants.length === 0 ? (
            <div className="text-center py-6 text-muted-foreground text-xs border-2 border-dashed border-border rounded-lg">No variants yet. Click "Add Variant" above.</div>
          ) : (
            <div className="overflow-x-auto rounded-lg border border-border">
              <table className="w-full text-xs">
                <thead>
                  <tr className="bg-gradient-to-r from-gray-50 to-gray-100/50 border-b border-border">
                    <th className="px-3 py-2 text-left font-semibold text-gray-600 text-[10px] uppercase tracking-wider">SKU</th>
                    <th className="px-3 py-2 text-left font-semibold text-gray-600 text-[10px] uppercase tracking-wider">Size</th>
                    <th className="px-3 py-2 text-left font-semibold text-gray-600 text-[10px] uppercase tracking-wider">Color</th>
                    <th className="px-3 py-2 text-left font-semibold text-gray-600 text-[10px] uppercase tracking-wider">Fabric</th>
                    <th className="px-3 py-2 text-left font-semibold text-gray-600 text-[10px] uppercase tracking-wider">EAN</th>
                    <th className="px-3 py-2 text-center font-semibold text-gray-600 text-[10px] uppercase tracking-wider">Barcode</th>
                    <th className="px-3 py-2 text-right font-semibold text-gray-600 text-[10px] uppercase tracking-wider">Purchase</th>
                    <th className="px-3 py-2 text-right font-semibold text-gray-600 text-[10px] uppercase tracking-wider">Selling</th>
                    <th className="px-3 py-2 text-center font-semibold text-gray-600 text-[10px] uppercase tracking-wider">GST</th>
                    <th className="px-3 py-2 text-right font-semibold text-gray-600 text-[10px] uppercase tracking-wider">Stock</th>
                    <th className="px-3 py-2 text-center font-semibold text-gray-600 text-[10px] uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {editVariants.map((v) => (
                    <tr key={v.id} className="hover:bg-indigo-50/40 transition-colors">
                      <td className="px-3 py-2 font-mono text-[11px] text-muted-foreground">{v.sku}</td>
                      <td className="px-3 py-2 text-xs font-medium">{v.size || '-'}</td>
                      <td className="px-3 py-2">
                        <div className="flex items-center gap-1.5">
                          {v.colorHex && <span className="w-3.5 h-3.5 rounded-full border-2 border-border inline-block shadow-sm" style={{ backgroundColor: v.colorHex }} />}
                          <span className="text-xs">{v.color || '-'}</span>
                        </div>
                      </td>
                      <td className="px-3 py-2 text-xs">{v.fabric || '-'}</td>
                      <td className="px-3 py-2 font-mono text-[11px] text-muted-foreground">{v.ean || '-'}</td>
                      <td className="px-3 py-2 text-center">
                        {barcodeImages[v.id] || v.barcodeImagePath ? (
                          <div className="flex items-center justify-center gap-1">
                            <img src={getBarcodeImageUrl(barcodeImages[v.id] || v.barcodeImagePath) || ''} alt="barcode" className="h-5" />
                            <div className="flex flex-col gap-0.5">
                              <button onClick={() => regenerateBarcodeMutation.mutate(v.id)} className="p-0.5 rounded hover:bg-accent text-muted-foreground hover:text-indigo-600" title="Regenerate"><RefreshCw size={8} /></button>
                              <button onClick={() => handlePrintLabel(v.sku, name)} className="p-0.5 rounded hover:bg-accent text-muted-foreground hover:text-indigo-600" title="Print Label"><Printer size={8} /></button>
                            </div>
                          </div>
                        ) : (
                          <div className="flex items-center justify-center gap-1">
                            <button onClick={() => regenerateBarcodeMutation.mutate(v.id)} disabled={regenerateBarcodeMutation.isPending} className="text-[10px] text-indigo-600 hover:text-indigo-800 font-medium underline underline-offset-2">
                              {regenerateBarcodeMutation.isPending ? '...' : 'Generate'}
                            </button>
                            <button onClick={() => handlePrintLabel(v.sku, name)} className="p-0.5 rounded hover:bg-accent text-muted-foreground hover:text-indigo-600" title="Print Label"><Printer size={10} /></button>
                          </div>
                        )}
                      </td>
                      <td className="px-3 py-2 text-right font-mono text-[11px] text-foreground">₹{Number(v.purchasePrice).toFixed(2)}</td>
                      <td className="px-3 py-2 text-right font-mono text-[11px] text-foreground">₹{Number(v.sellingPrice).toFixed(2)}</td>
                      <td className="px-3 py-2 text-center text-[11px] text-gray-600">{gstEnumToNumber(v.gstPercentage)}%</td>
                      <td className="px-3 py-2 text-right font-mono text-[11px]" style={{ color: v.stockQuantity <= 0 ? '#dc2626' : v.stockQuantity <= (v.reorderLevel || 0) ? '#d97706' : '#374151' }}>{v.stockQuantity}</td>
                      <td className="px-3 py-2 text-center">
                        <div className="flex items-center justify-center gap-0.5">
                           <button onClick={() => {
                             setEditingEditVariant(v);
                              setEditVariantForm({
                                size: v.size || '', color: v.color || '', colorHex: v.colorHex || '', fabric: v.fabric || '',
                                sku: v.sku, ean: v.ean || '', barcode: v.barcode, supplierId: v.supplierId || '',
                                purchasePrice: String(v.purchasePrice), sellingPrice: String(v.sellingPrice),
                                gstPercentage: gstEnumToNumber(v.gstPercentage), stockQuantity: String(v.stockQuantity), reorderLevel: String(v.reorderLevel),
                              });
                             setEditVariantFormError('');
                             setEditVariantDialogOpen(true);
                           }} className="p-1 rounded-lg hover:bg-indigo-100 text-muted-foreground hover:text-indigo-600 transition-colors"><Edit2 size={11} /></button>
                           <button onClick={() => setDeleteEditVariantTarget(v)} className="p-1 rounded-lg hover:bg-red-100 text-muted-foreground hover:text-destructive transition-colors"><Trash2 size={11} /></button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )
        ) : variants.length === 0 ? (
          <div className="text-center py-6 text-muted-foreground text-xs border-2 border-dashed border-border rounded-lg">No variants yet. Click "Add Variant" above.</div>
        ) : (
          <div className="overflow-x-auto rounded-lg border border-border">
            <table className="w-full text-xs">
              <thead>
                <tr className="bg-gradient-to-r from-gray-50 to-gray-100/50 border-b border-border">
                  {variantTableHeaders.map((h) => (
                    <th key={h} className="px-3 py-2 text-left font-semibold text-gray-600 text-[10px] uppercase tracking-wider whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {variants.map((v) => (
                  <tr key={v.id} className="hover:bg-indigo-50/40 transition-colors">
                    <td className="px-3 py-2 font-mono text-[11px] text-muted-foreground">{v.sku}</td>
                    <td className="px-3 py-2 text-xs font-medium">{v.size || '-'}</td>
                    <td className="px-3 py-2">
                      <div className="flex items-center gap-1.5">
                        {v.colorHex && <span className="w-3.5 h-3.5 rounded-full border-2 border-border inline-block shadow-sm" style={{ backgroundColor: v.colorHex }} />}
                        <span className="text-xs">{v.color || '-'}</span>
                      </div>
                    </td>
                    <td className="px-3 py-2 text-xs">{v.fabric || '-'}</td>
                    <td className="px-3 py-2 font-mono text-[11px] text-muted-foreground">{v.ean || '-'}</td>
                    <td className="px-3 py-2 text-right text-xs">{v.purchasePrice ? `₹${parseFloat(v.purchasePrice).toFixed(0)}` : '-'}</td>
                    <td className="px-3 py-2 text-right text-xs font-medium">{v.sellingPrice ? `₹${parseFloat(v.sellingPrice).toFixed(0)}` : '-'}</td>
                    <td className="px-3 py-2 text-right text-xs">{v.mrp ? `₹${parseFloat(v.mrp).toFixed(0)}` : '-'}</td>
                    <td className="px-3 py-2 text-center text-xs">{v.gstPercentage}%</td>
                    <td className="px-3 py-2 text-right text-xs">{v.initialStock}</td>
                    <td className="px-3 py-2 text-[11px] text-muted-foreground">{v.rackLocation || '-'}</td>
                    <td className="px-3 py-2">
                      <div className="flex items-center gap-0.5">
                        <button onClick={() => openEditVariant(v)} className="p-1 rounded-lg hover:bg-indigo-100 text-muted-foreground hover:text-indigo-600 transition-colors"><Edit2 size={11} /></button>
                        <button onClick={() => removeVariant(v.id)} className="p-1 rounded-lg hover:bg-red-100 text-muted-foreground hover:text-destructive transition-colors"><Trash2 size={11} /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <Dialog open={variantDialogOpen} onClose={() => setVariantDialogOpen(false)} title={editingVariant ? 'Edit Variant' : 'Add Variant'} size="lg">
        <div className="space-y-4 max-h-[65vh] overflow-y-auto pr-1">
          <div className="grid grid-cols-4 gap-3">
            <Select label="Size" value={variantForm.size} onChange={(e) => setVariantFormField('size', e.target.value)} options={sizeOptions} placeholder="Select size" />
            <Select label="Color" value={variantForm.color} onChange={(e) => {
              setVariantFormField('color', e.target.value);
              const c = (colors || []).find((cl) => cl.name === e.target.value);
              if (c) setVariantFormField('colorHex', c.hex);
            }} options={colorOptions} placeholder="Select color" />
            <div>
              <label className="block text-sm font-medium text-foreground mb-1">Color Hex</label>
              <div className="flex items-center gap-2">
                <input type="color" value={variantForm.colorHex || '#000000'} onChange={(e) => setVariantFormField('colorHex', e.target.value)} className="w-8 h-8 rounded-lg border border-border cursor-pointer p-0.5 shadow-sm" />
                <input type="text" value={variantForm.colorHex} onChange={(e) => setVariantFormField('colorHex', e.target.value)} placeholder="#000000" className="w-full rounded-lg border border-border px-2.5 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400 transition-all bg-muted/50 hover:bg-card" />
              </div>
            </div>
            <Input label="Fabric" value={variantForm.fabric} onChange={(e) => setVariantFormField('fabric', e.target.value)} placeholder="e.g. Cotton" />
          </div>

          <div className="flex items-end gap-2">
            <div className="flex-1">
              <Input label="SKU" value={variantForm.sku} onChange={(e) => setVariantFormField('sku', e.target.value)} placeholder="Auto-generated" />
            </div>
            <button type="button" onClick={regenerateSku} className="mb-1 p-2 rounded-lg hover:bg-accent text-muted-foreground hover:text-indigo-600 transition-colors" title="Regenerate SKU"><RefreshCw size={14} /></button>
          </div>

          <Input label="EAN (Barcode Number)" value={variantForm.ean} onChange={(e) => setVariantFormField('ean', e.target.value)} placeholder="e.g. 8901234567890" />

          <div className="flex items-center gap-3 p-3 bg-gradient-to-r from-indigo-50/50 to-purple-50/50 rounded-lg border border-indigo-100/50">
            <div className="w-10 h-10 rounded-lg bg-card shadow-sm border border-indigo-100 flex items-center justify-center">
              <Barcode size={20} className="text-indigo-400" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider mb-1">Code128 Barcode</p>
              <div className="bg-card rounded-lg border border-border p-1.5 inline-block shadow-sm">
                {variantForm.sku ? (
                  <BarcodeLib value={variantForm.sku.slice(0, 12)} format="CODE128" width={1.2} height={24} displayValue={false} />
                ) : (
                  <p className="text-xs text-muted-foreground font-mono">-</p>
                )}
              </div>
            </div>
          </div>

          <div className="border-t border-border pt-3">
            <div className="flex items-center gap-1.5 mb-2">
              <span className="w-1 h-1 rounded-full bg-emerald-500" />
              <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">Pricing</span>
            </div>
            <div className="grid grid-cols-4 gap-3">
              <Input label="Purchase Price" type="number" min="0" step="0.01" value={variantForm.purchasePrice} onChange={(e) => setVariantFormField('purchasePrice', e.target.value)} placeholder="0.00" />
              <Input label="Selling Price" type="number" min="0" step="0.01" value={variantForm.sellingPrice} onChange={(e) => setVariantFormField('sellingPrice', e.target.value)} placeholder="0.00" />
              <Input label="MRP" type="number" min="0" step="0.01" value={variantForm.mrp} onChange={(e) => setVariantFormField('mrp', e.target.value)} placeholder="0.00" />
              <Select label="GST (%)" value={variantForm.gstPercentage} onChange={(e) => setVariantFormField('gstPercentage', e.target.value)} options={GST_OPTIONS} />
            </div>
            <Select label="Supplier (overrides product)" value={variantForm.supplierId} onChange={(e) => {
              if (e.target.value === '__add_new__') { setNewSupplierForm({ name: '', contactPerson: '', email: '', phone: '', gstin: '', address: '' }); setSupplierFormError(''); setSupplierDialogOpen(true); }
              else { setVariantFormField('supplierId', e.target.value); }
            }} options={supplierOptions} placeholder="Default (product supplier)" />
          </div>

          <div className="border-t border-border pt-3">
            <div className="flex items-center gap-1.5 mb-2">
              <span className="w-1 h-1 rounded-full bg-amber-500" />
              <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">Stock</span>
            </div>
            <div className="grid grid-cols-3 gap-3">
              <Input label="Initial Stock" type="number" min="0" value={variantForm.initialStock} onChange={(e) => setVariantFormField('initialStock', e.target.value)} />
              <Input label="Reorder Level" type="number" min="0" value={variantForm.reorderLevel} onChange={(e) => setVariantFormField('reorderLevel', e.target.value)} />
              <Input label="Rack / Location" value={variantForm.rackLocation} onChange={(e) => setVariantFormField('rackLocation', e.target.value)} placeholder="e.g. A-12" />
            </div>
          </div>

          {variantFormError && <p className="text-xs text-red-500 bg-red-50 px-2.5 py-1.5 rounded-lg">{variantFormError}</p>}

          <div className="flex justify-end gap-3 pt-2 border-t border-border">
            <Button variant="outline" size="sm" onClick={() => setVariantDialogOpen(false)}>Cancel</Button>
            <Button size="sm" className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white shadow-sm shadow-indigo-500/20" onClick={handleSaveVariant}>{editingVariant ? 'Update Variant' : 'Add Variant'}</Button>
          </div>
        </div>
      </Dialog>



      <Dialog open={categoryDialogOpen} onClose={() => setCategoryDialogOpen(false)} title="Add New Category" size="sm">
        <div className="space-y-4">
          <Input label="Category Name" value={newCategoryName} onChange={(e) => setNewCategoryName(e.target.value)} placeholder="Enter category name" />
          <div className="flex justify-end gap-3">
            <Button variant="outline" onClick={() => setCategoryDialogOpen(false)}>Cancel</Button>
            <Button onClick={() => { if (!newCategoryName.trim()) { setErrors((prev) => ({ ...prev, category: 'Name is required' })); return; } createCategoryMutation.mutate({ name: newCategoryName.trim() }); }}
              disabled={createCategoryMutation.isPending}>{createCategoryMutation.isPending ? 'Creating...' : 'Create'}</Button>
          </div>
        </div>
      </Dialog>

      <Dialog open={brandDialogOpen} onClose={() => setBrandDialogOpen(false)} title="Add New Brand" size="sm">
        <div className="space-y-4">
          <Input label="Brand Name" value={newBrandName} onChange={(e) => setNewBrandName(e.target.value)} placeholder="Enter brand name" />
          <div className="flex justify-end gap-3">
            <Button variant="outline" onClick={() => setBrandDialogOpen(false)}>Cancel</Button>
            <Button onClick={() => { if (!newBrandName.trim()) { setErrors((prev) => ({ ...prev, brand: 'Name is required' })); return; } createBrandMutation.mutate({ name: newBrandName.trim() }); }}
              disabled={createBrandMutation.isPending}>{createBrandMutation.isPending ? 'Creating...' : 'Create'}</Button>
          </div>
        </div>
      </Dialog>

      {productId && (
        <>
          <Dialog open={editVariantDialogOpen} onClose={() => setEditVariantDialogOpen(false)} title={editingEditVariant ? 'Edit Variant' : 'Add Variant'} size="lg">
            <div className="space-y-4">
              <div className="grid grid-cols-4 gap-3">
                <Select label="Size" value={editVariantForm.size} onChange={(e) => setEditVariantForm({ ...editVariantForm, size: e.target.value })} options={sizeOptions} placeholder="Select size" />
                <Select label="Color" value={editVariantForm.color} onChange={(e) => {
                  setEditVariantForm({ ...editVariantForm, color: e.target.value });
                  const c = (colors || []).find((cl) => cl.name === e.target.value);
                  if (c) setEditVariantForm({ ...editVariantForm, color: e.target.value, colorHex: c.hex });
                }} options={colorOptions} placeholder="Select color" />
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1">Color Hex</label>
                  <div className="flex items-center gap-2">
                    <input type="color" value={editVariantForm.colorHex || '#000000'} onChange={(e) => setEditVariantForm({ ...editVariantForm, colorHex: e.target.value })} className="w-8 h-8 rounded-lg border border-border cursor-pointer p-0.5 shadow-sm" />
                    <input type="text" value={editVariantForm.colorHex || ''} onChange={(e) => setEditVariantForm({ ...editVariantForm, colorHex: e.target.value })} placeholder="#000000" className="w-full rounded-lg border border-border px-2.5 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400 transition-all bg-muted/50 hover:bg-card" />
                  </div>
                </div>
                <Input label="Fabric" value={editVariantForm.fabric || ''} onChange={(e) => setEditVariantForm({ ...editVariantForm, fabric: e.target.value })} placeholder="e.g. Cotton" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <Input label="SKU *" value={editVariantForm.sku} onChange={(e) => setEditVariantForm({ ...editVariantForm, sku: e.target.value })} />
                <Input label="EAN" value={editVariantForm.ean || ''} onChange={(e) => setEditVariantForm({ ...editVariantForm, ean: e.target.value })} placeholder="e.g. 8901234567890" />
              </div>
              <div className="flex items-center gap-3 p-3 bg-gradient-to-r from-indigo-50/50 to-purple-50/50 rounded-lg border border-indigo-100/50">
                <div className="w-10 h-10 rounded-lg bg-card shadow-sm border border-indigo-100 flex items-center justify-center">
                  <Barcode size={20} className="text-indigo-400" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider mb-1">Code128 Barcode</p>
                  <div className="bg-card rounded-lg border border-border p-1.5 inline-block shadow-sm">
                    {editVariantForm.sku ? (
                      <BarcodeLib value={editVariantForm.sku.slice(0, 12)} format="CODE128" width={1.2} height={24} displayValue={false} />
                    ) : (
                      <p className="text-xs text-muted-foreground font-mono">-</p>
                    )}
                  </div>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <Input label="Purchase Price *" type="number" min="0" step="0.01" value={editVariantForm.purchasePrice} onChange={(e) => setEditVariantForm({ ...editVariantForm, purchasePrice: e.target.value })} />
                <Input label="Selling Price *" type="number" min="0" step="0.01" value={editVariantForm.sellingPrice} onChange={(e) => setEditVariantForm({ ...editVariantForm, sellingPrice: e.target.value })} />
              </div>
              <Select label="GST (%)" value={editVariantForm.gstPercentage} onChange={(e) => setEditVariantForm({ ...editVariantForm, gstPercentage: e.target.value })} options={GST_OPTIONS} />
              <Select label="Supplier (overrides product)" value={editVariantForm.supplierId || ''} onChange={(e) => {
                if (e.target.value === '__add_new__') { setNewSupplierForm({ name: '', contactPerson: '', email: '', phone: '', gstin: '', address: '' }); setSupplierFormError(''); setSupplierDialogOpen(true); }
                else { setEditVariantForm({ ...editVariantForm, supplierId: e.target.value || undefined }); }
              }} options={supplierOptions} placeholder="Default (product supplier)" />
              <div className="grid grid-cols-2 gap-3">
                <Input label="Stock Quantity" type="number" min="0" value={editVariantForm.stockQuantity} onChange={(e) => setEditVariantForm({ ...editVariantForm, stockQuantity: e.target.value })} />
                <Input label="Reorder Level" type="number" min="0" value={editVariantForm.reorderLevel} onChange={(e) => setEditVariantForm({ ...editVariantForm, reorderLevel: e.target.value })} />
              </div>
              {editVariantFormError && <p className="text-xs text-red-500 bg-red-50 px-2.5 py-1.5 rounded-lg">{editVariantFormError}</p>}
              <div className="flex justify-end gap-3 pt-2 border-t border-border">
                <Button variant="outline" size="sm" onClick={() => setEditVariantDialogOpen(false)}>Cancel</Button>
                <Button size="sm" className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white shadow-sm shadow-indigo-500/20" onClick={() => {
                  const pp = parseFloat(editVariantForm.purchasePrice);
                  const sp = parseFloat(editVariantForm.sellingPrice);
                  if (!editVariantForm.sku?.trim()) { setEditVariantFormError('SKU is required'); return; }
                  if (isNaN(pp) || pp < 0) { setEditVariantFormError('Valid purchase price is required'); return; }
                  if (isNaN(sp) || sp < 0) { setEditVariantFormError('Valid selling price is required'); return; }
                  const payload: Record<string, unknown> = {
                    size: editVariantForm.size || undefined, color: editVariantForm.color || undefined,
                    colorHex: editVariantForm.colorHex || undefined, fabric: editVariantForm.fabric || undefined,
                    sku: editVariantForm.sku, ean: editVariantForm.ean || undefined, barcode: editVariantForm.barcode || undefined,
                    supplierId: editVariantForm.supplierId || undefined,
                    purchasePrice: pp, sellingPrice: sp,
                    gstPercentage: editVariantForm.gstPercentage,
                    reorderLevel: parseInt(editVariantForm.reorderLevel, 10) || 0,
                  };
                  if (editingEditVariant) {
                    payload.stockQuantity = parseInt(editVariantForm.stockQuantity, 10) || 0;
                    updateVariantMutation.mutate({ variantId: editingEditVariant.id, data: payload });
                  } else {
                    payload.initialStock = parseInt(editVariantForm.stockQuantity, 10) || 0;
                    createVariantMutation.mutate(payload);
                  }
                }} disabled={createVariantMutation.isPending || updateVariantMutation.isPending}>
                  {(createVariantMutation.isPending || updateVariantMutation.isPending) ? 'Saving...' : editingEditVariant ? 'Update Variant' : 'Add Variant'}
                </Button>
              </div>
            </div>
          </Dialog>
          <ConfirmDialog open={!!deleteEditVariantTarget} onClose={() => setDeleteEditVariantTarget(null)}
            onConfirm={() => deleteEditVariantTarget && deleteVariantMutation.mutate(deleteEditVariantTarget.id)}
            title="Delete Variant" message={`Delete variant "${deleteEditVariantTarget?.sku}"?`}
            confirmLabel="Delete" variant="danger" loading={deleteVariantMutation.isPending} />
        </>
      )}

      <Dialog open={supplierDialogOpen} onClose={() => setSupplierDialogOpen(false)} title="Add Supplier" size="sm" zIndex={60}>
        <form onSubmit={(e) => { e.preventDefault(); if (!newSupplierForm.name.trim()) { setSupplierFormError('Name is required'); return; } setCreatingSupplier(true); createSupplierMutation.mutate({ ...newSupplierForm, name: newSupplierForm.name.trim() }); }} className="space-y-4">
          <Input label="Name *" value={newSupplierForm.name} onChange={(e) => setNewSupplierForm({ ...newSupplierForm, name: e.target.value })} placeholder="e.g. Fabrics India" />
          <Input label="Contact Person" value={newSupplierForm.contactPerson} onChange={(e) => setNewSupplierForm({ ...newSupplierForm, contactPerson: e.target.value })} placeholder="e.g. Rajesh Kumar" />
          <div className="grid grid-cols-2 gap-3">
            <Input label="Email" type="email" value={newSupplierForm.email} onChange={(e) => setNewSupplierForm({ ...newSupplierForm, email: e.target.value })} placeholder="email@example.com" />
            <Input label="Phone" value={newSupplierForm.phone} onChange={(e) => setNewSupplierForm({ ...newSupplierForm, phone: e.target.value })} placeholder="+91-9876543210" />
          </div>
          <Input label="GSTIN" value={newSupplierForm.gstin} onChange={(e) => setNewSupplierForm({ ...newSupplierForm, gstin: e.target.value })} placeholder="22AAAAA0000A1Z5" />
          <Input label="Address" value={newSupplierForm.address} onChange={(e) => setNewSupplierForm({ ...newSupplierForm, address: e.target.value })} placeholder="Full address" />
          {supplierFormError && <p className="text-sm text-red-500">{supplierFormError}</p>}
          <div className="flex justify-end gap-3 pt-2">
            <Button variant="outline" type="button" onClick={() => setSupplierDialogOpen(false)}>Cancel</Button>
            <Button type="submit" disabled={createSupplierMutation.isPending || creatingSupplier}>{createSupplierMutation.isPending ? 'Saving...' : 'Create Supplier'}</Button>
          </div>
        </form>
      </Dialog>

      <div className="flex items-center justify-end gap-3 pt-3 border-t border-border">
        <Button variant="outline" size="sm" onClick={onCancel}>Cancel</Button>
        <Button size="sm" onClick={handleSubmit} disabled={isSubmitting} className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white shadow-sm shadow-indigo-500/20">{isSubmitting ? 'Saving...' : productId ? 'Save Product' : 'Create Product'}</Button>
      </div>
    </div>
  </div>
  );
}


