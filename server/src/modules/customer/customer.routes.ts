import { Router } from 'express';
import { customerController } from './customer.controller';
import { authenticate } from '../../middleware/authenticate';
import { authorize } from '../../middleware/authorize';
import { validate } from '../../middleware/validate';
import { createCustomerSchema, updateCustomerSchema } from './customer.validation';

const router = Router();

/**
 * @openapi
 * /customers:
 *   get:
 *     tags: [Customers]
 *     summary: List all customers
 *   post:
 *     tags: [Customers]
 *     summary: Create a new customer
 */
router.get('/customers', authenticate, customerController.list);
/**
 * @openapi
 * /customers/{id}:
 *   get:
 *     tags: [Customers]
 *     summary: Get customer by ID
 *   patch:
 *     tags: [Customers]
 *     summary: Update customer by ID
 *   delete:
 *     tags: [Customers]
 *     summary: Delete customer by ID
 */
router.get('/customers/:id', authenticate, customerController.getById);
router.post(
  '/customers',
  authenticate,
  authorize('ADMIN', 'MANAGER'),
  validate(createCustomerSchema),
  customerController.create,
);
router.patch(
  '/customers/:id',
  authenticate,
  authorize('ADMIN', 'MANAGER'),
  validate(updateCustomerSchema),
  customerController.update,
);
router.delete('/customers/:id', authenticate, authorize('ADMIN'), customerController.delete);

export default router;
