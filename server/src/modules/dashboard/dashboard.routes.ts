import { Router } from 'express';
import { dashboardController } from './dashboard.controller';
import { authenticate } from '../../middleware/authenticate';
import { requirePermission } from '../../middleware/requirePermission';
import { Permissions } from '../../config/permissions';

const router = Router();

/**
 * @openapi
 * /dashboard:
 *   get:
 *     tags: [Dashboard]
 *     summary: Get dashboard overview
 */
router.get('/dashboard', authenticate, requirePermission(Permissions.DASHBOARD_VIEW), dashboardController.overview);
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
  requirePermission(Permissions.DASHBOARD_VIEW),
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
  requirePermission(Permissions.DASHBOARD_VIEW),
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
  requirePermission(Permissions.DASHBOARD_VIEW),
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
  requirePermission(Permissions.DASHBOARD_VIEW),
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
  requirePermission(Permissions.DASHBOARD_VIEW),
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
  requirePermission(Permissions.DASHBOARD_VIEW),
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
  requirePermission(Permissions.DASHBOARD_VIEW),
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
  requirePermission(Permissions.DASHBOARD_VIEW),
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
  requirePermission(Permissions.DASHBOARD_VIEW),
  dashboardController.inventoryValueTrend,
);

export default router;
