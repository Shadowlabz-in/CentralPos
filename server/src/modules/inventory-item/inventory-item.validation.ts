import { z } from 'zod';

export const batchCreateSchema = z.object({
  body: z.object({
    variantId: z.string().uuid(),
    quantity: z.number().int().min(1).max(10000),
    serialNumbers: z.array(z.string()).optional(),
  }),
});

export const updateStatusSchema = z.object({
  body: z.object({
    status: z.enum(['AVAILABLE', 'SOLD', 'RETURNED', 'DAMAGED', 'RESERVED']),
    reason: z.string().optional(),
  }),
  params: z.object({
    id: z.string().uuid(),
  }),
});

export const printBarcodesSchema = z.object({
  body: z.object({
    ids: z.array(z.string().uuid()).min(1),
    labelWidth: z.number().int().positive().optional(),
    labelHeight: z.number().int().positive().optional(),
  }),
});

export const listQuerySchema = z.object({
  query: z.object({
    variantId: z.string().uuid().optional(),
    status: z.enum(['AVAILABLE', 'SOLD', 'RETURNED', 'DAMAGED', 'RESERVED']).optional(),
    search: z.string().optional(),
    page: z.coerce.number().int().positive().optional(),
    limit: z.coerce.number().int().positive().max(200).optional(),
  }),
});
