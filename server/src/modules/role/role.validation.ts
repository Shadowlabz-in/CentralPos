import { z } from 'zod';

export const createRoleSchema = z.object({
  body: z.object({
    name: z.string({ required_error: 'Role name is required' }).min(1, 'Role name cannot be empty'),
    label: z.string({ required_error: 'Role label is required' }).min(1, 'Role label cannot be empty'),
    description: z.string().optional(),
    permissions: z.array(z.string()).optional(),
  }),
});

export const updateRoleSchema = z.object({
  body: z.object({
    name: z.string().min(1).optional(),
    label: z.string().min(1).optional(),
    description: z.string().optional(),
    permissions: z.array(z.string()).optional(),
  }),
  params: z.object({
    id: z.string({ required_error: 'Role ID is required' }),
  }),
});
