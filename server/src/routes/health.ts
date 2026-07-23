import { Router, Request, Response } from 'express';
import prisma from '../config/database';
import logger from '../utils/logger';

const router = Router();

router.get('/health', async (_req: Request, res: Response) => {
  try {
    await prisma.$queryRaw`SELECT 1`;
    logger.info('Health check succeeded');
    res.json({
      status: 'OK',
      message: 'Kapda POS API Running',
    });
  } catch (error) {
    logger.error('Health check failed:', error);
    res.status(503).json({
      status: 'error',
      message: 'Database connection failed',
    });
  }
});

export default router;
