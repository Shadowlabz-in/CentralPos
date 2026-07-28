import { Router } from 'express';
import { purchaseController } from './purchase.controller';
import { authenticate } from '../../middleware/authenticate';
import { requirePermission } from '../../middleware/requirePermission';
import { Permissions } from '../../config/permissions';
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
  requirePermission(Permissions.PURCHASE_VIEW),
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
  requirePermission(Permissions.PURCHASE_VIEW),
  purchaseController.getById,
);
router.post(
  '/purchases',
  authenticate,
  requirePermission(Permissions.PURCHASE_CREATE),
  validate(createPurchaseSchema),
  purchaseController.create,
);
router.patch(
  '/purchases/:id',
  authenticate,
  requirePermission(Permissions.PURCHASE_EDIT),
  validate(updatePurchaseSchema),
  purchaseController.update,
);

export default router;
