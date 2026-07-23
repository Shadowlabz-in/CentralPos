import { Router } from 'express';
import { variantController } from './variant.controller';
import { authenticate } from '../../middleware/authenticate';
import { authorize } from '../../middleware/authorize';
import { validate } from '../../middleware/validate';
import { createVariantSchema, updateVariantSchema } from './variant.validation';

const router = Router();

/**
 * @openapi
 * /products/{productId}/variants:
 *   get:
 *     tags: [Variants]
 *     summary: List variants for a product
 *   post:
 *     tags: [Variants]
 *     summary: Create a variant for a product
 */
router.get('/products/:productId/variants', authenticate, variantController.list);
/**
 * @openapi
 * /variants/{id}:
 *   get:
 *     tags: [Variants]
 *     summary: Get variant by ID
 *   patch:
 *     tags: [Variants]
 *     summary: Update variant by ID
 *   delete:
 *     tags: [Variants]
 *     summary: Delete variant by ID
 */
router.get('/variants/:id', authenticate, variantController.getById);
router.post(
  '/products/:productId/variants',
  authenticate,
  authorize('ADMIN', 'MANAGER'),
  validate(createVariantSchema),
  variantController.create,
);
router.patch(
  '/variants/:id',
  authenticate,
  authorize('ADMIN', 'MANAGER'),
  validate(updateVariantSchema),
  variantController.update,
);
router.delete('/variants/:id', authenticate, authorize('ADMIN'), variantController.delete);

export default router;
