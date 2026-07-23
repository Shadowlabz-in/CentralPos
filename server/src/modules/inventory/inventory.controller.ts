import { Request, Response, NextFunction } from 'express';
import { inventoryService } from './inventory.service';

export const inventoryController = {
  async adjust(req: Request, res: Response, next: NextFunction) {
    try {
      const movement = await inventoryService.adjust({
        ...req.body,
        createdById: req.user!.userId,
        storeId: req.body.storeId || req.user!.storeId,
      });
      res.status(200).json({
        status: 'success',
        message: 'Stock adjusted successfully',
        data: movement,
      });
    } catch (error) {
      next(error);
    }
  },

  async current(req: Request, res: Response, next: NextFunction) {
    try {
      const { page, limit, search, categoryId, brandId, lowStock, sortBy, sortOrder } =
        req.query as any;

      const result = await inventoryService.current({
        page: parseInt(page) || 1,
        limit: parseInt(limit) || 10,
        search,
        categoryId,
        brandId,
        lowStock: lowStock === 'true',
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

  async history(req: Request, res: Response, next: NextFunction) {
    try {
      const { page, limit, productVariantId, productId, type, fromDate, toDate, sortOrder } =
        req.query as any;

      const result = await inventoryService.history({
        page: parseInt(page) || 1,
        limit: parseInt(limit) || 10,
        productVariantId,
        productId,
        type,
        fromDate,
        toDate,
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

  async lowStock(_req: Request, res: Response, next: NextFunction) {
    try {
      const items = await inventoryService.lowStock();
      res.status(200).json({
        status: 'success',
        data: items,
        count: items.length,
      });
    } catch (error) {
      next(error);
    }
  },

  async valuation(_req: Request, res: Response, next: NextFunction) {
    try {
      const result = await inventoryService.valuation();
      res.status(200).json({
        status: 'success',
        data: {
          totalValue: result.totalValue,
          itemCount: result.items.length,
          items: result.items,
        },
      });
    } catch (error) {
      next(error);
    }
  },
};
