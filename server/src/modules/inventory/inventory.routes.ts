import { Router } from 'express';
import { inventoryController } from './inventory.controller';
import { authenticate } from '../../middleware/authenticate';
import { authorize } from '../../middleware/authorize';
import { validate } from '../../middleware/validate';
import { adjustStockSchema } from './inventory.validation';

const router = Router();

/**
 * @openapi
 * /inventory/current:
 *   get:
 *     tags: [Inventory]
 *     summary: Get current stock levels
 */
router.get('/inventory/current', authenticate, inventoryController.current);
/**
 * @openapi
 * /inventory/history:
 *   get:
 *     tags: [Inventory]
 *     summary: Get inventory movement history
 */
router.get('/inventory/history', authenticate, inventoryController.history);
/**
 * @openapi
 * /inventory/low-stock:
 *   get:
 *     tags: [Inventory]
 *     summary: Get low stock alerts
 */
router.get('/inventory/low-stock', authenticate, inventoryController.lowStock);
/**
 * @openapi
 * /inventory/valuation:
 *   get:
 *     tags: [Inventory]
 *     summary: Get inventory valuation
 */
router.get('/inventory/valuation', authenticate, inventoryController.valuation);
/**
 * @openapi
 * /inventory/{variantId}/movements:
 *   get:
 *     tags: [Inventory]
 *     summary: Get stock movements for a variant
 */
router.get(
  '/inventory/:variantId/movements',
  authenticate,
  (req, _res, next) => {
    req.query.productVariantId = req.params.variantId;
    next();
  },
  inventoryController.history,
);
/**
 * @openapi
 * /inventory/adjust:
 *   post:
 *     tags: [Inventory]
 *     summary: Adjust stock levels
 */
router.post(
  '/inventory/adjust',
  authenticate,
  authorize('ADMIN', 'MANAGER'),
  validate(adjustStockSchema),
  inventoryController.adjust,
);

export default router;
