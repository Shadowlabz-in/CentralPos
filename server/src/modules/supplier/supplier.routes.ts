import { Router } from 'express';
import { supplierController } from './supplier.controller';
import { authenticate } from '../../middleware/authenticate';
import { authorize } from '../../middleware/authorize';
import { validate } from '../../middleware/validate';
import { createSupplierSchema, updateSupplierSchema } from './supplier.validation';

const router = Router();

/**
 * @openapi
 * /suppliers:
 *   get:
 *     tags: [Suppliers]
 *     summary: List all suppliers
 *   post:
 *     tags: [Suppliers]
 *     summary: Create a new supplier
 */
router.get('/suppliers', authenticate, supplierController.list);
/**
 * @openapi
 * /suppliers/{id}:
 *   get:
 *     tags: [Suppliers]
 *     summary: Get supplier by ID
 *   patch:
 *     tags: [Suppliers]
 *     summary: Update supplier by ID
 *   delete:
 *     tags: [Suppliers]
 *     summary: Delete supplier by ID
 */
router.get('/suppliers/:id', authenticate, supplierController.getById);
router.post(
  '/suppliers',
  authenticate,
  authorize('ADMIN', 'MANAGER'),
  validate(createSupplierSchema),
  supplierController.create,
);
router.patch(
  '/suppliers/:id',
  authenticate,
  authorize('ADMIN', 'MANAGER'),
  validate(updateSupplierSchema),
  supplierController.update,
);
router.delete('/suppliers/:id', authenticate, authorize('ADMIN'), supplierController.delete);

export default router;
