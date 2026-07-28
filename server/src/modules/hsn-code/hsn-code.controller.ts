import { Request, Response, NextFunction } from 'express';
import { hsnCodeService } from './hsn-code.service';

export const hsnCodeController = {
  async list(_req: Request, res: Response, next: NextFunction) {
    try {
      const storeId = (_req.query.storeId as string) || _req.user?.storeId;
      const codes = await hsnCodeService.list(storeId);
      res.status(200).json({ status: 'success', data: codes });
    } catch (error) {
      next(error);
    }
  },

  async getById(req: Request, res: Response, next: NextFunction) {
    try {
      const code = await hsnCodeService.getById(req.params.id);
      res.status(200).json({ status: 'success', data: code });
    } catch (error) {
      next(error);
    }
  },

  async create(req: Request, res: Response, next: NextFunction) {
    try {
      const data = { ...req.body, storeId: req.body.storeId || req.user?.storeId };
      const code = await hsnCodeService.create(data);
      res.status(201).json({ status: 'success', message: 'HSN code created successfully', data: code });
    } catch (error) {
      next(error);
    }
  },

  async update(req: Request, res: Response, next: NextFunction) {
    try {
      const code = await hsnCodeService.update(req.params.id, req.body);
      res.status(200).json({ status: 'success', message: 'HSN code updated successfully', data: code });
    } catch (error) {
      next(error);
    }
  },

  async delete(req: Request, res: Response, next: NextFunction) {
    try {
      await hsnCodeService.delete(req.params.id);
      res.status(200).json({ status: 'success', message: 'HSN code deleted successfully' });
    } catch (error) {
      next(error);
    }
  },
};
