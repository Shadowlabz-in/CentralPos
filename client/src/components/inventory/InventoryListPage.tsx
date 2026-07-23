import { useState, useCallback } from 'react';
import { useQuery, keepPreviousData } from '@tanstack/react-query';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { apiRequest } from '@/context/AuthContext';
import { InventoryItem, Category, Brand, PaginationMeta } from '@/types';
import { Table } from '@/components/ui/Table';
import { SearchInput } from '@/components/ui/SearchInput';
import { Select } from '@/components/ui/Select';
import { Pagination } from '@/components/ui/Pagination';
import { Badge } from '@/components/ui/Badge';
import { Spinner } from '@/components/ui/Spinner';
import { Button } from '@/components/ui/button';
import StockAdjustDialog from './StockAdjustDialog';

export default function InventoryListPage() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  const page = parseInt(searchParams.get('page') || '1', 10);
  const limit = 20;
  const search = searchParams.get('search') || '';
  const categoryId = searchParams.get('categoryId') || '';
  const brandId = searchParams.get('brandId') || '';
  const lowStock = searchParams.get('lowStock') || '';
  const sortBy = searchParams.get('sortBy') || '';
  const sortOrder = (searchParams.get('sortOrder') as 'asc' | 'desc') || '';

  const [searchInput, setSearchInput] = useState(search);
  const [adjustDialogOpen, setAdjustDialogOpen] = useState(false);
  const [selectedVariantId, setSelectedVariantId] = useState<string | null>(null);

  const updateParam = useCallback(
    (key: string, value: string) => {
      const params = new URLSearchParams(searchParams);
      if (value) {
        params.set(key, value);
      } else {
        params.delete(key);
      }
      if (key !== 'page') params.set('page', '1');
      setSearchParams(params);
    },
    [searchParams, setSearchParams],
  );

  const handleSearch = useCallback(
    (val: string) => {
      setSearchInput(val);
      updateParam('search', val);
    },
    [updateParam],
  );

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
  if (search) queryParams.set('search', search);
  if (categoryId) queryParams.set('categoryId', categoryId);
  if (brandId) queryParams.set('brandId', brandId);
  if (lowStock) queryParams.set('lowStock', lowStock);
  if (sortBy) queryParams.set('sortBy', sortBy);
  if (sortOrder) queryParams.set('sortOrder', sortOrder);

  const { data: inventoryData, isLoading } = useQuery({
    queryKey: [
      'inventory-current',
      page,
      limit,
      search,
      categoryId,
      brandId,
      lowStock,
      sortBy,
      sortOrder,
    ],
    queryFn: () =>
      apiRequest<{ data: InventoryItem[]; meta: PaginationMeta }>(
        `/inventory/current?${queryParams.toString()}`,
      ),
    placeholderData: keepPreviousData,
  });

  const handleSort = useCallback(
    (key: string) => {
      if (sortBy === key) {
        updateParam('sortOrder', sortOrder === 'asc' ? 'desc' : 'asc');
      } else {
        const params = new URLSearchParams(searchParams);
        params.set('sortBy', key);
        params.set('sortOrder', 'asc');
        params.set('page', '1');
        setSearchParams(params);
      }
    },
    [sortBy, sortOrder, searchParams, setSearchParams, updateParam],
  );

  const items = inventoryData?.data || [];
  const meta = inventoryData?.meta || { total: 0, page: 1, limit: 20, totalPages: 0 };
  const categories = categoriesData?.data || [];
  const brands = brandsData?.data || [];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Inventory</h1>
          <p className="text-gray-500">Manage your product stock</p>
        </div>
        <Button onClick={() => setAdjustDialogOpen(true)}>Adjust Stock</Button>
      </div>

      <div className="flex flex-wrap gap-3 items-center">
        <div className="w-64">
          <SearchInput
            value={searchInput}
            onChange={handleSearch}
            placeholder="Search by name, SKU, barcode..."
          />
        </div>
        <Select
          value={categoryId}
          onChange={(e) => updateParam('categoryId', e.target.value)}
          options={categories.map((c: Category) => ({ value: c.id, label: c.name }))}
          placeholder="All Categories"
        />
        <Select
          value={brandId}
          onChange={(e) => updateParam('brandId', e.target.value)}
          options={brands.map((b: Brand) => ({ value: b.id, label: b.name }))}
          placeholder="All Brands"
        />
        <label className="flex items-center gap-2 text-sm cursor-pointer">
          <input
            type="checkbox"
            checked={lowStock === 'true'}
            onChange={(e) => updateParam('lowStock', e.target.checked ? 'true' : '')}
            className="rounded border-gray-300"
          />
          Low Stock Only
        </label>
      </div>

      {isLoading ? (
        <Spinner />
      ) : (
        <>
          <Table
            columns={[
              {
                key: 'productName',
                header: 'Product Name',
                sortable: true,
                render: (item: InventoryItem) => (
                  <span className="font-medium">{item.productName}</span>
                ),
              },
              { key: 'sku', header: 'SKU', sortable: true },
              { key: 'barcode', header: 'Barcode' },
              { key: 'size', header: 'Size', render: (item: InventoryItem) => item.size || '-' },
              { key: 'color', header: 'Color', render: (item: InventoryItem) => item.color || '-' },
              {
                key: 'stockQuantity',
                header: 'Stock',
                sortable: true,
                render: (item: InventoryItem) => {
                  if (item.stockQuantity === 0) return <Badge variant="danger">0</Badge>;
                  if (item.isLowStock) return <Badge variant="warning">{item.stockQuantity}</Badge>;
                  return item.stockQuantity;
                },
              },
              {
                key: 'reorderLevel',
                header: 'Reorder',
                render: (item: InventoryItem) => item.reorderLevel || '-',
              },
              {
                key: 'purchasePrice',
                header: 'Cost',
                render: (item: InventoryItem) => `₹${item.purchasePrice.toFixed(2)}`,
              },
              {
                key: 'sellingPrice',
                header: 'Price',
                render: (item: InventoryItem) => `₹${item.sellingPrice.toFixed(2)}`,
              },
              {
                key: 'isActive',
                header: 'Status',
                render: (item: InventoryItem) => (
                  <Badge variant={item.isActive ? 'success' : 'danger'}>
                    {item.isActive ? 'Active' : 'Inactive'}
                  </Badge>
                ),
              },
            ]}
            data={items}
            keyExtractor={(item) => item.variantId}
            onRowClick={(item) => navigate(`/inventory/${item.variantId}`)}
            sortBy={sortBy}
            sortOrder={sortOrder}
            onSort={handleSort}
          />
          <Pagination
            page={meta.page}
            totalPages={meta.totalPages}
            total={meta.total}
            onPageChange={(p) => updateParam('page', String(p))}
          />
        </>
      )}

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
