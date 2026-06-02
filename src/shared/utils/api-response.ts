import { Response } from 'express';

export function sendSuccess<T>(res: Response, statusCode: number, message: string, data: T) {
  return res.status(statusCode).json({
    success: true,
    message,
    data
  });
}

export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

export function sendPaginatedSuccess<T>(
  res: Response,
  statusCode: number,
  message: string,
  data: T[],
  pagination: PaginationMeta
) {
  return res.status(statusCode).json({
    success: true,
    message,
    data,
    pagination
  });
}

export function sendNoContentSuccess(res: Response, message: string) {
  return res.status(200).json({
    success: true,
    message,
    data: null
  });
}
