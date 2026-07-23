import { useCallback } from 'react';
import { useQuery, keepPreviousData } from '@tanstack/react-query';
import { useSearchParams } from 'react-router-dom';
import { History } from 'lucide-react';
import { apiRequest } from '@/context/AuthContext';
import { StockMovement, PaginationMeta } from '@/types';
import { Table } from '@/components/ui/Table';
import { SearchInput } from '@/components/ui/SearchInput';
import { Select } from '@/components/ui/Select';
import { Pagination } from '@/components/ui/Pagination';
import { Badge } from '@/components/ui/Badge';
import { Spinner } from '@/components/ui/Spinner';
import Input from '@/components/ui/Input';

const MOVEMENT_TYPES = [
  { value: 'PURCHASE', label: 'Purchase' },
  { value: 'SALE', label: 'Sale' },
  { value: 'RETURN', label: 'Return' },
  { value: 'DAMAGE', label: 'Damage' },
  { value: 'ADJUSTMENT', label: 'Adjustment' },
  { value: 'OPENING_STOCK', label: 'Opening Stock' },
];

const movementTypeVariant: Record<string, 'success' | 'warning' | 'danger' | 'info' | 'default'> = {
  PURCHASE: 'success',
  SALE: 'danger',
  RETURN: 'info',
  DAMAGE: 'warning',
  ADJUSTMENT: 'default',
  OPENING_STOCK: 'info',
};

export default function StockHistoryPage() {
  const [searchParams, setSearchParams] = useSearchParams();

  const page = parseInt(searchParams.get('page') || '1', 10);
  const limit = 20;
  const variantSearch = searchParams.get('variantSearch') || '';
  const type = searchParams.get('type') || '';
  const fromDate = searchParams.get('fromDate') || '';
  const toDate = searchParams.get('toDate') || '';

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

  const queryParams = new URLSearchParams();
  queryParams.set('page', String(page));
  queryParams.set('limit', String(limit));
  if (variantSearch) queryParams.set('variantSearch', variantSearch);
  if (type) queryParams.set('type', type);
  if (fromDate) queryParams.set('fromDate', fromDate);
  if (toDate) queryParams.set('toDate', toDate);

  const { data, isLoading } = useQuery({
    queryKey: ['stock-history', page, limit, variantSearch, type, fromDate, toDate],
    queryFn: () =>
      apiRequest<{ data: StockMovement[]; meta: PaginationMeta }>(
        `/inventory/history?${queryParams.toString()}`,
      ),
    placeholderData: keepPreviousData,
  });

  const movements = data?.data || [];
  const meta = data?.meta || { total: 0, page: 1, limit: 20, totalPages: 0 };

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <History size={24} /> Stock Movement History
        </h1>
        <p className="text-gray-500">Track all stock changes</p>
      </div>

      <div className="flex flex-wrap gap-3 items-end">
        <div className="w-56">
          <SearchInput
            value={variantSearch}
            onChange={(val) => updateParam('variantSearch', val)}
            placeholder="Search variant..."
          />
        </div>
        <Select
          value={type}
          onChange={(e) => updateParam('type', e.target.value)}
          options={MOVEMENT_TYPES}
          placeholder="All Types"
        />
        <div>
          <Input
            type="date"
            value={fromDate}
            onChange={(e) => updateParam('fromDate', e.target.value)}
            placeholder="From"
          />
        </div>
        <div>
          <Input
            type="date"
            value={toDate}
            onChange={(e) => updateParam('toDate', e.target.value)}
            placeholder="To"
          />
        </div>
      </div>

      {isLoading ? (
        <Spinner />
      ) : (
        <>
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
                key: 'variant',
                header: 'Product',
                render: (m: StockMovement) => (m.variant ? `${m.variant.product.name}` : '-'),
              },
              {
                key: 'variantInfo',
                header: 'Variant',
                render: (m: StockMovement) =>
                  m.variant
                    ? `${m.variant.sku}${m.variant.size ? ` / ${m.variant.size}` : ''}${m.variant.color ? ` / ${m.variant.color}` : ''}`
                    : '-',
              },
              { key: 'previousStock', header: 'Previous' },
              {
                key: 'quantity',
                header: 'Change',
                render: (m: StockMovement) => (
                  <span
                    className={`font-medium ${m.quantity > 0 ? 'text-green-600' : 'text-red-600'}`}
                  >
                    {m.quantity > 0 ? '+' : ''}
                    {m.quantity}
                  </span>
                ),
              },
              { key: 'newStock', header: 'New Qty' },
              {
                key: 'type',
                header: 'Type',
                render: (m: StockMovement) => (
                  <Badge variant={movementTypeVariant[m.type] || 'default'}>{m.type}</Badge>
                ),
              },
              {
                key: 'adjustmentReason',
                header: 'Reason',
                render: (m: StockMovement) => m.adjustmentReason || '-',
              },
              {
                key: 'createdBy',
                header: 'User',
                render: (m: StockMovement) =>
                  m.createdBy
                    ? `${m.createdBy.firstName} ${m.createdBy.lastName || ''}`.trim()
                    : '-',
              },
            ]}
            data={movements}
            keyExtractor={(m) => m.id}
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
