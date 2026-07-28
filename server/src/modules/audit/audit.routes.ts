import { Router } from 'express';
import { auditController } from './audit.controller';
import { authenticate } from '../../middleware/authenticate';
import { requirePermission } from '../../middleware/requirePermission';
import { Permissions } from '../../config/permissions';

const router = Router();

/**
 * @openapi
 * /audit-logs:
 *   get:
 *     tags: [Audit]
 *     summary: List audit logs
 */
router.get('/audit-logs', authenticate, requirePermission(Permissions.SYSTEM_AUDIT_LOG), auditController.list);

export default router;
