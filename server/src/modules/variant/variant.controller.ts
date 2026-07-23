import { Request, Response, NextFunction } from 'express';
import { variantService } from './variant.service';

export const variantController = {
  async list(req: Request, res: Response, next: NextFunction) {
    try {
      const variants = await variantService.list(req.params.productId);
      res.status(200).json({ status: 'success', data: variants });
    } catch (error) {
      next(error);
    }
  },

  async getById(req: Request, res: Response, next: NextFunction) {
    try {
      const variant = await variantService.getById(req.params.id);
      res.status(200).json({ status: 'success', data: variant });
    } catch (error) {
      next(error);
    }
  },

  async create(req: Request, res: Response, next: NextFunction) {
    try {
      const variant = await variantService.create(req.params.productId, {
        ...req.body,
        storeId: (req.user as any)?.storeId,
        createdById: (req.user as any)?.userId,
      });
      res.status(201).json({
        status: 'success',
        message: 'Variant created successfully',
        data: variant,
      });
    } catch (error) {
      next(error);
    }
  },

  async update(req: Request, res: Response, next: NextFunction) {
    try {
      const variant = await variantService.update(req.params.id, req.body);
      res.status(200).json({
        status: 'success',
        message: 'Variant updated successfully',
        data: variant,
      });
    } catch (error) {
      next(error);
    }
  },

  async delete(req: Request, res: Response, next: NextFunction) {
    try {
      await variantService.delete(req.params.id);
      res.status(200).json({
        status: 'success',
        message: 'Variant deleted successfully',
      });
    } catch (error) {
      next(error);
    }
  },
};
