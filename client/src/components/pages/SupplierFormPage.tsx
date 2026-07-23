import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ArrowLeft, Save } from 'lucide-react';
import { apiRequest } from '@/context/AuthContext';
import type { Supplier, ApiResponse } from '@/types';
import Input from '@/components/ui/Input';
import { Button } from '@/components/ui/button';
import { Spinner } from '@/components/ui/Spinner';

interface FormData {
  name: string;
  contactPerson: string;
  phone: string;
  email: string;
  address: string;
  city: string;
  state: string;
  pincode: string;
  gstin: string;
  isActive: boolean;
}

const emptyForm: FormData = {
  name: '',
  contactPerson: '',
  phone: '',
  email: '',
  address: '',
  city: '',
  state: '',
  pincode: '',
  gstin: '',
  isActive: true,
};

export default function SupplierFormPage() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const queryClient = useQueryClient();
  const isEdit = !!id;
  const [form, setForm] = useState<FormData>(emptyForm);
  const [formError, setFormError] = useState('');

  const {
    data: supplier,
    isLoading: loadingSupplier,
    error: fetchError,
  } = useQuery({
    queryKey: ['supplier', id],
    queryFn: async () => {
      const res = await apiRequest<ApiResponse<Supplier>>(`/suppliers/${id}`);
      return res.data;
    },
    enabled: isEdit,
  });

  useEffect(() => {
    if (supplier) {
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
        isActive: supplier.isActive,
      });
    }
  }, [supplier]);

  const createMutation = useMutation({
    mutationFn: (data: Partial<FormData>) =>
      apiRequest('/suppliers', {
        method: 'POST',
        body: JSON.stringify(data),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['suppliers'] });
      navigate('/suppliers');
    },
    onError: (e: Error) => setFormError(e.message),
  });

  const updateMutation = useMutation({
    mutationFn: (data: Partial<FormData>) =>
      apiRequest(`/suppliers/${id}`, {
        method: 'PATCH',
        body: JSON.stringify(data),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['suppliers'] });
      navigate('/suppliers');
    },
    onError: (e: Error) => setFormError(e.message),
  });

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setFormError('');
    if (!form.name.trim()) {
      setFormError('Name is required');
      return;
    }
    const payload: Partial<FormData> = {};
    if (form.name.trim()) payload.name = form.name.trim();
    if (form.contactPerson.trim()) payload.contactPerson = form.contactPerson.trim();
    if (form.phone.trim()) payload.phone = form.phone.trim();
    if (form.email.trim()) payload.email = form.email.trim();
    if (form.address.trim()) payload.address = form.address.trim();
    if (form.city.trim()) payload.city = form.city.trim();
    if (form.state.trim()) payload.state = form.state.trim();
    if (form.pincode.trim()) payload.pincode = form.pincode.trim();
    if (form.gstin.trim()) payload.gstin = form.gstin.trim();
    if (isEdit) payload.isActive = form.isActive;

    if (isEdit) {
      updateMutation.mutate(payload);
    } else {
      createMutation.mutate(payload);
    }
  }

  const isSubmitting = createMutation.isPending || updateMutation.isPending;

  if (isEdit && loadingSupplier) return <Spinner />;
  if (isEdit && fetchError)
    return <p className="text-red-500 p-4">Failed to load supplier details</p>;

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-center gap-4">
        <button onClick={() => navigate('/suppliers')} className="p-2 rounded-lg hover:bg-gray-100">
          <ArrowLeft size={20} />
        </button>
        <div>
          <h1 className="text-2xl font-bold">{isEdit ? 'Edit Supplier' : 'Add Supplier'}</h1>
          <p className="text-gray-500">
            {isEdit ? 'Update supplier details' : 'Create a new supplier'}
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="bg-white rounded-xl border p-6 space-y-4">
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
            rows={3}
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary resize-none"
          />
        </div>

        {isEdit && (
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={form.isActive}
              onChange={(e) => setForm({ ...form, isActive: e.target.checked })}
              className="rounded border-gray-300 text-primary focus:ring-primary"
            />
            <span className="text-sm font-medium text-gray-700">Is Active</span>
          </label>
        )}

        {formError && <p className="text-sm text-red-500">{formError}</p>}

        <div className="flex justify-end gap-3 pt-2">
          <Button variant="outline" type="button" onClick={() => navigate('/suppliers')}>
            Cancel
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            <Save size={16} className="mr-1.5" />
            {isSubmitting ? 'Saving...' : isEdit ? 'Update Supplier' : 'Create Supplier'}
          </Button>
        </div>
      </form>
    </div>
  );
}
