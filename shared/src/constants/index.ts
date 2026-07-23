export const API_VERSION = 'v1';

export const GST_RATES = {
  GST_0: 0,
  GST_5: 5,
  GST_12: 12,
  GST_18: 18,
  GST_28: 28,
} as const;

export const PAYMENT_MODES = ['CASH', 'UPI', 'CARD', 'BANK_TRANSFER'] as const;

export const STOCK_MOVEMENT_TYPES = ['PURCHASE', 'SALE', 'RETURN', 'DAMAGE', 'ADJUSTMENT'] as const;

export const PURCHASE_STATUSES = ['DRAFT', 'PENDING', 'ORDERED', 'RECEIVED', 'CANCELLED'] as const;

export const PAYMENT_STATUSES = ['PENDING', 'PARTIAL', 'PAID'] as const;

export const EXPENSE_CATEGORIES = [
  'RENT',
  'SALARY',
  'UTILITIES',
  'ELECTRICITY',
  'MAINTENANCE',
  'TRANSPORTATION',
  'MARKETING',
  'PACKAGING',
  'MISCELLANEOUS',
] as const;

export const BARCODE_TYPE = 'CODE128';
