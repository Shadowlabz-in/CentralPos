import { Router } from 'express';
import { reportController } from './report.controller';
import { authenticate } from '../../middleware/authenticate';
import { authorize } from '../../middleware/authorize';

const router = Router();

/**
 * @openapi
 * /reports/sales:
 *   get:
 *     tags: [Reports]
 *     summary: Generate sales report
 */
router.get('/reports/sales', authenticate, authorize('ADMIN', 'MANAGER'), reportController.sales);
/**
 * @openapi
 * /reports/purchases:
 *   get:
 *     tags: [Reports]
 *     summary: Generate purchase report
 */
router.get(
  '/reports/purchases',
  authenticate,
  authorize('ADMIN', 'MANAGER'),
  reportController.purchases,
);
/**
 * @openapi
 * /reports/inventory:
 *   get:
 *     tags: [Reports]
 *     summary: Generate inventory report
 */
router.get(
  '/reports/inventory',
  authenticate,
  authorize('ADMIN', 'MANAGER', 'CASHIER'),
  reportController.inventory,
);
/**
 * @openapi
 * /reports/profit:
 *   get:
 *     tags: [Reports]
 *     summary: Generate profit & loss report
 */
router.get('/reports/profit', authenticate, authorize('ADMIN', 'MANAGER'), reportController.profit);
/**
 * @openapi
 * /reports/gst:
 *   get:
 *     tags: [Reports]
 *     summary: Generate GST report
 */
router.get('/reports/gst', authenticate, authorize('ADMIN', 'MANAGER'), reportController.gst);
/**
 * @openapi
 * /reports/customers:
 *   get:
 *     tags: [Reports]
 *     summary: Generate customer report
 */
router.get(
  '/reports/customers',
  authenticate,
  authorize('ADMIN', 'MANAGER'),
  reportController.customers,
);
/**
 * @openapi
 * /reports/suppliers:
 *   get:
 *     tags: [Reports]
 *     summary: Generate supplier report
 */
router.get(
  '/reports/suppliers',
  authenticate,
  authorize('ADMIN', 'MANAGER'),
  reportController.suppliers,
);
/**
 * @openapi
 * /reports/export:
 *   get:
 *     tags: [Reports]
 *     summary: Export report data
 */
router.get(
  '/reports/export',
  authenticate,
  authorize('ADMIN', 'MANAGER'),
  reportController.exportData,
);

export default router;
