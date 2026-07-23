import { z } from 'zod';

export const createCategorySchema = z.object({
  body: z.object({
    name: z
      .string({ required_error: 'Category name is required' })
      .min(1, 'Category name cannot be empty'),
    description: z.string().optional(),
    parentId: z.string().uuid().optional(),
    storeId: z.string().uuid().optional(),
  }),
});

export const updateCategorySchema = z.object({
  body: z.object({
    name: z.string().min(1).optional(),
    description: z.string().optional(),
    parentId: z.string().uuid().nullable().optional(),
  }),
  params: z.object({
    id: z.string({ required_error: 'Category ID is required' }),
  }),
});
