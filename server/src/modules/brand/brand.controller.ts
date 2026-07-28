import { Request, Response, NextFunction } from 'express';
import { brandService } from './brand.service';

export const brandController = {
  async list(_req: Request, res: Response, next: NextFunction) {
    try {
      const storeId = (_req.query.storeId as string) || _req.user?.storeId;
      const brands = await brandService.list(storeId);
      res.status(200).json({ status: 'success', data: brands });
    } catch (error) {
      next(error);
    }
  },

  async getById(req: Request, res: Response, next: NextFunction) {
    try {
      const brand = await brandService.getById(req.params.id);
      res.status(200).json({ status: 'success', data: brand });
    } catch (error) {
      next(error);
    }
  },

  async create(req: Request, res: Response, next: NextFunction) {
    try {
      const data = { ...req.body, storeId: req.body.storeId || req.user?.storeId };
      const brand = await brandService.create(data);
      res.status(201).json({
        status: 'success',
        message: 'Brand created successfully',
        data: brand,
      });
    } catch (error) {
      next(error);
    }
  },

  async update(req: Request, res: Response, next: NextFunction) {
    try {
      const brand = await brandService.update(req.params.id, req.body);
      res.status(200).json({
        status: 'success',
        message: 'Brand updated successfully',
        data: brand,
      });
    } catch (error) {
      next(error);
    }
  },

  async delete(req: Request, res: Response, next: NextFunction) {
    try {
      await brandService.delete(req.params.id);
      res.status(200).json({
        status: 'success',
        message: 'Brand deleted successfully',
      });
    } catch (error) {
      next(error);
    }
  },
};
