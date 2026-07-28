import { Router } from 'express';
import { occasionController } from './occasion.controller';
import { authenticate } from '../../middleware/authenticate';
import { requirePermission } from '../../middleware/requirePermission';
import { validate } from '../../middleware/validate';
import { Permissions } from '../../config/permissions';
import { createOccasionSchema, updateOccasionSchema } from './occasion.validation';

const router = Router();

router.get('/occasions', authenticate, occasionController.list);
router.get('/occasions/:id', authenticate, occasionController.getById);
router.post('/occasions', authenticate, requirePermission(Permissions.PRODUCT_CREATE), validate(createOccasionSchema), occasionController.create);
router.patch('/occasions/:id', authenticate, requirePermission(Permissions.PRODUCT_EDIT), validate(updateOccasionSchema), occasionController.update);
router.delete('/occasions/:id', authenticate, requirePermission(Permissions.PRODUCT_DELETE), occasionController.delete);

export default router;
