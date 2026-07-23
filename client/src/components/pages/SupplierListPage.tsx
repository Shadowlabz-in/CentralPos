import { useState, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, Edit2, Trash2, Users } from 'lucide-react';
import { apiRequest } from '@/context/AuthContext';
import type { Supplier, ApiResponse } from '@/types';
import { Dialog } from '@/components/ui/Dialog';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import Input from '@/components/ui/Input';
import { PageSpinner } from '@/components/ui/Spinner';
import { SearchInput } from '@/components/ui/SearchInput';
import { Badge } from '@/components/ui/Badge';

interface SupplierForm {
  name: string;
  contactPerson: string;
  phone: string;
  email: string;
  address: string;
  city: string;
  state: string;
  pincode: string;
  gstin: string;
}

const emptyForm: SupplierForm = {
  name: '',
  contactPerson: '',
  phone: '',
  email: '',
  address: '',
  city: '',
  state: '',
  pincode: '',
  gstin: '',
};

export default function SupplierListPage() {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingSupplier, setEditingSupplier] = useState<Supplier | null>(null);
  const [form, setForm] = useState<SupplierForm>(emptyForm);
  const [formError, setFormError] = useState('');
  const [deleteTarget, setDeleteTarget] = useState<Supplier | null>(null);
  const [deleteError, setDeleteError] = useState('');

  const {
    data: suppliers,
    isLoading,
    error,
  } = useQuery({
    queryKey: ['suppliers'],
    queryFn: async () => {
      const res = await apiRequest<ApiResponse<Supplier[]>>('/suppliers');
      return res.data;
    },
  });

  const filtered = useMemo(() => {
    if (!suppliers) return [];
    if (!search.trim()) return suppliers;
    const q = search.toLowerCase();
    return suppliers.filter(
      (s) =>
        s.name.toLowerCase().includes(q) ||
        (s.phone || '').toLowerCase().includes(q) ||
        (s.email || '').toLowerCase().includes(q),
    );
  }, [suppliers, search]);

  const invalidate = () => queryClient.invalidateQueries({ queryKey: ['suppliers'] });

  const createMutation = useMutation({
    mutationFn: (data: Omit<SupplierForm, ''>) =>
      apiRequest('/suppliers', {
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
    mutationFn: ({ id, data }: { id: string; data: Partial<SupplierForm> }) =>
      apiRequest(`/suppliers/${id}`, {
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
    mutationFn: (id: string) => apiRequest(`/suppliers/${id}`, { method: 'DELETE' }),
    onSuccess: () => {
      invalidate();
      setDeleteTarget(null);
      setDeleteError('');
    },
    onError: (e: Error) => setDeleteError(e.message),
  });

  function openAddDialog() {
    setEditingSupplier(null);
    setForm(emptyForm);
    setFormError('');
    setDialogOpen(true);
  }

  function openEditDialog(supplier: Supplier) {
    setEditingSupplier(supplier);
    setForm({
      name: supplier.name,
      contactPerson: supplier.contactPerson || '',
      phone: supplier.phone || '',
      email: supplier.email || '',
      address: supplier.address || '',
      city: supplier.city || '',
      state: supplier.state || '',
      pincode: supplier.pincode || '',
      gstin: supplier.gstin || '',
    });
    setFormError('');
    setDialogOpen(true);
  }

  function closeDialog() {
    setDialogOpen(false);
    setEditingSupplier(null);
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
    const payload: Partial<SupplierForm> = {};
    if (form.name.trim()) payload.name = form.name.trim();
    if (form.contactPerson.trim()) payload.contactPerson = form.contactPerson.trim();
    if (form.phone.trim()) payload.phone = form.phone.trim();
    if (form.email.trim()) payload.email = form.email.trim();
    if (form.address.trim()) payload.address = form.address.trim();
    if (form.city.trim()) payload.city = form.city.trim();
    if (form.state.trim()) payload.state = form.state.trim();
    if (form.pincode.trim()) payload.pincode = form.pincode.trim();
    if (form.gstin.trim()) payload.gstin = form.gstin.trim();

    if (editingSupplier) {
      updateMutation.mutate({ id: editingSupplier.id, data: payload });
    } else {
      createMutation.mutate(payload as SupplierForm);
    }
  }

  function handleDelete() {
    if (!deleteTarget) return;
    setDeleteError('');
    deleteMutation.mutate(deleteTarget.id);
  }

  const isSubmitting = createMutation.isPending || updateMutation.isPending;

  if (isLoading) return <PageSpinner />;
  if (error) return <p className="text-red-500 p-4">Failed to load suppliers</p>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Suppliers</h1>
          <p className="text-gray-500">Manage your suppliers</p>
        </div>
        <button
          onClick={openAddDialog}
          className="flex items-center gap-2 px-4 py-2 bg-black text-white rounded-lg text-sm hover:bg-gray-800"
        >
          <Plus size={16} /> Add Supplier
        </button>
      </div>

      <div className="flex items-center gap-4">
        <div className="w-72">
          <SearchInput
            value={search}
            onChange={setSearch}
            placeholder="Search by name, phone or email..."
          />
        </div>
      </div>

      <div className="bg-white rounded-xl border">
        {filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-gray-400">
            <Users size={48} className="mb-3" />
            <p className="text-lg font-medium mb-1">No suppliers found</p>
            <p className="text-sm">
              {search ? 'Try a different search term' : 'Add your first supplier to get started'}
            </p>
          </div>
        ) : (
          <table className="w-full">
            <thead className="border-b bg-gray-50">
              <tr>
                <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Name
                </th>
                <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Contact Person
                </th>
                <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Phone
                </th>
                <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Email
                </th>
                <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">
                  City
                </th>
                <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">
                  GSTIN
                </th>
                <th className="text-center px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="text-center px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Purchases
                </th>
                <th className="text-right px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {filtered.map((supplier) => (
                <tr key={supplier.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 text-sm font-medium text-gray-900">{supplier.name}</td>
                  <td className="px-4 py-3 text-sm text-gray-500">
                    {supplier.contactPerson || '-'}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-500">{supplier.phone || '-'}</td>
                  <td className="px-4 py-3 text-sm text-gray-500">{supplier.email || '-'}</td>
                  <td className="px-4 py-3 text-sm text-gray-500">{supplier.city || '-'}</td>
                  <td className="px-4 py-3 text-sm text-gray-500">{supplier.gstin || '-'}</td>
                  <td className="px-4 py-3 text-center">
                    <Badge variant={supplier.isActive ? 'success' : 'default'}>
                      {supplier.isActive ? 'Active' : 'Inactive'}
                    </Badge>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-700 text-center">
                    {supplier.purchaseCount ?? 0}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex items-center justify-end gap-1">
                      <button
                        onClick={() => openEditDialog(supplier)}
                        className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-500 hover:text-blue-600"
                        title="Edit"
                      >
                        <Edit2 size={14} />
                      </button>
                      <button
                        onClick={() => {
                          setDeleteTarget(supplier);
                          setDeleteError('');
                        }}
                        className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-500 hover:text-red-600"
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
        )}
      </div>

      <Dialog
        open={dialogOpen}
        onClose={closeDialog}
        title={editingSupplier ? 'Edit Supplier' : 'Add Supplier'}
        size="xl"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Name"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              placeholder="Supplier name"
              required
            />
            <Input
              label="Contact Person"
              value={form.contactPerson}
              onChange={(e) => setForm({ ...form, contactPerson: e.target.value })}
              placeholder="Contact person name"
            />
            <Input
              label="Phone"
              value={form.phone}
              onChange={(e) => setForm({ ...form, phone: e.target.value })}
              placeholder="Phone number"
            />
            <Input
              label="Email"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              placeholder="Email address"
              type="email"
            />
            <Input
              label="City"
              value={form.city}
              onChange={(e) => setForm({ ...form, city: e.target.value })}
              placeholder="City"
            />
            <Input
              label="State"
              value={form.state}
              onChange={(e) => setForm({ ...form, state: e.target.value })}
              placeholder="State"
            />
            <Input
              label="Pincode"
              value={form.pincode}
              onChange={(e) => setForm({ ...form, pincode: e.target.value })}
              placeholder="Pincode"
            />
            <Input
              label="GSTIN"
              value={form.gstin}
              onChange={(e) => setForm({ ...form, gstin: e.target.value })}
              placeholder="GSTIN"
            />
          </div>

          <div className="space-y-1">
            <label className="block text-sm font-medium text-gray-700">Address</label>
            <textarea
              value={form.address}
              onChange={(e) => setForm({ ...form, address: e.target.value })}
              placeholder="Full address"
              rows={2}
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
              {isSubmitting ? 'Saving...' : editingSupplier ? 'Update' : 'Create'}
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
        title="Delete Supplier"
        message={
          deleteTarget && (deleteTarget.purchaseCount ?? 0) > 0
            ? `Cannot delete "${deleteTarget.name}" — it has ${deleteTarget.purchaseCount} purchase(s). Remove or reassign them first.`
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
