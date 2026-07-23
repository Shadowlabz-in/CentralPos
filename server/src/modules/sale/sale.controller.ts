import { Request, Response, NextFunction } from 'express';
import { saleService } from './sale.service';
import { invoiceService } from './invoice.service';
import { AppError } from '../../middleware/errorHandler';

export const saleController = {
  async checkout(req: Request, res: Response, next: NextFunction) {
    try {
      const { customerId, isGst, discountAmount, notes, payments, items } = req.body;
      const cartItems = items || [];

      if (!cartItems.length) {
        return next(new AppError('Cart is empty. Add items before checkout.', 400));
      }

      const sale = await saleService.checkout(
        req.user!.userId,
        req.user!.storeId || req.body.storeId,
        {
          customerId,
          isGst: isGst ?? true,
          discountAmount: discountAmount || 0,
          notes,
          payments,
          cartItems,
        },
      );

      res.status(201).json({
        status: 'success',
        message: 'Sale completed successfully',
        data: sale,
      });
    } catch (error) {
      next(error);
    }
  },

  async list(req: Request, res: Response, next: NextFunction) {
    try {
      const { page = '1', limit = '10', fromDate, toDate, customerId } = req.query as any;
      const result = await saleService.list({
        page: parseInt(page) || 1,
        limit: parseInt(limit) || 10,
        fromDate,
        toDate,
        customerId,
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
      const sale = await saleService.getById(req.params.id);
      res.json({ status: 'success', data: sale });
    } catch (error) {
      next(error);
    }
  },

  async cancel(req: Request, res: Response, next: NextFunction) {
    try {
      await saleService.cancel(req.params.id, req.user!.userId);
      res.json({ status: 'success', message: 'Sale cancelled successfully. Stock restored.' });
    } catch (error) {
      next(error);
    }
  },

  async invoice(req: Request, res: Response, next: NextFunction) {
    try {
      const sale = await saleService.getById(req.params.id);
      const format = req.query.format || 'html';
      if (format === 'pdf') {
        const pdfBuffer = await invoiceService.generatePdf(sale);
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader(
          'Content-Disposition',
          `attachment; filename="invoice-${sale.invoiceNumber}.pdf"`,
        );
        res.send(pdfBuffer);
      } else {
        const html = invoiceService.generateHtml(sale);
        res.setHeader('Content-Type', 'text/html');
        res.send(html);
      }
    } catch (error) {
      next(error);
    }
  },

  async reprint(req: Request, res: Response, next: NextFunction) {
    try {
      const sale = await saleService.getById(req.params.id);
      const html = invoiceService.generateHtml(sale);
      res.setHeader('Content-Type', 'text/html');
      res.send(html);
    } catch (error) {
      next(error);
    }
  },
};
