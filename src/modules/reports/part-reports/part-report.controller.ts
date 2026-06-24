import type { Response } from 'express';
import { asyncHandler } from '../../../shared/utils/async-handler';
import {
  sendSuccess,
  sendNoContentSuccess,
} from '../../../shared/utils/api-response';
import { type AuthRequest } from '../../../shared/middlewares/auth.middleware';
import { partReportService } from './part-report.service';
import type { CreatePartReportBody, UpdatePartReportBody } from './part-report.types';

export const listPartReports = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { projectId } = req.params as { projectId: string };
  const reports = await partReportService.listByProject(projectId);
  return sendSuccess(res, 200, 'Part reports fetched successfully', reports);
});

export const getPartReport = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { id } = req.params as { id: string };
  const report = await partReportService.getById(id);
  return sendSuccess(res, 200, 'Part report fetched successfully', report);
});

export const createPartReport = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { projectId } = req.params as { projectId: string };
  const user = req.user!;
  const body = req.validatedBody as Omit<CreatePartReportBody, 'projectId'>;
  const report = await partReportService.create({ ...body, projectId }, user.id, user.role);
  return sendSuccess(res, 201, 'Part report created successfully', report);
});

export const updatePartReport = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { id } = req.params as { id: string };
  const user = req.user!;
  const body = req.validatedBody as UpdatePartReportBody;
  const report = await partReportService.update(id, body, user.id, user.role);
  return sendSuccess(res, 200, 'Part report updated successfully', report);
});

export const deletePartReport = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { id } = req.params as { id: string };
  const user = req.user!;
  await partReportService.delete(id, user.role);
  return sendNoContentSuccess(res, 'Part report deleted successfully');
});

export const deletePartReportSection = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { id } = req.params as { id: string };
  const user = req.user!;
  await partReportService.deleteSection(id, user.role);
  return sendNoContentSuccess(res, 'Part report section deleted successfully');
});

export const reviewPartReport = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { id } = req.params as { id: string };
  const user = req.user!;
  const report = await partReportService.review(id, user.id);
  return sendSuccess(res, 200, 'Part report reviewed successfully', report);
});

export const approvePartReport = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { id } = req.params as { id: string };
  const user = req.user!;
  const report = await partReportService.approve(id, user.id);
  return sendSuccess(res, 200, 'Part report approved successfully', report);
});

export const rejectPartReport = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { id } = req.params as { id: string };
  const user = req.user!;
  const body = req.validatedBody as { remark: string };
  const userName = `${user.firstName} ${user.lastName}`;
  const report = await partReportService.reject(id, user.id, userName, body.remark);
  return sendSuccess(res, 200, 'Part report rejected successfully', report);
});

export const resubmitPartReport = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { id } = req.params as { id: string };
  const user = req.user!;
  const report = await partReportService.resubmit(id, user.id);
  return sendSuccess(res, 200, 'Part report resubmitted successfully', report);
});

export const generatePartReport = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { id } = req.params as { id: string };
  const user = req.user!;
  const report = await partReportService.generate(id, user.id);
  return sendSuccess(res, 200, 'Part report generated successfully', report);
});

export const savePartReportDraft = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { id } = req.params as { id: string };
  const user = req.user!;
  const report = await partReportService.saveDraft(id, user.id);
  return sendSuccess(res, 200, 'Part report saved as draft successfully', report);
});

export const getPartReportDrafts = asyncHandler(async (req: AuthRequest, res: Response) => {
  const user = req.user!;
  const drafts = await partReportService.getDrafts(user.id);
  return sendSuccess(res, 200, 'Draft reports fetched successfully', drafts);
});

export const deletePartReportDraft = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { id } = req.params as { id: string };
  const user = req.user!;
  await partReportService.deleteDraft(id, user.id);
  return sendNoContentSuccess(res, 'Draft deleted successfully');
});
