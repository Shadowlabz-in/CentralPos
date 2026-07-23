import { Router } from 'express';
import { backupController } from './backup.controller';
import { authenticate } from '../../middleware/authenticate';
import { authorize } from '../../middleware/authorize';

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
router.post('/settings/backups', authenticate, authorize('ADMIN'), backupController.create);
router.get('/settings/backups', authenticate, authorize('ADMIN', 'MANAGER'), backupController.list);
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
  authorize('ADMIN'),
  backupController.restore,
);

export default router;
