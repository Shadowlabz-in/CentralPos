import { Router } from 'express';
import { demoRequestController } from './demo-request.controller';
import { authenticate } from '../../middleware/authenticate';
import { requirePermission } from '../../middleware/requirePermission';

const router = Router();

router.post('/demo-requests', demoRequestController.create);
router.get('/demo-requests', authenticate, requirePermission('admin:access'), demoRequestController.list);
router.patch('/demo-requests/:id', authenticate, requirePermission('admin:access'), demoRequestController.update);
router.get('/demo-requests/stats', authenticate, requirePermission('admin:access'), demoRequestController.stats);

export default router;
