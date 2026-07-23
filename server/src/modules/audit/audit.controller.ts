import { Request, Response, NextFunction } from 'express';
import { auditService } from './audit.service';

export const auditController = {
  list: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 50;
      const { action, module, userId } = req.query as any;
      const result = await auditService.list({ page, limit, action, module, userId });
      res.json({ status: 'success', ...result });
    } catch (error) {
      next(error);
    }
  },
};
