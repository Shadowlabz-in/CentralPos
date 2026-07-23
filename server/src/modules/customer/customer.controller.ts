import { Request, Response, NextFunction } from 'express';
import { customerService } from './customer.service';

export const customerController = {
  async list(req: Request, res: Response, next: NextFunction) {
    try {
      const { page = '1', limit = '10', search } = req.query as any;
      const result = await customerService.list({
        page: parseInt(page) || 1,
        limit: parseInt(limit) || 10,
        search,
      });
      res.json({
        status: 'success',
        data: result.data,
        meta: {
          total: result.total,
          page: parseInt(page) || 1,
          limit: parseInt(limit) || 10,
          totalPages: Math.ceil(result.total / (parseInt(limit) || 10)),
        },
      });
    } catch (error) {
      next(error);
    }
  },

  async getById(req: Request, res: Response, next: NextFunction) {
    try {
      const customer = await customerService.getById(req.params.id);
      res.json({ status: 'success', data: customer });
    } catch (error) {
      next(error);
    }
  },

  async create(req: Request, res: Response, next: NextFunction) {
    try {
      const customer = await customerService.create({
        ...req.body,
        storeId: req.body.storeId || req.user!.storeId,
      });
      res
        .status(201)
        .json({ status: 'success', message: 'Customer created successfully', data: customer });
    } catch (error) {
      next(error);
    }
  },

  async update(req: Request, res: Response, next: NextFunction) {
    try {
      const customer = await customerService.update(req.params.id, req.body);
      res.json({ status: 'success', message: 'Customer updated successfully', data: customer });
    } catch (error) {
      next(error);
    }
  },

  async delete(req: Request, res: Response, next: NextFunction) {
    try {
      await customerService.delete(req.params.id);
      res.json({ status: 'success', message: 'Customer deleted successfully' });
    } catch (error) {
      next(error);
    }
  },
};
