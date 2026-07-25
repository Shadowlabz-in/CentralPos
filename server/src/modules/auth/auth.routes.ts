import { Router } from 'express';
import { authController } from './auth.controller';
import { authenticate } from '../../middleware/authenticate';
import { validate } from '../../middleware/validate';
import { authLimiter } from '../../utils/rateLimiter';
import { loginSchema, changePasswordSchema, refreshTokenSchema, firebaseLoginSchema } from './auth.validation';

const router = Router();

/**
 * @openapi
 * /auth/login:
 *   post:
 *     tags: [Auth]
 *     summary: Login with email & password
 */
router.post('/auth/login', authLimiter, validate(loginSchema), authController.login);

/**
 * @openapi
 * /auth/firebase:
 *   post:
 *     tags: [Auth]
 *     summary: Login with Firebase ID token
 */
router.post('/auth/firebase', authLimiter, validate(firebaseLoginSchema), authController.firebaseLogin);

/**
 * @openapi
 * /auth/logout:
 *   post:
 *     tags: [Auth]
 *     summary: Logout current session
 */
router.post('/auth/logout', authenticate, authController.logout);

/**
 * @openapi
 * /auth/refresh:
 *   post:
 *     tags: [Auth]
 *     summary: Refresh access token
 */
router.post('/auth/refresh', validate(refreshTokenSchema), authController.refresh);

/**
 * @openapi
 * /auth/change-password:
 *   post:
 *     tags: [Auth]
 *     summary: Change current user password
 */
router.post(
  '/auth/change-password',
  authenticate,
  validate(changePasswordSchema),
  authController.changePassword,
);

export default router;
