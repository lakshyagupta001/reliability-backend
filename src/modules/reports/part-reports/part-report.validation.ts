import { z } from 'zod';

export const createPartReportSchema = z.object({
  reportName: z.string().min(1, 'Report name is required').max(255),
  data: z.any().optional(),
  formatNumber: z.string().max(100).optional(),
  reportNumber: z.string().max(100).optional(),
  checkedById: z.string().uuid().optional(),
  checkedByName: z.string().optional(),
  approvedById: z.string().uuid().optional(),
  approvedByName: z.string().optional(),
  isDraft: z.boolean().optional(),
});

export const updatePartReportSchema = z.object({
  reportName: z.string().min(1).max(255).optional(),
  data: z.any().optional(),
  formatNumber: z.string().max(100).nullable().optional(),
  reportNumber: z.string().max(100).nullable().optional(),
  checkedById: z.string().uuid().nullable().optional(),
  checkedByName: z.string().nullable().optional(),
  approvedById: z.string().uuid().nullable().optional(),
  approvedByName: z.string().nullable().optional(),
});

export const rejectPartReportSchema = z.object({
  remark: z.string().min(1, 'Rejection remark is required').max(1000),
});

export const resubmitPartReportSchema = z.object({
  remark: z.string().max(1000).optional(),
});

export const partReportIdParamSchema = z.object({
  id: z.string().uuid('Invalid Part Report ID'),
});

export const projectIdParamSchema = z.object({
  projectId: z.string().uuid('Invalid Project ID'),
});
