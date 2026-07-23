import { useState } from 'react';
import { useQuery, useMutation, useQueryClient, keepPreviousData } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { Plus, Search, Package, ArrowLeft } from 'lucide-react';
import { apiRequest } from '@/context/AuthContext';
import { AdjustmentReason, InventoryItem, PaginationMeta } from '@/types';
import { Table } from '@/components/ui/Table';
import { SearchInput } from '@/components/ui/SearchInput';
import { Pagination } from '@/components/ui/Pagination';
import { Badge } from '@/components/ui/Badge';
import { Spinner } from '@/components/ui/Spinner';
import { Dialog } from '@/components/ui/Dialog';
import { Select } from '@/components/ui/Select';
import { Button } from '@/components/ui/button';
import Input from '@/components/ui/Input';

const ADJUSTMENT_REASONS = [
  { value: 'PURCHASE', label: 'Purchase' },
  { value: 'RETURN', label: 'Return' },
  { value: 'CORRECTION', label: 'Correction' },
  { value: 'MANUAL_ADJUSTMENT', label: 'Manual Adjustment' },
  { value: 'OPENING_STOCK', label: 'Opening Stock' },
  { value: 'PHYSICAL_COUNT', label: 'Physical Count' },
  { value: 'DAMAGE', label: 'Damage' },
  { value: 'EXPIRED', label: 'Expired' },
  { value: 'LOST', label: 'Lost' },
  { value: 'SALE_CORRECTION', label: 'Sale Correction' },
  { value: 'RETURNED', label: 'Returned' },
];

export default function AddStockPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedVariantId, setSelectedVariantId] = useState<string | null>(null);
  const [quantity, setQuantity] = useState('');
  const [reason, setReason] = useState('');
  const [notes, setNotes] = useState('');

  const { data, isLoading } = useQuery({
    queryKey: ['inventory-add-stock', page, search],
    queryFn: () =>
      apiRequest<{ data: InventoryItem[]; meta: PaginationMeta }>(
        `/inventory/current?page=${page}&limit=20${search ? `&search=${encodeURIComponent(search)}` : ''}`,
      ),
    placeholderData: keepPreviousData,
  });

  const { data: variantData } = useQuery({
    queryKey: ['variant-detail', selectedVariantId],
    queryFn: () => apiRequest<{ data: any }>(`/variants/${selectedVariantId}`),
    enabled: !!selectedVariantId,
  });

  const variant = variantData?.data;
  const qtyNum = parseFloat(quantity) || 0;
  const newStock = variant ? variant.stockQuantity + qtyNum : 0;

  const adjustMutation = useMutation({
    mutationFn: (body: {
      productVariantId: string;
      quantity: number;
      reason: string;
      notes?: string;
    }) => apiRequest('/inventory/adjust', { method: 'POST', body: JSON.stringify(body) }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['inventory'] });
      queryClient.invalidateQueries({ queryKey: ['inventory-add-stock'] });
      queryClient.invalidateQueries({ queryKey: ['inventory-dashboard'] });
      setDialogOpen(false);
      setSelectedVariantId(null);
      setQuantity('');
      setReason('');
      setNotes('');
    },
  });

  const items = data?.data || [];
  const meta = data?.meta || { total: 0, page: 1, limit: 20, totalPages: 0 };

  const handleAdjust = (variantId: string) => {
    setSelectedVariantId(variantId);
    setDialogOpen(true);
  };

  const handleSubmit = () => {
    if (!selectedVariantId || !qtyNum || !reason) return;
    adjustMutation.mutate({
      productVariantId: selectedVariantId,
      quantity: qtyNum,
      reason,
      notes: notes || undefined,
    });
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Package size={24} /> Add Stock
          </h1>
          <p className="text-gray-500">Add or adjust stock for product variants</p>
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
        <Spinner />
      ) : (
        <>
          <Table
            columns={[
              {
                key: 'productName',
                header: 'Product',
                render: (item: InventoryItem) => (
                  <span className="font-medium">{item.productName}</span>
                ),
              },
              { key: 'sku', header: 'SKU' },
              { key: 'size', header: 'Size', render: (item: InventoryItem) => item.size || '-' },
              { key: 'color', header: 'Color', render: (item: InventoryItem) => item.color || '-' },
              {
                key: 'stockQuantity',
                header: 'Current Stock',
                render: (item: InventoryItem) => {
                  if (item.stockQuantity === 0) return <Badge variant="danger">0</Badge>;
                  if (item.isLowStock) return <Badge variant="warning">{item.stockQuantity}</Badge>;
                  return <span className="font-medium">{item.stockQuantity}</span>;
                },
              },
              {
                key: 'actions',
                header: 'Action',
                render: (item: InventoryItem) => (
                  <Button
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleAdjust(item.variantId);
                    }}
                  >
                    <Plus size={14} className="mr-1" /> Adjust
                  </Button>
                ),
              },
            ]}
            data={items}
            keyExtractor={(item) => item.variantId}
          />
          <Pagination
            page={meta.page}
            totalPages={meta.totalPages}
            total={meta.total}
            onPageChange={setPage}
          />
        </>
      )}

      <Dialog
        open={dialogOpen}
        onClose={() => {
          setDialogOpen(false);
          setSelectedVariantId(null);
        }}
        title="Adjust Stock"
        size="lg"
      >
        <div className="space-y-4">
          {variant && (
            <div className="bg-gray-50 rounded-lg p-3 text-sm">
              <p className="font-medium">{variant.product?.name || 'Variant'}</p>
              <p className="text-gray-500">
                SKU: {variant.sku} | Size: {variant.size || '-'} | Color: {variant.color || '-'}
              </p>
            </div>
          )}

          {variant && (
            <div className="grid grid-cols-3 gap-3 text-center text-sm bg-blue-50 rounded-lg p-3">
              <div>
                <p className="text-gray-500">Current</p>
                <p className="text-lg font-bold">{variant.stockQuantity}</p>
              </div>
              <div>
                <p className="text-gray-500">Adjustment</p>
                <p
                  className={`text-lg font-bold ${qtyNum > 0 ? 'text-green-600' : qtyNum < 0 ? 'text-red-600' : ''}`}
                >
                  {qtyNum > 0 ? '+' : ''}
                  {qtyNum || 0}
                </p>
              </div>
              <div>
                <p className="text-gray-500">New Stock</p>
                <p className={`text-lg font-bold ${newStock < 0 ? 'text-red-600' : ''}`}>
                  {newStock}
                </p>
              </div>
            </div>
          )}

          <div className="grid grid-cols-2 gap-3">
            <Input
              label="Quantity"
              type="number"
              placeholder="+ to add, - to reduce"
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
            />
            <Select
              label="Reason"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              options={ADJUSTMENT_REASONS}
              placeholder="Select reason"
            />
          </div>

          <Input
            label="Notes (optional)"
            placeholder="Additional notes..."
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
          />

          {adjustMutation.isError && (
            <p className="text-sm text-red-500">
              {(adjustMutation.error as Error)?.message || 'Adjustment failed'}
            </p>
          )}
          {adjustMutation.isSuccess && (
            <p className="text-sm text-green-600">Stock adjusted successfully!</p>
          )}

          <div className="flex justify-end gap-3 pt-2">
            <Button
              variant="outline"
              onClick={() => {
                setDialogOpen(false);
                setSelectedVariantId(null);
              }}
            >
              Cancel
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={!selectedVariantId || !qtyNum || !reason || adjustMutation.isPending}
            >
              {adjustMutation.isPending ? 'Adjusting...' : 'Update Stock'}
            </Button>
          </div>
        </div>
      </Dialog>
    </div>
  );
}
