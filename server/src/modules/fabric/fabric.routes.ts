import { Router } from 'express';
import { fabricController } from './fabric.controller';
import { authenticate } from '../../middleware/authenticate';
import { requirePermission } from '../../middleware/requirePermission';
import { Permissions } from '../../config/permissions';
import { validate } from '../../middleware/validate';
import { createFabricSchema, updateFabricSchema } from './fabric.validation';

const router = Router();

router.get('/fabrics', authenticate, fabricController.list);
router.get('/fabrics/:id', authenticate, fabricController.getById);
router.post('/fabrics', authenticate, requirePermission(Permissions.PRODUCT_CREATE), validate(createFabricSchema), fabricController.create);
router.patch('/fabrics/:id', authenticate, requirePermission(Permissions.PRODUCT_EDIT), validate(updateFabricSchema), fabricController.update);
router.delete('/fabrics/:id', authenticate, requirePermission(Permissions.PRODUCT_DELETE), fabricController.delete);

export default router;
