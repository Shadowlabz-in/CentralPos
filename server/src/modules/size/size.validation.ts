import { z } from 'zod';

export const createSizeSchema = z.object({
  body: z.object({
    name: z.string({ required_error: 'Size name is required' }).min(1),
    sortOrder: z.number().int().optional(),
    storeId: z.string().uuid().optional(),
  }),
});

export const updateSizeSchema = z.object({
  body: z.object({
    name: z.string().min(1).optional(),
    sortOrder: z.number().int().optional(),
  }),
  params: z.object({
    id: z.string({ required_error: 'Size ID is required' }),
  }),
});
