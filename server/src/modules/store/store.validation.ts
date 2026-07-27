import { z } from 'zod';

export const createStoreSchema = z.object({
  body: z.object({
    name: z.string({ required_error: 'Store name is required' }).min(1),
    code: z.string({ required_error: 'Store code is required' }).min(1),
    ownerId: z.string().uuid().optional().nullable(),
    ownerName: z.string().optional().nullable(),
    panNumber: z.string().optional().nullable(),
    address: z.string().optional().nullable(),
    city: z.string().optional().nullable(),
    state: z.string().optional().nullable(),
    pincode: z.string().optional().nullable(),
    phone: z.string().optional().nullable(),
    email: z.string().email().optional().nullable(),
    website: z.string().optional().nullable(),
    gstin: z.string().optional().nullable(),
    logo: z.string().optional().nullable(),
    currency: z.string().optional(),
    timezone: z.string().optional(),
    language: z.string().optional(),
    financialYear: z.string().optional().nullable(),
  }),
});

export const updateStoreSchema = z.object({
  body: z.object({
    name: z.string().min(1).optional(),
    code: z.string().min(1).optional(),
    ownerId: z.string().uuid().optional().nullable(),
    ownerName: z.string().optional().nullable(),
    panNumber: z.string().optional().nullable(),
    address: z.string().optional().nullable(),
    city: z.string().optional().nullable(),
    state: z.string().optional().nullable(),
    pincode: z.string().optional().nullable(),
    phone: z.string().optional().nullable(),
    email: z.string().email().optional().nullable(),
    website: z.string().optional().nullable(),
    gstin: z.string().optional().nullable(),
    logo: z.string().optional().nullable(),
    currency: z.string().optional(),
    timezone: z.string().optional(),
    language: z.string().optional(),
    financialYear: z.string().optional().nullable(),
    isActive: z.boolean().optional(),
  }),
  params: z.object({
    id: z.string({ required_error: 'Store ID is required' }),
  }),
});
