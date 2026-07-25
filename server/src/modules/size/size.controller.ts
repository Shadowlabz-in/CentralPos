import { Request, Response, NextFunction } from 'express';
import { sizeService } from './size.service';

export const sizeController = {
  async list(_req: Request, res: Response, next: NextFunction) {
    try {
      const storeId = _req.query.storeId as string | undefined;
      const sizes = await sizeService.list(storeId);
      res.status(200).json({ status: 'success', data: sizes });
    } catch (error) { next(error); }
  },
  async getById(req: Request, res: Response, next: NextFunction) {
    try {
      const size = await sizeService.getById(req.params.id);
      res.status(200).json({ status: 'success', data: size });
    } catch (error) { next(error); }
  },
  async create(req: Request, res: Response, next: NextFunction) {
    try {
      const size = await sizeService.create(req.body);
      res.status(201).json({ status: 'success', message: 'Size created successfully', data: size });
    } catch (error) { next(error); }
  },
  async update(req: Request, res: Response, next: NextFunction) {
    try {
      const size = await sizeService.update(req.params.id, req.body);
      res.status(200).json({ status: 'success', message: 'Size updated successfully', data: size });
    } catch (error) { next(error); }
  },
  async delete(req: Request, res: Response, next: NextFunction) {
    try {
      await sizeService.delete(req.params.id);
      res.status(200).json({ status: 'success', message: 'Size deleted successfully' });
    } catch (error) { next(error); }
  },
};
