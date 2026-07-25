import { Router } from 'express';
import { sizeController } from './size.controller';
import { authenticate } from '../../middleware/authenticate';
import { authorize } from '../../middleware/authorize';
import { validate } from '../../middleware/validate';
import { createSizeSchema, updateSizeSchema } from './size.validation';

const router = Router();
router.get('/sizes', authenticate, sizeController.list);
router.get('/sizes/:id', authenticate, sizeController.getById);
router.post('/sizes', authenticate, authorize('ADMIN', 'MANAGER'), validate(createSizeSchema), sizeController.create);
router.patch('/sizes/:id', authenticate, authorize('ADMIN', 'MANAGER'), validate(updateSizeSchema), sizeController.update);
router.delete('/sizes/:id', authenticate, authorize('ADMIN'), sizeController.delete);
export default router;
