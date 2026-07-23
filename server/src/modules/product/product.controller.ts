import { Request, Response, NextFunction } from 'express';
import { productService } from './product.service';

export const productController = {
  async list(req: Request, res: Response, next: NextFunction) {
    try {
      const { page, limit, search, categoryId, brandId, isActive, size, color, sortBy, sortOrder } =
        req.query as any;

      const result = await productService.list({
        page: parseInt(page) || 1,
        limit: parseInt(limit) || 10,
        search,
        categoryId,
        brandId,
        isActive: isActive === 'true' ? true : isActive === 'false' ? false : undefined,
        size,
        color,
        sortBy,
        sortOrder,
      });

      res.status(200).json({
        status: 'success',
        data: result.data,
        meta: result.meta,
      });
    } catch (error) {
      next(error);
    }
  },

  async getById(req: Request, res: Response, next: NextFunction) {
    try {
      const product = await productService.getById(req.params.id);
      res.status(200).json({ status: 'success', data: product });
    } catch (error) {
      next(error);
    }
  },

  async create(req: Request, res: Response, next: NextFunction) {
    try {
      const product = await productService.create(req.body);
      res.status(201).json({
        status: 'success',
        message: 'Product created successfully',
        data: product,
      });
    } catch (error) {
      next(error);
    }
  },

  async createWithVariants(req: Request, res: Response, next: NextFunction) {
    try {
      const product = await productService.createWithVariants(
        req.body,
        (req as any).user?.userId,
        (req as any).user?.storeId,
      );
      res.status(201).json({
        status: 'success',
        message: 'Product created successfully',
        data: product,
      });
    } catch (error) {
      next(error);
    }
  },

  async update(req: Request, res: Response, next: NextFunction) {
    try {
      const product = await productService.update(req.params.id, req.body);
      res.status(200).json({
        status: 'success',
        message: 'Product updated successfully',
        data: product,
      });
    } catch (error) {
      next(error);
    }
  },

  async delete(req: Request, res: Response, next: NextFunction) {
    try {
      await productService.delete(req.params.id);
      res.status(200).json({
        status: 'success',
        message: 'Product deleted successfully',
      });
    } catch (error) {
      next(error);
    }
  },
};
