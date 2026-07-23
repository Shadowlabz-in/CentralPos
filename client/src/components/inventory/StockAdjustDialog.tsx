import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/context/AuthContext';
import { AdjustmentReason } from '@/types';
import { Dialog } from '@/components/ui/Dialog';
import { Select } from '@/components/ui/Select';
import { SearchInput } from '@/components/ui/SearchInput';
import Input from '@/components/ui/Input';
import { Button } from '@/components/ui/button';

const ADJUSTMENT_REASONS: { value: AdjustmentReason; label: string }[] = [
  { value: 'PHYSICAL_COUNT', label: 'Physical Count' },
  { value: 'DAMAGE', label: 'Damage' },
  { value: 'EXPIRED', label: 'Expired' },
  { value: 'LOST', label: 'Lost' },
  { value: 'CORRECTION', label: 'Correction' },
  { value: 'MANUAL_ADJUSTMENT', label: 'Manual Adjustment' },
  { value: 'OPENING_STOCK', label: 'Opening Stock' },
  { value: 'SALE_CORRECTION', label: 'Sale Correction' },
  { value: 'RETURNED', label: 'Returned' },
];

interface StockAdjustDialogProps {
  open: boolean;
  onClose: () => void;
  onSuccess?: () => void;
  initialVariantId?: string | null;
}

export default function StockAdjustDialog({
  open,
  onClose,
  onSuccess,
  initialVariantId,
}: StockAdjustDialogProps) {
  const queryClient = useQueryClient();
  const [variantSearch, setVariantSearch] = useState('');
  const [selectedSku, setSelectedSku] = useState(initialVariantId || '');
  const [quantity, setQuantity] = useState('');
  const [reason, setReason] = useState<AdjustmentReason | ''>('');
  const [notes, setNotes] = useState('');
  const [showSearchResults, setShowSearchResults] = useState(false);

  const { data: searchResults } = useQuery({
    queryKey: ['variants-search', variantSearch],
    queryFn: () =>
      apiRequest<{ data: any[] }>(`/variants?search=${encodeURIComponent(variantSearch)}&limit=10`),
    enabled: variantSearch.length >= 2,
  });

  const { data: variantData } = useQuery({
    queryKey: ['variant', selectedSku],
    queryFn: () => apiRequest<{ data: any }>(`/variants/${selectedSku}`),
    enabled: !!selectedSku,
  });

  const adjustMutation = useMutation({
    mutationFn: (body: {
      productVariantId: string;
      quantity: number;
      reason: AdjustmentReason;
      notes?: string;
    }) => apiRequest('/inventory/adjust', { method: 'POST', body: JSON.stringify(body) }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['inventory'] });
      queryClient.invalidateQueries({ queryKey: ['variant', selectedSku] });
      queryClient.invalidateQueries({ queryKey: ['variant-movements', selectedSku] });
      queryClient.invalidateQueries({ queryKey: ['inventory-dashboard'] });
      setSelectedSku('');
      setQuantity('');
      setReason('');
      setNotes('');
      setVariantSearch('');
      onSuccess?.();
    },
  });

  const variant = variantData?.data;
  const qtyNum = parseFloat(quantity) || 0;
  const newStock = variant ? variant.stockQuantity + qtyNum : null;

  const handleSubmit = async () => {
    if (!selectedSku || !qtyNum || !reason) return;
    adjustMutation.mutate({
      productVariantId: selectedSku,
      quantity: qtyNum,
      reason: reason as AdjustmentReason,
      notes: notes || undefined,
    });
  };

  const handleSelectVariant = (id: string) => {
    setSelectedSku(id);
    setShowSearchResults(false);
    setVariantSearch('');
  };

  return (
    <Dialog open={open} onClose={onClose} title="Adjust Stock" size="lg">
      <div className="space-y-4">
        {!variant && (
          <div className="relative">
            <SearchInput
              value={variantSearch}
              onChange={(val) => {
                setVariantSearch(val);
                setShowSearchResults(true);
              }}
              placeholder="Search variant by name or SKU..."
            />
            {showSearchResults && variantSearch.length >= 2 && searchResults?.data && (
              <div className="absolute z-10 w-full mt-1 bg-white border rounded-lg shadow-lg max-h-60 overflow-y-auto">
                {(searchResults.data as any[]).length === 0 ? (
                  <div className="p-3 text-sm text-gray-400">No variants found</div>
                ) : (
                  (searchResults.data as any[]).map((sv: any) => (
                    <button
                      key={sv.id}
                      onClick={() => handleSelectVariant(sv.id)}
                      className="w-full text-left px-3 py-2 hover:bg-gray-50 text-sm border-b last:border-0"
                    >
                      <span className="font-medium">{sv.product?.name || 'Unknown'}</span>
                      <span className="text-gray-400 ml-2">({sv.sku})</span>
                      {sv.size && <span className="text-gray-400 ml-1">- {sv.size}</span>}
                      {sv.color && <span className="text-gray-400 ml-1">/ {sv.color}</span>}
                    </button>
                  ))
                )}
              </div>
            )}
          </div>
        )}

        {variant && (
          <div className="bg-gray-50 rounded-lg p-3">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">{variant.product?.name || 'Variant'}</p>
                <p className="text-sm text-gray-500">
                  SKU: {variant.sku} | Size: {variant.size || '-'} | Color: {variant.color || '-'}
                </p>
              </div>
              <button
                onClick={() => {
                  setSelectedSku('');
                  setVariantSearch('');
                }}
                className="text-xs text-red-500 hover:underline"
              >
                Change
              </button>
            </div>
          </div>
        )}

        {newStock !== null && (
          <div className="grid grid-cols-3 gap-3 text-center text-sm bg-blue-50 rounded-lg p-3">
            <div>
              <p className="text-gray-500">Current</p>
              <p className="text-lg font-bold">{variant?.stockQuantity ?? 0}</p>
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
            placeholder="Positive to add, negative to reduce"
            value={quantity}
            onChange={(e) => setQuantity(e.target.value)}
          />
          <Select
            label="Reason"
            value={reason}
            onChange={(e) => setReason(e.target.value as AdjustmentReason)}
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

        <div className="flex justify-end gap-3 pt-2">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={!selectedSku || !qtyNum || !reason || adjustMutation.isPending}
          >
            {adjustMutation.isPending ? 'Adjusting...' : 'Adjust Stock'}
          </Button>
        </div>
      </div>
    </Dialog>
  );
}
