import { z } from 'zod';

export const createProductSchema = z.object({
  body: z.object({
    name: z
      .string({ required_error: 'Product name is required' })
      .min(1, 'Product name cannot be empty'),
    description: z.string().optional(),
    tags: z.array(z.string()).optional(),
    categoryId: z.string({ required_error: 'Category is required' }).uuid('Invalid category ID'),
    brandId: z.string().uuid().nullable().optional(),
    isActive: z.boolean().optional(),
  }),
});

export const updateProductSchema = z.object({
  body: z.object({
    name: z.string().min(1).optional(),
    description: z.string().optional(),
    tags: z.array(z.string()).optional(),
    categoryId: z.string().uuid().optional(),
    brandId: z.string().uuid().nullable().optional(),
    isActive: z.boolean().optional(),
  }),
  params: z.object({
    id: z.string({ required_error: 'Product ID is required' }),
  }),
});

const gstValues = [0, 5, 12, 18, 28] as const;

const variantInputSchema = z.object({
  size: z.string().optional(),
  color: z.string().optional(),
  fabric: z.string().optional(),
  sku: z.string().optional(),
  barcode: z.string().optional(),
  purchasePrice: z.coerce.number().nonnegative('Purchase price cannot be negative').optional(),
  sellingPrice: z.coerce.number().nonnegative('Selling price cannot be negative').optional(),
  mrp: z.coerce.number().nonnegative('MRP cannot be negative').optional(),
  gstPercentage: z.coerce
    .number()
    .refine((v) => gstValues.includes(v as (typeof gstValues)[number]), {
      message: 'GST must be one of: 0, 5, 12, 18, 28',
    })
    .optional(),
  initialStock: z.coerce.number().int().nonnegative().default(0),
  reorderLevel: z.coerce.number().int().nonnegative().default(0),
  rackLocation: z.string().optional(),
});

export const createProductWithVariantsSchema = z.object({
  body: z
    .object({
      name: z
        .string({ required_error: 'Product name is required' })
        .min(1, 'Product name cannot be empty'),
      description: z.string().optional(),
      categoryId: z.string({ required_error: 'Category is required' }).uuid('Invalid category ID'),
      brandId: z.string().uuid().nullable().optional(),
      supplierId: z.string().uuid().nullable().optional(),
      purchasePrice: z.coerce.number().nonnegative('Purchase price cannot be negative').optional(),
      sellingPrice: z.coerce.number().nonnegative('Selling price cannot be negative').optional(),
      mrp: z.coerce.number().nonnegative('MRP cannot be negative').optional(),
      gstPercentage: z.coerce
        .number()
        .refine((v) => gstValues.includes(v as (typeof gstValues)[number]), {
          message: 'GST must be one of: 0, 5, 12, 18, 28',
        })
        .default(18),
      isActive: z.boolean().default(true),
      variants: z.array(variantInputSchema).min(1, 'At least one variant is required'),
    })
    .refine(
      (data) => {
        if (data.mrp !== undefined && data.sellingPrice !== undefined) {
          return data.mrp >= data.sellingPrice;
        }
        return true;
      },
      { message: 'MRP must be greater than or equal to Selling Price', path: ['mrp'] },
    ),
});
