import { Router } from 'express';
import { colorController } from './color.controller';
import { authenticate } from '../../middleware/authenticate';
import { requirePermission } from '../../middleware/requirePermission';
import { validate } from '../../middleware/validate';
import { Permissions } from '../../config/permissions';
import { createColorSchema, updateColorSchema } from './color.validation';

const router = Router();
router.get('/colors', authenticate, colorController.list);
router.get('/colors/:id', authenticate, colorController.getById);
router.post('/colors', authenticate, requirePermission(Permissions.PRODUCT_CREATE), validate(createColorSchema), colorController.create);
router.patch('/colors/:id', authenticate, requirePermission(Permissions.PRODUCT_EDIT), validate(updateColorSchema), colorController.update);
router.delete('/colors/:id', authenticate, requirePermission(Permissions.PRODUCT_DELETE), colorController.delete);
export default router;
