import { Request, Response, NextFunction } from 'express';
import { categoryService } from './category.service';

export const categoryController = {
  async list(_req: Request, res: Response, next: NextFunction) {
    try {
      const storeId = (_req.query.storeId as string) || _req.user?.storeId;
      const categories = await categoryService.list(storeId);
      res.status(200).json({ status: 'success', data: categories });
    } catch (error) {
      next(error);
    }
  },

  async getById(req: Request, res: Response, next: NextFunction) {
    try {
      const category = await categoryService.getById(req.params.id);
      res.status(200).json({ status: 'success', data: category });
    } catch (error) {
      next(error);
    }
  },

  async create(req: Request, res: Response, next: NextFunction) {
    try {
      const data = { ...req.body, storeId: req.body.storeId || req.user?.storeId };
      const category = await categoryService.create(data);
      res.status(201).json({
        status: 'success',
        message: 'Category created successfully',
        data: category,
      });
    } catch (error) {
      next(error);
    }
  },

  async update(req: Request, res: Response, next: NextFunction) {
    try {
      const category = await categoryService.update(req.params.id, req.body);
      res.status(200).json({
        status: 'success',
        message: 'Category updated successfully',
        data: category,
      });
    } catch (error) {
      next(error);
    }
  },

  async delete(req: Request, res: Response, next: NextFunction) {
    try {
      await categoryService.delete(req.params.id);
      res.status(200).json({
        status: 'success',
        message: 'Category deleted successfully',
      });
    } catch (error) {
      next(error);
    }
  },
};
