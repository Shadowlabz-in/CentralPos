import { Request, Response, NextFunction } from 'express';
import { inventoryItemService } from './inventory-item.service';

export const inventoryItemController = {
  async batchCreate(req: Request, res: Response, next: NextFunction) {
    try {
      const { variantId, quantity, serialNumbers } = req.body;
      const result = await inventoryItemService.batchCreate({
        variantId,
        quantity,
        serialNumbers,
        storeId: req.user!.storeId!,
        createdById: req.user!.userId,
      });
      res.status(201).json({ status: 'success', data: result });
    } catch (error) {
      next(error);
    }
  },

  async lookup(req: Request, res: Response, next: NextFunction) {
    try {
      const item = await inventoryItemService.lookupByBarcode(req.params.barcode);
      res.json({ status: 'success', data: item });
    } catch (error) {
      next(error);
    }
  },

  async list(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await inventoryItemService.list({
        variantId: req.query.variantId as string | undefined,
        status: req.query.status as any,
        search: req.query.search as string | undefined,
        page: req.query.page ? parseInt(req.query.page as string) : undefined,
        limit: req.query.limit ? parseInt(req.query.limit as string) : undefined,
      });
      res.json({ status: 'success', ...result });
    } catch (error) {
      next(error);
    }
  },

  async updateStatus(req: Request, res: Response, next: NextFunction) {
    try {
      const item = await inventoryItemService.updateStatus(
        req.params.id,
        req.body.status,
        req.user!.userId,
        req.body.reason,
      );
      res.json({ status: 'success', data: item });
    } catch (error) {
      next(error);
    }
  },

  async printBarcodes(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await inventoryItemService.printBarcodes(
        req.body.ids,
        req.body.labelWidth,
        req.body.labelHeight,
      );
      res.json({ status: 'success', data: result });
    } catch (error) {
      next(error);
    }
  },

  async inventoryCount(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await inventoryItemService.getInventoryCount(req.params.variantId);
      res.json({ status: 'success', data: result });
    } catch (error) {
      next(error);
    }
  },
};
