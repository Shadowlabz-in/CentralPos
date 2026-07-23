import { useQuery } from '@tanstack/react-query';
import {
  Package,
  Boxes,
  BarChart3,
  IndianRupee,
  AlertTriangle,
  XCircle,
  ArrowUpDown,
} from 'lucide-react';
import { apiRequest } from '@/context/AuthContext';
import { StockMovement } from '@/types';
import { Table } from '@/components/ui/Table';
import { Badge } from '@/components/ui/Badge';
import { Spinner } from '@/components/ui/Spinner';

const movementTypeVariant: Record<string, 'success' | 'warning' | 'danger' | 'info' | 'default'> = {
  PURCHASE: 'success',
  SALE: 'danger',
  RETURN: 'info',
  DAMAGE: 'warning',
  ADJUSTMENT: 'default',
  OPENING_STOCK: 'info',
};

function MetricCard({
  icon,
  label,
  value,
  sub,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  sub?: string;
}) {
  return (
    <div className="bg-white rounded-xl border p-4 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-gray-500">{label}</p>
          <p className="text-2xl font-bold mt-1">{value}</p>
          {sub && <p className="text-xs text-gray-400 mt-1">{sub}</p>}
        </div>
        <div className="p-2 rounded-lg bg-primary/10 text-primary">{icon}</div>
      </div>
    </div>
  );
}

export default function InventoryDashboard() {
  const { data, isLoading, error } = useQuery({
    queryKey: ['inventory-dashboard'],
    queryFn: async () => {
      const [inventory, valuation, lowStockRes, history] = await Promise.all([
        apiRequest<any>('/dashboard/inventory'),
        apiRequest<any>('/inventory/valuation'),
        apiRequest<{ data: any[] }>('/inventory/low-stock'),
        apiRequest<{ data: StockMovement[] }>('/inventory/history?limit=10'),
      ]);
      return {
        inventory: inventory.data,
        valuation: valuation.data,
        lowStockCount: Array.isArray(lowStockRes.data) ? lowStockRes.data.length : 0,
        lowStockItems: Array.isArray(lowStockRes.data) ? lowStockRes.data : [],
        recentMovements: history.data || [],
      };
    },
    staleTime: 30000,
  });

  if (isLoading) return <Spinner />;
  if (error) return <p className="text-red-500">Failed to load inventory dashboard</p>;
  if (!data) return null;

  const inv = data.inventory || {};
  const val = data.valuation || {};

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Inventory Dashboard</h1>
        <p className="text-gray-500">Overview of your inventory</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        <MetricCard
          icon={<Package size={20} />}
          label="Total Products"
          value={String(inv.totalProducts || 0)}
        />
        <MetricCard
          icon={<Boxes size={20} />}
          label="Total Variants"
          value={String(inv.totalVariants || 0)}
        />
        <MetricCard
          icon={<BarChart3 size={20} />}
          label="Total Stock Qty"
          value={String(val.totalStockQty ?? val.totalQuantity ?? '-')}
        />
        <MetricCard
          icon={<IndianRupee size={20} />}
          label="Inventory Value"
          value={`₹${(inv.totalValue || 0).toLocaleString('en-IN')}`}
        />
        <MetricCard
          icon={<AlertTriangle size={20} />}
          label="Low Stock"
          value={String(data.lowStockCount)}
          sub={`${inv.outOfStock || 0} out of stock`}
        />
        <MetricCard
          icon={<XCircle size={20} />}
          label="Out of Stock"
          value={String(inv.outOfStock || 0)}
        />
      </div>

      <div className="bg-white rounded-xl border p-4">
        <h3 className="font-semibold mb-4 flex items-center gap-2">
          <ArrowUpDown size={18} /> Recent Stock Movements
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
                }),
            },
            {
              key: 'variant',
              header: 'Variant',
              render: (m: StockMovement) =>
                m.variant ? `${m.variant.product.name} (${m.variant.sku})` : '-',
            },
            {
              key: 'type',
              header: 'Type',
              render: (m: StockMovement) => (
                <Badge variant={movementTypeVariant[m.type] || 'default'}>{m.type}</Badge>
              ),
            },
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
            { key: 'newStock', header: 'New Stock', render: (m: StockMovement) => m.newStock },
            {
              key: 'createdBy',
              header: 'By',
              render: (m: StockMovement) =>
                m.createdBy ? `${m.createdBy.firstName} ${m.createdBy.lastName || ''}`.trim() : '-',
            },
          ]}
          data={data.recentMovements}
          keyExtractor={(m) => m.id}
        />
      </div>
    </div>
  );
}
