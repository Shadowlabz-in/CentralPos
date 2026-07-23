import { Request, Response, NextFunction } from 'express';
import { authService } from './auth.service';
import { createAuditLog } from '../audit/audit.service';

export const authController = {
  async login(req: Request, res: Response, next: NextFunction) {
    try {
      const { email, password } = req.body;
      const result = await authService.login(email, password);
      createAuditLog({
        userId: result.user.id,
        action: 'LOGIN',
        module: 'AUTH',
        ipAddress: req.ip,
        storeId: result.user.storeId,
      });
      res.status(200).json({
        status: 'success',
        message: 'Login successful',
        data: result,
      });
    } catch (error) {
      next(error);
    }
  },

  async logout(req: Request, res: Response, next: NextFunction) {
    try {
      const refreshToken = req.body.refreshToken;
      await authService.logout(req.user!.userId, refreshToken);
      createAuditLog({
        userId: req.user!.userId,
        action: 'LOGOUT',
        module: 'AUTH',
        ipAddress: req.ip,
        storeId: req.user?.storeId,
      });
      res.status(200).json({ status: 'success', message: 'Logout successful' });
    } catch (error) {
      next(error);
    }
  },

  async refresh(req: Request, res: Response, next: NextFunction) {
    try {
      const { refreshToken } = req.body;
      const result = await authService.refreshAccessToken(refreshToken);
      res.status(200).json({
        status: 'success',
        data: result,
      });
    } catch (error) {
      next(error);
    }
  },

  async changePassword(req: Request, res: Response, next: NextFunction) {
    try {
      const { currentPassword, newPassword } = req.body;
      await authService.changePassword(req.user!.userId, currentPassword, newPassword);
      res.status(200).json({
        status: 'success',
        message: 'Password changed successfully',
      });
    } catch (error) {
      next(error);
    }
  },
};
