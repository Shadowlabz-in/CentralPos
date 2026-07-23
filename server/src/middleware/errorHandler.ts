import { Request, Response, NextFunction } from 'express';
import { ZodError } from 'zod';
import { ApiResponse } from '@kapda/shared';
import logger from '../utils/logger';

export class AppError extends Error {
  public statusCode: number;
  public isOperational: boolean;

  constructor(message: string, statusCode = 400) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = true;
    Error.captureStackTrace(this, this.constructor);
  }
}

export const errorHandler = (
  err: Error,
  _req: Request,
  res: Response,
  _next: NextFunction,
): void => {
  if (err instanceof AppError) {
    const response: ApiResponse = {
      status: 'error',
      message: err.message,
    };
    res.status(err.statusCode).json(response);
    return;
  }

  if (err instanceof ZodError) {
    const response: ApiResponse = {
      status: 'error',
      message: 'Validation failed',
      errors: err.errors,
    };
    res.status(400).json(response);
    return;
  }

  logger.error('Unhandled error:', err);

  const response: ApiResponse = {
    status: 'error',
    message: 'Internal server error',
  };
  res.status(500).json(response);
};
