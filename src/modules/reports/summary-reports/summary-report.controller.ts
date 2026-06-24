import type { Response } from 'express';
import { asyncHandler } from '../../../shared/utils/async-handler';
import { sendSuccess, sendNoContentSuccess } from '../../../shared/utils/api-response';
import { type AuthRequest } from '../../../shared/middlewares/auth.middleware';
import { summaryReportService } from './summary-report.service';
import type { CreateSummaryReportBody, UpdateSummaryReportBody } from './summary-report.types';

export const getSummaryReport = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { projectId } = req.params as { projectId: string };
  const sr = await summaryReportService.getByProjectId(projectId);
  return sendSuccess(res, 200, 'Summary Report fetched successfully', sr);
});

export const getSummaryReportById = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { id } = req.params as { id: string };
  const sr = await summaryReportService.getById(id);
  return sendSuccess(res, 200, 'Summary Report fetched successfully', sr);
});

export const createSummaryReport = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { projectId } = req.params as { projectId: string };
  const user = req.user!;
  const body = req.validatedBody as Omit<CreateSummaryReportBody, 'projectId'>;
  const sr = await summaryReportService.create({ ...body, projectId }, user.id);
  return sendSuccess(res, 201, 'Summary Report created successfully', sr);
});

export const updateSummaryReport = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { id } = req.params as { id: string };
  console.log('UPDATE_SUMMARY_REPORT CALLED FOR ID:', id);
  const user = req.user!;
  const body = req.validatedBody as UpdateSummaryReportBody;
  const sr = await summaryReportService.update(id, body, user.id);
  return sendSuccess(res, 200, 'Summary Report updated successfully', sr);
});

export const reviewSummaryReport = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { id } = req.params as { id: string };
  const user = req.user!;
  const sr = await summaryReportService.review(id, user.id);
  return sendSuccess(res, 200, 'Summary Report reviewed successfully', sr);
});

export const approveSummaryReport = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { id } = req.params as { id: string };
  const user = req.user!;
  const sr = await summaryReportService.approve(id, user.id);
  return sendSuccess(res, 200, 'Summary Report approved successfully', sr);
});

export const rejectSummaryReport = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { id } = req.params as { id: string };
  const user = req.user!;
  const body = req.validatedBody as { remark: string };
  const userName = `${user.firstName} ${user.lastName}`;
  const sr = await summaryReportService.reject(id, user.id, userName, body.remark);
  return sendSuccess(res, 200, 'Summary Report rejected successfully', sr);
});

export const resubmitSummaryReport = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { id } = req.params as { id: string };
  const user = req.user!;
  const sr = await summaryReportService.resubmit(id, user.id);
  return sendSuccess(res, 200, 'Summary Report resubmitted successfully', sr);
});

export const deleteSummaryReport = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { id } = req.params as { id: string };
  const user = req.user!;
  await summaryReportService.delete(id, user.role);
  return sendSuccess(res, 200, 'Summary Report deleted successfully', null);
});

export const deleteSummaryReportSection = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { id } = req.params as { id: string };
  const user = req.user!;
  await summaryReportService.deleteSection(id, user.role);
  return sendSuccess(res, 200, 'Summary Report section deleted successfully', null);
});

export const generateSummaryReport = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { id } = req.params as { id: string };
  const user = req.user!;
  const sr = await summaryReportService.generate(id, user.id);
  return sendSuccess(res, 200, 'Summary Report generated successfully', sr);
});

export const saveSummaryReportDraft = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { id } = req.params as { id: string };
  const user = req.user!;
  const sr = await summaryReportService.saveDraft(id, user.id);
  return sendSuccess(res, 200, 'Summary Report saved as draft successfully', sr);
});

export const getSummaryReportDrafts = asyncHandler(async (req: AuthRequest, res: Response) => {
  const user = req.user!;
  const drafts = await summaryReportService.getDrafts(user.id);
  return sendSuccess(res, 200, 'Draft summary reports fetched successfully', drafts);
});

export const deleteSummaryReportDraft = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { id } = req.params as { id: string };
  const user = req.user!;
  await summaryReportService.deleteDraft(id, user.id);
  return sendNoContentSuccess(res, 'Draft deleted successfully');
});
