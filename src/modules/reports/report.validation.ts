import { z } from 'zod';

export const createReportSchema = z.object({
  projectId: z.string().uuid('Invalid project ID'),
  type: z.enum(['PART_REPORT', 'SUMMARY_REPORT', 'TEST_LIST']),
  title: z.string().min(1, 'Title is required').max(255),
  format: z.string().max(50),
  formatNumber: z.string().max(100).optional(),
  reportNumber: z.string().max(100).optional(),
  data: z.any(),
  checkedByUserId: z.string().uuid().optional(),
  checkedByName: z.string().optional(),
  approvedByUserId: z.string().uuid().optional(),
  approvedByName: z.string().optional(),
});

export const updateReportSchema = z.object({
  title: z.string().min(1).max(255).optional(),
  formatNumber: z.string().max(100).optional(),
  reportNumber: z.string().max(100).optional(),
  data: z.any().optional(),
  checkedByUserId: z.string().uuid().nullable().optional(),
  checkedByName: z.string().nullable().optional(),
  approvedByUserId: z.string().uuid().nullable().optional(),
  approvedByName: z.string().nullable().optional(),
});

export const reviewReportSchema = z.object({});

export const rejectReportSchema = z.object({
  remark: z.string().min(1, 'Rejection remark is required').max(1000, 'Remark is too long'),
});

export const resubmitReportSchema = z.object({});

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
