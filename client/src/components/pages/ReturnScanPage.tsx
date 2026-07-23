import { useState, useRef, useCallback, useEffect } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  ScanLine,
  Undo2,
  Check,
  X,
  CircleAlert,
  Search,
  Camera,
  Barcode,
  Package,
} from 'lucide-react';
import { apiRequest } from '@/context/AuthContext';
import Input from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Button } from '@/components/ui/button';
import { PageSpinner } from '@/components/ui/Spinner';

interface InventoryItemData {
  id: string;
  barcode: string;
  variantId: string;
  status: string;
  serialNumber: string | null;
  productVariant: {
    sku: string;
    size: string | null;
    color: string | null;
    fabric: string | null;
    sellingPrice: number;
    product: { name: string };
  };
}

export default function ReturnScanPage() {
  const queryClient = useQueryClient();
  const barcodeInputRef = useRef<HTMLInputElement>(null);
  const [barcode, setBarcode] = useState('');
  const [scannedItem, setScannedItem] = useState<InventoryItemData | null>(null);
  const [returnReason, setReturnReason] = useState('');
  const [condition, setCondition] = useState('RESELLABLE');
  const [notification, setNotification] = useState<{
    message: string;
    type: 'error' | 'success' | 'info';
  } | null>(null);
  const [recentReturns, setRecentReturns] = useState<
    Array<{ barcode: string; status: string; time: Date }>
  >([]);

  const showToast = useCallback((message: string, type: 'error' | 'success' | 'info' = 'error') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 4000);
  }, []);

  const lookupMutation = useMutation({
    mutationFn: (code: string) =>
      apiRequest<{ status: string; data: InventoryItemData }>(`/inventory-items/lookup/${code}`),
    onSuccess: (res) => {
      const item = res.data;
      if (item.status === 'SOLD') {
        setScannedItem(item);
        showToast(`Item found - ${item.productVariant.product.name}`, 'success');
      } else if (item.status === 'AVAILABLE') {
        showToast('This item is still available (not yet sold)', 'info');
        setScannedItem(null);
      } else {
        showToast(`This item is already ${item.status.toLowerCase()}`, 'error');
        setScannedItem(null);
      }
    },
    onError: (err: any) => {
      showToast(err?.message || 'Item not found for this barcode', 'error');
      setScannedItem(null);
    },
  });

  const returnMutation = useMutation({
    mutationFn: (data: { id: string; status: string; reason?: string }) =>
      apiRequest(`/inventory-items/${data.id}/status`, {
        method: 'PATCH',
        body: JSON.stringify({ status: data.status, reason: data.reason }),
      }),
    onSuccess: () => {
      if (scannedItem) {
        setRecentReturns((prev) => [
          {
            barcode: scannedItem.barcode,
            status: condition === 'RESELLABLE' ? 'AVAILABLE' : 'RETURNED',
            time: new Date(),
          },
          ...prev.slice(0, 49),
        ]);
      }
      setScannedItem(null);
      setBarcode('');
      setReturnReason('');
      showToast('Item returned successfully', 'success');
      barcodeInputRef.current?.focus();
    },
    onError: (err: any) => {
      showToast(err?.message || 'Return failed', 'error');
    },
  });

  const handleReturn = () => {
    if (!scannedItem) return;
    const newStatus = condition === 'RESELLABLE' ? 'AVAILABLE' : 'RETURNED';
    returnMutation.mutate({
      id: scannedItem.id,
      status: newStatus,
      reason: [returnReason, `Condition: ${condition}`].filter(Boolean).join(' | ') || undefined,
    });
  };

  const handleBarcodeSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!barcode.trim()) return;
    lookupMutation.mutate(barcode.trim());
    setBarcode('');
  };

  return (
    <div className="space-y-6">
      {notification && (
        <div
          className={`fixed top-4 right-4 z-50 flex items-center gap-2 px-4 py-3 rounded-lg shadow-lg text-sm font-medium ${
            notification.type === 'error'
              ? 'bg-red-600 text-white'
              : notification.type === 'success'
                ? 'bg-green-600 text-white'
                : 'bg-gray-800 text-white'
          }`}
        >
          {notification.type === 'error' ? <CircleAlert size={16} /> : <Check size={16} />}
          {notification.message}
        </div>
      )}

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Undo2 size={24} /> Return Item
          </h1>
          <p className="text-gray-500">Scan a sold item's barcode to process its return</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-4">
          <div className="bg-white rounded-xl border p-6 space-y-4">
            <h2 className="font-semibold text-lg">Scan Barcode</h2>

            <form onSubmit={handleBarcodeSubmit} className="flex gap-3">
              <input
                ref={barcodeInputRef}
                type="text"
                placeholder="Scan item barcode..."
                className="flex-1 pl-4 pr-4 py-3 border-2 border-black rounded-lg text-lg focus:outline-none"
                value={barcode}
                onChange={(e) => setBarcode(e.target.value)}
                autoFocus
              />
              <Button type="submit" disabled={!barcode.trim() || lookupMutation.isPending}>
                {lookupMutation.isPending ? (
                  'Looking up...'
                ) : (
                  <>
                    <Search size={18} className="mr-1" /> Find
                  </>
                )}
              </Button>
            </form>

            {scannedItem && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-4 space-y-4">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="font-medium text-lg">{scannedItem.productVariant.product.name}</p>
                    <p className="text-sm text-gray-500">
                      SKU: {scannedItem.productVariant.sku} | Variant:{' '}
                      {[
                        scannedItem.productVariant.size,
                        scannedItem.productVariant.color,
                        scannedItem.productVariant.fabric,
                      ]
                        .filter(Boolean)
                        .join(' / ') || '-'}
                    </p>
                    <p className="text-xs font-mono text-gray-400 mt-1">{scannedItem.barcode}</p>
                  </div>
                  <span className="text-sm bg-blue-100 text-blue-700 px-2 py-1 rounded font-medium">
                    SOLD
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <Select
                    label="Condition"
                    value={condition}
                    onChange={(e) => setCondition(e.target.value)}
                    options={[
                      { value: 'RESELLABLE', label: 'Resellable' },
                      { value: 'DAMAGED', label: 'Damaged' },
                      { value: 'DEFECTIVE', label: 'Defective' },
                    ]}
                  />
                  <Input
                    label="Return Reason (optional)"
                    placeholder="e.g. Wrong size"
                    value={returnReason}
                    onChange={(e) => setReturnReason(e.target.value)}
                  />
                </div>

                <div className="flex justify-end gap-3 pt-2">
                  <Button variant="outline" onClick={() => setScannedItem(null)}>
                    <X size={16} className="mr-1" /> Cancel
                  </Button>
                  <Button onClick={handleReturn} disabled={returnMutation.isPending}>
                    {returnMutation.isPending ? (
                      'Processing...'
                    ) : (
                      <>
                        <Undo2 size={16} className="mr-1" /> Return Item
                      </>
                    )}
                  </Button>
                </div>
              </div>
            )}

            {lookupMutation.isPending && (
              <div className="text-center py-8 text-gray-400">
                <Search size={32} className="mx-auto mb-2 animate-pulse" />
                <p>Looking up item...</p>
              </div>
            )}

            {!scannedItem && !lookupMutation.isPending && (
              <div className="text-center py-8 text-gray-400">
                <Barcode size={48} className="mx-auto mb-3" />
                <p>Scan or enter a barcode to find a sold item</p>
              </div>
            )}
          </div>

          {recentReturns.length > 0 && (
            <div className="bg-white rounded-xl border p-4">
              <h3 className="font-semibold mb-3">Recent Returns</h3>
              <div className="space-y-1 max-h-60 overflow-y-auto">
                {recentReturns.map((r, i) => (
                  <div
                    key={i}
                    className="flex items-center justify-between text-sm py-1.5 border-b last:border-0"
                  >
                    <span className="font-mono text-xs">{r.barcode}</span>
                    <span
                      className={`text-xs px-2 py-0.5 rounded ${
                        r.status === 'AVAILABLE'
                          ? 'bg-green-100 text-green-700'
                          : 'bg-yellow-100 text-yellow-700'
                      }`}
                    >
                      {r.status}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="lg:col-span-1">
          <div className="bg-white rounded-xl border p-6 sticky top-6 space-y-4">
            <h2 className="font-semibold flex items-center gap-2">
              <Package size={18} /> Quick Stats
            </h2>
            <div className="text-sm space-y-2">
              <div className="flex justify-between">
                <span className="text-gray-500">Scanned</span>
                <span className="font-medium">{recentReturns.length}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Returned</span>
                <span className="font-medium text-green-600">
                  {recentReturns.filter((r) => r.status === 'AVAILABLE').length}
                </span>
              </div>
            </div>
            <p className="text-xs text-gray-400">
              Scan item barcodes to look up their status and process returns.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
