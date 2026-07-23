import { z } from 'zod';

// Generic pagination schema
export const PaginationSchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(10),
});

// Health check response
export const HealthResponseSchema = z.object({
  status: z.string(),
  message: z.string(),
});
