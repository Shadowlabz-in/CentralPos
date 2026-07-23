import { useState } from 'react';
import { useQuery, keepPreviousData } from '@tanstack/react-query';
import { AlertTriangle } from 'lucide-react';
import { apiRequest } from '@/context/AuthContext';
import { InventoryItem, Category, Brand, PaginationMeta } from '@/types';
import { Table } from '@/components/ui/Table';
import { Tabs } from '@/components/ui/Tabs';
import { Select } from '@/components/ui/Select';
import { SearchInput } from '@/components/ui/SearchInput';
import { Pagination } from '@/components/ui/Pagination';
import { Badge } from '@/components/ui/Badge';
import { Spinner } from '@/components/ui/Spinner';
import { Button } from '@/components/ui/button';
import StockAdjustDialog from './StockAdjustDialog';

export default function LowStockPage() {
  const [search, setSearch] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [brandId, setBrandId] = useState('');
  const [page, setPage] = useState(1);
  const [adjustDialogOpen, setAdjustDialogOpen] = useState(false);
  const [selectedVariantId, setSelectedVariantId] = useState<string | null>(null);
  const limit = 50;

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

  const queryParams = new URLSearchParams();
  queryParams.set('page', String(page));
  queryParams.set('limit', String(limit));
  queryParams.set('lowStock', 'true');
  if (search) queryParams.set('search', search);
  if (categoryId) queryParams.set('categoryId', categoryId);
  if (brandId) queryParams.set('brandId', brandId);

  const { data: lowStockData, isLoading } = useQuery({
    queryKey: ['low-stock-alerts', page, limit, search, categoryId, brandId],
    queryFn: () =>
      apiRequest<{ data: InventoryItem[]; meta: PaginationMeta }>(
        `/inventory/current?${queryParams.toString()}`,
      ),
    placeholderData: keepPreviousData,
  });

  const items = lowStockData?.data || [];
  const meta = lowStockData?.meta || { total: 0, page: 1, limit: 20, totalPages: 0 };
  const categories = categoriesData?.data || [];
  const brands = brandsData?.data || [];

  const handleAdjust = (variantId: string) => {
    setSelectedVariantId(variantId);
    setAdjustDialogOpen(true);
  };

  const tabs = [
    {
      id: 'low',
      label: `Low Stock (${items.filter((i) => i.stockQuantity > 0 && i.stockQuantity <= i.reorderLevel).length})`,
      content: (
        <>
          <Table
            columns={[
              {
                key: 'productName',
                header: 'Product Name',
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
                render: (item: InventoryItem) => (
                  <Badge variant="warning">{item.stockQuantity}</Badge>
                ),
              },
              {
                key: 'reorderLevel',
                header: 'Reorder Level',
                render: (item: InventoryItem) => item.reorderLevel,
              },
              {
                key: 'deficit',
                header: 'Deficit',
                render: (item: InventoryItem) => {
                  const deficit = item.reorderLevel - item.stockQuantity;
                  return (
                    <span className="font-medium text-red-600">{deficit > 0 ? deficit : 0}</span>
                  );
                },
              },
              {
                key: 'actions',
                header: 'Actions',
                render: (item: InventoryItem) => (
                  <Button
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleAdjust(item.variantId);
                    }}
                  >
                    Adjust Stock
                  </Button>
                ),
              },
            ]}
            data={items.filter((i) => i.stockQuantity > 0 && i.stockQuantity <= i.reorderLevel)}
            keyExtractor={(item) => item.variantId}
          />
          <Pagination
            page={meta.page}
            totalPages={meta.totalPages}
            total={meta.total}
            onPageChange={setPage}
          />
        </>
      ),
    },
    {
      id: 'out',
      label: `Out of Stock (${items.filter((i) => i.stockQuantity === 0).length})`,
      content: (
        <>
          <Table
            columns={[
              {
                key: 'productName',
                header: 'Product Name',
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
                render: () => <Badge variant="danger">0</Badge>,
              },
              {
                key: 'reorderLevel',
                header: 'Reorder Level',
                render: (item: InventoryItem) => item.reorderLevel,
              },
              {
                key: 'deficit',
                header: 'Deficit',
                render: (item: InventoryItem) => {
                  const deficit = item.reorderLevel - item.stockQuantity;
                  return (
                    <span className="font-medium text-red-600">{deficit > 0 ? deficit : 0}</span>
                  );
                },
              },
              {
                key: 'actions',
                header: 'Actions',
                render: (item: InventoryItem) => (
                  <Button
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleAdjust(item.variantId);
                    }}
                  >
                    Adjust Stock
                  </Button>
                ),
              },
            ]}
            data={items.filter((i) => i.stockQuantity === 0)}
            keyExtractor={(item) => item.variantId}
          />
          <Pagination
            page={meta.page}
            totalPages={meta.totalPages}
            total={meta.total}
            onPageChange={setPage}
          />
        </>
      ),
    },
  ];

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <AlertTriangle size={24} /> Stock Alerts
        </h1>
        <p className="text-gray-500">Items that need attention</p>
      </div>

      <div className="flex flex-wrap gap-3 items-center">
        <div className="w-56">
          <SearchInput value={search} onChange={setSearch} placeholder="Search products..." />
        </div>
        <Select
          value={categoryId}
          onChange={(e) => {
            setCategoryId(e.target.value);
            setPage(1);
          }}
          options={categories.map((c: Category) => ({ value: c.id, label: c.name }))}
          placeholder="All Categories"
        />
        <Select
          value={brandId}
          onChange={(e) => {
            setBrandId(e.target.value);
            setPage(1);
          }}
          options={brands.map((b: Brand) => ({ value: b.id, label: b.name }))}
          placeholder="All Brands"
        />
      </div>

      {isLoading ? <Spinner /> : <Tabs tabs={tabs} defaultTab="low" />}

      <StockAdjustDialog
        open={adjustDialogOpen}
        onClose={() => {
          setAdjustDialogOpen(false);
          setSelectedVariantId(null);
        }}
        onSuccess={() => {
          setAdjustDialogOpen(false);
          setSelectedVariantId(null);
        }}
        initialVariantId={selectedVariantId}
      />
    </div>
  );
}
