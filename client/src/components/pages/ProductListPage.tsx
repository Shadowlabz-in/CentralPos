import { useState, useCallback } from 'react';
import { useQuery, keepPreviousData } from '@tanstack/react-query';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Plus } from 'lucide-react';
import { apiRequest } from '@/context/AuthContext';
import type { Product, Category, Brand, PaginationMeta } from '@/types';
import { Table } from '@/components/ui/Table';
import { SearchInput } from '@/components/ui/SearchInput';
import { Select } from '@/components/ui/Select';
import { Pagination } from '@/components/ui/Pagination';
import { Badge } from '@/components/ui/Badge';
import { Spinner } from '@/components/ui/Spinner';
import { Button } from '@/components/ui/button';

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('en-IN', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

export default function ProductListPage() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  const page = parseInt(searchParams.get('page') || '1', 10);
  const limit = 20;
  const search = searchParams.get('search') || '';
  const categoryId = searchParams.get('categoryId') || '';
  const brandId = searchParams.get('brandId') || '';
  const sortBy = searchParams.get('sortBy') || '';
  const sortOrder = (searchParams.get('sortOrder') as 'asc' | 'desc') || '';

  const [searchInput, setSearchInput] = useState(search);

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
  if (sortBy) queryParams.set('sortBy', sortBy);
  if (sortOrder) queryParams.set('sortOrder', sortOrder);

  const { data: productsData, isLoading } = useQuery({
    queryKey: ['products', page, limit, search, categoryId, brandId, sortBy, sortOrder],
    queryFn: () =>
      apiRequest<{ data: Product[]; meta: PaginationMeta }>(`/products?${queryParams.toString()}`),
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

  const products = productsData?.data || [];
  const meta = productsData?.meta || { total: 0, page: 1, limit: 20, totalPages: 0 };
  const categories = categoriesData?.data || [];
  const brands = brandsData?.data || [];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Products</h1>
          <p className="text-gray-500">Manage your product catalog</p>
        </div>
        <Button onClick={() => navigate('/inventory/products/new')}>
          <Plus size={16} className="mr-1" /> Create Product
        </Button>
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
      </div>

      {isLoading ? (
        <Spinner />
      ) : (
        <>
          <Table
            columns={[
              {
                key: 'name',
                header: 'Name',
                sortable: true,
                render: (item: Product) => <span className="font-medium">{item.name}</span>,
              },
              {
                key: 'category',
                header: 'Category',
                sortable: true,
                render: (item: Product) => <span>{item.category?.name || '-'}</span>,
              },
              {
                key: 'brand',
                header: 'Brand',
                sortable: true,
                render: (item: Product) => <span>{item.brand?.name || '-'}</span>,
              },
              {
                key: 'variants',
                header: 'Variants',
                render: (item: Product) => <Badge variant="info">{item.variants.length}</Badge>,
              },
              {
                key: 'isActive',
                header: 'Status',
                render: (item: Product) => (
                  <Badge variant={item.isActive ? 'success' : 'danger'}>
                    {item.isActive ? 'Active' : 'Inactive'}
                  </Badge>
                ),
              },
              {
                key: 'createdAt',
                header: 'Created',
                sortable: true,
                render: (item: Product) => (
                  <span className="text-gray-500">{formatDate(item.createdAt)}</span>
                ),
              },
            ]}
            data={products}
            keyExtractor={(item) => item.id}
            onRowClick={(item) => navigate(`/inventory/products/${item.id}/edit`)}
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
    </div>
  );
}
