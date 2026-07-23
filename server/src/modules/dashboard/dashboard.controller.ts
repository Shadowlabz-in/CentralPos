import { Request, Response, NextFunction } from 'express';
import { dashboardService } from './dashboard.service';

export const dashboardController = {
  async overview(_req: Request, res: Response, next: NextFunction) {
    try {
      const data = await dashboardService.overview();
      res.json({ status: 'success', data });
    } catch (error) {
      next(error);
    }
  },

  async profit(req: Request, res: Response, next: NextFunction) {
    try {
      const { fromDate, toDate, categoryId, brandId } = req.query as any;
      const data = await dashboardService.profit({ fromDate, toDate, categoryId, brandId });
      res.json({ status: 'success', data });
    } catch (error) {
      next(error);
    }
  },

  async inventory(_req: Request, res: Response, next: NextFunction) {
    try {
      const data = await dashboardService.inventory();
      res.json({ status: 'success', data });
    } catch (error) {
      next(error);
    }
  },

  async purchases(_req: Request, res: Response, next: NextFunction) {
    try {
      const data = await dashboardService.purchases();
      res.json({ status: 'success', data });
    } catch (error) {
      next(error);
    }
  },

  async customers(_req: Request, res: Response, next: NextFunction) {
    try {
      const data = await dashboardService.customers();
      res.json({ status: 'success', data });
    } catch (error) {
      next(error);
    }
  },

  async salesChart(req: Request, res: Response, next: NextFunction) {
    try {
      const { period = 'daily', fromDate, toDate } = req.query as any;
      const data = await dashboardService.salesChart({ period, fromDate, toDate });
      res.json({ status: 'success', data });
    } catch (error) {
      next(error);
    }
  },

  async salesByCategory(req: Request, res: Response, next: NextFunction) {
    try {
      const { fromDate, toDate } = req.query as any;
      const data = await dashboardService.salesByCategory({ fromDate, toDate });
      res.json({ status: 'success', data });
    } catch (error) {
      next(error);
    }
  },

  async salesByBrand(req: Request, res: Response, next: NextFunction) {
    try {
      const { fromDate, toDate } = req.query as any;
      const data = await dashboardService.salesByBrand({ fromDate, toDate });
      res.json({ status: 'success', data });
    } catch (error) {
      next(error);
    }
  },

  async topProducts(req: Request, res: Response, next: NextFunction) {
    try {
      const { fromDate, toDate, limit } = req.query as any;
      const data = await dashboardService.topProducts({
        fromDate,
        toDate,
        limit: parseInt(limit) || 10,
      });
      res.json({ status: 'success', data });
    } catch (error) {
      next(error);
    }
  },

  async inventoryValueTrend(_req: Request, res: Response, next: NextFunction) {
    try {
      const data = await dashboardService.inventoryValueTrend();
      res.json({ status: 'success', data });
    } catch (error) {
      next(error);
    }
  },
};
