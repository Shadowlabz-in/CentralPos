import { z } from 'zod';

export const createPlanSchema = z.object({
  body: z.object({
    name: z.string().min(1, 'Name is required'),
    code: z.string().min(1, 'Code is required'),
    description: z.string().optional(),
    price: z.number().min(0, 'Price must be >= 0').default(0),
    yearlyPrice: z.number().min(0).optional(),
    currency: z.string().default('INR'),
    billingPeriod: z.enum(['monthly', 'yearly', 'one-time']).default('monthly'),
    maxStores: z.number().int().min(1).default(1),
    maxUsers: z.number().int().min(1).default(2),
    maxProducts: z.number().int().min(0).default(50),
    features: z.array(z.object({
      key: z.string(),
      label: z.string(),
      included: z.boolean(),
    })).default([]),
    isActive: z.boolean().default(true),
    sortOrder: z.number().int().default(0),
    isPopular: z.boolean().default(false),
  }),
});

export const updatePlanSchema = z.object({
  body: createPlanSchema.shape.body.partial(),
});

export const createSubscriptionSchema = z.object({
  body: z.object({
    planId: z.string().uuid(),
    status: z.enum(['active', 'trial', 'cancelled', 'expired', 'past_due']).default('active'),
    startDate: z.string().datetime().optional(),
    endDate: z.string().datetime().optional(),
    trialEndsAt: z.string().datetime().optional(),
    autoRenew: z.boolean().default(true),
    notes: z.string().optional(),
  }),
});

export const updateSubscriptionSchema = z.object({
  body: createSubscriptionSchema.shape.body.partial(),
});
