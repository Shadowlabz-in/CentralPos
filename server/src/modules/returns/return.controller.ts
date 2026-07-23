import { Request, Response, NextFunction } from 'express';
import { returnService } from './return.service';

export const returnController = {
  async createReturn(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await returnService.createReturn(
        req.user!.userId,
        req.user!.storeId || req.body.storeId,
        req.body,
      );
      res
        .status(201)
        .json({ status: 'success', message: 'Return processed successfully', data: result });
    } catch (error) {
      next(error);
    }
  },

  async listReturns(req: Request, res: Response, next: NextFunction) {
    try {
      const { page = '1', limit = '20', saleId } = req.query as any;
      const result = await returnService.listReturns({
        page: parseInt(page) || 1,
        limit: parseInt(limit) || 20,
        saleId,
      });
      res.json({
        status: 'success',
        data: result.data,
        meta: {
          total: result.total,
          page: parseInt(page) || 1,
          limit: parseInt(limit) || 20,
          totalPages: Math.ceil(result.total / (parseInt(limit) || 20)),
        },
      });
    } catch (error) {
      next(error);
    }
  },

  async getReturn(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await returnService.getReturn(req.params.id);
      res.json({ status: 'success', data: result });
    } catch (error) {
      next(error);
    }
  },

  async processExchange(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await returnService.processExchange(
        req.user!.userId,
        req.user!.storeId || req.body.storeId,
        req.body,
      );
      res
        .status(201)
        .json({ status: 'success', message: 'Exchange processed successfully', data: result });
    } catch (error) {
      next(error);
    }
  },

  async processRefund(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await returnService.processRefund(req.user!.userId, req.body);
      res.json({ status: 'success', message: 'Refund processed successfully', data: result });
    } catch (error) {
      next(error);
    }
  },

  async createCreditNote(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await returnService.createCreditNote(
        req.user!.userId,
        req.user!.storeId || req.body.storeId,
        req.body,
      );
      res
        .status(201)
        .json({ status: 'success', message: 'Credit note created successfully', data: result });
    } catch (error) {
      next(error);
    }
  },

  async listCreditNotes(req: Request, res: Response, next: NextFunction) {
    try {
      const { page = '1', limit = '20', customerId, status } = req.query as any;
      const result = await returnService.listCreditNotes({
        page: parseInt(page) || 1,
        limit: parseInt(limit) || 20,
        customerId,
        status,
      });
      res.json({
        status: 'success',
        data: result.data,
        meta: {
          total: result.total,
          page: parseInt(page) || 1,
          limit: parseInt(limit) || 20,
          totalPages: Math.ceil(result.total / (parseInt(limit) || 20)),
        },
      });
    } catch (error) {
      next(error);
    }
  },

  async redeemCreditNote(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await returnService.redeemCreditNote(req.user!.userId, req.body);
      res.json({ status: 'success', message: 'Credit note redeemed successfully', data: result });
    } catch (error) {
      next(error);
    }
  },
};
