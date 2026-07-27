import { Request, Response, NextFunction } from 'express';
import { storeService } from './store.service';

export const storeController = {
  async list(req: Request, res: Response, next: NextFunction) {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 20;
      const result = await storeService.list(page, limit);
      res.status(200).json({ status: 'success', ...result });
    } catch (error) {
      next(error);
    }
  },

  async getById(req: Request, res: Response, next: NextFunction) {
    try {
      const store = await storeService.getById(req.params.id);
      res.status(200).json({ status: 'success', data: store });
    } catch (error) {
      next(error);
    }
  },

  async create(req: Request, res: Response, next: NextFunction) {
    try {
      const store = await storeService.create(req.body);
      res.status(201).json({ status: 'success', message: 'Store created successfully', data: store });
    } catch (error) {
      next(error);
    }
  },

  async update(req: Request, res: Response, next: NextFunction) {
    try {
      const store = await storeService.update(req.params.id, req.body);
      res.status(200).json({ status: 'success', message: 'Store updated successfully', data: store });
    } catch (error) {
      next(error);
    }
  },

  async delete(req: Request, res: Response, next: NextFunction) {
    try {
      await storeService.delete(req.params.id);
      res.status(200).json({ status: 'success', message: 'Store deleted successfully' });
    } catch (error) {
      next(error);
    }
  },
};
