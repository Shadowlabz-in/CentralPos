import { Request, Response, NextFunction } from 'express';
import { verifyAccessToken } from '../utils/jwt';
import { AppError } from './errorHandler';
import prisma from '../utils/prisma';

export const authenticate = async (req: Request, _res: Response, next: NextFunction): Promise<void> => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    throw new AppError('Access token is required', 401);
  }

  const token = authHeader.split(' ')[1];

  let payload;
  try {
    payload = verifyAccessToken(token);
  } catch {
    throw new AppError('Invalid or expired access token', 401);
  }

  try {
    const user = await prisma.user.findUnique({
      where: { id: payload.userId },
      select: { tokenVersion: true, isActive: true },
    });
    if (!user || !user.isActive) {
      throw new AppError('Account is deactivated. Contact admin.', 403);
    }
    const tokenVersion = payload.tokenVersion ?? 0;
    if (user.tokenVersion !== tokenVersion) {
      throw new AppError('Session expired. Please login again.', 401);
    }
  } catch (err) {
    if (err instanceof AppError) throw err;
    throw new AppError('Authentication error', 500);
  }

  req.user = payload;
  next();
};
