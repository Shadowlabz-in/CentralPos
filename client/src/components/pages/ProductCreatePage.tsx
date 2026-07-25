import { useState, useMemo, useRef } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { Plus, Trash2, Edit2, Upload, X, RefreshCw, Barcode as BarcodeIcon } from 'lucide-react';
import Barcode from 'react-barcode';
import { apiRequest } from '@/context/AuthContext';
import type { Category, Brand, Supplier } from '@/types';
import Input from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Dialog } from '@/components/ui/Dialog';
import { PageSpinner } from '@/components/ui/Spinner';
import { Button } from '@/components/ui/button';

interface VariantEntry {
  id: string;
  size: string;
  color: string;
  fabric: string;
  sku: string;
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
function newVariantId() {
  variantIdCounter++;
  return `v_${variantIdCounter}`;
}

function generateSKU(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  return Array.from({ length: 10 }, () => chars[Math.floor(Math.random() * chars.length)]).join('');
}

function generateBarcode(): string {
  const ts = Date.now().toString().slice(-8);
  const rand = Math.random().toString().slice(2, 6);
  return `K${ts}${rand}`.slice(0, 14);
}

const emptyVariant = (): VariantEntry => ({
  id: newVariantId(),
  size: '',
  color: '',
  fabric: '',
  sku: generateSKU(),
  supplierId: '',
  purchasePrice: '',
  sellingPrice: '',
  mrp: '',
  gstPercentage: '18',
  initialStock: '0',
  reorderLevel: '0',
  rackLocation: '',
});

const GST_OPTIONS = [
  { value: '0', label: '0%' },
  { value: '5', label: '5%' },
  { value: '12', label: '12%' },
  { value: '18', label: '18%' },
  { value: '28', label: '28%' },
];

export default function ProductCreatePage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [name, setName] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [brandId, setBrandId] = useState('');
  const [supplierId, setSupplierId] = useState('');
  const [purchasePrice, setPurchasePrice] = useState('');
  const [sellingPrice, setSellingPrice] = useState('');
  const [mrp, setMrp] = useState('');
  const [gstPercentage, setGstPercentage] = useState('18');
  const [description, setDescription] = useState('');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  const [variants, setVariants] = useState<VariantEntry[]>([emptyVariant()]);
  const [variantDialogOpen, setVariantDialogOpen] = useState(false);
  const [editingVariant, setEditingVariant] = useState<VariantEntry | null>(null);
  const [variantForm, setVariantForm] = useState<VariantEntry>(emptyVariant());
  const [variantFormError, setVariantFormError] = useState('');

  const [categoryDialogOpen, setCategoryDialogOpen] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [brandDialogOpen, setBrandDialogOpen] = useState(false);
  const [newBrandName, setNewBrandName] = useState('');

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});

  const { data: catsData, isLoading: catsLoading } = useQuery({
    queryKey: ['categories'],
    queryFn: () => apiRequest<{ data: Category[] }>('/categories'),
    staleTime: 300000,
  });
  const { data: brandsData, isLoading: brandsLoading } = useQuery({
    queryKey: ['brands'],
    queryFn: () => apiRequest<{ data: Brand[] }>('/brands'),
    staleTime: 300000,
  });
  const { data: suppliersData } = useQuery({
    queryKey: ['suppliers'],
    queryFn: () => apiRequest<{ data: Supplier[] }>('/suppliers'),
    staleTime: 300000,
  });

  const categories = catsData?.data || [];
  const brands = brandsData?.data || [];
  const suppliers = suppliersData?.data || [];

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
    () => [{ value: '', label: 'None' }, ...suppliers.map((s) => ({ value: s.id, label: s.name }))],
    [suppliers],
  );

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

  function handleImageSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setImageFile(file);
    const reader = new FileReader();
    reader.onload = (ev) => setImagePreview(ev.target?.result as string);
    reader.readAsDataURL(file);
  }

  function removeImage() {
    setImageFile(null);
    setImagePreview(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  }

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

  function validate(): boolean {
    const errs: Record<string, string> = {};
    if (!name.trim()) errs.name = 'Product name is required';
    if (!categoryId) errs.category = 'Category is required';
    if (mrp && sellingPrice && parseFloat(mrp) < parseFloat(sellingPrice)) {
      errs.mrp = 'MRP must be >= Selling Price';
    }
    for (const v of variants) {
      const sp = parseFloat(v.sellingPrice);
      const pp = parseFloat(v.purchasePrice);
      if (v.sellingPrice && !isNaN(sp) && !isNaN(pp) && sp < pp) {
        errs[`variant_${v.id}_price`] = `Selling price < Purchase price for ${v.sku}`;
      }
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  }

  async function handleSubmit() {
    if (!validate()) return;
    setIsSubmitting(true);
    setSubmitError('');

    try {
      const payload: any = {
        name: name.trim(),
        categoryId,
        brandId: brandId || null,
        supplierId: supplierId || null,
        purchasePrice: purchasePrice ? parseFloat(purchasePrice) : undefined,
        sellingPrice: sellingPrice ? parseFloat(sellingPrice) : undefined,
        mrp: mrp ? parseFloat(mrp) : undefined,
        gstPercentage: parseInt(gstPercentage, 10),
        description: description.trim() || undefined,
        isActive: true,
          variants: variants.map((v) => ({
            size: v.size || undefined,
            color: v.color || undefined,
            fabric: v.fabric || undefined,
            sku: v.sku || undefined,
            supplierId: v.supplierId || undefined,
            purchasePrice: v.purchasePrice ? parseFloat(v.purchasePrice) : undefined,
          sellingPrice: v.sellingPrice ? parseFloat(v.sellingPrice) : undefined,
          mrp: v.mrp ? parseFloat(v.mrp) : undefined,
          gstPercentage: v.gstPercentage ? parseInt(v.gstPercentage, 10) : undefined,
          initialStock: parseInt(v.initialStock, 10) || 0,
          reorderLevel: parseInt(v.reorderLevel, 10) || 0,
          rackLocation: v.rackLocation || undefined,
        })),
      };

      const res = await apiRequest<{ data: { id: string } }>('/products/with-variants', {
        method: 'POST',
        body: JSON.stringify(payload),
      });

      const productId = res.data.id;

      if (imageFile) {
        const formData = new FormData();
        formData.append('image', imageFile);
        await apiRequest(`/products/${productId}/images`, {
          method: 'POST',
          body: formData as any,
          headers: {},
        });
      }

      queryClient.invalidateQueries({ queryKey: ['products'] });
      queryClient.invalidateQueries({ queryKey: ['inventory'] });
      navigate('/inventory/products');
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
    if (!variantForm.sku.trim()) {
      setVariantFormError('SKU is required');
      return;
    }
    if (variantForm.sellingPrice && variantForm.purchasePrice) {
      const sp = parseFloat(variantForm.sellingPrice);
      const pp = parseFloat(variantForm.purchasePrice);
      if (!isNaN(sp) && !isNaN(pp) && sp < pp) {
        setVariantFormError('Selling price cannot be less than purchase price');
        return;
      }
    }
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

  function fillDefaultPrices() {
    setVariantForm((prev) => ({
      ...prev,
      purchasePrice: prev.purchasePrice || purchasePrice,
      sellingPrice: prev.sellingPrice || sellingPrice,
      mrp: prev.mrp || mrp,
      gstPercentage: prev.gstPercentage || gstPercentage,
    }));
  }

  function regenerateSku() {
    setVariantForm((prev) => ({ ...prev, sku: generateSKU() }));
  }

  const variantTableHeaders = [
    'SKU',
    'Size',
    'Color',
    'Fabric',
    'Purchase',
    'Selling',
    'MRP',
    'GST',
    'Stock',
    'Rack',
    '',
  ];

  if (catsLoading || brandsLoading) return <PageSpinner />;

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-12">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Create Product</h1>
          <p className="text-gray-500">Add a new product to your catalog</p>
        </div>
        <Button onClick={handleSubmit} disabled={isSubmitting} size="lg">
          {isSubmitting ? 'Creating...' : 'Create Product'}
        </Button>
      </div>

      {submitError && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
          {submitError}
        </div>
      )}

      {/* Product Details */}
      <div className="bg-white rounded-xl border p-6 space-y-5">
        <h2 className="text-lg font-semibold">Product Details</h2>

        <Input
          label="Product Name *"
          value={name}
          onChange={(e) => {
            setName(e.target.value);
            setErrors((prev) => {
              const { name: _, ...rest } = prev;
              return rest;
            });
          }}
          placeholder="Enter product name"
          error={errors.name}
        />

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">Product Image</label>
          {imagePreview ? (
            <div className="relative inline-block">
              <img
                src={imagePreview}
                alt="Preview"
                className="h-32 w-32 object-cover rounded-lg border"
              />
              <button
                type="button"
                onClick={removeImage}
                className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-0.5"
              >
                <X size={14} />
              </button>
            </div>
          ) : (
            <div
              onClick={() => fileInputRef.current?.click()}
              className="h-32 w-32 border-2 border-dashed border-gray-300 rounded-lg flex flex-col items-center justify-center cursor-pointer hover:border-gray-400 transition-colors"
            >
              <Upload size={24} className="text-gray-400 mb-1" />
              <span className="text-xs text-gray-400">Upload Image</span>
            </div>
          )}
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleImageSelect}
            className="hidden"
          />
        </div>
      </div>

      {/* Categorization */}
      <div className="bg-white rounded-xl border p-6 space-y-4">
        <h2 className="text-lg font-semibold">Categorization</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Select
            label="Category *"
            value={categoryId}
            onChange={(e) => {
              handleCategoryChange(e.target.value);
              setErrors((prev) => {
                const { category: _, ...rest } = prev;
                return rest;
              });
            }}
            options={categoryOptions}
            placeholder="Select category"
            error={errors.category}
          />
          <Select
            label="Brand"
            value={brandId}
            onChange={(e) => handleBrandChange(e.target.value)}
            options={brandOptions}
            placeholder="Select brand"
          />
          <Select
            label="Supplier"
            value={supplierId}
            onChange={(e) => setSupplierId(e.target.value)}
            options={supplierOptions}
          />
        </div>
      </div>

      {/* Pricing Defaults */}
      <div className="bg-white rounded-xl border p-6 space-y-4">
        <h2 className="text-lg font-semibold">Default Pricing</h2>
        <p className="text-xs text-gray-400 -mt-3">
          Prices are inherited by each variant. Override per variant if needed.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Input
            label="Purchase Price"
            type="number"
            min="0"
            step="0.01"
            value={purchasePrice}
            onChange={(e) => setPurchasePrice(e.target.value)}
            placeholder="0.00"
          />
          <Input
            label="Selling Price"
            type="number"
            min="0"
            step="0.01"
            value={sellingPrice}
            onChange={(e) => setSellingPrice(e.target.value)}
            placeholder="0.00"
          />
          <Input
            label="MRP"
            type="number"
            min="0"
            step="0.01"
            value={mrp}
            onChange={(e) => {
              setMrp(e.target.value);
              setErrors((prev) => {
                const { mrp: _, ...rest } = prev;
                return rest;
              });
            }}
            placeholder="0.00"
            error={errors.mrp}
          />
          <Select
            label="GST Rate"
            value={gstPercentage}
            onChange={(e) => setGstPercentage(e.target.value)}
            options={GST_OPTIONS}
          />
        </div>
      </div>

      {/* Variants */}
      <div className="bg-white rounded-xl border p-6 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold">Variants</h2>
            <p className="text-xs text-gray-400">
              Each combination of Size, Color & Fabric creates a unique SKU
            </p>
          </div>
          <Button variant="outline" size="sm" onClick={openAddVariant}>
            <Plus size={16} className="mr-1" /> Add Variant
          </Button>
        </div>

        {variants.length === 0 ? (
          <div className="text-center py-8 text-gray-400 text-sm border rounded-lg">
            No variants. Click "Add Variant" to get started, or keep at least one default variant.
          </div>
        ) : (
          <div className="overflow-x-auto rounded-lg border">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 border-b">
                  {variantTableHeaders.map((h) => (
                    <th
                      key={h}
                      className="px-3 py-2.5 text-left font-medium text-gray-600 text-xs whitespace-nowrap"
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y">
                {variants.map((v) => (
                  <tr key={v.id} className="hover:bg-gray-50">
                    <td className="px-3 py-2.5 font-mono text-xs">{v.sku}</td>
                    <td className="px-3 py-2.5">{v.size || '-'}</td>
                    <td className="px-3 py-2.5">{v.color || '-'}</td>
                    <td className="px-3 py-2.5">{v.fabric || '-'}</td>
                    <td className="px-3 py-2.5 text-right">
                      {v.purchasePrice ? `₹${parseFloat(v.purchasePrice).toFixed(0)}` : '-'}
                    </td>
                    <td className="px-3 py-2.5 text-right">
                      {v.sellingPrice ? `₹${parseFloat(v.sellingPrice).toFixed(0)}` : '-'}
                    </td>
                    <td className="px-3 py-2.5 text-right">
                      {v.mrp ? `₹${parseFloat(v.mrp).toFixed(0)}` : '-'}
                    </td>
                    <td className="px-3 py-2.5 text-center">{v.gstPercentage}%</td>
                    <td className="px-3 py-2.5 text-right">{v.initialStock}</td>
                    <td className="px-3 py-2.5 text-xs">{v.rackLocation || '-'}</td>
                    <td className="px-3 py-2.5">
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => openEditVariant(v)}
                          className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-500 hover:text-blue-600"
                        >
                          <Edit2 size={13} />
                        </button>
                        <button
                          onClick={() => removeVariant(v.id)}
                          className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-500 hover:text-red-600"
                        >
                          <Trash2 size={13} />
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

      {/* Stock & Description */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl border p-6 space-y-4">
          <h2 className="text-lg font-semibold">Initial Stock</h2>
          <p className="text-xs text-gray-400 -mt-3">
            Set per-variant stock in the variant editor above.
          </p>
          <div className="space-y-1 text-sm text-gray-500">
            {variants.length === 0 ? (
              <p>No variants defined yet.</p>
            ) : (
              <ul className="list-disc list-inside space-y-1">
                {variants.map((v) => (
                  <li key={v.id}>
                    <span className="font-mono text-xs">{v.sku}</span> —{' '}
                    <span className="font-medium">{v.initialStock} pcs</span>
                    {v.rackLocation ? ` @ ${v.rackLocation}` : ''}
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>

        <div className="bg-white rounded-xl border p-6 space-y-4">
          <h2 className="text-lg font-semibold">Description</h2>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Optional product description..."
            rows={5}
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary resize-none"
          />
        </div>
      </div>

      {/* Bottom Submit */}
      <div className="flex justify-end gap-3 pt-4 border-t">
        <Button variant="outline" onClick={() => navigate('/inventory/products')}>
          Cancel
        </Button>
        <Button onClick={handleSubmit} disabled={isSubmitting}>
          {isSubmitting ? 'Creating...' : 'Create Product'}
        </Button>
      </div>

      {/* Variant Dialog */}
      <Dialog
        open={variantDialogOpen}
        onClose={() => setVariantDialogOpen(false)}
        title={editingVariant ? 'Edit Variant' : 'Add Variant'}
        size="xl"
      >
        <div className="space-y-4 max-h-[70vh] overflow-y-auto pr-1">
          <div className="grid grid-cols-3 gap-4">
            <Input
              label="Size"
              value={variantForm.size}
              onChange={(e) => setVariantFormField('size', e.target.value)}
              placeholder="e.g. M, 42, XL"
            />
            <Input
              label="Color"
              value={variantForm.color}
              onChange={(e) => setVariantFormField('color', e.target.value)}
              placeholder="e.g. Red, Blue"
            />
            <Input
              label="Fabric"
              value={variantForm.fabric}
              onChange={(e) => setVariantFormField('fabric', e.target.value)}
              placeholder="e.g. Cotton, Polyester"
            />
          </div>

          <div className="flex items-end gap-2">
            <div className="flex-1">
              <Input
                label="SKU"
                value={variantForm.sku}
                onChange={(e) => setVariantFormField('sku', e.target.value)}
                placeholder="Auto-generated"
              />
            </div>
            <button
              type="button"
              onClick={regenerateSku}
              className="mb-1 p-2.5 rounded-lg hover:bg-gray-100 text-gray-500"
              title="Regenerate SKU"
            >
              <RefreshCw size={16} />
            </button>
          </div>

          <div className="flex items-center gap-4 p-3 bg-gray-50 rounded-lg">
            <BarcodeIcon size={32} className="text-gray-400 shrink-0" />
            <div className="flex-1 min-w-0">
              <p className="text-xs text-gray-500 mb-1">Code128 Barcode</p>
              <div className="bg-white rounded border p-2 inline-block">
                {variantForm.sku ? (
                  <Barcode
                    value={variantForm.sku.slice(0, 12)}
                    format="CODE128"
                    width={1.5}
                    height={40}
                    displayValue={false}
                  />
                ) : (
                  <p className="text-sm text-gray-400 font-mono">-</p>
                )}
              </div>
            </div>
          </div>

          <div className="border-t pt-3">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-700">Pricing</span>
              {!editingVariant && (
                <button
                  type="button"
                  onClick={fillDefaultPrices}
                  className="text-xs text-blue-600 hover:underline"
                >
                  Use defaults
                </button>
              )}
            </div>
            <div className="grid grid-cols-4 gap-3">
              <Input
                label="Purchase Price"
                type="number"
                min="0"
                step="0.01"
                value={variantForm.purchasePrice}
                onChange={(e) => setVariantFormField('purchasePrice', e.target.value)}
                placeholder="0.00"
              />
              <Input
                label="Selling Price"
                type="number"
                min="0"
                step="0.01"
                value={variantForm.sellingPrice}
                onChange={(e) => setVariantFormField('sellingPrice', e.target.value)}
                placeholder="0.00"
              />
              <Input
                label="MRP"
                type="number"
                min="0"
                step="0.01"
                value={variantForm.mrp}
                onChange={(e) => setVariantFormField('mrp', e.target.value)}
                placeholder="0.00"
              />
              <Select
                label="GST (%)"
                value={variantForm.gstPercentage}
                onChange={(e) => setVariantFormField('gstPercentage', e.target.value)}
                options={GST_OPTIONS}
              />
            </div>
          </div>
          <div className="flex items-center gap-2 text-sm text-gray-500 mb-2">
            <span className="w-1 h-1 rounded-full bg-indigo-400" />
            Supplier
          </div>
          <Select
            label="Supplier (overrides product)"
            value={variantForm.supplierId}
            onChange={(e) => setVariantFormField('supplierId', e.target.value)}
            options={supplierOptions}
            placeholder="Default (product supplier)"
          />

          <div className="border-t pt-3">
            <span className="text-sm font-medium text-gray-700 mb-2 block">Stock</span>
            <div className="grid grid-cols-3 gap-3">
              <Input
                label="Initial Stock"
                type="number"
                min="0"
                value={variantForm.initialStock}
                onChange={(e) => setVariantFormField('initialStock', e.target.value)}
              />
              <Input
                label="Reorder Level"
                type="number"
                min="0"
                value={variantForm.reorderLevel}
                onChange={(e) => setVariantFormField('reorderLevel', e.target.value)}
              />
              <Input
                label="Rack / Location"
                value={variantForm.rackLocation}
                onChange={(e) => setVariantFormField('rackLocation', e.target.value)}
                placeholder="e.g. A-12"
              />
            </div>
          </div>

          {variantFormError && <p className="text-sm text-red-500">{variantFormError}</p>}

          <div className="flex justify-end gap-3 pt-2 border-t">
            <Button variant="outline" onClick={() => setVariantDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSaveVariant}>
              {editingVariant ? 'Update Variant' : 'Add Variant'}
            </Button>
          </div>
        </div>
      </Dialog>

      {/* New Category Dialog */}
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
                  setErrors((prev) => ({ ...prev, category: 'Name is required' }));
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

      {/* New Brand Dialog */}
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
                  setErrors((prev) => ({ ...prev, brand: 'Name is required' }));
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
