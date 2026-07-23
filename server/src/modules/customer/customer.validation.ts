import { z } from 'zod';

export const createCustomerSchema = z.object({
  body: z.object({
    name: z.string({ required_error: 'Customer name is required' }).min(1),
    email: z.string().email().optional().or(z.literal('')),
    phone: z.string().optional().or(z.literal('')),
    address: z.string().optional().or(z.literal('')),
    city: z.string().optional().or(z.literal('')),
    state: z.string().optional().or(z.literal('')),
    pincode: z.string().optional().or(z.literal('')),
    gstin: z.string().optional().or(z.literal('')),
  }),
});

export const updateCustomerSchema = z.object({
  body: z.object({
    name: z.string().min(1).optional(),
    email: z.string().email().optional().or(z.literal('')),
    phone: z.string().optional().or(z.literal('')),
    address: z.string().optional().or(z.literal('')),
    city: z.string().optional().or(z.literal('')),
    state: z.string().optional().or(z.literal('')),
    pincode: z.string().optional().or(z.literal('')),
    gstin: z.string().optional().or(z.literal('')),
  }),
  params: z.object({
    id: z.string({ required_error: 'Customer ID is required' }),
  }),
});
