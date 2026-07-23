import { z } from 'zod';

export const createBrandSchema = z.object({
  body: z.object({
    name: z
      .string({ required_error: 'Brand name is required' })
      .min(1, 'Brand name cannot be empty'),
    description: z.string().optional(),
    storeId: z.string().uuid().optional(),
  }),
});

export const updateBrandSchema = z.object({
  body: z.object({
    name: z.string().min(1).optional(),
    description: z.string().optional(),
  }),
  params: z.object({
    id: z.string({ required_error: 'Brand ID is required' }),
  }),
});
