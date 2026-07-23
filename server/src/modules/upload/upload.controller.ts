import { Request, Response, NextFunction } from 'express';
import { productService } from '../product/product.service';
import { AppError } from '../../middleware/errorHandler';

export const uploadController = {
  async uploadImage(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.file) throw new AppError('No image file provided', 400);

      const isPrimary = req.body.isPrimary === 'true';
      const image = await productService.uploadImage(req.params.productId, req.file, isPrimary);

      res.status(201).json({
        status: 'success',
        message: 'Image uploaded successfully',
        data: image,
      });
    } catch (error) {
      next(error);
    }
  },

  async uploadMultipleImages(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.files || (req.files as Express.Multer.File[]).length === 0) {
        throw new AppError('No image files provided', 400);
      }

      const files = req.files as Express.Multer.File[];
      const images = await Promise.all(
        files.map((file, index) =>
          productService.uploadImage(req.params.productId, file, index === 0),
        ),
      );

      res.status(201).json({
        status: 'success',
        message: `${images.length} image(s) uploaded successfully`,
        data: images,
      });
    } catch (error) {
      next(error);
    }
  },

  async deleteImage(req: Request, res: Response, next: NextFunction) {
    try {
      await productService.deleteImage(req.params.productId, req.params.imageId);
      res.status(200).json({
        status: 'success',
        message: 'Image deleted successfully',
      });
    } catch (error) {
      next(error);
    }
  },

  async setPrimaryImage(req: Request, res: Response, next: NextFunction) {
    try {
      const image = await productService.setPrimaryImage(req.params.productId, req.params.imageId);
      res.status(200).json({
        status: 'success',
        message: 'Primary image updated',
        data: image,
      });
    } catch (error) {
      next(error);
    }
  },
};
