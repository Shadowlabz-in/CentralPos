import { Request, Response, NextFunction } from 'express';
import { userService } from './user.service';

export const userController = {
  async list(req: Request, res: Response, next: NextFunction) {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;
      const result = await userService.list(page, limit);
      res.status(200).json({
        status: 'success',
        data: result.data,
        meta: result.meta,
      });
    } catch (error) {
      next(error);
    }
  },

  async getById(req: Request, res: Response, next: NextFunction) {
    try {
      const user = await userService.getById(req.params.id);
      res.status(200).json({
        status: 'success',
        data: user,
      });
    } catch (error) {
      next(error);
    }
  },

  async getProfile(req: Request, res: Response, next: NextFunction) {
    try {
      const user = await userService.getProfile(req.user!.userId);
      res.status(200).json({
        status: 'success',
        data: user,
      });
    } catch (error) {
      next(error);
    }
  },

  async create(req: Request, res: Response, next: NextFunction) {
    try {
      const user = await userService.create({
        ...req.body,
        createdById: req.user!.userId,
      });
      res.status(201).json({
        status: 'success',
        message: 'User created successfully',
        data: user,
      });
    } catch (error) {
      next(error);
    }
  },

  async update(req: Request, res: Response, next: NextFunction) {
    try {
      const user = await userService.update(req.params.id, req.body, req.user!.userId);
      res.status(200).json({
        status: 'success',
        message: 'User updated successfully',
        data: user,
      });
    } catch (error) {
      next(error);
    }
  },

  async delete(req: Request, res: Response, next: NextFunction) {
    try {
      await userService.delete(req.params.id, req.user!.userId);
      res.status(200).json({
        status: 'success',
        message: 'User deleted successfully',
      });
    } catch (error) {
      next(error);
    }
  },
};
