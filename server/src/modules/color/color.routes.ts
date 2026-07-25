import { Router } from 'express';
import { colorController } from './color.controller';
import { authenticate } from '../../middleware/authenticate';
import { authorize } from '../../middleware/authorize';
import { validate } from '../../middleware/validate';
import { createColorSchema, updateColorSchema } from './color.validation';

const router = Router();
router.get('/colors', authenticate, colorController.list);
router.get('/colors/:id', authenticate, colorController.getById);
router.post('/colors', authenticate, authorize('ADMIN', 'MANAGER'), validate(createColorSchema), colorController.create);
router.patch('/colors/:id', authenticate, authorize('ADMIN', 'MANAGER'), validate(updateColorSchema), colorController.update);
router.delete('/colors/:id', authenticate, authorize('ADMIN'), colorController.delete);
export default router;
