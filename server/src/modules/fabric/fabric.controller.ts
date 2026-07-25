import { Request, Response, NextFunction } from 'express';
import { fabricService } from './fabric.service';

export const fabricController = {
  async list(_req: Request, res: Response, next: NextFunction) {
    try {
      const storeId = _req.query.storeId as string | undefined;
      const fabrics = await fabricService.list(storeId);
      res.status(200).json({ status: 'success', data: fabrics });
    } catch (error) {
      next(error);
    }
  },

  async getById(req: Request, res: Response, next: NextFunction) {
    try {
      const fabric = await fabricService.getById(req.params.id);
      res.status(200).json({ status: 'success', data: fabric });
    } catch (error) {
      next(error);
    }
  },

  async create(req: Request, res: Response, next: NextFunction) {
    try {
      const fabric = await fabricService.create(req.body);
      res.status(201).json({ status: 'success', message: 'Fabric created successfully', data: fabric });
    } catch (error) {
      next(error);
    }
  },

  async update(req: Request, res: Response, next: NextFunction) {
    try {
      const fabric = await fabricService.update(req.params.id, req.body);
      res.status(200).json({ status: 'success', message: 'Fabric updated successfully', data: fabric });
    } catch (error) {
      next(error);
    }
  },

  async delete(req: Request, res: Response, next: NextFunction) {
    try {
      await fabricService.delete(req.params.id);
      res.status(200).json({ status: 'success', message: 'Fabric deleted successfully' });
    } catch (error) {
      next(error);
    }
  },
};
