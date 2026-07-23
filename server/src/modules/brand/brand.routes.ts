import { Router } from 'express';
import { brandController } from './brand.controller';
import { authenticate } from '../../middleware/authenticate';
import { authorize } from '../../middleware/authorize';
import { validate } from '../../middleware/validate';
import { createBrandSchema, updateBrandSchema } from './brand.validation';

const router = Router();

/**
 * @openapi
 * /brands:
 *   get:
 *     tags: [Brands]
 *     summary: List all brands
 *   post:
 *     tags: [Brands]
 *     summary: Create a new brand
 */
router.get('/brands', authenticate, brandController.list);
/**
 * @openapi
 * /brands/{id}:
 *   get:
 *     tags: [Brands]
 *     summary: Get brand by ID
 *   patch:
 *     tags: [Brands]
 *     summary: Update brand by ID
 *   delete:
 *     tags: [Brands]
 *     summary: Delete brand by ID
 */
router.get('/brands/:id', authenticate, brandController.getById);
router.post(
  '/brands',
  authenticate,
  authorize('ADMIN', 'MANAGER'),
  validate(createBrandSchema),
  brandController.create,
);
router.patch(
  '/brands/:id',
  authenticate,
  authorize('ADMIN', 'MANAGER'),
  validate(updateBrandSchema),
  brandController.update,
);
router.delete('/brands/:id', authenticate, authorize('ADMIN'), brandController.delete);

export default router;
