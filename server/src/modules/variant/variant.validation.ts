import { z } from 'zod';

const gstValues = [0, 5, 12, 18, 28] as const;

export const createVariantSchema = z.object({
  body: z.object({
    size: z.string().optional(),
    color: z.string().optional(),
    fabric: z.string().optional(),
    rackLocation: z.string().optional(),
    sku: z.string().min(1, 'SKU cannot be empty').optional(),
    barcode: z.string().min(1, 'Barcode cannot be empty').optional(),
    mrp: z.coerce.number().nonnegative('MRP cannot be negative').optional(),
    purchasePrice: z.coerce
      .number({ required_error: 'Purchase price is required' })
      .nonnegative('Purchase price cannot be negative'),
    sellingPrice: z.coerce
      .number({ required_error: 'Selling price is required' })
      .nonnegative('Selling price cannot be negative'),
    gstPercentage: z.coerce
      .number()
      .refine((v) => gstValues.includes(v as (typeof gstValues)[number]), {
        message: 'GST must be one of: 0, 5, 12, 18, 28',
      })
      .default(18),
    stockQuantity: z.coerce
      .number()
      .int('Stock must be an integer')
      .nonnegative('Stock cannot be negative')
      .default(0),
    initialStock: z.coerce.number().int().nonnegative().optional(),
    reorderLevel: z.coerce
      .number()
      .int('Reorder level must be an integer')
      .nonnegative('Reorder level cannot be negative')
      .default(0),
    isActive: z.boolean().default(true),
  }),
  params: z.object({
    productId: z.string({ required_error: 'Product ID is required' }),
  }),
});

export const updateVariantSchema = z.object({
  body: z.object({
    size: z.string().optional(),
    color: z.string().optional(),
    fabric: z.string().optional(),
    rackLocation: z.string().optional(),
    sku: z.string().min(1).optional(),
    barcode: z.string().min(1).optional(),
    purchasePrice: z.coerce.number().nonnegative().optional(),
    sellingPrice: z.coerce.number().nonnegative().optional(),
    gstPercentage: z.coerce
      .number()
      .refine((v) => gstValues.includes(v as (typeof gstValues)[number]), {
        message: 'GST must be one of: 0, 5, 12, 18, 28',
      })
      .optional(),
    stockQuantity: z.coerce.number().int().nonnegative().optional(),
    reorderLevel: z.coerce.number().int().nonnegative().optional(),
    isActive: z.boolean().optional(),
  }),
  params: z.object({
    id: z.string({ required_error: 'Variant ID is required' }),
  }),
});
