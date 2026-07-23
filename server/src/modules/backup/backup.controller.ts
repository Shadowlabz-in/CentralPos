import { Request, Response, NextFunction } from 'express';
import { backupService } from './backup.service';

export const backupController = {
  create: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const storeId = req.user!.storeId || req.body.storeId;
      const data = await backupService.create(req.user!.userId, storeId);
      res.json({ status: 'success', message: 'Backup created successfully', data });
    } catch (error) {
      next(error);
    }
  },

  list: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 20;
      const storeId = req.user!.storeId || req.body.storeId;
      const result = await backupService.list(storeId, page, limit);
      res.json({ status: 'success', ...result });
    } catch (error) {
      next(error);
    }
  },

  restore: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const result = await backupService.restore(req.params.id);
      res.json({ status: 'success', ...result });
    } catch (error) {
      next(error);
    }
  },
};
