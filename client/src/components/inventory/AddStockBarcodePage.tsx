import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { Plus, Barcode, Download, Printer, Check, ArrowLeft, Package, Search } from 'lucide-react';
import { apiRequest } from '@/context/AuthContext';
import type { PaginationMeta } from '@/types';
import { Table } from '@/components/ui/Table';
import { SearchInput } from '@/components/ui/SearchInput';
import { Pagination } from '@/components/ui/Pagination';
import { Badge } from '@/components/ui/Badge';
import { PageSpinner, Spinner } from '@/components/ui/Spinner';
import { Dialog } from '@/components/ui/Dialog';
import { Select } from '@/components/ui/Select';
import { Button } from '@/components/ui/button';
import Input from '@/components/ui/Input';

interface VariantResult {
  variantId: string;
  productName: string;
  sku: string;
  size: string | null;
  color: string | null;
  fabric: string | null;
  stockQuantity: number;
  sellingPrice: number;
}

interface BarcodeResult {
  barcode: string;
  imagePath: string;
}

export default function AddStockBarcodePage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedVariant, setSelectedVariant] = useState<VariantResult | null>(null);
  const [quantity, setQuantity] = useState('');
  const [serialNumbers, setSerialNumbers] = useState('');
  const [result, setResult] = useState<{ count: number; barcodes: BarcodeResult[] } | null>(null);

  const { data, isLoading } = useQuery({
    queryKey: ['inventory-variants-barcode', page, search],
    queryFn: () =>
      apiRequest<{ data: VariantResult[]; meta: PaginationMeta }>(
        `/inventory/current?page=${page}&limit=20${search ? `&search=${encodeURIComponent(search)}` : ''}`,
      ),
  });

  const items = data?.data || [];
  const meta = data?.meta || { total: 0, page: 1, limit: 20, totalPages: 0 };

  const generateMutation = useMutation({
    mutationFn: (body: { variantId: string; quantity: number; serialNumbers?: string[] }) =>
      apiRequest<{ status: string; data: { count: number; barcodes: BarcodeResult[] } }>(
        '/inventory-items/batch-create',
        { method: 'POST', body: JSON.stringify(body) },
      ),
    onSuccess: (res) => {
      setResult(res.data);
      queryClient.invalidateQueries({ queryKey: ['inventory'] });
    },
  });

  const handleOpenDialog = (variant: VariantResult) => {
    setSelectedVariant(variant);
    setQuantity('');
    setSerialNumbers('');
    setResult(null);
    setDialogOpen(true);
  };

  const handleGenerate = () => {
    if (!selectedVariant || !quantity || parseInt(quantity) < 1) return;
    const snArray = serialNumbers
      ? serialNumbers
          .split('\n')
          .map((s) => s.trim())
          .filter(Boolean)
      : undefined;
    generateMutation.mutate({
      variantId: selectedVariant.variantId,
      quantity: parseInt(quantity),
      serialNumbers: snArray,
    });
  };

  const handlePrint = async (imagePath: string) => {
    const base = '/api';
    const url = imagePath.startsWith('http')
      ? imagePath
      : `${base.replace(/\/api$/, '')}${imagePath}`;
    const w = window.open(url, '_blank');
    if (w) {
      w.onload = () => w.print();
    }
  };

  const handlePrintAll = () => {
    if (!result) return;
    result.barcodes.forEach((b, i) => {
      setTimeout(() => handlePrint(b.imagePath), i * 300);
    });
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Barcode size={24} /> Add Stock with Barcodes
          </h1>
          <p className="text-gray-500">Generate unique barcodes for each physical item</p>
        </div>
      </div>

      <div className="w-72">
        <SearchInput
          value={search}
          onChange={(v) => {
            setSearch(v);
            setPage(1);
          }}
          placeholder="Search by name, SKU, barcode..."
        />
      </div>

      {isLoading ? (
        <PageSpinner />
      ) : (
        <Table
          columns={[
            {
              key: 'productName',
              header: 'Product',
              render: (item: VariantResult) => (
                <span className="font-medium">{item.productName}</span>
              ),
            },
            { key: 'sku', header: 'SKU' },
            { key: 'size', header: 'Size', render: (item: VariantResult) => item.size || '-' },
            { key: 'color', header: 'Color', render: (item: VariantResult) => item.color || '-' },
            {
              key: 'stockQuantity',
              header: 'Stock',
              render: (item: VariantResult) => {
                if (item.stockQuantity === 0) return <Badge variant="danger">0</Badge>;
                return <span className="font-medium">{item.stockQuantity}</span>;
              },
            },
            {
              key: 'actions',
              header: '',
              render: (item: VariantResult) => (
                <Button
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleOpenDialog(item);
                  }}
                >
                  <Plus size={14} className="mr-1" /> Add Stock
                </Button>
              ),
            },
          ]}
          data={items}
          keyExtractor={(item) => item.variantId}
        />
      )}
      <Pagination
        page={meta.page}
        totalPages={meta.totalPages}
        total={meta.total}
        onPageChange={setPage}
      />

      <Dialog
        open={dialogOpen}
        onClose={() => {
          setDialogOpen(false);
          setResult(null);
        }}
        title="Generate Barcoded Stock"
        size="lg"
      >
        <div className="space-y-4">
          {selectedVariant && (
            <div className="bg-gray-50 rounded-lg p-3 text-sm flex items-center justify-between">
              <div>
                <p className="font-medium">{selectedVariant.productName}</p>
                <p className="text-gray-500">
                  SKU: {selectedVariant.sku} | Size: {selectedVariant.size || '-'} / Color:{' '}
                  {selectedVariant.color || '-'}
                </p>
              </div>
              <span className="font-bold text-lg">Stock: {selectedVariant.stockQuantity}</span>
            </div>
          )}

          <Input
            label="Quantity *"
            type="number"
            min="1"
            max="10000"
            placeholder="Number of barcodes to generate (e.g. 100)"
            value={quantity}
            onChange={(e) => setQuantity(e.target.value)}
          />

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Serial Numbers (optional)
            </label>
            <textarea
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
              rows={3}
              placeholder="One per line, in order. Leave blank to auto-generate."
              value={serialNumbers}
              onChange={(e) => setSerialNumbers(e.target.value)}
            />
            <p className="text-xs text-gray-400 mt-1">
              Each line corresponds to one item. Must match quantity.
            </p>
          </div>

          {generateMutation.isPending && (
            <div className="flex items-center gap-2 text-blue-600">
              <Spinner /> Generating {quantity} barcodes...
            </div>
          )}

          {generateMutation.isError && (
            <p className="text-sm text-red-500">
              {(generateMutation.error as Error)?.message || 'Failed to generate'}
            </p>
          )}

          {result && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4 space-y-3">
              <div className="flex items-center gap-2 text-green-700">
                <Check size={18} />
                <span className="font-medium">{result.count} barcodes generated successfully</span>
              </div>

              <div className="max-h-48 overflow-y-auto space-y-1">
                {result.barcodes.slice(0, 20).map((b) => (
                  <div
                    key={b.barcode}
                    className="flex items-center justify-between bg-white rounded px-2 py-1 text-xs"
                  >
                    <span className="font-mono">{b.barcode}</span>
                    <button
                      onClick={() => handlePrint(b.imagePath)}
                      className="text-blue-600 hover:underline"
                    >
                      <Printer size={12} className="inline" /> Print
                    </button>
                  </div>
                ))}
                {result.barcodes.length > 20 && (
                  <p className="text-xs text-gray-400 text-center pt-1">
                    ...and {result.barcodes.length - 20} more
                  </p>
                )}
              </div>

              <div className="flex gap-2">
                <Button size="sm" onClick={handlePrintAll} className="flex-1">
                  <Printer size={14} className="mr-1" /> Print All
                </Button>
              </div>
            </div>
          )}

          {!result && (
            <div className="flex justify-end gap-3 pt-2">
              <Button variant="outline" onClick={() => setDialogOpen(false)}>
                Cancel
              </Button>
              <Button
                onClick={handleGenerate}
                disabled={!quantity || parseInt(quantity) < 1 || generateMutation.isPending}
              >
                {generateMutation.isPending
                  ? 'Generating...'
                  : `Generate ${quantity || '0'} Barcodes`}
              </Button>
            </div>
          )}
        </div>
      </Dialog>
    </div>
  );
}
