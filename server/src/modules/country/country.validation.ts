import { z } from 'zod';

export const createCountrySchema = z.object({
  body: z.object({
    name: z.string({ required_error: 'Country name is required' }).min(1, 'Country name cannot be empty'),
    code: z.string({ required_error: 'Country code is required' }).length(2, 'Country code must be 2 letters'),
    storeId: z.string().uuid().optional(),
  }),
});

export const updateCountrySchema = z.object({
  body: z.object({
    name: z.string().min(1).optional(),
    code: z.string().length(2).optional(),
  }),
  params: z.object({
    id: z.string({ required_error: 'Country ID is required' }),
  }),
});
