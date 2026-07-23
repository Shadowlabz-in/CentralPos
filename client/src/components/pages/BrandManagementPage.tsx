import { useState, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Tag, Plus, Pencil, Trash2 } from 'lucide-react';
import { apiRequest } from '@/context/AuthContext';
import type { Brand, ApiResponse } from '@/types';
import { Button } from '@/components/ui/button';
import { Dialog } from '@/components/ui/Dialog';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import Input from '@/components/ui/Input';
import { SearchInput } from '@/components/ui/SearchInput';
import { PageSpinner } from '@/components/ui/Spinner';
import { Pagination } from '@/components/ui/Pagination';

const ITEMS_PER_PAGE = 10;

interface BrandForm {
  name: string;
  description: string;
}

const emptyForm: BrandForm = { name: '', description: '' };

export default function BrandManagementPage() {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingBrand, setEditingBrand] = useState<Brand | null>(null);
  const [form, setForm] = useState<BrandForm>(emptyForm);
  const [formError, setFormError] = useState('');
  const [deleteTarget, setDeleteTarget] = useState<Brand | null>(null);
  const [deleteError, setDeleteError] = useState('');

  const {
    data: brands,
    isLoading,
    error,
  } = useQuery({
    queryKey: ['brands'],
    queryFn: async () => {
      const res = await apiRequest<ApiResponse<Brand[]>>('/brands');
      return res.data;
    },
  });

  const filtered = useMemo(() => {
    if (!brands) return [];
    if (!search.trim()) return brands;
    const q = search.toLowerCase();
    return brands.filter((b) => b.name.toLowerCase().includes(q));
  }, [brands, search]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / ITEMS_PER_PAGE));
  const safePage = Math.min(page, totalPages);
  const paginatedBrands = useMemo(() => {
    const start = (safePage - 1) * ITEMS_PER_PAGE;
    return filtered.slice(start, start + ITEMS_PER_PAGE);
  }, [filtered, safePage]);

  const invalidate = () => queryClient.invalidateQueries({ queryKey: ['brands'] });

  const createMutation = useMutation({
    mutationFn: (data: { name: string; description?: string }) =>
      apiRequest('/brands', {
        method: 'POST',
        body: JSON.stringify(data),
      }),
    onSuccess: () => {
      invalidate();
      closeDialog();
    },
    onError: (e: Error) => setFormError(e.message),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: { name?: string; description?: string } }) =>
      apiRequest(`/brands/${id}`, {
        method: 'PATCH',
        body: JSON.stringify(data),
      }),
    onSuccess: () => {
      invalidate();
      closeDialog();
    },
    onError: (e: Error) => setFormError(e.message),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => apiRequest(`/brands/${id}`, { method: 'DELETE' }),
    onSuccess: () => {
      invalidate();
      setDeleteTarget(null);
      setDeleteError('');
    },
    onError: (e: Error) => setDeleteError(e.message),
  });

  function openAddDialog() {
    setEditingBrand(null);
    setForm(emptyForm);
    setFormError('');
    setDialogOpen(true);
  }

  function openEditDialog(brand: Brand) {
    setEditingBrand(brand);
    setForm({
      name: brand.name,
      description: brand.description || '',
    });
    setFormError('');
    setDialogOpen(true);
  }

  function closeDialog() {
    setDialogOpen(false);
    setEditingBrand(null);
    setForm(emptyForm);
    setFormError('');
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setFormError('');
    if (!form.name.trim()) {
      setFormError('Name is required');
      return;
    }
    const payload: { name: string; description?: string } = { name: form.name.trim() };
    if (form.description.trim()) payload.description = form.description.trim();

    if (editingBrand) {
      updateMutation.mutate({ id: editingBrand.id, data: payload });
    } else {
      createMutation.mutate(payload);
    }
  }

  function handleDelete() {
    if (!deleteTarget) return;
    setDeleteError('');
    deleteMutation.mutate(deleteTarget.id);
  }

  const isSubmitting = createMutation.isPending || updateMutation.isPending;

  function handleSearchChange(value: string) {
    setSearch(value);
    setPage(1);
  }

  if (isLoading) return <PageSpinner />;
  if (error) return <p className="text-red-500 p-4">Failed to load brands</p>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Brands</h1>
          <p className="text-gray-500">Manage product brands</p>
        </div>
        <Button onClick={openAddDialog}>
          <Plus size={16} className="mr-1.5" /> Add Brand
        </Button>
      </div>

      <div className="w-72">
        <SearchInput
          value={search}
          onChange={handleSearchChange}
          placeholder="Search brands by name..."
        />
      </div>

      <div className="bg-white rounded-xl border">
        {paginatedBrands.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-gray-400">
            <Tag size={48} className="mb-3" />
            <p className="text-lg font-medium mb-1">
              {search ? 'No brands match your search' : 'No brands yet'}
            </p>
            <p className="text-sm">
              {search ? 'Try a different search term' : 'Create your first brand to get started'}
            </p>
          </div>
        ) : (
          <>
            <table className="w-full">
              <thead className="border-b bg-gray-50">
                <tr>
                  <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Name
                  </th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Description
                  </th>
                  <th className="text-center px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Products
                  </th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Created
                  </th>
                  <th className="text-right px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {paginatedBrands.map((brand) => (
                  <tr key={brand.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <Tag size={14} className="text-gray-400 shrink-0" />
                        <span className="text-sm font-medium text-gray-900">{brand.name}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-500 max-w-[240px] truncate">
                      {brand.description || '-'}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-700 text-center">
                      {brand.productCount ?? 0}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-500">
                      {new Date(brand.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => openEditDialog(brand)}
                          className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-500 hover:text-blue-600"
                          title="Edit brand"
                        >
                          <Pencil size={14} />
                        </button>
                        <button
                          onClick={() => {
                            setDeleteTarget(brand);
                            setDeleteError('');
                          }}
                          className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-500 hover:text-red-600"
                          title="Delete brand"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            <div className="px-4 pb-4">
              <Pagination
                page={safePage}
                totalPages={totalPages}
                total={filtered.length}
                onPageChange={setPage}
              />
            </div>
          </>
        )}
      </div>

      <Dialog
        open={dialogOpen}
        onClose={closeDialog}
        title={editingBrand ? 'Edit Brand' : 'Add Brand'}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Name"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            placeholder="Brand name"
            required
          />

          <div className="space-y-1">
            <label className="block text-sm font-medium text-gray-700">Description</label>
            <textarea
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              placeholder="Optional description"
              rows={3}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary resize-none"
            />
          </div>

          {formError && <p className="text-sm text-red-500">{formError}</p>}

          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={closeDialog}
              className="px-4 py-2 text-sm rounded-lg border hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-4 py-2 text-sm rounded-lg bg-black text-white hover:bg-gray-800 disabled:opacity-50"
            >
              {isSubmitting ? 'Saving...' : editingBrand ? 'Update' : 'Create'}
            </button>
          </div>
        </form>
      </Dialog>

      <ConfirmDialog
        open={!!deleteTarget}
        onClose={() => {
          setDeleteTarget(null);
          setDeleteError('');
        }}
        onConfirm={handleDelete}
        title="Delete Brand"
        message={
          deleteTarget && (deleteTarget.productCount ?? 0) > 0
            ? `Cannot delete "${deleteTarget.name}" — it has ${deleteTarget.productCount} product(s) assigned. Remove or reassign them first.`
            : `Are you sure you want to delete "${deleteTarget?.name}"? This action cannot be undone.`
        }
        confirmLabel="Delete"
        variant="danger"
        loading={deleteMutation.isPending}
      />
      {deleteError && (
        <div className="fixed bottom-4 right-4 bg-red-50 text-red-700 px-4 py-3 rounded-lg border border-red-200 text-sm shadow-lg">
          {deleteError}
        </div>
      )}
    </div>
  );
}
