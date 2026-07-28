import { Router } from 'express';
import { hsnCodeController } from './hsn-code.controller';
import { authenticate } from '../../middleware/authenticate';
import { requirePermission } from '../../middleware/requirePermission';
import { Permissions } from '../../config/permissions';
import { validate } from '../../middleware/validate';
import { createHsnCodeSchema, updateHsnCodeSchema } from './hsn-code.validation';

const router = Router();

router.get('/hsn-codes', authenticate, hsnCodeController.list);
router.get('/hsn-codes/:id', authenticate, hsnCodeController.getById);
router.post('/hsn-codes', authenticate, requirePermission(Permissions.PRODUCT_CREATE), validate(createHsnCodeSchema), hsnCodeController.create);
router.patch('/hsn-codes/:id', authenticate, requirePermission(Permissions.PRODUCT_EDIT), validate(updateHsnCodeSchema), hsnCodeController.update);
router.delete('/hsn-codes/:id', authenticate, requirePermission(Permissions.PRODUCT_DELETE), hsnCodeController.delete);

export default router;
