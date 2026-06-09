import type { Request, Response } from 'express';
import { asyncHandler } from '../../shared/utils/async-handler';
import {
  sendSuccess,
  sendPaginatedSuccess,
  sendNoContentSuccess,
  type PaginationMeta,
} from '../../shared/utils/api-response';
import { type AuthRequest } from '../../shared/middlewares/auth.middleware';
import { reportService } from './report.service';
import type { CreateReportBody, UpdateReportBody, ListReportsQuery } from './report.types';

export const listReports = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    const query = req.validatedQuery as ListReportsQuery;
    const { rows, total, page, limit, totalPages } = await reportService.listReports(query);

    const pagination: PaginationMeta = {
      page,
      limit,
      total,
      totalPages,
      hasNextPage: page < totalPages,
      hasPreviousPage: page > 1,
    };

    return sendPaginatedSuccess(res, 200, 'Reports fetched successfully', rows, pagination);
  },
);

export const getReport = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    const { id } = req.params as { id: string };
    const report = await reportService.getReportById(id);
    return sendSuccess(res, 200, 'Report fetched successfully', report);
  },
);

export const createReport = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    const user = req.user!;
    const body = req.validatedBody as CreateReportBody;
    const report = await reportService.createReport(body, user.id, user.role);
    return sendSuccess(res, 201, 'Report created successfully', report);
  },
);

export const updateReport = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    const { id } = req.params as { id: string };
    const user = req.user!;
    const body = req.validatedBody as UpdateReportBody;
    const report = await reportService.updateReport(id, body, user.id, user.role);
    return sendSuccess(res, 200, 'Report updated successfully', report);
  },
);

export const deleteReport = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    const { id } = req.params as { id: string };
    const user = req.user!;
    await reportService.deleteReport(id, user.role);
    return sendNoContentSuccess(res, 'Report deleted successfully');
  },
);

export const exportReportPdf = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    const { id } = req.params as { id: string };
    const report = await reportService.getReportById(id);
    
    // For now, return a message that PDF generation will be implemented
    // In production, this would generate a PDF and send it as a blob
    return sendSuccess(res, 200, 'PDF generation endpoint - to be implemented', {
      reportId: id,
      reportTitle: report.title,
    });
  },
);

export const getProjectReports = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    const { id: projectId } = req.params as { id: string };
    const reports = await reportService.getProjectReports(projectId);
    return sendSuccess(res, 200, 'Project reports fetched successfully', reports);
  },
);
