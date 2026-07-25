import { z } from 'zod';

export const createColorSchema = z.object({
  body: z.object({
    name: z.string({ required_error: 'Color name is required' }).min(1),
    hex: z.string().regex(/^#[0-9A-Fa-f]{6}$/, 'Must be a valid hex color').optional(),
    storeId: z.string().uuid().optional(),
  }),
});

export const updateColorSchema = z.object({
  body: z.object({
    name: z.string().min(1).optional(),
    hex: z.string().regex(/^#[0-9A-Fa-f]{6}$/, 'Must be a valid hex color').optional(),
  }),
  params: z.object({
    id: z.string({ required_error: 'Color ID is required' }),
  }),
});
