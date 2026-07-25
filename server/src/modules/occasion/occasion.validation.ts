import { z } from 'zod';

export const createOccasionSchema = z.object({
  body: z.object({
    name: z.string({ required_error: 'Occasion name is required' }).min(1, 'Occasion name cannot be empty'),
    description: z.string().optional(),
    storeId: z.string().uuid().optional(),
  }),
});

export const updateOccasionSchema = z.object({
  body: z.object({
    name: z.string().min(1).optional(),
    description: z.string().optional(),
  }),
  params: z.object({
    id: z.string({ required_error: 'Occasion ID is required' }),
  }),
});
