import { Request, Response, NextFunction } from 'express';
import { AppError } from './errorHandler';
import { hasPermission, Permission } from '../config/permissions';

export function requirePermission(...permissions: Permission[]) {
  return (req: Request, _res: Response, next: NextFunction): void => {
    if (!req.user) {
      throw new AppError('Authentication required', 401);
    }

    const userRoles = req.user.roles || [];
    const userPermissions = req.user.permissions || [];
    const hasAccess = permissions.some((perm) => hasPermission(userRoles, perm, userPermissions));

    if (!hasAccess) {
      throw new AppError('Forbidden: You do not have permission to perform this action', 403);
    }

    next();
  };
}
