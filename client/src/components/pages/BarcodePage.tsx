import { useState, useCallback, useEffect } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { Barcode, Printer, RefreshCw } from 'lucide-react';
import { apiRequest } from '@/context/AuthContext';
import type { ApiResponse } from '@/types';
import { Button } from '@/components/ui/button';
import { SearchInput } from '@/components/ui/SearchInput';
import { Table } from '@/components/ui/Table';
import { PageSpinner } from '@/components/ui/Spinner';

const API_BASE = import.meta.env.VITE_API_URL || '/api';

function getBarcodeImageUrl(path?: string | null): string | null {
  if (!path) return null;
  if (path.startsWith('http')) return path;
  const base = API_BASE.replace(/\/api$/, '');
  return `${base}${path}`;
}

interface VariantItem {
  variantId: string;
  productName: string;
  sku: string;
  barcode: string;
  size?: string | null;
  color?: string | null;
  barcodeImagePath?: string | null;
}

export default function BarcodePage() {
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [selectedVariant, setSelectedVariant] = useState<VariantItem | null>(null);
  const [barcodeImages, setBarcodeImages] = useState<Record<string, string>>({});
  const [generatingAll, setGeneratingAll] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(search), 400);
    return () => clearTimeout(timer);
  }, [search]);

  const {
    data: variants,
    isLoading,
    error,
  } = useQuery({
    queryKey: ['inventory-variants', debouncedSearch],
    queryFn: async () => {
      const res = await apiRequest<ApiResponse<VariantItem[]>>(
        `/inventory/current?search=${encodeURIComponent(debouncedSearch)}&limit=50`,
      );
      return res.data;
    },
  });

  const generateMutation = useMutation({
    mutationFn: async (variantId: string) => {
      const res = await apiRequest<{ data: { barcodeImagePath: string; barcode: string } }>(
        `/barcodes/regenerate/${variantId}`,
        { method: 'POST' },
      );
      return { variantId, ...res.data };
    },
    onSuccess: (data) => {
      setBarcodeImages((prev) => ({ ...prev, [data.variantId]: data.barcodeImagePath }));
      setSelectedVariant((prev) =>
        prev?.variantId === data.variantId
          ? { ...prev, barcodeImagePath: data.barcodeImagePath }
          : prev,
      );
    },
  });

  const handlePrint = useCallback(async (variantId: string) => {
    try {
      const res = await apiRequest<{ data: { imageUrl: string } }>(`/barcodes/print/${variantId}`);
      const imageUrl = res.data.imageUrl;
      const printWindow = window.open(imageUrl, '_blank');
      if (printWindow) {
        printWindow.onload = () => printWindow.print();
      }
    } catch {
      // silent
    }
  }, []);

  const handleGenerateAll = useCallback(async () => {
    if (!variants) return;
    const needsBarcode = variants.filter((v) => !v.barcodeImagePath && !barcodeImages[v.variantId]);
    if (needsBarcode.length === 0) return;

    setGeneratingAll(true);
    try {
      for (const v of needsBarcode) {
        const res = await apiRequest<{ data: { barcodeImagePath: string; barcode: string } }>(
          `/barcodes/regenerate/${v.variantId}`,
          { method: 'POST' },
        );
        setBarcodeImages((prev) => ({ ...prev, [v.variantId]: res.data.barcodeImagePath }));
      }
    } finally {
      setGeneratingAll(false);
    }
  }, [variants, barcodeImages]);

  function getBarcodePath(v: VariantItem): string | null | undefined {
    return barcodeImages[v.variantId] ?? v.barcodeImagePath;
  }

  const needsBarcodeCount = variants
    ? variants.filter((v) => !v.barcodeImagePath && !barcodeImages[v.variantId]).length
    : 0;

  const columns = [
    {
      key: 'productName',
      header: 'Product Name',
      render: (item: VariantItem) => (
        <span className="font-medium text-gray-900">{item.productName}</span>
      ),
    },
    {
      key: 'sku',
      header: 'SKU',
      render: (item: VariantItem) => (
        <span className="text-gray-600 font-mono text-xs">{item.sku}</span>
      ),
    },
    {
      key: 'barcode',
      header: 'Barcode',
      render: (item: VariantItem) => (
        <span className="text-gray-600 font-mono text-xs">{item.barcode || '-'}</span>
      ),
    },
    {
      key: 'size',
      header: 'Size',
      render: (item: VariantItem) => item.size || '-',
    },
    {
      key: 'color',
      header: 'Color',
      render: (item: VariantItem) =>
        item.color ? (
          <span className="flex items-center gap-1">
            <span
              className="inline-block w-3 h-3 rounded-full border"
              style={{ backgroundColor: item.color.toLowerCase() }}
            />
            {item.color}
          </span>
        ) : (
          '-'
        ),
    },
    {
      key: 'barcodeImage',
      header: 'Barcode',
      render: (item: VariantItem) => {
        const path = getBarcodePath(item);
        const url = getBarcodeImageUrl(path);
        if (url) {
          return <img src={url} alt="Barcode" className="h-8 w-24 object-contain" />;
        }
        return <span className="text-gray-400">-</span>;
      },
    },
    {
      key: 'actions',
      header: 'Actions',
      render: (item: VariantItem) => (
        <div className="flex items-center gap-1">
          <button
            onClick={(e) => {
              e.stopPropagation();
              handlePrint(item.variantId);
            }}
            className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-500 hover:text-blue-600"
            title="Print barcode"
          >
            <Printer size={14} />
          </button>
          {!getBarcodePath(item) && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                generateMutation.mutate(item.variantId);
              }}
              disabled={generateMutation.isPending && generateMutation.variables === item.variantId}
              className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-500 hover:text-green-600"
              title="Generate barcode"
            >
              <RefreshCw
                size={14}
                className={
                  generateMutation.isPending && generateMutation.variables === item.variantId
                    ? 'animate-spin'
                    : ''
                }
              />
            </button>
          )}
        </div>
      ),
    },
  ];

  if (isLoading) return <PageSpinner />;
  if (error) return <p className="text-red-500 p-4">Failed to load variants</p>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Barcode Management</h1>
          <p className="text-gray-500">Generate, preview, and print barcode labels</p>
        </div>
        {needsBarcodeCount > 0 && (
          <Button onClick={handleGenerateAll} disabled={generatingAll}>
            <RefreshCw size={16} className={`mr-1.5 ${generatingAll ? 'animate-spin' : ''}`} />
            Generate All ({needsBarcodeCount})
          </Button>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-4">
          <div className="w-full max-w-sm">
            <SearchInput
              value={search}
              onChange={setSearch}
              placeholder="Search by name, SKU, or barcode..."
            />
          </div>

          <div className="bg-white rounded-xl border">
            <Table<VariantItem>
              columns={columns}
              data={variants || []}
              keyExtractor={(item) => item.variantId}
              onRowClick={(item) => setSelectedVariant(item)}
              emptyMessage={
                debouncedSearch
                  ? 'No variants match your search'
                  : 'Start typing to search for variants'
              }
            />
          </div>
        </div>

        <div className="lg:col-span-1">
          <div className="bg-white rounded-xl border p-6 sticky top-6">
            <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <Barcode size={20} />
              Barcode Preview
            </h2>

            {selectedVariant ? (
              <div className="space-y-4">
                <div className="text-sm space-y-1">
                  <p>
                    <span className="text-gray-500">Product:</span>{' '}
                    <span className="font-medium">{selectedVariant.productName}</span>
                  </p>
                  <p>
                    <span className="text-gray-500">SKU:</span>{' '}
                    <span className="font-mono text-xs">{selectedVariant.sku}</span>
                  </p>
                  <p>
                    <span className="text-gray-500">Barcode:</span>{' '}
                    <span className="font-mono text-xs">{selectedVariant.barcode || '-'}</span>
                  </p>
                  {(selectedVariant.size || selectedVariant.color) && (
                    <p>
                      <span className="text-gray-500">Variant:</span>{' '}
                      {[selectedVariant.size, selectedVariant.color].filter(Boolean).join(' / ')}
                    </p>
                  )}
                </div>

                <div className="border-2 border-dashed border-gray-200 rounded-lg p-6 flex flex-col items-center justify-center min-h-[200px]">
                  {(() => {
                    const path = getBarcodePath(selectedVariant);
                    const url = getBarcodeImageUrl(path);
                    if (url) {
                      return (
                        <div className="bg-white border rounded-lg p-4 shadow-sm flex flex-col items-center">
                          <img
                            src={url}
                            alt={`Barcode for ${selectedVariant.sku}`}
                            className="max-w-full h-auto"
                          />
                          <p className="text-xs text-gray-400 mt-2 font-mono">
                            {selectedVariant.barcode}
                          </p>
                        </div>
                      );
                    }
                    return (
                      <div className="flex flex-col items-center gap-3 text-gray-400">
                        <Barcode size={48} />
                        <p className="text-sm">No barcode image yet</p>
                        <Button
                          size="sm"
                          onClick={() => generateMutation.mutate(selectedVariant.variantId)}
                          disabled={generateMutation.isPending}
                        >
                          {generateMutation.isPending ? (
                            <>
                              <RefreshCw size={14} className="mr-1.5 animate-spin" />
                              Generating...
                            </>
                          ) : (
                            <>
                              <RefreshCw size={14} className="mr-1.5" />
                              Generate Barcode
                            </>
                          )}
                        </Button>
                      </div>
                    );
                  })()}
                </div>

                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handlePrint(selectedVariant.variantId)}
                    className="flex-1"
                  >
                    <Printer size={14} className="mr-1.5" />
                    Print
                  </Button>
                  {!getBarcodePath(selectedVariant) && (
                    <Button
                      size="sm"
                      onClick={() => generateMutation.mutate(selectedVariant.variantId)}
                      disabled={generateMutation.isPending}
                      className="flex-1"
                    >
                      <RefreshCw
                        size={14}
                        className={`mr-1.5 ${generateMutation.isPending ? 'animate-spin' : ''}`}
                      />
                      Generate
                    </Button>
                  )}
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-12 text-gray-400">
                <Barcode size={48} className="mb-3" />
                <p className="text-sm">Select a variant from the list</p>
                <p className="text-xs mt-1">to preview its barcode</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
