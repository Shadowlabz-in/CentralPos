import { useQuery } from '@tanstack/react-query';
import {
  Store,
  ShoppingCart,
  TrendingUp,
  Package,
  Users,
  Truck,
  DollarSign,
  AlertTriangle,
  BarChart3,
  PieChart as PieChartIcon,
  LineChart as LineChartIcon,
  Download,
} from 'lucide-react';
import { apiRequest } from '@/context/AuthContext';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d'];

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

export default function DashboardPage() {
  const { data, isLoading, error } = useQuery({
    queryKey: ['dashboard'],
    queryFn: async () => {
      const [ov, pr, inv, pur, cust, chart, cat, top] = await Promise.all([
        apiRequest<any>('/dashboard'),
        apiRequest<any>('/dashboard/profit'),
        apiRequest<any>('/dashboard/inventory'),
        apiRequest<any>('/dashboard/purchases'),
        apiRequest<any>('/dashboard/customers'),
        apiRequest<any>('/dashboard/sales-chart?period=daily'),
        apiRequest<any>('/dashboard/sales-by-category'),
        apiRequest<any>('/dashboard/top-products?limit=5'),
      ]);
      return {
        overview: ov.data,
        profit: pr.data,
        inventory: inv.data,
        purchases: pur.data,
        customers: cust.data,
        dailySales: chart.data || [],
        categorySales: cat.data || [],
        topProducts: top.data || [],
      };
    },
    staleTime: 30000,
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (error) return <p className="text-red-500">Failed to load dashboard data</p>;
  if (!data) return null;

  const s = data.overview || {};
  const inv = data.inventory || {};
  const pur = data.purchases || {};
  const cust = data.customers || {};
  const dailySales = data.dailySales || [];
  const categorySales = data.categorySales || [];
  const topProducts = data.topProducts || [];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Dashboard</h1>
          <p className="text-gray-500">Real-time overview of your store performance</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => window.open('/api/reports/export?type=sales&format=csv', '_blank')}
            className="flex items-center gap-2 px-3 py-2 border rounded-lg text-sm hover:bg-gray-50"
          >
            <Download size={16} /> Export CSV
          </button>
        </div>
      </div>

      <div>
        <h2 className="text-lg font-semibold mb-3 flex items-center gap-2">
          <ShoppingCart size={20} /> Sales Summary
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
          {['today', 'yesterday', 'week', 'month', 'year'].map((p) => {
            const d = s[p] || {};
            return (
              <MetricCard
                key={p}
                icon={<BarChart3 size={18} />}
                label={p.charAt(0).toUpperCase() + p.slice(1)}
                value={`₹${(d.netSales || 0).toFixed(0)}`}
                sub={`${d.billCount || 0} bills · ${(d.gstCollected || 0).toFixed(0)} GST`}
              />
            );
          })}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          icon={<DollarSign size={20} />}
          label="Gross Profit"
          value={`₹${(data.profit?.grossProfit || 0).toFixed(0)}`}
          sub={`${data.profit?.profitMargin || 0}% margin`}
        />
        <MetricCard
          icon={<Package size={20} />}
          label="Inventory Value"
          value={`₹${(inv.totalValue || 0).toFixed(0)}`}
          sub={`${inv.totalVariants || 0} variants`}
        />
        <MetricCard
          icon={<AlertTriangle size={20} />}
          label="Low Stock Items"
          value={String(inv.lowStock || 0)}
          sub={`${inv.outOfStock || 0} out of stock`}
        />
        <MetricCard
          icon={<Truck size={20} />}
          label="Total Purchases"
          value={`₹${(pur.totalValue || 0).toFixed(0)}`}
          sub={`${pur.totalPurchases || 0} purchases`}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl border p-4">
          <h3 className="font-semibold mb-4 flex items-center gap-2">
            <LineChartIcon size={18} /> Daily Sales
          </h3>
          <ResponsiveContainer width="100%" height={250}>
            <LineChart data={dailySales}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} />
              <Tooltip />
              <Line
                type="monotone"
                dataKey="revenue"
                stroke="#0088FE"
                strokeWidth={2}
                name="Revenue"
              />
              <Line type="monotone" dataKey="sales" stroke="#00C49F" strokeWidth={2} name="Sales" />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white rounded-xl border p-4">
          <h3 className="font-semibold mb-4 flex items-center gap-2">
            <PieChartIcon size={18} /> Sales by Category
          </h3>
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie
                data={categorySales}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"
                outerRadius={80}
                label={({ name, percent }: any) => `${name} ${(percent * 100).toFixed(0)}%`}
              >
                {categorySales.map((_: any, i: number) => (
                  <Cell key={i} fill={COLORS[i % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl border p-4">
          <h3 className="font-semibold mb-4 flex items-center gap-2">
            <BarChart3 size={18} /> Top Selling Products
          </h3>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={topProducts} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis type="number" tick={{ fontSize: 11 }} />
              <YAxis dataKey="name" type="category" width={120} tick={{ fontSize: 11 }} />
              <Tooltip />
              <Bar dataKey="revenue" fill="#8884d8" name="Revenue" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="grid grid-cols-1 gap-4">
          <div className="bg-white rounded-xl border p-4">
            <h3 className="font-semibold mb-3 flex items-center gap-2">
              <Users size={18} /> Customers
            </h3>
            <div className="grid grid-cols-3 gap-3 text-center">
              <div>
                <p className="text-2xl font-bold">{cust.totalCustomers || 0}</p>
                <p className="text-xs text-gray-500">Total</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-green-600">{cust.newCustomers || 0}</p>
                <p className="text-xs text-gray-500">New (Month)</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-blue-600">{cust.returningCustomers || 0}</p>
                <p className="text-xs text-gray-500">Returning</p>
              </div>
            </div>
            {cust.topCustomers?.length > 0 && (
              <div className="mt-3 space-y-1">
                <p className="text-xs text-gray-500 font-medium">Top Customers</p>
                {cust.topCustomers.slice(0, 3).map((c: any) => (
                  <div key={c.name} className="flex justify-between text-sm">
                    <span>{c.name}</span>
                    <span className="font-medium">₹{c.totalSpent.toFixed(0)}</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="bg-white rounded-xl border p-4">
            <h3 className="font-semibold mb-3 flex items-center gap-2">
              <Store size={18} /> Store Overview
            </h3>
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div>
                <span className="text-gray-500">Products:</span>{' '}
                <span className="font-medium">{inv.totalProducts || 0}</span>
              </div>
              <div>
                <span className="text-gray-500">Variants:</span>{' '}
                <span className="font-medium">{inv.totalVariants || 0}</span>
              </div>
              <div>
                <span className="text-gray-500">Suppliers:</span>{' '}
                <span className="font-medium">{pur.supplierCount || 0}</span>
              </div>
              <div>
                <span className="text-gray-500">Pending Payments:</span>{' '}
                <span className="font-medium">{pur.pendingPayments || 0}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
