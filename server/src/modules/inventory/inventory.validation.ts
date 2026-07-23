import { z } from 'zod';

const adjustmentReasons = [
  'PHYSICAL_COUNT',
  'DAMAGE',
  'EXPIRED',
  'LOST',
  'CORRECTION',
  'MANUAL_ADJUSTMENT',
  'OPENING_STOCK',
  'SALE_CORRECTION',
  'RETURNED',
] as const;

export const adjustStockSchema = z.object({
  body: z.object({
    productVariantId: z
      .string({ required_error: 'Product variant ID is required' })
      .uuid('Invalid variant ID'),
    quantity: z.coerce
      .number({ required_error: 'Quantity is required' })
      .int('Quantity must be an integer')
      .refine((val) => val !== 0, { message: 'Quantity cannot be zero' }),
    reason: z.enum(adjustmentReasons, { required_error: 'Adjustment reason is required' }),
    notes: z.string().optional(),
  }),
});
