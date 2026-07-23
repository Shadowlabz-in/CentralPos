import { useQuery } from '@tanstack/react-query';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  Package,
  IndianRupee,
  BarChart3,
  AlertTriangle,
  ClipboardList,
} from 'lucide-react';
import { apiRequest } from '@/context/AuthContext';
import { ProductVariant, StockMovement } from '@/types';
import { Table } from '@/components/ui/Table';
import { Badge } from '@/components/ui/Badge';
import { Spinner } from '@/components/ui/Spinner';
import { Button } from '@/components/ui/button';

const movementTypeVariant: Record<string, 'success' | 'warning' | 'danger' | 'info' | 'default'> = {
  PURCHASE: 'success',
  SALE: 'danger',
  RETURN: 'info',
  DAMAGE: 'warning',
  ADJUSTMENT: 'default',
  OPENING_STOCK: 'info',
};

export default function StockDetailPage() {
  const { variantId } = useParams<{ variantId: string }>();
  const navigate = useNavigate();

  const { data: variant, isLoading: variantLoading } = useQuery({
    queryKey: ['variant', variantId],
    queryFn: () => apiRequest<{ data: ProductVariant }>(`/variants/${variantId}`),
    enabled: !!variantId,
  });

  const { data: movementsData, isLoading: movementsLoading } = useQuery({
    queryKey: ['variant-movements', variantId],
    queryFn: () =>
      apiRequest<{ data: StockMovement[] }>(`/inventory/${variantId}/movements?limit=50`),
    enabled: !!variantId,
  });

  if (variantLoading || movementsLoading) return <Spinner />;

  const v = variant?.data;
  const movements = movementsData?.data || [];

  if (!v) return <p className="text-red-500">Variant not found</p>;

  const stockValue = v.stockQuantity * v.purchasePrice;
  const lastPurchase = movements.find((m) => m.type === 'PURCHASE');
  const lastSale = movements.find((m) => m.type === 'SALE');

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <button onClick={() => navigate(-1)} className="p-2 rounded-lg hover:bg-gray-100">
          <ArrowLeft size={20} />
        </button>
        <div>
          <h1 className="text-2xl font-bold">{v.product?.name || 'Variant Detail'}</h1>
          <p className="text-gray-500">SKU: {v.sku}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <div className="bg-white rounded-xl border p-4">
          <h3 className="font-semibold mb-3 flex items-center gap-2">
            <Package size={18} /> Variant Info
          </h3>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-500">SKU</span>
              <span className="font-medium">{v.sku}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Barcode</span>
              <span className="font-medium">{v.barcode || '-'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Size</span>
              <span className="font-medium">{v.size || '-'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Color</span>
              <span className="font-medium">{v.color || '-'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Status</span>
              <Badge variant={v.isActive ? 'success' : 'danger'}>
                {v.isActive ? 'Active' : 'Inactive'}
              </Badge>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl border p-4">
          <h3 className="font-semibold mb-3 flex items-center gap-2">
            <BarChart3 size={18} /> Stock Info
          </h3>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-500">Current Stock</span>
              <span
                className={`font-medium ${v.stockQuantity === 0 ? 'text-red-600' : v.stockQuantity <= v.reorderLevel ? 'text-yellow-600' : ''}`}
              >
                {v.stockQuantity}
                {v.stockQuantity <= v.reorderLevel && (
                  <AlertTriangle size={14} className="inline ml-1" />
                )}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Stock Value</span>
              <span className="font-medium">₹{stockValue.toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Reorder Level</span>
              <span className="font-medium">{v.reorderLevel}</span>
            </div>
            {v.stockQuantity < v.reorderLevel && (
              <div className="flex justify-between">
                <span className="text-gray-500">Deficit</span>
                <span className="font-medium text-red-600">{v.reorderLevel - v.stockQuantity}</span>
              </div>
            )}
          </div>
        </div>

        <div className="bg-white rounded-xl border p-4">
          <h3 className="font-semibold mb-3 flex items-center gap-2">
            <IndianRupee size={18} /> Business Info
          </h3>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-500">Purchase Price</span>
              <span className="font-medium">₹{v.purchasePrice.toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Selling Price</span>
              <span className="font-medium">₹{v.sellingPrice.toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Margin</span>
              <span className="font-medium text-green-600">
                {v.sellingPrice > 0
                  ? `${Math.round(((v.sellingPrice - v.purchasePrice) / v.sellingPrice) * 100)}%`
                  : '-'}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Last Purchase</span>
              <span className="font-medium">
                {lastPurchase ? new Date(lastPurchase.createdAt).toLocaleDateString('en-IN') : '-'}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Last Sale</span>
              <span className="font-medium">
                {lastSale ? new Date(lastSale.createdAt).toLocaleDateString('en-IN') : '-'}
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl border p-4">
        <h3 className="font-semibold mb-4 flex items-center gap-2">
          <ClipboardList size={18} /> Stock Movement History
        </h3>
        <Table
          columns={[
            {
              key: 'createdAt',
              header: 'Date',
              render: (m: StockMovement) =>
                new Date(m.createdAt).toLocaleDateString('en-IN', {
                  day: '2-digit',
                  month: 'short',
                  year: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit',
                }),
            },
            {
              key: 'type',
              header: 'Type',
              render: (m: StockMovement) => (
                <Badge variant={movementTypeVariant[m.type] || 'default'}>{m.type}</Badge>
              ),
            },
            { key: 'previousStock', header: 'Previous' },
            {
              key: 'quantity',
              header: 'Change',
              render: (m: StockMovement) => (
                <span
                  className={
                    m.quantity > 0 ? 'text-green-600 font-medium' : 'text-red-600 font-medium'
                  }
                >
                  {m.quantity > 0 ? '+' : ''}
                  {m.quantity}
                </span>
              ),
            },
            { key: 'newStock', header: 'New Stock' },
            {
              key: 'adjustmentReason',
              header: 'Reason',
              render: (m: StockMovement) => m.adjustmentReason || m.notes || '-',
            },
            {
              key: 'createdBy',
              header: 'User',
              render: (m: StockMovement) =>
                m.createdBy ? `${m.createdBy.firstName} ${m.createdBy.lastName || ''}`.trim() : '-',
            },
          ]}
          data={movements}
          keyExtractor={(m) => m.id}
          emptyMessage="No movements recorded yet"
        />
      </div>

      <div className="flex gap-2">
        <Button onClick={() => navigate(`/inventory`)} variant="outline">
          Back to Inventory
        </Button>
      </div>
    </div>
  );
}
