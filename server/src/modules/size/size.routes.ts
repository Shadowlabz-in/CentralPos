import { Router } from 'express';
import { sizeController } from './size.controller';
import { authenticate } from '../../middleware/authenticate';
import { requirePermission } from '../../middleware/requirePermission';
import { validate } from '../../middleware/validate';
import { Permissions } from '../../config/permissions';
import { createSizeSchema, updateSizeSchema } from './size.validation';

const router = Router();
router.get('/sizes', authenticate, sizeController.list);
router.get('/sizes/:id', authenticate, sizeController.getById);
router.post('/sizes', authenticate, requirePermission(Permissions.PRODUCT_CREATE), validate(createSizeSchema), sizeController.create);
router.patch('/sizes/:id', authenticate, requirePermission(Permissions.PRODUCT_EDIT), validate(updateSizeSchema), sizeController.update);
router.delete('/sizes/:id', authenticate, requirePermission(Permissions.PRODUCT_DELETE), sizeController.delete);
export default router;
