import { Request, Response, NextFunction } from 'express';
import { countryService } from './country.service';

export const countryController = {
  async list(_req: Request, res: Response, next: NextFunction) {
    try {
      const storeId = (_req.query.storeId as string) || _req.user?.storeId;
      const countries = await countryService.list(storeId);
      res.status(200).json({ status: 'success', data: countries });
    } catch (error) {
      next(error);
    }
  },

  async getById(req: Request, res: Response, next: NextFunction) {
    try {
      const country = await countryService.getById(req.params.id);
      res.status(200).json({ status: 'success', data: country });
    } catch (error) {
      next(error);
    }
  },

  async create(req: Request, res: Response, next: NextFunction) {
    try {
      const data = {
        ...req.body,
        storeId: req.body.storeId || req.user?.storeId,
      };
      const country = await countryService.create(data);
      res.status(201).json({ status: 'success', message: 'Country created successfully', data: country });
    } catch (error) {
      next(error);
    }
  },

  async update(req: Request, res: Response, next: NextFunction) {
    try {
      const country = await countryService.update(req.params.id, req.body);
      res.status(200).json({ status: 'success', message: 'Country updated successfully', data: country });
    } catch (error) {
      next(error);
    }
  },

  async delete(req: Request, res: Response, next: NextFunction) {
    try {
      await countryService.delete(req.params.id);
      res.status(200).json({ status: 'success', message: 'Country deleted successfully' });
    } catch (error) {
      next(error);
    }
  },
};
