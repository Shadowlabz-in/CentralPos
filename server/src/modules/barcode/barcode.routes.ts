import { Router } from 'express';
import { barcodeController } from './barcode.controller';
import { authenticate } from '../../middleware/authenticate';
import { requirePermission } from '../../middleware/requirePermission';
import { Permissions } from '../../config/permissions';

const router = Router();

/**
 * @openapi
 * /barcodes/{barcode}:
 *   get:
 *     tags: [Barcodes]
 *     summary: Lookup variant by barcode
 */
router.get('/barcodes/:barcode', authenticate, barcodeController.lookup);

/**
 * @openapi
 * /barcodes/regenerate/{variantId}:
 *   post:
 *     tags: [Barcodes]
 *     summary: Regenerate barcode for a variant
 */
router.post(
  '/barcodes/regenerate/:variantId',
  authenticate,
  requirePermission(Permissions.INVENTORY_BARCODE_GENERATE),
  barcodeController.regenerate,
);

/**
 * @openapi
 * /barcodes/print/{variantId}:
 *   get:
 *     tags: [Barcodes]
 *     summary: Print barcode label for a variant
 */
router.get('/barcodes/print/:variantId', authenticate, barcodeController.print);

export default router;
