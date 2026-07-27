import { Request, Response, NextFunction } from 'express';
import { planService } from './plan.service';
import { planRepository } from './plan.repository';

export const planController = {
  async list(req: Request, res: Response, next: NextFunction) {
    try {
      const activeOnly = req.query.active === 'true';
      const plans = await planService.list(activeOnly);
      res.json({ status: 'success', data: plans });
    } catch (error) {
      next(error);
    }
  },

  async getById(req: Request, res: Response, next: NextFunction) {
    try {
      const plan = await planService.getById(req.params.id);
      res.json({ status: 'success', data: plan });
    } catch (error) {
      next(error);
    }
  },

  async create(req: Request, res: Response, next: NextFunction) {
    try {
      const plan = await planService.create(req.body);
      res.status(201).json({ status: 'success', message: 'Plan created', data: plan });
    } catch (error) {
      next(error);
    }
  },

  async update(req: Request, res: Response, next: NextFunction) {
    try {
      const plan = await planService.update(req.params.id, req.body);
      res.json({ status: 'success', message: 'Plan updated', data: plan });
    } catch (error) {
      next(error);
    }
  },

  async delete(req: Request, res: Response, next: NextFunction) {
    try {
      await planService.delete(req.params.id);
      res.json({ status: 'success', message: 'Plan deleted' });
    } catch (error) {
      next(error);
    }
  },

  async getStoreSubscription(req: Request, res: Response, next: NextFunction) {
    try {
      const sub = await planService.getStoreSubscription(req.params.storeId);
      res.json({ status: 'success', data: sub });
    } catch (error) {
      next(error);
    }
  },

  async setStoreSubscription(req: Request, res: Response, next: NextFunction) {
    try {
      const sub = await planService.setStoreSubscription(req.params.storeId, req.body);
      res.json({ status: 'success', message: 'Subscription updated', data: sub });
    } catch (error) {
      next(error);
    }
  },

  async removeStoreSubscription(req: Request, res: Response, next: NextFunction) {
    try {
      await planService.removeStoreSubscription(req.params.storeId);
      res.json({ status: 'success', message: 'Subscription removed' });
    } catch (error) {
      next(error);
    }
  },

  async getStoreUsage(req: Request, res: Response, next: NextFunction) {
    try {
      const metrics = await planRepository.getSubscriptionMetrics(req.params.storeId);
      res.json({ status: 'success', data: metrics });
    } catch (error) {
      next(error);
    }
  },
};
