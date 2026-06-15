import { z } from 'zod';

export const createReportSchema = z.object({
  projectId: z.string().uuid('Invalid project ID'),
  type: z.enum(['REPORT_FORMAT', 'SUMMARY_FORMAT', 'CONTROLLER_TEST_LIST']),
  title: z.string().min(1, 'Title is required').max(255),
  format: z.string().max(50),
  formatNumber: z.string().max(100).optional(),
  reportNumber: z.string().max(100).optional(),
  data: z.any(),
});

export const updateReportSchema = z.object({
  title: z.string().min(1).max(255).optional(),
  formatNumber: z.string().max(100).optional(),
  reportNumber: z.string().max(100).optional(),
  data: z.any().optional(),
});

export const reportIdParamSchema = z.object({
  id: z.string().uuid('Invalid report ID'),
});

export const listReportsQuerySchema = z.object({
  page: z.coerce.number().min(1).optional(),
  limit: z.coerce.number().min(1).max(100).optional(),
  search: z.string().optional(),
  format: z.enum(['report', 'summary']).optional(),
  sortBy: z.string().optional(),
  sortOrder: z.enum(['asc', 'desc']).optional(),
});
