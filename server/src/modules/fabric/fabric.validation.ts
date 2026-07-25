import { z } from 'zod';

export const createFabricSchema = z.object({
  body: z.object({
    name: z.string({ required_error: 'Fabric name is required' }).min(1, 'Fabric name cannot be empty'),
    description: z.string().optional(),
    storeId: z.string().uuid().optional(),
  }),
});

export const updateFabricSchema = z.object({
  body: z.object({
    name: z.string().min(1).optional(),
    description: z.string().optional(),
  }),
  params: z.object({
    id: z.string({ required_error: 'Fabric ID is required' }),
  }),
});
