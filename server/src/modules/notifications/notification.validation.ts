import { z } from 'zod';

export const updateNotificationSettingSchema = z.object({
  body: z.object({
    lowStockAlert: z.boolean().optional(),
    outOfStockAlert: z.boolean().optional(),
    salesAlert: z.boolean().optional(),
    returnsAlert: z.boolean().optional(),
    dailySummary: z.boolean().optional(),
    emailNotifications: z.boolean().optional(),
    pushNotifications: z.boolean().optional(),
  }),
});
