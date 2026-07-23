import { z } from 'zod';

const paymentModes = ['CASH', 'UPI', 'CARD', 'BANK_TRANSFER'] as const;
const paymentStatuses = ['PENDING', 'PARTIAL', 'PAID'] as const;

const purchaseItemSchema = z.object({
  productVariantId: z
    .string({ required_error: 'Product variant ID is required' })
    .uuid('Invalid variant ID'),
  quantity: z.coerce
    .number({ required_error: 'Quantity is required' })
    .int('Quantity must be an integer')
    .positive('Quantity must be greater than 0'),
  unitCost: z.coerce
    .number({ required_error: 'Unit cost is required' })
    .positive('Unit cost must be greater than 0'),
  gstPercentage: z.coerce.number().min(0).max(100).default(0),
  discount: z.coerce.number().min(0).default(0),
});

export const createPurchaseSchema = z.object({
  body: z.object({
    supplierId: z.string({ required_error: 'Supplier ID is required' }).uuid('Invalid supplier ID'),
    invoiceNumber: z
      .string({ required_error: 'Invoice number is required' })
      .min(1, 'Invoice number cannot be empty'),
    invoiceDate: z.string().optional(),
    purchaseDate: z
      .string({ required_error: 'Purchase date is required' })
      .min(1, 'Purchase date is required'),
    paymentStatus: z.enum(paymentStatuses).default('PENDING'),
    paymentMode: z.enum(paymentModes).optional(),
    notes: z.string().optional(),
    items: z.array(purchaseItemSchema).min(1, 'At least one item is required'),
  }),
});

export const updatePurchaseSchema = z.object({
  body: z.object({
    invoiceNumber: z.string().min(1).optional(),
    paymentStatus: z.enum(paymentStatuses).optional(),
    paymentMode: z.enum(paymentModes).optional(),
    notes: z.string().optional(),
  }),
  params: z.object({
    id: z.string({ required_error: 'Purchase ID is required' }),
  }),
});

export const listPurchaseSchema = z.object({
  query: z.object({
    page: z.coerce.number().int().positive().default(1),
    limit: z.coerce.number().int().positive().max(100).default(10),
    search: z.string().optional(),
    supplierId: z.string().uuid().optional(),
    status: z.enum(['DRAFT', 'PENDING', 'ORDERED', 'RECEIVED', 'CANCELLED']).optional(),
    paymentStatus: z.enum(paymentStatuses).optional(),
    fromDate: z.string().optional(),
    toDate: z.string().optional(),
    sortBy: z.enum(['createdAt', 'purchaseDate', 'grandTotal']).optional().default('createdAt'),
    sortOrder: z.enum(['asc', 'desc']).optional().default('desc'),
  }),
});
