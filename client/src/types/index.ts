export interface Category {
  id: string;
  name: string;
  slug: string;
  description?: string | null;
  parentId?: string | null;
  parent?: { id: string; name: string; slug: string } | null;
  children?: { id: string; name: string; slug: string }[];
  productCount?: number;
  childCount?: number;
  storeId?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Brand {
  id: string;
  name: string;
  slug: string;
  description?: string | null;
  productCount?: number;
  storeId?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Product {
  id: string;
  name: string;
  slug: string;
  description?: string | null;
  tags: string[];
  categoryId: string;
  brandId?: string | null;
  isActive: boolean;
  category?: Category;
  brand?: Brand;
  images: ProductImage[];
  variants: ProductVariant[];
  createdAt: string;
  updatedAt: string;
}

export interface ProductImage {
  id: string;
  productId: string;
  url: string;
  alt?: string | null;
  isPrimary: boolean;
  sortOrder: number;
}

export interface ProductVariant {
  id: string;
  productId: string;
  sku: string;
  barcode: string;
  size?: string | null;
  color?: string | null;
  fabric?: string | null;
  rackLocation?: string | null;
  purchasePrice: number;
  sellingPrice: number;
  gstPercentage: string;
  stockQuantity: number;
  reorderLevel: number;
  isActive: boolean;
  barcodeImagePath?: string | null;
  product?: {
    id: string;
    name: string;
    slug: string;
    category?: { id: string; name: string };
    brand?: { id: string; name: string };
  };
  storeId?: string;
}

export interface InventoryItem {
  variantId: string;
  sku: string;
  barcode: string;
  size?: string | null;
  color?: string | null;
  productName: string;
  category?: { id: string; name: string } | null;
  brand?: { id: string; name: string } | null;
  stockQuantity: number;
  reorderLevel: number;
  purchasePrice: number;
  sellingPrice: number;
  isLowStock: boolean;
  isActive: boolean;
}

export interface StockMovement {
  id: string;
  productVariantId: string;
  variant?: {
    id: string;
    sku: string;
    size?: string | null;
    color?: string | null;
    product: { id: string; name: string };
  };
  quantity: number;
  type: StockMovementType;
  previousStock: number;
  newStock: number;
  adjustmentReason?: string | null;
  notes?: string | null;
  createdBy: { id: string; firstName: string; lastName: string };
  createdAt: string;
}

export type StockMovementType =
  'PURCHASE' | 'SALE' | 'RETURN' | 'DAMAGE' | 'ADJUSTMENT' | 'OPENING_STOCK';

export type AdjustmentReason =
  | 'PHYSICAL_COUNT'
  | 'DAMAGE'
  | 'EXPIRED'
  | 'LOST'
  | 'CORRECTION'
  | 'MANUAL_ADJUSTMENT'
  | 'OPENING_STOCK'
  | 'SALE_CORRECTION'
  | 'RETURNED';

export interface Supplier {
  id: string;
  name: string;
  contactPerson?: string | null;
  email?: string | null;
  phone?: string | null;
  address?: string | null;
  city?: string | null;
  state?: string | null;
  pincode?: string | null;
  gstin?: string | null;
  isActive: boolean;
  purchaseCount?: number;
  storeId?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Purchase {
  id: string;
  invoiceNumber: string;
  supplierId: string;
  supplier?: Supplier;
  purchaseDate: string;
  subtotal: number;
  discountAmount: number;
  taxAmount: number;
  grandTotal: number;
  status: PurchaseStatus;
  paymentStatus: PaymentStatus;
  paymentMode?: string | null;
  notes?: string | null;
  items: PurchaseItem[];
  createdBy?: { id: string; firstName: string; lastName: string };
  storeId: string;
  createdAt: string;
  updatedAt: string;
}

export interface PurchaseItem {
  id: string;
  purchaseId: string;
  productVariantId: string;
  variant?: ProductVariant;
  quantity: number;
  unitCost: number;
  totalCost: number;
}

export type PurchaseStatus = 'DRAFT' | 'PENDING' | 'ORDERED' | 'RECEIVED' | 'CANCELLED';
export type PaymentStatus = 'PENDING' | 'PARTIAL' | 'PAID';

export interface ApiResponse<T> {
  status: 'success' | 'error';
  message?: string;
  data: T;
  meta?: PaginationMeta;
  count?: number;
}

export interface PaginationMeta {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName?: string | null;
  phone?: string | null;
  roles: string[];
  isActive: boolean;
  storeId?: string;
}
