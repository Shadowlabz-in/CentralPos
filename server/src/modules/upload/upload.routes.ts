import { Router } from 'express';
import multer from 'multer';
import path from 'path';
import { config } from '../../config';
import { uploadController } from './upload.controller';
import { authenticate } from '../../middleware/authenticate';
import { requirePermission } from '../../middleware/requirePermission';
import { Permissions } from '../../config/permissions';
import { AppError } from '../../middleware/errorHandler';

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    cb(null, config.upload.dir);
  },
  filename: (_req, file, cb) => {
    const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    cb(null, `${uniqueSuffix}${path.extname(file.originalname)}`);
  },
});

const fileFilter = (_req: any, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  const allowed = [...config.upload.allowedMimeTypes];
  if ((allowed as readonly string[]).includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new AppError('Only JPEG, PNG, and WebP images are allowed', 400));
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: config.upload.maxFileSize },
});

const router = Router();

/**
 * @openapi
 * /products/{productId}/images:
 *   post:
 *     tags: [Uploads]
 *     summary: Upload a product image
 */
router.post(
  '/products/:productId/images',
  authenticate,
  requirePermission(Permissions.PRODUCT_CREATE),
  upload.single('image'),
  uploadController.uploadImage,
);

/**
 * @openapi
 * /products/{productId}/images/multiple:
 *   post:
 *     tags: [Uploads]
 *     summary: Upload multiple product images
 */
router.post(
  '/products/:productId/images/multiple',
  authenticate,
  requirePermission(Permissions.PRODUCT_CREATE),
  upload.array('images', 10),
  uploadController.uploadMultipleImages,
);

/**
 * @openapi
 * /products/{productId}/images/{imageId}:
 *   delete:
 *     tags: [Uploads]
 *     summary: Delete a product image
 *   patch:
 *     tags: [Uploads]
 *     summary: Set image as primary
 */
router.delete(
  '/products/:productId/images/:imageId',
  authenticate,
  requirePermission(Permissions.PRODUCT_CREATE),
  uploadController.deleteImage,
);

router.patch(
  '/products/:productId/images/:imageId/primary',
  authenticate,
  requirePermission(Permissions.PRODUCT_CREATE),
  uploadController.setPrimaryImage,
);

export default router;
