import { Request, Response, NextFunction } from 'express';
import { occasionService } from './occasion.service';

export const occasionController = {
  async list(_req: Request, res: Response, next: NextFunction) {
    try {
      const storeId = (_req.query.storeId as string) || _req.user?.storeId;
      const occasions = await occasionService.list(storeId);
      res.status(200).json({ status: 'success', data: occasions });
    } catch (error) {
      next(error);
    }
  },

  async getById(req: Request, res: Response, next: NextFunction) {
    try {
      const occasion = await occasionService.getById(req.params.id);
      res.status(200).json({ status: 'success', data: occasion });
    } catch (error) {
      next(error);
    }
  },

  async create(req: Request, res: Response, next: NextFunction) {
    try {
      const data = { ...req.body, storeId: req.body.storeId || req.user?.storeId };
      const occasion = await occasionService.create(data);
      res.status(201).json({ status: 'success', message: 'Occasion created successfully', data: occasion });
    } catch (error) {
      next(error);
    }
  },

  async update(req: Request, res: Response, next: NextFunction) {
    try {
      const occasion = await occasionService.update(req.params.id, req.body);
      res.status(200).json({ status: 'success', message: 'Occasion updated successfully', data: occasion });
    } catch (error) {
      next(error);
    }
  },

  async delete(req: Request, res: Response, next: NextFunction) {
    try {
      await occasionService.delete(req.params.id);
      res.status(200).json({ status: 'success', message: 'Occasion deleted successfully' });
    } catch (error) {
      next(error);
    }
  },
};
