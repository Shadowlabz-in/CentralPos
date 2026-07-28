import { Request, Response, NextFunction } from 'express';
import { supplierService } from './supplier.service';

export const supplierController = {
  async list(_req: Request, res: Response, next: NextFunction) {
    try {
      const storeId = (_req.query.storeId as string) || _req.user?.storeId;
      const suppliers = await supplierService.list(storeId);
      res.status(200).json({ status: 'success', data: suppliers });
    } catch (error) {
      next(error);
    }
  },

  async getById(req: Request, res: Response, next: NextFunction) {
    try {
      const supplier = await supplierService.getById(req.params.id);
      res.status(200).json({ status: 'success', data: supplier });
    } catch (error) {
      next(error);
    }
  },

  async create(req: Request, res: Response, next: NextFunction) {
    try {
      const data = { ...req.body, storeId: req.body.storeId || req.user?.storeId };
      const supplier = await supplierService.create(data);
      res.status(201).json({
        status: 'success',
        message: 'Supplier created successfully',
        data: supplier,
      });
    } catch (error) {
      next(error);
    }
  },

  async update(req: Request, res: Response, next: NextFunction) {
    try {
      const supplier = await supplierService.update(req.params.id, req.body);
      res.status(200).json({
        status: 'success',
        message: 'Supplier updated successfully',
        data: supplier,
      });
    } catch (error) {
      next(error);
    }
  },

  async delete(req: Request, res: Response, next: NextFunction) {
    try {
      await supplierService.delete(req.params.id);
      res.status(200).json({
        status: 'success',
        message: 'Supplier deleted successfully',
      });
    } catch (error) {
      next(error);
    }
  },
};
