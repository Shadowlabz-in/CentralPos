import { Router } from 'express';
import { planController } from './plan.controller';
import { authenticate } from '../../middleware/authenticate';
import { requirePermission } from '../../middleware/requirePermission';
import { validate } from '../../middleware/validate';
import { createPlanSchema, updatePlanSchema, createSubscriptionSchema, updateSubscriptionSchema } from './plan.validation';

const router = Router();

router.get('/plans', planController.list);
router.get('/plans/:id', planController.getById);
router.post('/plans', authenticate, requirePermission('plan:create'), validate(createPlanSchema), planController.create);
router.patch('/plans/:id', authenticate, requirePermission('plan:edit'), validate(updatePlanSchema), planController.update);
router.delete('/plans/:id', authenticate, requirePermission('plan:delete'), planController.delete);

router.get('/stores/:storeId/subscription', authenticate, planController.getStoreSubscription);
router.post('/stores/:storeId/subscription', authenticate, requirePermission('store:edit'), validate(createSubscriptionSchema), planController.setStoreSubscription);
router.patch('/stores/:storeId/subscription', authenticate, requirePermission('store:edit'), validate(updateSubscriptionSchema), planController.setStoreSubscription);
router.delete('/stores/:storeId/subscription', authenticate, requirePermission('store:edit'), planController.removeStoreSubscription);
router.get('/stores/:storeId/subscription/usage', authenticate, planController.getStoreUsage);

export default router;
