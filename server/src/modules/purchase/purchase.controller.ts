import { Request, Response, NextFunction } from 'express';
import { purchaseService } from './purchase.service';

export const purchaseController = {
  async list(req: Request, res: Response, next: NextFunction) {
    try {
      const {
        page,
        limit,
        search,
        supplierId,
        status,
        paymentStatus,
        fromDate,
        toDate,
        sortBy,
        sortOrder,
      } = req.query as any;

      const result = await purchaseService.list({
        page: parseInt(page) || 1,
        limit: parseInt(limit) || 10,
        search,
        supplierId,
        status,
        paymentStatus,
        fromDate,
        toDate,
        sortBy,
        sortOrder,
      });

      res.status(200).json({
        status: 'success',
        data: result.data,
        meta: result.meta,
      });
    } catch (error) {
      next(error);
    }
  },

  async getById(req: Request, res: Response, next: NextFunction) {
    try {
      const purchase = await purchaseService.getById(req.params.id);
      res.status(200).json({ status: 'success', data: purchase });
    } catch (error) {
      next(error);
    }
  },

  async create(req: Request, res: Response, next: NextFunction) {
    try {
      const purchase = await purchaseService.create({
        ...req.body,
        createdById: req.user!.userId,
        storeId: req.body.storeId || req.user!.storeId,
      });
      res.status(201).json({
        status: 'success',
        message: 'Purchase created successfully. Stock updated.',
        data: purchase,
      });
    } catch (error) {
      next(error);
    }
  },

  async update(req: Request, res: Response, next: NextFunction) {
    try {
      const purchase = await purchaseService.update(req.params.id, req.body);
      res.status(200).json({
        status: 'success',
        message: 'Purchase updated successfully',
        data: purchase,
      });
    } catch (error) {
      next(error);
    }
  },
};
