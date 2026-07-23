import { z } from 'zod';

export const createSupplierSchema = z.object({
  body: z.object({
    name: z
      .string({ required_error: 'Supplier name is required' })
      .min(1, 'Supplier name cannot be empty'),
    contactPerson: z.string().optional(),
    phone: z.string().optional(),
    email: z.string().email().optional().or(z.literal('')),
    address: z.string().optional(),
    city: z.string().optional(),
    state: z.string().optional(),
    pincode: z.string().optional(),
    gstin: z.string().optional(),
    storeId: z.string().uuid().optional(),
  }),
});

export const updateSupplierSchema = z.object({
  body: z.object({
    name: z.string().min(1).optional(),
    contactPerson: z.string().optional(),
    phone: z.string().optional(),
    email: z.string().email().optional().or(z.literal('')),
    address: z.string().optional(),
    city: z.string().optional(),
    state: z.string().optional(),
    pincode: z.string().optional(),
    gstin: z.string().optional(),
    isActive: z.boolean().optional(),
  }),
  params: z.object({
    id: z.string({ required_error: 'Supplier ID is required' }),
  }),
});
