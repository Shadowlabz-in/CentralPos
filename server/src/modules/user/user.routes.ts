import { Router } from 'express';
import { userController } from './user.controller';
import { authenticate } from '../../middleware/authenticate';
import { requirePermission } from '../../middleware/requirePermission';
import { validate } from '../../middleware/validate';
import { audit } from '../audit/audit.service';
import { createUserSchema, updateUserSchema } from './user.validation';

const router = Router();

router.get('/users/me', authenticate, userController.getProfile);

router.get('/users', authenticate, requirePermission('user:view'), userController.list);

router.get('/users/:id', authenticate, requirePermission('user:view'), userController.getById);

router.post(
  '/users',
  authenticate,
  requirePermission('user:create'),
  validate(createUserSchema),
  audit('USER_CREATE', 'USER_MANAGEMENT'),
  userController.create,
);

router.patch(
  '/users/:id',
  authenticate,
  requirePermission('user:edit'),
  validate(updateUserSchema),
  audit('USER_UPDATE', 'USER_MANAGEMENT'),
  userController.update,
);

router.delete(
  '/users/:id',
  authenticate,
  requirePermission('user:delete'),
  audit('USER_DELETE', 'USER_MANAGEMENT'),
  userController.delete,
);

export default router;
