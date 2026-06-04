import { NextFunction, Request, Response } from 'express';
import { AppError } from '../utils/errors/app-error';
import { appConfig } from '../config/app.config';
import { logger } from '../utils/logger';

export function errorHandler(error: Error, req: Request, res: Response, next: NextFunction) {
  if (res.headersSent) {
    return next(error);
  }

  if (error instanceof AppError) {
    return res.status(error.statusCode).json({
      success: false,
      message: error.message,
      code: error.code,
      errors: error.errors,
    });
  }

  logger.error('Unhandled error', {
    message: error.message,
    stack: appConfig.isProduction ? undefined : error.stack,
    method: req.method,
    path: req.originalUrl,
  });

  return res.status(500).json({
    success: false,
    message: 'Internal server error',
    code: 'INTERNAL_SERVER_ERROR',
    ...(appConfig.isProduction ? {} : { stack: error.stack }),
  });
}
