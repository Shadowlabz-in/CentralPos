import { Request, Response, NextFunction } from 'express';
import { reportService } from './report.service';
import { toCsv, toExcelXml } from './export.service';

export const reportController = {
  async sales(req: Request, res: Response, next: NextFunction) {
    try {
      const {
        page = '1',
        limit = '20',
        fromDate,
        toDate,
        customerId,
        paymentMode,
        createdById,
      } = req.query as any;
      const result = await reportService.sales({
        page: parseInt(page) || 1,
        limit: parseInt(limit) || 20,
        fromDate,
        toDate,
        customerId,
        paymentMode,
        createdById,
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

  async purchases(req: Request, res: Response, next: NextFunction) {
    try {
      const { page = '1', limit = '20', fromDate, toDate, supplierId } = req.query as any;
      const result = await reportService.purchases({
        page: parseInt(page) || 1,
        limit: parseInt(limit) || 20,
        fromDate,
        toDate,
        supplierId,
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

  async inventory(req: Request, res: Response, next: NextFunction) {
    try {
      const {
        page = '1',
        limit = '20',
        categoryId,
        brandId,
        stockStatus,
        search,
      } = req.query as any;
      const result = await reportService.inventory({
        page: parseInt(page) || 1,
        limit: parseInt(limit) || 20,
        categoryId,
        brandId,
        stockStatus,
        search,
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

  async profit(req: Request, res: Response, next: NextFunction) {
    try {
      const { fromDate, toDate, period = 'monthly' } = req.query as any;
      const data = await reportService.profit({ fromDate, toDate, period });
      res.json({ status: 'success', data });
    } catch (error) {
      next(error);
    }
  },

  async gst(req: Request, res: Response, next: NextFunction) {
    try {
      const { fromDate, toDate } = req.query as any;
      const data = await reportService.gst({ fromDate, toDate });
      res.json({ status: 'success', data });
    } catch (error) {
      next(error);
    }
  },

  async customers(req: Request, res: Response, next: NextFunction) {
    try {
      const { page = '1', limit = '20', search } = req.query as any;
      const result = await reportService.customers({
        page: parseInt(page) || 1,
        limit: parseInt(limit) || 20,
        search,
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

  async suppliers(req: Request, res: Response, next: NextFunction) {
    try {
      const { page = '1', limit = '20', search } = req.query as any;
      const result = await reportService.suppliers({
        page: parseInt(page) || 1,
        limit: parseInt(limit) || 20,
        search,
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

  async exportData(req: Request, res: Response, next: NextFunction) {
    try {
      const { type = 'sales', format = 'csv', fromDate, toDate } = req.query as any;
      let rows: Record<string, any>[] = [];

      if (type === 'sales') {
        rows = await reportService.exportSales({ fromDate, toDate });
      }

      const filename = `${type}-report-${new Date().toISOString().slice(0, 10)}`;

      if (format === 'csv') {
        const csv = toCsv(rows);
        res.setHeader('Content-Type', 'text/csv');
        res.setHeader('Content-Disposition', `attachment; filename="${filename}.csv"`);
        return res.send(csv);
      }

      if (format === 'xlsx') {
        const xml = toExcelXml(rows);
        res.setHeader('Content-Type', 'application/vnd.ms-excel');
        res.setHeader('Content-Disposition', `attachment; filename="${filename}.xls"`);
        return res.send(xml);
      }

      res.json({ status: 'success', data: rows });
    } catch (error) {
      next(error);
    }
  },
};
