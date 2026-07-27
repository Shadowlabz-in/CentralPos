import { Router } from 'express';
import { roleController } from './role.controller';
import { authenticate } from '../../middleware/authenticate';
import { requirePermission } from '../../middleware/requirePermission';
import { validate } from '../../middleware/validate';
import { createRoleSchema, updateRoleSchema } from './role.validation';

const router = Router();

router.get('/roles', authenticate, requirePermission('admin:access'), roleController.list);
router.get('/roles/:id', authenticate, requirePermission('admin:access'), roleController.getById);
router.post('/roles', authenticate, requirePermission('admin:access'), validate(createRoleSchema), roleController.create);
router.patch('/roles/:id', authenticate, requirePermission('admin:access'), validate(updateRoleSchema), roleController.update);
router.delete('/roles/:id', authenticate, requirePermission('admin:access'), roleController.delete);

export default router;
