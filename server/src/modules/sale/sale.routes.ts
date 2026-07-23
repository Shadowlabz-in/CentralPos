import { Router } from 'express';
import { saleController } from './sale.controller';
import { cartController } from './cart.controller';
import { authenticate } from '../../middleware/authenticate';
import { authorize } from '../../middleware/authorize';
import { validate } from '../../middleware/validate';
import { verifyAccessToken } from '../../utils/jwt';
import { AppError } from '../../middleware/errorHandler';
import {
  checkoutSchema,
  listSalesSchema,
  cancelSaleSchema,
  addToCartSchema,
  updateCartItemSchema,
  removeFromCartSchema,
} from './sale.validation';

function authenticateWithQuery(req: any, _res: any, next: any) {
  const authHeader = req.headers.authorization;
  if (authHeader?.startsWith('Bearer ')) {
    try {
      req.user = verifyAccessToken(authHeader.split(' ')[1]);
      return next();
    } catch {
      /* fall through to query-param check */
    }
  }
  const token = req.query.token;
  if (token) {
    try {
      req.user = verifyAccessToken(token);
      return next();
    } catch {
      /* fall through to error */
    }
  }
  throw new AppError('Access token is required', 401);
}

const router = Router();

/**
 * @openapi
 * /sales:
 *   get:
 *     tags: [Sales]
 *     summary: List all sales
 */
router.get('/sales', authenticate, validate(listSalesSchema), saleController.list);
/**
 * @openapi
 * /sales/{id}:
 *   get:
 *     tags: [Sales]
 *     summary: Get sale by ID
 */
router.get('/sales/:id', authenticate, saleController.getById);
/**
 * @openapi
 * /sales/checkout:
 *   post:
 *     tags: [Sales]
 *     summary: Process a checkout
 */
router.post(
  '/sales/checkout',
  authenticate,
  authorize('ADMIN', 'MANAGER', 'CASHIER'),
  validate(checkoutSchema),
  saleController.checkout,
);
/**
 * @openapi
 * /sales/{id}/cancel:
 *   post:
 *     tags: [Sales]
 *     summary: Cancel a sale
 */
router.post('/sales/:id/cancel', authenticate, authorize('ADMIN'), saleController.cancel);
/**
 * @openapi
 * /sales/{id}/invoice:
 *   get:
 *     tags: [Sales]
 *     summary: Generate invoice PDF for a sale
 */
router.get('/sales/:id/invoice', authenticateWithQuery, saleController.invoice);
/**
 * @openapi
 * /sales/{id}/reprint:
 *   post:
 *     tags: [Sales]
 *     summary: Reprint sale receipt
 */
router.post(
  '/sales/:id/reprint',
  authenticateWithQuery,
  authorize('ADMIN', 'MANAGER'),
  saleController.reprint,
);

/**
 * @openapi
 * /pos/cart:
 *   get:
 *     tags: [Cart]
 *     summary: Get current cart contents
 */
router.get('/pos/cart', authenticate, cartController.getCart);
/**
 * @openapi
 * /pos/cart/add:
 *   post:
 *     tags: [Cart]
 *     summary: Add item to cart
 */
router.post('/pos/cart/add', authenticate, validate(addToCartSchema), cartController.addItem);
/**
 * @openapi
 * /pos/cart/update:
 *   post:
 *     tags: [Cart]
 *     summary: Update cart item quantity
 */
router.post(
  '/pos/cart/update',
  authenticate,
  validate(updateCartItemSchema),
  cartController.updateItem,
);
/**
 * @openapi
 * /pos/cart/remove:
 *   post:
 *     tags: [Cart]
 *     summary: Remove item from cart
 */
router.post(
  '/pos/cart/remove',
  authenticate,
  validate(removeFromCartSchema),
  cartController.removeItem,
);
/**
 * @openapi
 * /pos/cart/clear:
 *   post:
 *     tags: [Cart]
 *     summary: Clear the cart
 */
router.post('/pos/cart/clear', authenticate, cartController.clearCart);
/**
 * @openapi
 * /pos/cart/hold:
 *   post:
 *     tags: [Cart]
 *     summary: Hold current cart
 */
router.post('/pos/cart/hold', authenticate, cartController.holdCart);
/**
 * @openapi
 * /pos/cart/resume/{key}:
 *   post:
 *     tags: [Cart]
 *     summary: Resume a held cart
 */
router.post('/pos/cart/resume/:key', authenticate, cartController.resumeCart);
/**
 * @openapi
 * /pos/cart/held:
 *   get:
 *     tags: [Cart]
 *     summary: List all held carts
 */
router.get('/pos/cart/held', authenticate, cartController.listHeld);

export default router;
