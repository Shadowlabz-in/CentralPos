import { z } from 'zod';

export const createHsnCodeSchema = z.object({
  body: z.object({
    code: z.string({ required_error: 'HSN code is required' }).min(1, 'HSN code cannot be empty'),
    description: z.string().optional(),
    storeId: z.string().uuid().optional(),
  }),
});

export const updateHsnCodeSchema = z.object({
  body: z.object({
    code: z.string().min(1).optional(),
    description: z.string().optional(),
  }),
  params: z.object({
    id: z.string({ required_error: 'HSN code ID is required' }),
  }),
});
