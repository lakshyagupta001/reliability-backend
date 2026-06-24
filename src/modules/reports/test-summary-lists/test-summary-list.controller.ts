import type { Response } from 'express';
import { asyncHandler } from '../../../shared/utils/async-handler';
import { sendSuccess, sendNoContentSuccess } from '../../../shared/utils/api-response';
import { type AuthRequest } from '../../../shared/middlewares/auth.middleware';
import { testSummaryListService } from './test-summary-list.service';
import type { UpdateTestSummaryListBody } from './test-summary-list.types';

export const getTestSummaryListBySrId = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { id } = req.params as { id: string }; // summaryReportId
  const tsl = await testSummaryListService.getBySummaryReportId(id);
  return sendSuccess(res, 200, 'Test Summary List fetched successfully', tsl);
});

export const getTestSummaryListById = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { id } = req.params as { id: string };
  const tsl = await testSummaryListService.getById(id);
  return sendSuccess(res, 200, 'Test Summary List fetched successfully', tsl);
});

export const updateTestSummaryList = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { id } = req.params as { id: string };
  const user = req.user!;
  const body = req.body as UpdateTestSummaryListBody;
  const updated = await testSummaryListService.update(id, body, user.id);
  return sendSuccess(res, 200, 'Test Summary List updated successfully', updated);
});

export const reviewTestSummaryList = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { id } = req.params as { id: string };
  const user = req.user!;
  const updated = await testSummaryListService.review(id, user.id);
  return sendSuccess(res, 200, 'Test Summary List reviewed successfully', updated);
});

export const approveTestSummaryList = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { id } = req.params as { id: string };
  const user = req.user!;
  const updated = await testSummaryListService.approve(id, user.id);
  return sendSuccess(res, 200, 'Test Summary List approved successfully', updated);
});

export const rejectTestSummaryList = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { id } = req.params as { id: string };
  const user = req.user!;
  const body = req.validatedBody as { remark: string };
  const userName = `${user.firstName} ${user.lastName}`;
  const updated = await testSummaryListService.reject(id, user.id, userName, body.remark);
  return sendSuccess(res, 200, 'Test Summary List rejected successfully', updated);
});

export const resubmitTestSummaryList = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { id } = req.params as { id: string };
  const user = req.user!;
  const updated = await testSummaryListService.resubmit(id, user.id);
  return sendSuccess(res, 200, 'Test Summary List resubmitted successfully', updated);
});

export const generateTestSummaryList = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { id } = req.params as { id: string };
  const user = req.user!;
  const updated = await testSummaryListService.generate(id, user.id);
  return sendSuccess(res, 200, 'Test Summary List generated successfully', updated);
});

export const saveTestSummaryListDraft = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { id } = req.params as { id: string };
  const user = req.user!;
  const updated = await testSummaryListService.saveDraft(id, user.id);
  return sendSuccess(res, 200, 'Test Summary List saved as draft successfully', updated);
});

export const getTestSummaryListDrafts = asyncHandler(async (req: AuthRequest, res: Response) => {
  const user = req.user!;
  const drafts = await testSummaryListService.getDrafts(user.id);
  return sendSuccess(res, 200, 'Draft test summary lists fetched successfully', drafts);
});

export const deleteTestSummaryListDraft = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { id } = req.params as { id: string };
  const user = req.user!;
  await testSummaryListService.deleteDraft(id, user.id);
  return sendNoContentSuccess(res, 'Draft deleted successfully');
});
export const deleteTestSummaryList = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { id } = req.params as { id: string };
  const user = req.user!;
  await testSummaryListService.delete(id, user.id);
  return sendNoContentSuccess(res, 'Test Summary List deleted successfully');
});
