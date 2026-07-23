import { Router } from 'express';
import { returnController } from './return.controller';
import { authenticate } from '../../middleware/authenticate';
import { authorize } from '../../middleware/authorize';
import { validate } from '../../middleware/validate';
import {
  createReturnSchema,
  exchangeSchema,
  refundSchema,
  createCreditNoteSchema,
  redeemCreditNoteSchema,
} from './return.validation';

const router = Router();

/**
 * @openapi
 * /returns:
 *   get:
 *     tags: [Returns]
 *     summary: List all returns
 *   post:
 *     tags: [Returns]
 *     summary: Create a return
 */
router.get(
  '/returns',
  authenticate,
  authorize('ADMIN', 'MANAGER', 'CASHIER'),
  returnController.listReturns,
);
/**
 * @openapi
 * /returns/{id}:
 *   get:
 *     tags: [Returns]
 *     summary: Get return by ID
 */
router.get(
  '/returns/:id',
  authenticate,
  authorize('ADMIN', 'MANAGER', 'CASHIER'),
  returnController.getReturn,
);
router.post(
  '/returns',
  authenticate,
  authorize('ADMIN', 'MANAGER', 'CASHIER'),
  validate(createReturnSchema),
  returnController.createReturn,
);

/**
 * @openapi
 * /exchanges:
 *   post:
 *     tags: [Returns]
 *     summary: Process an exchange
 */
router.post(
  '/exchanges',
  authenticate,
  authorize('ADMIN', 'MANAGER', 'CASHIER'),
  validate(exchangeSchema),
  returnController.processExchange,
);

/**
 * @openapi
 * /refunds:
 *   post:
 *     tags: [Returns]
 *     summary: Process a refund
 */
router.post(
  '/refunds',
  authenticate,
  authorize('ADMIN', 'MANAGER'),
  validate(refundSchema),
  returnController.processRefund,
);

/**
 * @openapi
 * /credit-notes:
 *   get:
 *     tags: [Returns]
 *     summary: List all credit notes
 *   post:
 *     tags: [Returns]
 *     summary: Create a credit note
 */
router.get(
  '/credit-notes',
  authenticate,
  authorize('ADMIN', 'MANAGER', 'CASHIER'),
  returnController.listCreditNotes,
);
router.post(
  '/credit-notes',
  authenticate,
  authorize('ADMIN', 'MANAGER'),
  validate(createCreditNoteSchema),
  returnController.createCreditNote,
);
/**
 * @openapi
 * /credit-notes/redeem:
 *   post:
 *     tags: [Returns]
 *     summary: Redeem a credit note
 */
router.post(
  '/credit-notes/redeem',
  authenticate,
  authorize('ADMIN', 'MANAGER', 'CASHIER'),
  validate(redeemCreditNoteSchema),
  returnController.redeemCreditNote,
);

export default router;
