import { Request, Response, NextFunction } from 'express';
import { roleService } from './role.service';

export const roleController = {
  async list(_req: Request, res: Response, next: NextFunction) {
    try {
      const roles = await roleService.list();
      res.status(200).json({ status: 'success', data: roles });
    } catch (error) {
      next(error);
    }
  },

  async getById(req: Request, res: Response, next: NextFunction) {
    try {
      const role = await roleService.getById(req.params.id);
      res.status(200).json({ status: 'success', data: role });
    } catch (error) {
      next(error);
    }
  },

  async create(req: Request, res: Response, next: NextFunction) {
    try {
      const role = await roleService.create(req.body);
      res.status(201).json({ status: 'success', message: 'Role created successfully', data: role });
    } catch (error) {
      next(error);
    }
  },

  async update(req: Request, res: Response, next: NextFunction) {
    try {
      const role = await roleService.update(req.params.id, req.body);
      res.status(200).json({ status: 'success', message: 'Role updated successfully', data: role });
    } catch (error) {
      next(error);
    }
  },

  async delete(req: Request, res: Response, next: NextFunction) {
    try {
      await roleService.delete(req.params.id);
      res.status(200).json({ status: 'success', message: 'Role deleted successfully' });
    } catch (error) {
      next(error);
    }
  },
};
