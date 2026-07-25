import { Router } from 'express';
import { occasionController } from './occasion.controller';
import { authenticate } from '../../middleware/authenticate';
import { authorize } from '../../middleware/authorize';
import { validate } from '../../middleware/validate';
import { createOccasionSchema, updateOccasionSchema } from './occasion.validation';

const router = Router();

router.get('/occasions', authenticate, occasionController.list);
router.get('/occasions/:id', authenticate, occasionController.getById);
router.post('/occasions', authenticate, authorize('ADMIN', 'MANAGER'), validate(createOccasionSchema), occasionController.create);
router.patch('/occasions/:id', authenticate, authorize('ADMIN', 'MANAGER'), validate(updateOccasionSchema), occasionController.update);
router.delete('/occasions/:id', authenticate, authorize('ADMIN'), occasionController.delete);

export default router;
