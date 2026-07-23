import { Router } from 'express';
import { dashboardController } from './dashboard.controller';
import { authenticate } from '../../middleware/authenticate';
import { authorize } from '../../middleware/authorize';

const router = Router();

/**
 * @openapi
 * /dashboard:
 *   get:
 *     tags: [Dashboard]
 *     summary: Get dashboard overview
 */
router.get('/dashboard', authenticate, authorize('ADMIN', 'MANAGER'), dashboardController.overview);
/**
 * @openapi
 * /dashboard/profit:
 *   get:
 *     tags: [Dashboard]
 *     summary: Get profit metrics
 */
router.get(
  '/dashboard/profit',
  authenticate,
  authorize('ADMIN', 'MANAGER'),
  dashboardController.profit,
);
/**
 * @openapi
 * /dashboard/inventory:
 *   get:
 *     tags: [Dashboard]
 *     summary: Get inventory summary
 */
router.get(
  '/dashboard/inventory',
  authenticate,
  authorize('ADMIN', 'MANAGER', 'CASHIER'),
  dashboardController.inventory,
);
/**
 * @openapi
 * /dashboard/purchases:
 *   get:
 *     tags: [Dashboard]
 *     summary: Get purchase summaries
 */
router.get(
  '/dashboard/purchases',
  authenticate,
  authorize('ADMIN', 'MANAGER'),
  dashboardController.purchases,
);
/**
 * @openapi
 * /dashboard/customers:
 *   get:
 *     tags: [Dashboard]
 *     summary: Get customer metrics
 */
router.get(
  '/dashboard/customers',
  authenticate,
  authorize('ADMIN', 'MANAGER'),
  dashboardController.customers,
);
/**
 * @openapi
 * /dashboard/sales-chart:
 *   get:
 *     tags: [Dashboard]
 *     summary: Get sales chart data
 */
router.get(
  '/dashboard/sales-chart',
  authenticate,
  authorize('ADMIN', 'MANAGER'),
  dashboardController.salesChart,
);
/**
 * @openapi
 * /dashboard/sales-by-category:
 *   get:
 *     tags: [Dashboard]
 *     summary: Get sales breakdown by category
 */
router.get(
  '/dashboard/sales-by-category',
  authenticate,
  authorize('ADMIN', 'MANAGER'),
  dashboardController.salesByCategory,
);
/**
 * @openapi
 * /dashboard/sales-by-brand:
 *   get:
 *     tags: [Dashboard]
 *     summary: Get sales breakdown by brand
 */
router.get(
  '/dashboard/sales-by-brand',
  authenticate,
  authorize('ADMIN', 'MANAGER'),
  dashboardController.salesByBrand,
);
/**
 * @openapi
 * /dashboard/top-products:
 *   get:
 *     tags: [Dashboard]
 *     summary: Get top selling products
 */
router.get(
  '/dashboard/top-products',
  authenticate,
  authorize('ADMIN', 'MANAGER'),
  dashboardController.topProducts,
);
/**
 * @openapi
 * /dashboard/inventory-value-trend:
 *   get:
 *     tags: [Dashboard]
 *     summary: Get inventory value trend
 */
router.get(
  '/dashboard/inventory-value-trend',
  authenticate,
  authorize('ADMIN', 'MANAGER'),
  dashboardController.inventoryValueTrend,
);

export default router;
