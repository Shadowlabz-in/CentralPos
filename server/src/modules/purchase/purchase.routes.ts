import { Router } from 'express';
import { purchaseController } from './purchase.controller';
import { authenticate } from '../../middleware/authenticate';
import { authorize } from '../../middleware/authorize';
import { validate } from '../../middleware/validate';
import { createPurchaseSchema, updatePurchaseSchema } from './purchase.validation';

const router = Router();

/**
 * @openapi
 * /purchases:
 *   get:
 *     tags: [Purchases]
 *     summary: List all purchases
 *   post:
 *     tags: [Purchases]
 *     summary: Create a new purchase
 */
router.get(
  '/purchases',
  authenticate,
  authorize('ADMIN', 'MANAGER', 'CASHIER'),
  purchaseController.list,
);
/**
 * @openapi
 * /purchases/{id}:
 *   get:
 *     tags: [Purchases]
 *     summary: Get purchase by ID
 *   patch:
 *     tags: [Purchases]
 *     summary: Update purchase by ID
 */
router.get(
  '/purchases/:id',
  authenticate,
  authorize('ADMIN', 'MANAGER', 'CASHIER'),
  purchaseController.getById,
);
router.post(
  '/purchases',
  authenticate,
  authorize('ADMIN', 'MANAGER'),
  validate(createPurchaseSchema),
  purchaseController.create,
);
router.patch(
  '/purchases/:id',
  authenticate,
  authorize('ADMIN', 'MANAGER'),
  validate(updatePurchaseSchema),
  purchaseController.update,
);

export default router;
