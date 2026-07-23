import { Request, Response, NextFunction } from 'express';
import prisma from '../../utils/prisma';

export async function createAuditLog(params: {
  userId?: string;
  action: string;
  module: string;
  recordId?: string;
  details?: any;
  ipAddress?: string | null;
  storeId?: string | null;
}) {
  try {
    await prisma.auditLog.create({ data: params as any });
  } catch {
    // Silently fail - audit should never break the app
  }
}

// Middleware to log actions
export function audit(action: string, module: string) {
  return (req: Request, _res: Response, next: NextFunction) => {
    const originalJson = _res.json.bind(_res);
    _res.json = function (body: any) {
      if (_res.statusCode < 400 && body?.data?.id) {
        createAuditLog({
          userId: req.user?.userId,
          action,
          module,
          recordId: body.data.id,
          ipAddress: req.ip,
          storeId: req.user?.storeId,
        });
      }
      return originalJson(body);
    };
    next();
  };
}

export const auditService = {
  async list(params: {
    page: number;
    limit: number;
    action?: string;
    module?: string;
    userId?: string;
  }) {
    const where: any = {};
    if (params.action) where.action = params.action;
    if (params.module) where.module = params.module;
    if (params.userId) where.userId = params.userId;

    const [data, total] = await Promise.all([
      prisma.auditLog.findMany({
        where,
        include: { user: { select: { id: true, firstName: true, lastName: true, email: true } } },
        orderBy: { createdAt: 'desc' },
        skip: (params.page - 1) * params.limit,
        take: params.limit,
      }),
      prisma.auditLog.count({ where }),
    ]);
    return { data, total };
  },
};
