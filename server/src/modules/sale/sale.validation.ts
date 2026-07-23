import { z } from 'zod';

export const addToCartSchema = z.object({
  body: z.object({
    productVariantId: z.string({ required_error: 'Product variant ID is required' }),
    quantity: z.coerce.number().int().positive('Quantity must be positive').default(1),
  }),
});

export const updateCartItemSchema = z.object({
  body: z.object({
    productVariantId: z.string({ required_error: 'Product variant ID is required' }),
    quantity: z.coerce.number().int().nonnegative('Quantity cannot be negative'),
  }),
});

export const removeFromCartSchema = z.object({
  body: z.object({
    productVariantId: z.string({ required_error: 'Product variant ID is required' }),
  }),
});

export const checkoutSchema = z.object({
  body: z.object({
    customerId: z.string().optional().nullable(),
    isGst: z.boolean().default(true),
    discountAmount: z.coerce.number().nonnegative().default(0),
    notes: z.string().optional().nullable(),
    items: z
      .array(
        z.object({
          productVariantId: z.string({ required_error: 'Product variant ID is required' }),
          quantity: z.coerce.number().int().positive('Quantity must be positive'),
          unitPrice: z.coerce.number().nonnegative().default(0),
        }),
      )
      .min(1, 'At least one item is required'),
    payments: z
      .array(
        z.object({
          mode: z.enum(['CASH', 'UPI', 'CARD', 'BANK_TRANSFER']),
          amount: z.coerce.number().positive('Payment amount must be positive'),
          reference: z.string().optional().nullable(),
        }),
      )
      .min(1, 'At least one payment method is required'),
  }),
});

export const listSalesSchema = z.object({
  query: z.object({
    page: z.coerce.number().int().positive().default(1),
    limit: z.coerce.number().int().positive().max(100).default(10),
    fromDate: z.string().optional(),
    toDate: z.string().optional(),
    customerId: z.string().optional(),
  }),
});

export const cancelSaleSchema = z.object({
  params: z.object({
    id: z.string({ required_error: 'Sale ID is required' }),
  }),
});
