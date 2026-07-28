import { Router } from 'express';
import { categoryController } from './category.controller';
import { authenticate } from '../../middleware/authenticate';
import { requirePermission } from '../../middleware/requirePermission';
import { validate } from '../../middleware/validate';
import { Permissions } from '../../config/permissions';
import { createCategorySchema, updateCategorySchema } from './category.validation';

const router = Router();

/**
 * @openapi
 * /categories:
 *   get:
 *     tags: [Categories]
 *     summary: List all categories
 *   post:
 *     tags: [Categories]
 *     summary: Create a new category
 */
router.get('/categories', authenticate, categoryController.list);
/**
 * @openapi
 * /categories/{id}:
 *   get:
 *     tags: [Categories]
 *     summary: Get category by ID
 *   patch:
 *     tags: [Categories]
 *     summary: Update category by ID
 *   delete:
 *     tags: [Categories]
 *     summary: Delete category by ID
 */
router.get('/categories/:id', authenticate, categoryController.getById);
router.post(
  '/categories',
  authenticate,
  requirePermission(Permissions.CATEGORY_CREATE),
  validate(createCategorySchema),
  categoryController.create,
);
router.patch(
  '/categories/:id',
  authenticate,
  requirePermission(Permissions.CATEGORY_EDIT),
  validate(updateCategorySchema),
  categoryController.update,
);
router.delete('/categories/:id', authenticate, requirePermission(Permissions.CATEGORY_DELETE), categoryController.delete);

export default router;
