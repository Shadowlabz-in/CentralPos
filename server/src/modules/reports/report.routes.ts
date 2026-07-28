import { Router } from 'express';
import { reportController } from './report.controller';
import { authenticate } from '../../middleware/authenticate';
import { requirePermission } from '../../middleware/requirePermission';
import { Permissions } from '../../config/permissions';

const router = Router();

/**
 * @openapi
 * /reports/sales:
 *   get:
 *     tags: [Reports]
 *     summary: Generate sales report
 */
router.get('/reports/sales', authenticate, requirePermission(Permissions.REPORT_SALES), reportController.sales);
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
  requirePermission(Permissions.REPORT_VIEW),
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
  requirePermission(Permissions.REPORT_INVENTORY),
  reportController.inventory,
);
/**
 * @openapi
 * /reports/profit:
 *   get:
 *     tags: [Reports]
 *     summary: Generate profit & loss report
 */
router.get('/reports/profit', authenticate, requirePermission(Permissions.REPORT_VIEW), reportController.profit);
/**
 * @openapi
 * /reports/gst:
 *   get:
 *     tags: [Reports]
 *     summary: Generate GST report
 */
router.get('/reports/gst', authenticate, requirePermission(Permissions.REPORT_GST), reportController.gst);
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
  requirePermission(Permissions.REPORT_VIEW),
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
  requirePermission(Permissions.REPORT_VIEW),
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
  requirePermission(Permissions.REPORT_VIEW),
  reportController.exportData,
);

export default router;
