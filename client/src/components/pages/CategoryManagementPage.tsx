import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, Edit2, Trash2, Search } from 'lucide-react';
import { apiRequest } from '@/context/AuthContext';
import type { Category } from '@/types';
import { Table } from '@/components/ui/Table';
import { Dialog } from '@/components/ui/Dialog';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { SearchInput } from '@/components/ui/SearchInput';
import { Select } from '@/components/ui/Select';
import { Badge } from '@/components/ui/Badge';
import { Spinner } from '@/components/ui/Spinner';
import { Button } from '@/components/ui/button';
import Input from '@/components/ui/Input';

export default function CategoryManagementPage() {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<Category | null>(null);
  const [form, setForm] = useState({ name: '', description: '', parentId: '' });
  const [formError, setFormError] = useState('');
  const [deleteTarget, setDeleteTarget] = useState<Category | null>(null);

  const {
    data: categories,
    isLoading,
    error,
  } = useQuery({
    queryKey: ['categories'],
    queryFn: async () => {
      const res = await apiRequest<{ status: string; data: Category[] }>('/categories');
      return res.data;
    },
    staleTime: 60000,
  });

  const filtered = (categories || []).filter(
    (c) => !search || c.name.toLowerCase().includes(search.toLowerCase()),
  );

  const parentOptions = (categories || [])
    .filter((c) => c.id !== editing?.id)
    .map((c) => ({ value: c.id, label: c.name }));

  const invalidate = () => queryClient.invalidateQueries({ queryKey: ['categories'] });

  const createMutation = useMutation({
    mutationFn: (data: { name: string; description?: string; parentId?: string }) =>
      apiRequest('/categories', { method: 'POST', body: JSON.stringify(data) }),
    onSuccess: () => {
      invalidate();
      closeDialog();
    },
    onError: (e: Error) => setFormError(e.message),
  });

  const updateMutation = useMutation({
    mutationFn: ({
      id,
      data,
    }: {
      id: string;
      data: { name?: string; description?: string; parentId?: string | null };
    }) => apiRequest(`/categories/${id}`, { method: 'PATCH', body: JSON.stringify(data) }),
    onSuccess: () => {
      invalidate();
      closeDialog();
    },
    onError: (e: Error) => setFormError(e.message),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => apiRequest(`/categories/${id}`, { method: 'DELETE' }),
    onSuccess: () => {
      invalidate();
      setDeleteTarget(null);
    },
    onError: (e: Error) => setDeleteTarget(null),
  });

  function openAdd() {
    setEditing(null);
    setForm({ name: '', description: '', parentId: '' });
    setFormError('');
    setDialogOpen(true);
  }

  function openEdit(cat: Category) {
    setEditing(cat);
    setForm({ name: cat.name, description: cat.description || '', parentId: cat.parentId || '' });
    setFormError('');
    setDialogOpen(true);
  }

  function closeDialog() {
    setDialogOpen(false);
    setEditing(null);
    setForm({ name: '', description: '', parentId: '' });
    setFormError('');
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setFormError('');
    if (!form.name.trim()) {
      setFormError('Name is required');
      return;
    }
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

  if (isLoading) return <Spinner />;
  if (error) return <p className="text-red-500 p-4">Failed to load categories</p>;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Categories</h1>
          <p className="text-gray-500">Manage product categories</p>
        </div>
        <Button onClick={openAdd}>
          <Plus size={16} className="mr-1" /> Add Category
        </Button>
      </div>

      <div className="w-64">
        <SearchInput value={search} onChange={setSearch} placeholder="Search categories..." />
      </div>

      <Table
        columns={[
          {
            key: 'name',
            header: 'Name',
            render: (c: Category) => <span className="font-medium">{c.name}</span>,
          },
          { key: 'parent', header: 'Parent', render: (c: Category) => c.parent?.name || '-' },
          {
            key: 'productCount',
            header: 'Products',
            render: (c: Category) => (
              <Badge variant={c.productCount && c.productCount > 0 ? 'default' : 'info'}>
                {c.productCount || 0}
              </Badge>
            ),
          },
          {
            key: 'childCount',
            header: 'Subcategories',
            render: (c: Category) => c.childCount || 0,
          },
          {
            key: 'actions',
            header: 'Actions',
            render: (c: Category) => (
              <div className="flex gap-1">
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={(e) => {
                    e.stopPropagation();
                    openEdit(c);
                  }}
                >
                  <Edit2 size={14} />
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={(e) => {
                    e.stopPropagation();
                    setDeleteTarget(c);
                  }}
                >
                  <Trash2 size={14} className="text-red-500" />
                </Button>
              </div>
            ),
          },
        ]}
        data={filtered}
        keyExtractor={(c) => c.id}
        emptyMessage="No categories found. Create your first category."
      />

      <Dialog
        open={dialogOpen}
        onClose={closeDialog}
        title={editing ? 'Edit Category' : 'Add Category'}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Name"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            placeholder="Category name"
          />
          <Select
            label="Parent Category"
            value={form.parentId}
            onChange={(e) => setForm({ ...form, parentId: e.target.value })}
            options={parentOptions}
            placeholder="None (Top level)"
          />
          <div className="space-y-1">
            <label className="block text-sm font-medium text-gray-700">Description</label>
            <textarea
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              placeholder="Optional description"
              rows={3}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>
          {formError && <p className="text-sm text-red-500">{formError}</p>}
          <div className="flex justify-end gap-3 pt-2">
            <Button variant="outline" type="button" onClick={closeDialog}>
              Cancel
            </Button>
            <Button type="submit" disabled={submitting}>
              {submitting ? 'Saving...' : editing ? 'Update' : 'Create'}
            </Button>
          </div>
        </form>
      </Dialog>

      <ConfirmDialog
        open={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={() => deleteTarget && deleteMutation.mutate(deleteTarget.id)}
        title="Delete Category"
        message={
          deleteTarget && (deleteTarget.productCount ?? 0) > 0
            ? `Cannot delete "${deleteTarget.name}" — it has ${deleteTarget.productCount} product(s). Remove or reassign them first.`
            : `Are you sure you want to delete "${deleteTarget?.name}"?`
        }
        confirmLabel="Delete"
        variant="danger"
        loading={deleteMutation.isPending}
      />
    </div>
  );
}
