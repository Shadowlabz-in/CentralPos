import { Router } from 'express';
import { storeController } from './store.controller';
import { authenticate } from '../../middleware/authenticate';
import { requirePermission } from '../../middleware/requirePermission';
import { validate } from '../../middleware/validate';
import { createStoreSchema, updateStoreSchema } from './store.validation';

const router = Router();

router.get('/stores', authenticate, requirePermission('store:view'), storeController.list);
router.get('/stores/:id', authenticate, requirePermission('store:view'), storeController.getById);
router.post('/stores', authenticate, requirePermission('store:create'), validate(createStoreSchema), storeController.create);
router.patch('/stores/:id', authenticate, requirePermission('store:edit'), validate(updateStoreSchema), storeController.update);
router.delete('/stores/:id', authenticate, requirePermission('store:delete'), storeController.delete);

export default router;
