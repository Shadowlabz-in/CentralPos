import { Router } from 'express';
import { barcodeController } from './barcode.controller';
import { authenticate } from '../../middleware/authenticate';
import { authorize } from '../../middleware/authorize';

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
  authorize('ADMIN', 'MANAGER'),
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
