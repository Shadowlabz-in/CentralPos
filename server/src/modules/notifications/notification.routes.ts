import { Router } from 'express';
import { notificationController } from './notification.controller';
import { authenticate } from '../../middleware/authenticate';
import { validate } from '../../middleware/validate';
import { updateNotificationSettingSchema } from './notification.validation';

const router = Router();

/**
 * @openapi
 * /notifications:
 *   get:
 *     tags: [Notifications]
 *     summary: List notifications
 */
router.get('/notifications', authenticate, notificationController.list);
/**
 * @openapi
 * /notifications/{id}/read:
 *   patch:
 *     tags: [Notifications]
 *     summary: Mark notification as read
 */
router.patch('/notifications/:id/read', authenticate, notificationController.markAsRead);
/**
 * @openapi
 * /notifications/read-all:
 *   patch:
 *     tags: [Notifications]
 *     summary: Mark all notifications as read
 */
router.patch('/notifications/read-all', authenticate, notificationController.markAllAsRead);

/**
 * @openapi
 * /notification-settings:
 *   get:
 *     tags: [Notifications]
 *     summary: Get notification settings
 *   patch:
 *     tags: [Notifications]
 *     summary: Update notification settings
 */
router.get('/notification-settings', authenticate, notificationController.getSettings);
router.patch(
  '/notification-settings',
  authenticate,
  validate(updateNotificationSettingSchema),
  notificationController.updateSettings,
);

export default router;
