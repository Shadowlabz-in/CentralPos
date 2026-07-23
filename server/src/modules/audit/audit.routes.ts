import { Router } from 'express';
import { auditController } from './audit.controller';
import { authenticate } from '../../middleware/authenticate';
import { authorize } from '../../middleware/authorize';

const router = Router();

/**
 * @openapi
 * /audit-logs:
 *   get:
 *     tags: [Audit]
 *     summary: List audit logs
 */
router.get('/audit-logs', authenticate, authorize('ADMIN', 'MANAGER'), auditController.list);

export default router;
