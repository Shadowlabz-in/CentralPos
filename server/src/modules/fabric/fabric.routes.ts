import { Router } from 'express';
import { fabricController } from './fabric.controller';
import { authenticate } from '../../middleware/authenticate';
import { authorize } from '../../middleware/authorize';
import { validate } from '../../middleware/validate';
import { createFabricSchema, updateFabricSchema } from './fabric.validation';

const router = Router();

router.get('/fabrics', authenticate, fabricController.list);
router.get('/fabrics/:id', authenticate, fabricController.getById);
router.post('/fabrics', authenticate, authorize('ADMIN', 'MANAGER'), validate(createFabricSchema), fabricController.create);
router.patch('/fabrics/:id', authenticate, authorize('ADMIN', 'MANAGER'), validate(updateFabricSchema), fabricController.update);
router.delete('/fabrics/:id', authenticate, authorize('ADMIN'), fabricController.delete);

export default router;
