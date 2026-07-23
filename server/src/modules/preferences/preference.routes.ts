import { Router } from 'express';
import { preferenceController } from './preference.controller';
import { authenticate } from '../../middleware/authenticate';
import { validate } from '../../middleware/validate';
import { updatePreferenceSchema } from './preference.validation';

const router = Router();

/**
 * @openapi
 * /preferences:
 *   get:
 *     tags: [Preferences]
 *     summary: Get user preferences
 *   patch:
 *     tags: [Preferences]
 *     summary: Update user preferences
 */
router.get('/preferences', authenticate, preferenceController.get);
router.patch(
  '/preferences',
  authenticate,
  validate(updatePreferenceSchema),
  preferenceController.update,
);

export default router;
