import { Router } from 'express';
import { settingsController } from './settings.controller';
import { authenticate } from '../../middleware/authenticate';
import { requirePermission } from '../../middleware/requirePermission';
import { Permissions } from '../../config/permissions';
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
  requirePermission(Permissions.SETTINGS_VIEW),
  settingsController.getStore,
);
router.patch(
  '/settings/store',
  authenticate,
  requirePermission(Permissions.SETTINGS_EDIT),
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
  requirePermission(Permissions.SETTINGS_VIEW),
  settingsController.getInvoice,
);
router.patch(
  '/settings/invoice',
  authenticate,
  requirePermission(Permissions.SETTINGS_EDIT),
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
router.get('/settings/gst', authenticate, requirePermission(Permissions.SETTINGS_VIEW), settingsController.getGst);
router.patch(
  '/settings/gst',
  authenticate,
  requirePermission(Permissions.SETTINGS_EDIT),
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
  requirePermission(Permissions.SETTINGS_VIEW),
  settingsController.getBarcode,
);
router.patch(
  '/settings/barcode',
  authenticate,
  requirePermission(Permissions.SETTINGS_EDIT),
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
  requirePermission(Permissions.SETTINGS_VIEW),
  settingsController.getPrinter,
);
router.patch(
  '/settings/printer',
  authenticate,
  requirePermission(Permissions.SETTINGS_EDIT),
  validate(updatePrinterSchema),
  settingsController.updatePrinter,
);

export default router;
