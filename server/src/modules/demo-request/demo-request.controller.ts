import { Request, Response, NextFunction } from 'express';
import { demoRequestRepository } from './demo-request.repository';

export const demoRequestController = {
  async create(req: Request, res: Response, next: NextFunction) {
    try {
      const demo = await demoRequestRepository.create(req.body);
      res.status(201).json({ status: 'success', message: 'Demo request submitted', data: demo });
    } catch (error) {
      next(error);
    }
  },

  async list(req: Request, res: Response, next: NextFunction) {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 20;
      const result = await demoRequestRepository.findAll(page, limit);
      res.json({ status: 'success', ...result });
    } catch (error) {
      next(error);
    }
  },

  async update(req: Request, res: Response, next: NextFunction) {
    try {
      const demo = await demoRequestRepository.update(req.params.id, req.body);
      res.json({ status: 'success', message: 'Demo request updated', data: demo });
    } catch (error) {
      next(error);
    }
  },

  async stats(req: Request, res: Response, next: NextFunction) {
    try {
      const stats = await demoRequestRepository.getStats();
      res.json({ status: 'success', data: stats });
    } catch (error) {
      next(error);
    }
  },
};
