import { z } from 'zod';

export const createReturnSchema = z.object({
  body: z.object({
    saleId: z.string({ required_error: 'Sale ID is required' }),
    returnDate: z.string().optional(),
    reason: z.string().optional(),
    items: z
      .array(
        z.object({
          saleItemId: z.string({ required_error: 'Sale item ID is required' }),
          productVariantId: z.string({ required_error: 'Product variant ID is required' }),
          quantity: z.coerce.number().int().positive('Quantity must be positive'),
          unitPrice: z.coerce.number().nonnegative().optional(),
          reason: z.string().optional(),
          condition: z.enum(['RESELLABLE', 'DAMAGED', 'DEFECTIVE']).default('RESELLABLE'),
          isResellable: z.boolean().default(true),
        }),
      )
      .min(1, 'At least one item is required'),
    refundMethod: z.enum(['CASH', 'UPI', 'CARD', 'BANK_TRANSFER', 'STORE_CREDIT']).optional(),
    refundAmount: z.coerce.number().nonnegative().optional(),
  }),
});

export const exchangeSchema = z.object({
  body: z.object({
    saleId: z.string({ required_error: 'Original sale ID is required' }),
    returnItems: z
      .array(
        z.object({
          saleItemId: z.string({ required_error: 'Sale item ID is required' }),
          productVariantId: z.string({ required_error: 'Product variant ID is required' }),
          quantity: z.coerce.number().int().positive(),
          condition: z.enum(['RESELLABLE', 'DAMAGED', 'DEFECTIVE']).default('RESELLABLE'),
        }),
      )
      .min(1, 'At least one return item is required'),
    exchangeItems: z
      .array(
        z.object({
          productVariantId: z.string({ required_error: 'Exchange product variant ID is required' }),
          quantity: z.coerce.number().int().positive(),
          unitPrice: z.coerce.number().nonnegative(),
        }),
      )
      .min(1, 'At least one exchange item is required'),
    additionalPayments: z
      .array(
        z.object({
          mode: z.enum(['CASH', 'UPI', 'CARD', 'BANK_TRANSFER']),
          amount: z.coerce.number().positive(),
        }),
      )
      .optional()
      .default([]),
    customerId: z.string().optional().nullable(),
  }),
});

export const refundSchema = z.object({
  body: z.object({
    salesReturnId: z.string({ required_error: 'Sales return ID is required' }),
    refundMethod: z.enum(['CASH', 'UPI', 'CARD', 'BANK_TRANSFER']),
    refundAmount: z.coerce.number().positive('Refund amount must be positive'),
  }),
});

export const createCreditNoteSchema = z.object({
  body: z.object({
    customerId: z.string().optional().nullable(),
    salesReturnId: z.string().optional().nullable(),
    originalSaleId: z.string().optional().nullable(),
    amount: z.coerce.number().positive('Amount must be positive'),
    expiryDate: z.string().optional().nullable(),
    notes: z.string().optional(),
  }),
});

export const redeemCreditNoteSchema = z.object({
  body: z.object({
    creditNoteId: z.string({ required_error: 'Credit note ID is required' }),
    saleId: z.string({ required_error: 'Sale ID is required' }),
    amount: z.coerce.number().positive('Redemption amount must be positive'),
  }),
});
