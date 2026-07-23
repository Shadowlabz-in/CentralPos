import { Request, Response, NextFunction } from 'express';
import { settingsService } from './settings.service';

export const settingsController = {
  getStore: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const data = await settingsService.getStore(req.user!.storeId || req.body.storeId);
      res.json({ status: 'success', data });
    } catch (error) {
      next(error);
    }
  },
  updateStore: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const data = await settingsService.updateStore(
        req.user!.storeId || req.body.storeId,
        req.body,
      );
      res.json({ status: 'success', message: 'Store settings updated', data });
    } catch (error) {
      next(error);
    }
  },

  getInvoice: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const data = await settingsService.getInvoice(req.user!.storeId || req.body.storeId);
      res.json({ status: 'success', data });
    } catch (error) {
      next(error);
    }
  },
  updateInvoice: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const data = await settingsService.updateInvoice(
        req.user!.storeId || req.body.storeId,
        req.body,
      );
      res.json({ status: 'success', message: 'Invoice settings updated', data });
    } catch (error) {
      next(error);
    }
  },

  getGst: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const data = await settingsService.getGst(req.user!.storeId || req.body.storeId);
      res.json({ status: 'success', data });
    } catch (error) {
      next(error);
    }
  },
  updateGst: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const data = await settingsService.updateGst(req.user!.storeId || req.body.storeId, req.body);
      res.json({ status: 'success', message: 'GST settings updated', data });
    } catch (error) {
      next(error);
    }
  },

  getBarcode: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const data = await settingsService.getBarcode(req.user!.storeId || req.body.storeId);
      res.json({ status: 'success', data });
    } catch (error) {
      next(error);
    }
  },
  updateBarcode: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const data = await settingsService.updateBarcode(
        req.user!.storeId || req.body.storeId,
        req.body,
      );
      res.json({ status: 'success', message: 'Barcode settings updated', data });
    } catch (error) {
      next(error);
    }
  },

  getPrinter: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const data = await settingsService.getPrinter(req.user!.storeId || req.body.storeId);
      res.json({ status: 'success', data });
    } catch (error) {
      next(error);
    }
  },
  updatePrinter: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const data = await settingsService.updatePrinter(
        req.user!.storeId || req.body.storeId,
        req.body,
      );
      res.json({ status: 'success', message: 'Printer settings updated', data });
    } catch (error) {
      next(error);
    }
  },
};
