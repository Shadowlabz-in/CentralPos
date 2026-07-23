import { useState, useEffect, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useParams, useNavigate } from 'react-router-dom';
import { Plus, Edit2, Trash2, Save } from 'lucide-react';
import { apiRequest } from '@/context/AuthContext';
import type { Product, Category, Brand, ProductVariant } from '@/types';
import Input from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Dialog } from '@/components/ui/Dialog';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { Badge } from '@/components/ui/Badge';
import { PageSpinner } from '@/components/ui/Spinner';
import { Button } from '@/components/ui/button';

function generateSKU(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  return Array.from({ length: 8 }, () => chars[Math.floor(Math.random() * chars.length)]).join('');
}

function generateBarcode(): string {
  return Array.from({ length: 12 }, () => Math.floor(Math.random() * 10)).join('');
}

interface VariantFormData {
  size: string;
  color: string;
  sku: string;
  barcode: string;
  purchasePrice: string;
  sellingPrice: string;
  gstPercentage: string;
  stockQuantity: string;
  reorderLevel: string;
}

const emptyVariantForm: VariantFormData = {
  size: '',
  color: '',
  sku: '',
  barcode: '',
  purchasePrice: '',
  sellingPrice: '',
  gstPercentage: '18',
  stockQuantity: '0',
  reorderLevel: '0',
};

function gstEnumToNumber(val: string): string {
  const map: Record<string, string> = {
    GST_0: '0',
    GST_5: '5',
    GST_12: '12',
    GST_18: '18',
    GST_28: '28',
  };
  return map[val] ?? val;
}

function variantToFormData(v: ProductVariant): VariantFormData {
  return {
    size: v.size || '',
    color: v.color || '',
    sku: v.sku,
    barcode: v.barcode,
    purchasePrice: String(v.purchasePrice),
    sellingPrice: String(v.sellingPrice),
    gstPercentage: gstEnumToNumber(v.gstPercentage),
    stockQuantity: String(v.stockQuantity),
    reorderLevel: String(v.reorderLevel),
  };
}

export default function ProductEditPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [name, setName] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [brandId, setBrandId] = useState('');
  const [description, setDescription] = useState('');
  const [tagsInput, setTagsInput] = useState('');
  const [saveError, setSaveError] = useState('');

  const [variants, setVariants] = useState<ProductVariant[]>([]);
  const [variantDialogOpen, setVariantDialogOpen] = useState(false);
  const [editingVariant, setEditingVariant] = useState<ProductVariant | null>(null);
  const [variantForm, setVariantForm] = useState<VariantFormData>(emptyVariantForm);
  const [variantFormError, setVariantFormError] = useState('');
  const [deleteTarget, setDeleteTarget] = useState<ProductVariant | null>(null);

  const [categoryDialogOpen, setCategoryDialogOpen] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [brandDialogOpen, setBrandDialogOpen] = useState(false);
  const [newBrandName, setNewBrandName] = useState('');

  const {
    data: productData,
    isLoading,
    error: loadError,
  } = useQuery({
    queryKey: ['product', id],
    queryFn: () => apiRequest<{ data: Product }>(`/products/${id}`),
    enabled: !!id,
  });

  const { data: categoriesData } = useQuery({
    queryKey: ['categories'],
    queryFn: () => apiRequest<{ data: Category[] }>('/categories'),
    staleTime: 300000,
  });

  const { data: brandsData } = useQuery({
    queryKey: ['brands'],
    queryFn: () => apiRequest<{ data: Brand[] }>('/brands'),
    staleTime: 300000,
  });

  const categories = categoriesData?.data || [];
  const brands = brandsData?.data || [];

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

  useEffect(() => {
    if (productData?.data) {
      const p = productData.data;
      setName(p.name);
      setCategoryId(p.categoryId);
      setBrandId(p.brandId || '');
      setDescription(p.description || '');
      setTagsInput(p.tags.join(', '));
      setVariants(p.variants || []);
    }
  }, [productData]);

  const updateProductMutation = useMutation({
    mutationFn: (data: {
      name: string;
      categoryId: string;
      brandId?: string;
      description?: string;
      tags?: string[];
    }) => apiRequest(`/products/${id}`, { method: 'PATCH', body: JSON.stringify(data) }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['product', id] });
      queryClient.invalidateQueries({ queryKey: ['products'] });
      setSaveError('');
    },
    onError: (e: Error) => setSaveError(e.message),
  });

  const createVariantMutation = useMutation({
    mutationFn: (data: Record<string, unknown>) =>
      apiRequest<{ data: ProductVariant }>(`/products/${id}/variants`, {
        method: 'POST',
        body: JSON.stringify(data),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['product', id] });
      setVariantDialogOpen(false);
    },
    onError: (e: Error) => setVariantFormError(e.message),
  });

  const updateVariantMutation = useMutation({
    mutationFn: ({ variantId, data }: { variantId: string; data: Record<string, unknown> }) =>
      apiRequest(`/variants/${variantId}`, { method: 'PATCH', body: JSON.stringify(data) }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['product', id] });
      setVariantDialogOpen(false);
    },
    onError: (e: Error) => setVariantFormError(e.message),
  });

  const deleteVariantMutation = useMutation({
    mutationFn: (variantId: string) => apiRequest(`/variants/${variantId}`, { method: 'DELETE' }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['product', id] });
      setDeleteTarget(null);
    },
    onError: (e: Error) => setVariantFormError(e.message),
  });

  const createCategoryMutation = useMutation({
    mutationFn: (data: { name: string }) =>
      apiRequest<{ data: Category }>('/categories', { method: 'POST', body: JSON.stringify(data) }),
    onSuccess: (res) => {
      setCategoryId(res.data.id);
      setCategoryDialogOpen(false);
      setNewCategoryName('');
      queryClient.invalidateQueries({ queryKey: ['categories'] });
    },
    onError: (e: Error) => setSaveError(e.message),
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
    onError: (e: Error) => setSaveError(e.message),
  });

  function handleCategoryChange(value: string) {
    if (value === '__add_new__') {
      setCategoryDialogOpen(true);
    } else {
      setCategoryId(value);
    }
  }

  function handleBrandChange(value: string) {
    if (value === '__add_new__') {
      setBrandDialogOpen(true);
    } else {
      setBrandId(value);
    }
  }

  function handleSaveProduct() {
    setSaveError('');
    if (!name.trim()) {
      setSaveError('Product name is required');
      return;
    }
    if (!categoryId) {
      setSaveError('Category is required');
      return;
    }
    const tags = tagsInput
      .split(',')
      .map((t) => t.trim())
      .filter(Boolean);
    updateProductMutation.mutate({
      name: name.trim(),
      categoryId,
      brandId: brandId || undefined,
      description: description.trim() || undefined,
      tags: tags.length > 0 ? tags : undefined,
    });
  }

  function openAddVariantDialog() {
    setEditingVariant(null);
    setVariantForm({ ...emptyVariantForm, sku: generateSKU(), barcode: generateBarcode() });
    setVariantFormError('');
    setVariantDialogOpen(true);
  }

  function openEditVariantDialog(variant: ProductVariant) {
    setEditingVariant(variant);
    setVariantForm(variantToFormData(variant));
    setVariantFormError('');
    setVariantDialogOpen(true);
  }

  function handleSaveVariant() {
    setVariantFormError('');
    const pp = parseFloat(variantForm.purchasePrice);
    const sp = parseFloat(variantForm.sellingPrice);
    if (!variantForm.sku.trim()) {
      setVariantFormError('SKU is required');
      return;
    }
    if (isNaN(pp) || pp < 0) {
      setVariantFormError('Valid purchase price is required');
      return;
    }
    if (isNaN(sp) || sp < 0) {
      setVariantFormError('Valid selling price is required');
      return;
    }

    const payload: Record<string, unknown> = {
      size: variantForm.size || undefined,
      color: variantForm.color || undefined,
      sku: variantForm.sku,
      barcode: variantForm.barcode,
      purchasePrice: pp,
      sellingPrice: sp,
      gstPercentage: variantForm.gstPercentage,
      reorderLevel: parseInt(variantForm.reorderLevel, 10) || 0,
    };

    if (editingVariant) {
      payload.stockQuantity = parseInt(variantForm.stockQuantity, 10) || 0;
      updateVariantMutation.mutate({ variantId: editingVariant.id, data: payload });
    } else {
      payload.initialStock = parseInt(variantForm.stockQuantity, 10) || 0;
      createVariantMutation.mutate(payload);
    }
  }

  function handleDeleteVariant() {
    if (!deleteTarget) return;
    deleteVariantMutation.mutate(deleteTarget.id);
  }

  if (isLoading) return <PageSpinner />;
  if (loadError) return <p className="text-red-500 p-4">Failed to load product</p>;
  if (!productData?.data) return <p className="text-gray-500 p-4">Product not found</p>;

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Edit Product</h1>
          <p className="text-gray-500">{productData.data.name}</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => navigate('/inventory/products')}>
            Cancel
          </Button>
          <Button onClick={handleSaveProduct} disabled={updateProductMutation.isPending}>
            <Save size={16} className="mr-1" />{' '}
            {updateProductMutation.isPending ? 'Saving...' : 'Save'}
          </Button>
        </div>
      </div>

      <div className="bg-white rounded-xl border p-6 space-y-4">
        <h2 className="text-lg font-semibold">Product Information</h2>
        <Input
          label="Product Name *"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />
        <Select
          label="Category *"
          value={categoryId}
          onChange={(e) => handleCategoryChange(e.target.value)}
          options={categoryOptions}
          placeholder="Select category"
        />
        <Select
          label="Brand"
          value={brandId}
          onChange={(e) => handleBrandChange(e.target.value)}
          options={brandOptions}
          placeholder="Select brand"
        />
        <div className="space-y-1">
          <label className="block text-sm font-medium text-gray-700">Description</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={3}
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary resize-none"
          />
        </div>
        <Input
          label="Tags (comma-separated)"
          value={tagsInput}
          onChange={(e) => setTagsInput(e.target.value)}
          placeholder="e.g. cotton, summer, casual"
        />
        {saveError && <p className="text-sm text-red-500">{saveError}</p>}
      </div>

      <div className="bg-white rounded-xl border p-6 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">Variants ({variants.length})</h2>
          <Button variant="outline" size="sm" onClick={openAddVariantDialog}>
            <Plus size={16} className="mr-1" /> Add Variant
          </Button>
        </div>

        {variants.length === 0 ? (
          <div className="text-center py-8 text-gray-400 text-sm">
            No variants. Click "Add Variant" to add one.
          </div>
        ) : (
          <div className="overflow-x-auto rounded-lg border">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 border-b">
                  <th className="px-4 py-3 text-left font-medium text-gray-600">SKU</th>
                  <th className="px-4 py-3 text-left font-medium text-gray-600">Size</th>
                  <th className="px-4 py-3 text-left font-medium text-gray-600">Color</th>
                  <th className="px-4 py-3 text-right font-medium text-gray-600">Purchase</th>
                  <th className="px-4 py-3 text-right font-medium text-gray-600">Selling</th>
                  <th className="px-4 py-3 text-center font-medium text-gray-600">GST</th>
                  <th className="px-4 py-3 text-right font-medium text-gray-600">Stock</th>
                  <th className="px-4 py-3 text-center font-medium text-gray-600">Status</th>
                  <th className="px-4 py-3 text-center font-medium text-gray-600">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {variants.map((v) => (
                  <tr key={v.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 font-mono text-xs">{v.sku}</td>
                    <td className="px-4 py-3">{v.size || '-'}</td>
                    <td className="px-4 py-3">{v.color || '-'}</td>
                    <td className="px-4 py-3 text-right">₹{Number(v.purchasePrice).toFixed(2)}</td>
                    <td className="px-4 py-3 text-right">₹{Number(v.sellingPrice).toFixed(2)}</td>
                    <td className="px-4 py-3 text-center">{gstEnumToNumber(v.gstPercentage)}%</td>
                    <td className="px-4 py-3 text-right">
                      <Badge variant={v.stockQuantity <= v.reorderLevel ? 'warning' : 'default'}>
                        {v.stockQuantity}
                      </Badge>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <Badge variant={v.isActive ? 'success' : 'danger'}>
                        {v.isActive ? 'Active' : 'Inactive'}
                      </Badge>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <div className="flex items-center justify-center gap-1">
                        <button
                          onClick={() => openEditVariantDialog(v)}
                          className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-500 hover:text-blue-600"
                        >
                          <Edit2 size={14} />
                        </button>
                        <button
                          onClick={() => setDeleteTarget(v)}
                          className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-500 hover:text-red-600"
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
        {variantFormError && <p className="text-sm text-red-500">{variantFormError}</p>}
      </div>

      <Dialog
        open={variantDialogOpen}
        onClose={() => setVariantDialogOpen(false)}
        title={editingVariant ? 'Edit Variant' : 'Add Variant'}
      >
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Size"
              value={variantForm.size}
              onChange={(e) => setVariantForm({ ...variantForm, size: e.target.value })}
              placeholder="e.g. M, 42, XL"
            />
            <Input
              label="Color"
              value={variantForm.color}
              onChange={(e) => setVariantForm({ ...variantForm, color: e.target.value })}
              placeholder="e.g. Red, Blue"
            />
          </div>
          <Input
            label="SKU *"
            value={variantForm.sku}
            onChange={(e) => setVariantForm({ ...variantForm, sku: e.target.value })}
          />
          <Input
            label="Barcode"
            value={variantForm.barcode}
            onChange={(e) => setVariantForm({ ...variantForm, barcode: e.target.value })}
          />
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Purchase Price *"
              type="number"
              min="0"
              step="0.01"
              value={variantForm.purchasePrice}
              onChange={(e) => setVariantForm({ ...variantForm, purchasePrice: e.target.value })}
            />
            <Input
              label="Selling Price *"
              type="number"
              min="0"
              step="0.01"
              value={variantForm.sellingPrice}
              onChange={(e) => setVariantForm({ ...variantForm, sellingPrice: e.target.value })}
            />
          </div>
          <Select
            label="GST (%)"
            value={variantForm.gstPercentage}
            onChange={(e) => setVariantForm({ ...variantForm, gstPercentage: e.target.value })}
            options={[
              { value: '0', label: '0%' },
              { value: '5', label: '5%' },
              { value: '12', label: '12%' },
              { value: '18', label: '18%' },
              { value: '28', label: '28%' },
            ]}
          />
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Stock Quantity"
              type="number"
              min="0"
              value={variantForm.stockQuantity}
              onChange={(e) => setVariantForm({ ...variantForm, stockQuantity: e.target.value })}
            />
            <Input
              label="Reorder Level"
              type="number"
              min="0"
              value={variantForm.reorderLevel}
              onChange={(e) => setVariantForm({ ...variantForm, reorderLevel: e.target.value })}
            />
          </div>
          {variantFormError && <p className="text-sm text-red-500">{variantFormError}</p>}
          <div className="flex justify-end gap-3 pt-2">
            <Button variant="outline" onClick={() => setVariantDialogOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleSaveVariant}
              disabled={createVariantMutation.isPending || updateVariantMutation.isPending}
            >
              {createVariantMutation.isPending || updateVariantMutation.isPending
                ? 'Saving...'
                : editingVariant
                  ? 'Update Variant'
                  : 'Add Variant'}
            </Button>
          </div>
        </div>
      </Dialog>

      <ConfirmDialog
        open={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDeleteVariant}
        title="Delete Variant"
        message={`Are you sure you want to delete variant "${deleteTarget?.sku}"? This action cannot be undone.`}
        confirmLabel="Delete"
        variant="danger"
        loading={deleteVariantMutation.isPending}
      />

      <Dialog
        open={categoryDialogOpen}
        onClose={() => setCategoryDialogOpen(false)}
        title="Add New Category"
        size="sm"
      >
        <div className="space-y-4">
          <Input
            label="Category Name"
            value={newCategoryName}
            onChange={(e) => setNewCategoryName(e.target.value)}
            placeholder="Enter category name"
          />
          <div className="flex justify-end gap-3">
            <Button variant="outline" onClick={() => setCategoryDialogOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={() => {
                if (!newCategoryName.trim()) {
                  setSaveError('Category name is required');
                  return;
                }
                createCategoryMutation.mutate({ name: newCategoryName.trim() });
              }}
              disabled={createCategoryMutation.isPending}
            >
              {createCategoryMutation.isPending ? 'Creating...' : 'Create'}
            </Button>
          </div>
        </div>
      </Dialog>

      <Dialog
        open={brandDialogOpen}
        onClose={() => setBrandDialogOpen(false)}
        title="Add New Brand"
        size="sm"
      >
        <div className="space-y-4">
          <Input
            label="Brand Name"
            value={newBrandName}
            onChange={(e) => setNewBrandName(e.target.value)}
            placeholder="Enter brand name"
          />
          <div className="flex justify-end gap-3">
            <Button variant="outline" onClick={() => setBrandDialogOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={() => {
                if (!newBrandName.trim()) {
                  setSaveError('Brand name is required');
                  return;
                }
                createBrandMutation.mutate({ name: newBrandName.trim() });
              }}
              disabled={createBrandMutation.isPending}
            >
              {createBrandMutation.isPending ? 'Creating...' : 'Create'}
            </Button>
          </div>
        </div>
      </Dialog>
    </div>
  );
}
