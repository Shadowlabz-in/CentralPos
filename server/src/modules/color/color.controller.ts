import { Request, Response, NextFunction } from 'express';
import { colorService } from './color.service';

export const colorController = {
  async list(_req: Request, res: Response, next: NextFunction) {
    try {
      const storeId = _req.query.storeId as string | undefined;
      const colors = await colorService.list(storeId);
      res.status(200).json({ status: 'success', data: colors });
    } catch (error) { next(error); }
  },
  async getById(req: Request, res: Response, next: NextFunction) {
    try {
      const color = await colorService.getById(req.params.id);
      res.status(200).json({ status: 'success', data: color });
    } catch (error) { next(error); }
  },
  async create(req: Request, res: Response, next: NextFunction) {
    try {
      const color = await colorService.create(req.body);
      res.status(201).json({ status: 'success', message: 'Color created successfully', data: color });
    } catch (error) { next(error); }
  },
  async update(req: Request, res: Response, next: NextFunction) {
    try {
      const color = await colorService.update(req.params.id, req.body);
      res.status(200).json({ status: 'success', message: 'Color updated successfully', data: color });
    } catch (error) { next(error); }
  },
  async delete(req: Request, res: Response, next: NextFunction) {
    try {
      await colorService.delete(req.params.id);
      res.status(200).json({ status: 'success', message: 'Color deleted successfully' });
    } catch (error) { next(error); }
  },
};
