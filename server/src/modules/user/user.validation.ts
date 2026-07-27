import { z } from 'zod';

const permissionEnum = z.string();

export const createUserSchema = z.object({
  body: z.object({
    firstName: z
      .string({ required_error: 'First name is required' })
      .min(1, 'First name cannot be empty'),
    lastName: z.string().optional(),
    email: z.string({ required_error: 'Email is required' }).email('Invalid email format'),
    password: z
      .string({ required_error: 'Password is required' })
      .min(6, 'Password must be at least 6 characters'),
    role: z.string({ required_error: 'Role is required' }).min(1, 'Role cannot be empty'),
    phone: z.string().optional(),
    storeId: z.string().uuid().optional(),
    permissions: z.array(z.string()).optional(),
  }),
});

export const updateUserSchema = z.object({
  body: z.object({
    firstName: z.string().min(1).optional(),
    lastName: z.string().optional(),
    email: z.string().email().optional(),
    phone: z.string().optional(),
    isActive: z.boolean().optional(),
    role: z.string().optional(),
    storeId: z.string().uuid().nullable().optional(),
    permissions: z.array(z.string()).optional(),
  }),
  params: z.object({
    id: z.string({ required_error: 'User ID is required' }),
  }),
});
