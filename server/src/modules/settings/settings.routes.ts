import { Router } from 'express';
import { settingsController } from './settings.controller';
import { authenticate } from '../../middleware/authenticate';
import { authorize } from '../../middleware/authorize';
import { validate } from '../../middleware/validate';
import {
  updateStoreSchema,
  updateInvoiceSchema,
  updateGstSchema,
  updateBarcodeSchema,
  updatePrinterSchema,
} from './settings.validation';

const router = Router();

/**
 * @openapi
 * /settings/store:
 *   get:
 *     tags: [Settings]
 *     summary: Get store settings
 *   patch:
 *     tags: [Settings]
 *     summary: Update store settings
 */
router.get(
  '/settings/store',
  authenticate,
  authorize('ADMIN', 'MANAGER'),
  settingsController.getStore,
);
router.patch(
  '/settings/store',
  authenticate,
  authorize('ADMIN'),
  validate(updateStoreSchema),
  settingsController.updateStore,
);

/**
 * @openapi
 * /settings/invoice:
 *   get:
 *     tags: [Settings]
 *     summary: Get invoice settings
 *   patch:
 *     tags: [Settings]
 *     summary: Update invoice settings
 */
router.get(
  '/settings/invoice',
  authenticate,
  authorize('ADMIN', 'MANAGER'),
  settingsController.getInvoice,
);
router.patch(
  '/settings/invoice',
  authenticate,
  authorize('ADMIN'),
  validate(updateInvoiceSchema),
  settingsController.updateInvoice,
);

/**
 * @openapi
 * /settings/gst:
 *   get:
 *     tags: [Settings]
 *     summary: Get GST settings
 *   patch:
 *     tags: [Settings]
 *     summary: Update GST settings
 */
router.get('/settings/gst', authenticate, authorize('ADMIN', 'MANAGER'), settingsController.getGst);
router.patch(
  '/settings/gst',
  authenticate,
  authorize('ADMIN'),
  validate(updateGstSchema),
  settingsController.updateGst,
);

/**
 * @openapi
 * /settings/barcode:
 *   get:
 *     tags: [Settings]
 *     summary: Get barcode settings
 *   patch:
 *     tags: [Settings]
 *     summary: Update barcode settings
 */
router.get(
  '/settings/barcode',
  authenticate,
  authorize('ADMIN', 'MANAGER'),
  settingsController.getBarcode,
);
router.patch(
  '/settings/barcode',
  authenticate,
  authorize('ADMIN'),
  validate(updateBarcodeSchema),
  settingsController.updateBarcode,
);

/**
 * @openapi
 * /settings/printer:
 *   get:
 *     tags: [Settings]
 *     summary: Get printer settings
 *   patch:
 *     tags: [Settings]
 *     summary: Update printer settings
 */
router.get(
  '/settings/printer',
  authenticate,
  authorize('ADMIN', 'MANAGER'),
  settingsController.getPrinter,
);
router.patch(
  '/settings/printer',
  authenticate,
  authorize('ADMIN'),
  validate(updatePrinterSchema),
  settingsController.updatePrinter,
);

export default router;
