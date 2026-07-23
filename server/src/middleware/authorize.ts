import { Request, Response, NextFunction } from 'express';
import { AppError } from './errorHandler';

export type Role = 'ADMIN' | 'MANAGER' | 'CASHIER' | 'INVENTORY_MANAGER';

export function authorize(...allowedRoles: Role[]) {
  return (req: Request, _res: Response, next: NextFunction): void => {
    if (!req.user) throw new AppError('Authentication required', 401);

    const userRoles = req.user.roles as Role[];

    const hasAccess = userRoles.some((role) => allowedRoles.includes(role));

    if (!hasAccess) throw new AppError('Insufficient permissions for this action', 403);

    next();
  };
}
