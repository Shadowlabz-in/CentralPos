import { Router } from 'express';
import { backupController } from './backup.controller';
import { authenticate } from '../../middleware/authenticate';
import { requirePermission } from '../../middleware/requirePermission';
import { Permissions } from '../../config/permissions';

const router = Router();

/**
 * @openapi
 * /settings/backups:
 *   post:
 *     tags: [Backups]
 *     summary: Create a new backup
 *   get:
 *     tags: [Backups]
 *     summary: List all backups
 */
router.post('/settings/backups', authenticate, requirePermission(Permissions.SYSTEM_BACKUP), backupController.create);
router.get('/settings/backups', authenticate, requirePermission(Permissions.SYSTEM_BACKUP), backupController.list);
/**
 * @openapi
 * /settings/backups/{id}/restore:
 *   post:
 *     tags: [Backups]
 *     summary: Restore a backup
 */
router.post(
  '/settings/backups/:id/restore',
  authenticate,
  requirePermission(Permissions.SYSTEM_RESTORE),
  backupController.restore,
);

export default router;
