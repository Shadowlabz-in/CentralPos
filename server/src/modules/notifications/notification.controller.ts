import { Request, Response, NextFunction } from 'express';
import { notificationService } from './notification.service';

export const notificationController = {
  list: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 20;
      const result = await notificationService.list(req.user!.userId, page, limit);
      res.json({ status: 'success', ...result });
    } catch (error) {
      next(error);
    }
  },

  markAsRead: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const data = await notificationService.markAsRead(req.user!.userId, req.params.id);
      res.json({ status: 'success', data });
    } catch (error) {
      next(error);
    }
  },

  markAllAsRead: async (req: Request, res: Response, next: NextFunction) => {
    try {
      await notificationService.markAllAsRead(req.user!.userId);
      res.json({ status: 'success', message: 'All notifications marked as read' });
    } catch (error) {
      next(error);
    }
  },

  getSettings: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const data = await notificationService.getSettings(req.user!.userId);
      res.json({ status: 'success', data });
    } catch (error) {
      next(error);
    }
  },

  updateSettings: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const data = await notificationService.updateSettings(req.user!.userId, req.body);
      res.json({ status: 'success', message: 'Notification settings updated', data });
    } catch (error) {
      next(error);
    }
  },
};
