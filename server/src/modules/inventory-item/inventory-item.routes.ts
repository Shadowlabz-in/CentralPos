import { Router } from 'express';
import { inventoryItemController } from './inventory-item.controller';
import { authenticate } from '../../middleware/authenticate';
import { authorize } from '../../middleware/authorize';
import { validate } from '../../middleware/validate';
import {
  batchCreateSchema,
  updateStatusSchema,
  printBarcodesSchema,
  listQuerySchema,
} from './inventory-item.validation';

const router = Router();

router.get(
  '/inventory-items',
  authenticate,
  validate(listQuerySchema),
  inventoryItemController.list,
);

router.post(
  '/inventory-items/batch-create',
  authenticate,
  authorize('ADMIN', 'MANAGER'),
  validate(batchCreateSchema),
  inventoryItemController.batchCreate,
);

router.patch(
  '/inventory-items/:id/status',
  authenticate,
  authorize('ADMIN', 'MANAGER'),
  validate(updateStatusSchema),
  inventoryItemController.updateStatus,
);

router.post(
  '/inventory-items/print-barcodes',
  authenticate,
  validate(printBarcodesSchema),
  inventoryItemController.printBarcodes,
);

router.get('/inventory-items/lookup/:barcode', authenticate, inventoryItemController.lookup);

router.get(
  '/inventory-items/count/:variantId',
  authenticate,
  inventoryItemController.inventoryCount,
);

export default router;
