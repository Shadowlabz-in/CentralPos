import { Router } from 'express';
import { productController } from './product.controller';
import { authenticate } from '../../middleware/authenticate';
import { requirePermission } from '../../middleware/requirePermission';
import { validate } from '../../middleware/validate';
import { Permissions } from '../../config/permissions';
import {
  createProductSchema,
  updateProductSchema,
  createProductWithVariantsSchema,
} from './product.validation';

const router = Router();

/**
 * @openapi
 * /products:
 *   get:
 *     tags: [Products]
 *     summary: List all products
 *   post:
 *     tags: [Products]
 *     summary: Create a new product
 */
router.get('/products', authenticate, productController.list);
/**
 * @openapi
 * /products/{id}:
 *   get:
 *     tags: [Products]
 *     summary: Get product by ID
 *   patch:
 *     tags: [Products]
 *     summary: Update product by ID
 *   delete:
 *     tags: [Products]
 *     summary: Delete product by ID
 */
router.get('/products/:id', authenticate, productController.getById);
router.post(
  '/products',
  authenticate,
  requirePermission(Permissions.PRODUCT_CREATE),
  validate(createProductSchema),
  productController.create,
);
router.post(
  '/products/with-variants',
  authenticate,
  requirePermission(Permissions.PRODUCT_CREATE),
  validate(createProductWithVariantsSchema),
  productController.createWithVariants,
);
router.patch(
  '/products/:id',
  authenticate,
  requirePermission(Permissions.PRODUCT_EDIT),
  validate(updateProductSchema),
  productController.update,
);
router.delete('/products/:id', authenticate, requirePermission(Permissions.PRODUCT_DELETE), productController.delete);

export default router;
