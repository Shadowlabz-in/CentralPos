import { useState, useEffect, useRef, useCallback } from 'react';
import { apiRequest, getAccessToken } from '@/hooks/useAuth';
import {
  Search,
  X,
  Plus,
  Minus,
  ShoppingCart,
  User,
  Printer,
  DollarSign,
  CreditCard,
  Smartphone,
  Banknote,
  Trash2,
  Check,
  AlertTriangle,
  Camera,
  ScanLine,
  CircleAlert,
} from 'lucide-react';

interface VariantResult {
  id: string;
  sku: string;
  barcode: string;
  size: string | null;
  color: string | null;
  sellingPrice: number | string;
  purchasePrice: number | string;
  stockQuantity: number;
  gstPercentage: string;
  reorderLevel: number;
  product: { id: string; name: string; slug: string };
}

interface CartItem {
  productVariantId: string;
  name: string;
  variant: string;
  sku: string;
  quantity: number;
  unitPrice: number;
  stockQuantity: number;
  gstPercentage: string;
}

interface Customer {
  id: string;
  name: string;
  phone: string | null;
  email: string | null;
  gstin: string | null;
}

interface PaymentEntry {
  mode: 'CASH' | 'UPI' | 'CARD' | 'BANK_TRANSFER';
  amount: number;
  reference: string;
}

function gstRateToNumber(rate: string): number {
  const map: Record<string, number> = { GST_0: 0, GST_5: 5, GST_12: 12, GST_18: 18, GST_28: 28 };
  return map[rate] ?? 0;
}

export default function POSPage() {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<VariantResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [customer, setCustomer] = useState<Customer | null>(null);
  const [customerSearch, setCustomerSearch] = useState('');
  const [customerResults, setCustomerResults] = useState<Customer[]>([]);
  const [showCustomerModal, setShowCustomerModal] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [scannerActive, setScannerActive] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const scanIntervalRef = useRef<number | null>(null);
  const [notification, setNotification] = useState<{
    message: string;
    type: 'error' | 'success' | 'info';
  } | null>(null);
  const notifTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const showToast = useCallback((message: string, type: 'error' | 'success' | 'info' = 'error') => {
    if (notifTimeoutRef.current) clearTimeout(notifTimeoutRef.current);
    setNotification({ message, type });
    notifTimeoutRef.current = setTimeout(() => setNotification(null), 4000);
  }, []);

  const [discountAmount, setDiscountAmount] = useState(0);
  const [isGst, setIsGst] = useState(true);
  const [payments, setPayments] = useState<PaymentEntry[]>([
    { mode: 'CASH', amount: 0, reference: '' },
  ]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [saleResult, setSaleResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const barcodeInputRef = useRef<HTMLInputElement>(null);

  // USB scanner detection: rapid keystrokes (< 50ms apart) = scanner input
  const scannerTimestampsRef = useRef<number[]>([]);
  const scannerBufferRef = useRef('');

  const handleBarcodeInput = useCallback((value: string) => {
    if (!value.trim()) return;
    triggerBarcodeSearch(value);
  }, []);

  const onBarcodeKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      const now = Date.now();
      const timestamps = scannerTimestampsRef.current;
      timestamps.push(now);
      if (timestamps.length > 20) timestamps.shift();

      scannerBufferRef.current = (e.target as HTMLInputElement).value;

      if (e.key === 'Enter') {
        const isScanner =
          timestamps.length >= 6 &&
          (timestamps[timestamps.length - 1] - timestamps[0]) / timestamps.length < 80;
        e.preventDefault();
        handleBarcodeInput(scannerBufferRef.current);
        if (!isScanner) {
          timestamps.length = 0;
        }
      }
    },
    [handleBarcodeInput],
  );

  const triggerBarcodeSearch = useCallback(
    async (value: string) => {
      if (!value.trim()) return;
      try {
        const res = await apiRequest<{ status: string; data: VariantResult }>(`/barcodes/${value}`);
        if (res.data) {
          if (res.data.stockQuantity <= 0) {
            showToast(`"${res.data.product.name}" is out of stock`, 'error');
            return;
          }
          addToCart(res.data);
          setSearchQuery('');
          barcodeInputRef.current?.focus();
        }
      } catch {
        setSearchQuery(value);
      }
    },
    [showToast],
  );

  const handleSearch = useCallback(async (q: string) => {
    setSearchQuery(q);
    if (!q.trim()) {
      setSearchResults([]);
      return;
    }
    setIsSearching(true);
    try {
      const res = await apiRequest<{ status: string; data: VariantResult[]; meta: any }>(
        `/inventory/current?search=${encodeURIComponent(q)}&limit=10`,
      );
      setSearchResults(res.data || []);
    } catch {
      setSearchResults([]);
    }
    setIsSearching(false);
  }, []);

  // Camera barcode scanner
  const startCameraScanner = useCallback(async () => {
    setCameraError(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment', width: { ideal: 640 }, height: { ideal: 480 } },
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }
      setScannerActive(true);

      if ('BarcodeDetector' in window) {
        const detector = new (window as any).BarcodeDetector({
          formats: [
            'code_128',
            'qr_code',
            'ean_13',
            'ean_8',
            'upc_a',
            'upc_e',
            'code_39',
            'code_93',
            'codabar',
            'itf',
            'data_matrix',
            'pdf417',
          ],
        });
        scanIntervalRef.current = window.setInterval(async () => {
          if (!videoRef.current) return;
          try {
            const barcodes = await detector.detect(videoRef.current);
            if (barcodes.length > 0) {
              const code = barcodes[0].rawValue;
              stopCameraScanner();
              triggerBarcodeSearch(code);
            }
          } catch {
            /* detection frame skip */
          }
        }, 300);
      } else {
        showToast(
          'Camera barcode scanning requires a Chromium-based browser. Use a USB scanner instead.',
          'info',
        );
      }
    } catch {
      setCameraError('Camera access denied. Use the search bar or USB scanner.');
      showToast('Camera access denied. Use the search bar or USB scanner.', 'error');
    }
  }, [triggerBarcodeSearch, showToast]);

  const stopCameraScanner = useCallback(() => {
    if (scanIntervalRef.current) {
      clearInterval(scanIntervalRef.current);
      scanIntervalRef.current = null;
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    setScannerActive(false);
    setCameraError(null);
  }, []);

  useEffect(() => {
    return () => {
      if (scanIntervalRef.current) clearInterval(scanIntervalRef.current);
      if (streamRef.current) streamRef.current.getTracks().forEach((t) => t.stop());
    };
  }, []);

  const addToCart = useCallback(
    (variant: VariantResult) => {
      const price = Number(variant.sellingPrice);
      setCart((prev) => {
        const existing = prev.find((i) => i.productVariantId === variant.id);
        if (existing) {
          return prev.map((i) =>
            i.productVariantId === variant.id ? { ...i, quantity: i.quantity + 1 } : i,
          );
        }
        return [
          ...prev,
          {
            productVariantId: variant.id,
            name: variant.product.name,
            variant: `${variant.size || ''}${variant.size && variant.color ? '/' : ''}${variant.color || ''}`,
            sku: variant.sku,
            quantity: 1,
            unitPrice: price,
            stockQuantity: variant.stockQuantity,
            gstPercentage: variant.gstPercentage,
          },
        ];
      });
      setSearchQuery('');
      setSearchResults([]);
      showToast(`${variant.product.name} added to cart`, 'success');
    },
    [showToast],
  );

  const updateQuantity = (id: string, delta: number) => {
    setCart((prev) =>
      prev.map((i) =>
        i.productVariantId === id ? { ...i, quantity: Math.max(1, i.quantity + delta) } : i,
      ),
    );
  };

  const removeItem = (id: string) => {
    setCart((prev) => prev.filter((i) => i.productVariantId !== id));
  };

  const clearCart = () => {
    if (cart.length === 0) return;
    if (window.confirm('Clear all items from cart?')) {
      setCart([]);
      setDiscountAmount(0);
      setError(null);
      setSaleResult(null);
    }
  };

  const searchCustomers = useCallback(async (q: string) => {
    setCustomerSearch(q);
    if (!q.trim()) {
      setCustomerResults([]);
      return;
    }
    try {
      const res = await apiRequest<{ status: string; data: Customer[] }>(
        `/customers?search=${encodeURIComponent(q)}&limit=5`,
      );
      setCustomerResults(res.data || []);
    } catch {
      setCustomerResults([]);
    }
  }, []);

  const selectCustomer = (c: Customer) => {
    setCustomer(c);
    setShowCustomerModal(false);
    setCustomerSearch('');
  };

  const subtotal = cart.reduce((sum, i) => sum + i.unitPrice * i.quantity, 0);
  const totalTax = isGst
    ? cart.reduce((sum, i) => {
        const gstPct = gstRateToNumber(i.gstPercentage);
        return sum + (i.unitPrice * i.quantity * gstPct) / 100;
      }, 0)
    : 0;
  const grandTotal = subtotal + totalTax - discountAmount;

  const handleCheckout = async () => {
    if (cart.length === 0) return;
    setError(null);
    setIsProcessing(true);
    try {
      const paymentTotal = payments.reduce((s, p) => s + p.amount, 0);
      if (Math.abs(paymentTotal - grandTotal) > 0.01) {
        throw new Error(
          `Payment total (₹${paymentTotal.toFixed(2)}) must equal grand total (₹${grandTotal.toFixed(2)})`,
        );
      }
      const result = await apiRequest<{ status: string; data: any }>('/sales/checkout', {
        method: 'POST',
        body: JSON.stringify({
          customerId: customer?.id || null,
          isGst,
          discountAmount,
          items: cart.map((i) => ({
            productVariantId: i.productVariantId,
            quantity: i.quantity,
            unitPrice: i.unitPrice,
          })),
          payments: payments
            .filter((p) => p.amount > 0)
            .map((p) => ({
              mode: p.mode,
              amount: p.amount,
              reference: p.reference || null,
            })),
        }),
      });
      setSaleResult(result.data);
      setCart([]);
      setDiscountAmount(0);
      setPayments([{ mode: 'CASH', amount: 0, reference: '' }]);
      setShowPaymentModal(false);
    } catch (err: any) {
      setError(err.message);
    }
    setIsProcessing(false);
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'F2') {
        e.preventDefault();
        barcodeInputRef.current?.focus();
      }
      if (e.key === 'F3') {
        e.preventDefault();
        scannerActive ? stopCameraScanner() : startCameraScanner();
      }
      if (e.key === 'F4') {
        e.preventDefault();
        setShowCustomerModal(true);
      }
      if (e.key === 'F8') {
        e.preventDefault();
        setShowPaymentModal(true);
      }
      if (e.key === 'F9') {
        e.preventDefault();
        handleCheckout();
      }
      if (e.key === 'Escape') {
        clearCart();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [cart, payments, customer, isGst, discountAmount, scannerActive]);

  useEffect(() => {
    barcodeInputRef.current?.focus();
  }, []);

  if (saleResult) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-6rem)]">
        <div className="bg-white rounded-xl shadow-lg p-8 max-w-md w-full text-center space-y-4">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto">
            <Check className="w-8 h-8 text-green-600" />
          </div>
          <h2 className="text-2xl font-bold">Sale Complete!</h2>
          <p className="text-gray-500">Invoice: {saleResult.invoiceNumber}</p>
          <p className="text-3xl font-bold">₹{Number(saleResult.grandTotal).toFixed(2)}</p>
          <div className="flex gap-3 justify-center">
            <button
              onClick={async () => {
                try {
                  const res = await fetch(`/api/sales/${saleResult.id}/invoice?format=html`, {
                    headers: { Authorization: `Bearer ${getAccessToken()}` },
                  });
                  const html = await res.text();
                  const w = window.open('', '_blank');
                  if (w) {
                    w.document.write(html);
                    w.document.close();
                  }
                } catch {}
              }}
              className="flex items-center gap-2 px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-800"
            >
              <Printer size={18} /> Print
            </button>
            <button
              onClick={async () => {
                try {
                  const res = await fetch(`/api/sales/${saleResult.id}/invoice?format=pdf`, {
                    headers: { Authorization: `Bearer ${getAccessToken()}` },
                  });
                  const blob = await res.blob();
                  const url = URL.createObjectURL(blob);
                  window.open(url, '_blank');
                } catch {}
              }}
              className="flex items-center gap-2 px-4 py-2 border rounded-lg hover:bg-gray-50"
            >
              <Printer size={18} /> PDF
            </button>
          </div>
          <button
            onClick={() => setSaleResult(null)}
            className="text-blue-600 hover:underline text-sm"
          >
            New Sale
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-[calc(100vh-6rem)] gap-4">
      {/* Notification Toast */}
      {notification && (
        <div
          className={`fixed top-4 right-4 z-50 flex items-center gap-2 px-4 py-3 rounded-lg shadow-lg text-sm font-medium transition-all ${
            notification.type === 'error'
              ? 'bg-red-600 text-white'
              : notification.type === 'success'
                ? 'bg-green-600 text-white'
                : 'bg-gray-800 text-white'
          }`}
        >
          {notification.type === 'error' ? (
            <CircleAlert size={16} />
          ) : notification.type === 'success' ? (
            <Check size={16} />
          ) : (
            <ScanLine size={16} />
          )}
          {notification.message}
        </div>
      )}

      {/* Left Panel - Search */}
      <div className="w-96 space-y-4 flex flex-col">
        <div className="bg-white rounded-xl shadow-sm border p-4 space-y-3">
          <h3 className="font-semibold text-sm text-gray-500 uppercase tracking-wider">
            Scan / Search
          </h3>
          <div className="relative">
            <input
              ref={barcodeInputRef}
              type="text"
              placeholder="Scan barcode or type to search..."
              className="w-full pl-10 pr-14 py-3 border-2 border-black rounded-lg text-lg focus:outline-none"
              value={searchQuery}
              onChange={(e) => handleSearch(e.target.value)}
              onKeyDown={onBarcodeKeyDown}
              autoFocus
            />
            <Search className="absolute left-3 top-3.5 text-gray-400" size={20} />
            <button
              type="button"
              onClick={scannerActive ? stopCameraScanner : startCameraScanner}
              title={scannerActive ? 'Stop camera scanner' : 'Scan barcode with camera'}
              className={`absolute right-2 top-2 p-1.5 rounded-lg transition-colors ${
                scannerActive
                  ? 'bg-blue-100 text-blue-600 animate-pulse'
                  : 'text-gray-400 hover:text-black hover:bg-gray-100'
              }`}
            >
              <Camera size={20} />
            </button>
          </div>
        </div>

        {/* Camera Scanner */}
        {scannerActive && (
          <div className="relative bg-black rounded-xl overflow-hidden border-2 border-blue-500">
            <video ref={videoRef} className="w-full h-48 object-cover" autoPlay muted playsInline />
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div className="w-3/4 h-1 bg-blue-400 opacity-50 rounded" />
            </div>
            <button
              onClick={stopCameraScanner}
              className="absolute top-2 right-2 bg-black/60 text-white p-1.5 rounded-lg hover:bg-black/80"
            >
              <X size={16} />
            </button>
            <p className="absolute bottom-2 left-2 text-white text-xs bg-black/50 px-2 py-1 rounded">
              Point camera at barcode
            </p>
          </div>
        )}
        {cameraError && (
          <div className="flex items-center gap-2 p-3 bg-red-50 text-red-700 rounded-lg text-sm">
            <CircleAlert size={16} />
            {cameraError}
          </div>
        )}

        {/* Search Results */}
        <div className="flex-1 overflow-y-auto space-y-2">
          {isSearching && <p className="text-gray-400 text-center py-4">Searching...</p>}
          {!isSearching && searchQuery && searchResults.length === 0 && (
            <p className="text-gray-400 text-center py-4">No products found</p>
          )}
          {searchResults.map((v) => (
            <button
              key={v.id}
              onClick={() => addToCart(v)}
              className="w-full bg-white rounded-lg shadow-sm border p-3 text-left hover:border-black transition-colors"
              disabled={v.stockQuantity <= 0}
            >
              <div className="flex justify-between items-start">
                <div>
                  <p className="font-medium">{v.product.name}</p>
                  <p className="text-sm text-gray-500">
                    {v.size || ''}
                    {v.size && v.color ? '/' : ''}
                    {v.color || ''} | {v.sku}
                  </p>
                </div>
                <p className="font-bold text-lg">₹{Number(v.sellingPrice).toFixed(0)}</p>
              </div>
              <div className="flex justify-between mt-1">
                <span
                  className={`text-xs ${v.stockQuantity <= (v.reorderLevel || 0) ? 'text-red-500' : 'text-gray-400'}`}
                >
                  Stock: {v.stockQuantity}
                </span>
                {v.stockQuantity <= 0 && (
                  <span className="text-xs text-red-500 font-medium">Out of Stock</span>
                )}
              </div>
            </button>
          ))}
        </div>

        <div className="text-xs text-gray-400 space-y-1 bg-gray-50 rounded-lg p-3">
          <p>
            <kbd className="bg-gray-200 px-1 rounded">F2</kbd> Search{' '}
            <kbd className="bg-gray-200 px-1 rounded ml-2">F3</kbd> Scan{' '}
            <kbd className="bg-gray-200 px-1 rounded ml-2">F4</kbd> Customer
          </p>
          <p>
            <kbd className="bg-gray-200 px-1 rounded">F8</kbd> Payment{' '}
            <kbd className="bg-gray-200 px-1 rounded ml-2">F9</kbd> Sale{' '}
            <kbd className="bg-gray-200 px-1 rounded ml-2">ESC</kbd> Clear
          </p>
        </div>
      </div>

      {/* Center - Cart */}
      <div className="flex-1 bg-white rounded-xl shadow-sm border flex flex-col">
        <div className="p-4 border-b flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ShoppingCart size={20} />
            <h2 className="font-bold text-lg">Cart</h2>
            <span className="text-sm text-gray-500">({cart.length} items)</span>
          </div>
          <button
            onClick={clearCart}
            className="text-sm text-red-500 hover:text-red-700 flex items-center gap-1"
          >
            <Trash2 size={14} /> Clear
          </button>
        </div>

        <div className="flex-1 overflow-y-auto">
          {cart.length === 0 ? (
            <div className="flex items-center justify-center h-full text-gray-400">
              <p>Scan or search products to add</p>
            </div>
          ) : (
            <div className="divide-y">
              {cart.map((item) => (
                <div key={item.productVariantId} className="p-4 hover:bg-gray-50">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <p className="font-medium">{item.name}</p>
                      <p className="text-sm text-gray-500">
                        {item.variant} | {item.sku}
                      </p>
                    </div>
                    <p className="font-bold text-lg">
                      ₹{(item.unitPrice * item.quantity).toFixed(0)}
                    </p>
                  </div>
                  <div className="flex items-center justify-between mt-2">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => updateQuantity(item.productVariantId, -1)}
                        className="w-8 h-8 rounded-full border flex items-center justify-center hover:bg-gray-100"
                      >
                        <Minus size={16} />
                      </button>
                      <span className="w-8 text-center font-medium">{item.quantity}</span>
                      <button
                        onClick={() => updateQuantity(item.productVariantId, 1)}
                        className="w-8 h-8 rounded-full border flex items-center justify-center hover:bg-gray-100"
                      >
                        <Plus size={16} />
                      </button>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-sm text-gray-400">₹{item.unitPrice} each</span>
                      <button
                        onClick={() => removeItem(item.productVariantId)}
                        className="text-red-400 hover:text-red-600"
                      >
                        <X size={18} />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Right Panel - Totals */}
      <div className="w-80 space-y-4">
        <div className="bg-white rounded-xl shadow-sm border p-4 space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-sm text-gray-500 uppercase tracking-wider">
              Customer
            </h3>
            <button
              onClick={() => setShowCustomerModal(true)}
              className="text-blue-600 text-sm hover:underline"
            >
              {customer ? 'Change' : 'Select'}
            </button>
          </div>
          {customer ? (
            <div className="flex items-center gap-2">
              <User size={16} className="text-gray-400" />
              <div>
                <p className="font-medium text-sm">{customer.name}</p>
                {customer.phone && <p className="text-xs text-gray-500">{customer.phone}</p>}
              </div>
            </div>
          ) : (
            <p className="text-sm text-gray-400">Walk-in Customer</p>
          )}
        </div>

        <div className="bg-white rounded-xl shadow-sm border p-4 space-y-3">
          <h3 className="font-semibold text-sm text-gray-500 uppercase tracking-wider">
            Invoice Type
          </h3>
          <div className="flex gap-2">
            <button
              onClick={() => setIsGst(true)}
              className={`flex-1 py-2 rounded-lg text-sm font-medium ${isGst ? 'bg-black text-white' : 'bg-gray-100'}`}
            >
              GST
            </button>
            <button
              onClick={() => setIsGst(false)}
              className={`flex-1 py-2 rounded-lg text-sm font-medium ${!isGst ? 'bg-black text-white' : 'bg-gray-100'}`}
            >
              Non-GST
            </button>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border p-4 space-y-3">
          <h3 className="font-semibold text-sm text-gray-500 uppercase tracking-wider">Totals</h3>
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Subtotal</span>
              <span>₹{subtotal.toFixed(2)}</span>
            </div>
            {discountAmount > 0 && (
              <div className="flex justify-between text-sm text-green-600">
                <span>Discount</span>
                <span>-₹{discountAmount.toFixed(2)}</span>
              </div>
            )}
            {isGst && (
              <div className="flex justify-between text-sm">
                <span>GST</span>
                <span>₹{totalTax.toFixed(2)}</span>
              </div>
            )}
            <div className="flex justify-between text-lg font-bold border-t pt-2">
              <span>Total</span>
              <span>₹{grandTotal.toFixed(2)}</span>
            </div>
          </div>

          <div>
            <label className="text-xs text-gray-500 mb-1 block">Discount (₹)</label>
            <input
              type="number"
              min="0"
              step="0.01"
              value={discountAmount}
              onChange={(e) => setDiscountAmount(Math.max(0, parseFloat(e.target.value) || 0))}
              className="w-full border rounded-lg px-3 py-2 text-sm"
            />
          </div>

          <button
            onClick={() => {
              if (cart.length === 0) return;
              const remaining = grandTotal;
              setPayments([{ mode: 'CASH', amount: remaining, reference: '' }]);
              setShowPaymentModal(true);
            }}
            disabled={cart.length === 0}
            className="w-full py-3 bg-black text-white rounded-lg font-semibold hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            <DollarSign size={18} /> Pay ₹{grandTotal.toFixed(2)}
          </button>
        </div>
      </div>

      {/* Customer Modal */}
      {showCustomerModal && (
        <div
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
          onClick={() => setShowCustomerModal(false)}
        >
          <div
            className="bg-white rounded-xl p-6 w-96 max-h-[80vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="font-bold text-lg mb-4">Select Customer</h3>
            <input
              type="text"
              placeholder="Search by name or phone..."
              className="w-full border rounded-lg px-3 py-2 mb-3"
              value={customerSearch}
              onChange={(e) => searchCustomers(e.target.value)}
              autoFocus
            />
            <div className="space-y-2 mb-4 max-h-60 overflow-y-auto">
              <button
                onClick={() => {
                  setCustomer(null);
                  setShowCustomerModal(false);
                }}
                className="w-full text-left p-3 rounded-lg hover:bg-gray-50 border"
              >
                Walk-in Customer
              </button>
              {customerResults.map((c) => (
                <button
                  key={c.id}
                  onClick={() => selectCustomer(c)}
                  className="w-full text-left p-3 rounded-lg hover:bg-gray-50 border"
                >
                  <p className="font-medium">{c.name}</p>
                  <p className="text-sm text-gray-500">{c.phone || c.email || ''}</p>
                </button>
              ))}
            </div>
            <button
              onClick={() => setShowCustomerModal(false)}
              className="text-sm text-gray-500 hover:underline"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Payment Modal */}
      {showPaymentModal && (
        <div
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
          onClick={() => setShowPaymentModal(false)}
        >
          <div
            className="bg-white rounded-xl p-6 w-[32rem] max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="font-bold text-lg mb-4">Payment</h3>
            <div className="text-center mb-6">
              <p className="text-sm text-gray-500">Total Amount</p>
              <p className="text-4xl font-bold">₹{grandTotal.toFixed(2)}</p>
            </div>

            {error && (
              <div className="flex items-center gap-2 p-3 bg-red-50 text-red-700 rounded-lg mb-4 text-sm">
                <AlertTriangle size={16} />
                {error}
              </div>
            )}

            <div className="space-y-3 mb-4">
              {payments.map((payment, idx) => (
                <div key={idx} className="border rounded-lg p-3 space-y-2">
                  <div className="flex gap-2">
                    {(['CASH', 'UPI', 'CARD', 'BANK_TRANSFER'] as const).map((mode) => (
                      <button
                        key={mode}
                        onClick={() => {
                          const newPayments = [...payments];
                          newPayments[idx].mode = mode;
                          setPayments(newPayments);
                        }}
                        className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-sm ${
                          payment.mode === mode ? 'bg-black text-white' : 'bg-gray-100'
                        }`}
                      >
                        {mode === 'CASH' && <Banknote size={14} />}
                        {mode === 'UPI' && <Smartphone size={14} />}
                        {mode === 'CARD' && <CreditCard size={14} />}
                        {mode === 'BANK_TRANSFER' && <CreditCard size={14} />}
                        {mode}
                      </button>
                    ))}
                    {payments.length > 1 && (
                      <button
                        onClick={() => setPayments(payments.filter((_, i) => i !== idx))}
                        className="text-red-500 hover:text-red-700"
                      >
                        <X size={18} />
                      </button>
                    )}
                  </div>
                  <div className="flex gap-2">
                    <input
                      type="number"
                      placeholder="Amount"
                      value={payment.amount || ''}
                      onChange={(e) => {
                        const newPayments = [...payments];
                        newPayments[idx].amount = parseFloat(e.target.value) || 0;
                        setPayments(newPayments);
                      }}
                      className="flex-1 border rounded-lg px-3 py-2 text-sm"
                    />
                    <input
                      type="text"
                      placeholder="Ref (optional)"
                      value={payment.reference}
                      onChange={(e) => {
                        const newPayments = [...payments];
                        newPayments[idx].reference = e.target.value;
                        setPayments(newPayments);
                      }}
                      className="flex-1 border rounded-lg px-3 py-2 text-sm"
                    />
                  </div>
                </div>
              ))}
            </div>

            <div className="flex gap-2 mb-6">
              <button
                onClick={() => {
                  const remaining = grandTotal - payments.reduce((s, p) => s + p.amount, 0);
                  if (remaining > 0.01) {
                    setPayments([
                      ...payments,
                      { mode: 'CASH', amount: Math.round(remaining * 100) / 100, reference: '' },
                    ]);
                  }
                }}
                className="text-sm text-blue-600 hover:underline"
              >
                + Add Split Payment
              </button>
            </div>

            <div className="flex justify-between text-sm mb-6">
              <span>Paid: ₹{payments.reduce((s, p) => s + p.amount, 0).toFixed(2)}</span>
              <span
                className={
                  Math.abs(payments.reduce((s, p) => s + p.amount, 0) - grandTotal) > 0.01
                    ? 'text-red-500'
                    : 'text-green-600'
                }
              >
                {Math.abs(payments.reduce((s, p) => s + p.amount, 0) - grandTotal) > 0.01
                  ? `Due: ₹${(grandTotal - payments.reduce((s, p) => s + p.amount, 0)).toFixed(2)}`
                  : 'Paid in Full'}
              </span>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setShowPaymentModal(false)}
                className="flex-1 py-3 border rounded-lg font-medium hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleCheckout}
                disabled={isProcessing || payments.reduce((s, p) => s + p.amount, 0) <= 0}
                className="flex-1 py-3 bg-black text-white rounded-lg font-semibold hover:bg-gray-800 disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {isProcessing ? (
                  'Processing...'
                ) : (
                  <>
                    <Check size={18} /> Complete Sale
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
