import { Request, Response, NextFunction } from 'express';
import { preferenceService } from './preference.service';

export const preferenceController = {
  get: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const data = await preferenceService.get(req.user!.userId);
      res.json({ status: 'success', data });
    } catch (error) {
      next(error);
    }
  },

  update: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const data = await preferenceService.update(req.user!.userId, req.body);
      res.json({ status: 'success', message: 'Preferences updated', data });
    } catch (error) {
      next(error);
    }
  },
};
