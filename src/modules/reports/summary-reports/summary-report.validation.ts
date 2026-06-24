import { z } from 'zod';

export const projectIdParam = z.object({ projectId: z.string().uuid() });
export const summaryReportIdParam = z.object({ id: z.string().uuid() });

export const createSummaryReportSchema = z.object({
  data: z.any().optional(),
  formatNumber: z.string().max(100).optional(),
  reportNumber: z.string().max(100).optional(),
  checkedById: z.string().uuid().optional(),
  checkedByName: z.string().optional(),
  approvedById: z.string().uuid().optional(),
  approvedByName: z.string().optional(),
  isDraft: z.boolean().optional(),
});

export const updateSummaryReportSchema = z.object({
  data: z.any().optional(),
  formatNumber: z.string().max(100).nullable().optional(),
  reportNumber: z.string().max(100).nullable().optional(),
  checkedById: z.string().uuid().nullable().optional(),
  checkedByName: z.string().nullable().optional(),
  approvedById: z.string().uuid().nullable().optional(),
  approvedByName: z.string().nullable().optional(),
});

export const rejectSchema = z.object({
  remark: z.string().min(1).max(1000),
});

export const resubmitSchema = z.object({});
