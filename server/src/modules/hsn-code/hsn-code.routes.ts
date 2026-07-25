import { Router } from 'express';
import { hsnCodeController } from './hsn-code.controller';
import { authenticate } from '../../middleware/authenticate';
import { authorize } from '../../middleware/authorize';
import { validate } from '../../middleware/validate';
import { createHsnCodeSchema, updateHsnCodeSchema } from './hsn-code.validation';

const router = Router();

router.get('/hsn-codes', authenticate, hsnCodeController.list);
router.get('/hsn-codes/:id', authenticate, hsnCodeController.getById);
router.post('/hsn-codes', authenticate, authorize('ADMIN', 'MANAGER'), validate(createHsnCodeSchema), hsnCodeController.create);
router.patch('/hsn-codes/:id', authenticate, authorize('ADMIN', 'MANAGER'), validate(updateHsnCodeSchema), hsnCodeController.update);
router.delete('/hsn-codes/:id', authenticate, authorize('ADMIN'), hsnCodeController.delete);

export default router;
