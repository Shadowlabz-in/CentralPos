import { Router } from 'express';
import { returnController } from './return.controller';
import { authenticate } from '../../middleware/authenticate';
import { requirePermission } from '../../middleware/requirePermission';
import { Permissions } from '../../config/permissions';
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
  requirePermission(Permissions.POS_RETURN),
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
  requirePermission(Permissions.POS_RETURN),
  returnController.getReturn,
);
router.post(
  '/returns',
  authenticate,
  requirePermission(Permissions.POS_RETURN),
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
  requirePermission(Permissions.POS_RETURN),
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
  requirePermission(Permissions.POS_RETURN),
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
  requirePermission(Permissions.POS_RETURN),
  returnController.listCreditNotes,
);
router.post(
  '/credit-notes',
  authenticate,
  requirePermission(Permissions.POS_RETURN),
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
  requirePermission(Permissions.POS_RETURN),
  validate(redeemCreditNoteSchema),
  returnController.redeemCreditNote,
);

export default router;
