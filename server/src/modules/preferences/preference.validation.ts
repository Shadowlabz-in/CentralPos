import { z } from 'zod';

export const updatePreferenceSchema = z.object({
  body: z.object({
    theme: z.enum(['light', 'dark', 'system']).optional(),
    language: z.string().optional(),
    dashboardLayout: z.string().optional(),
    itemsPerPage: z.coerce.number().int().positive().optional(),
    sidebarCollapsed: z.boolean().optional(),
  }),
});
