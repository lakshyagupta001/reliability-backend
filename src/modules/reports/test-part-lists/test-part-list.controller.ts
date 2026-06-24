import type { Response } from 'express';
import { asyncHandler } from '../../../shared/utils/async-handler';
import { sendSuccess, sendNoContentSuccess } from '../../../shared/utils/api-response';
import { type AuthRequest } from '../../../shared/middlewares/auth.middleware';
import { testPartListService } from './test-part-list.service';
import type { UpdateTestPartListBody } from './test-part-list.types';

export const getTestPartList = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { id } = req.params as { id: string }; // partReportId
  const tpl = await testPartListService.getByPartReportId(id);
  return sendSuccess(res, 200, 'Test Part List fetched successfully', tpl);
});

export const getTestPartListById = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { id } = req.params as { id: string };
  const tpl = await testPartListService.getById(id);
  return sendSuccess(res, 200, 'Test Part List fetched successfully', tpl);
});

export const updateTestPartList = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { id } = req.params as { id: string };
  const user = req.user!;
  const body = req.body as UpdateTestPartListBody;
  const updated = await testPartListService.update(id, body, user.id);
  return sendSuccess(res, 200, 'Test Part List updated successfully', updated);
});

export const reviewTestPartList = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { id } = req.params as { id: string };
  const user = req.user!;
  const updated = await testPartListService.review(id, user.id);
  return sendSuccess(res, 200, 'Test Part List reviewed successfully', updated);
});

export const approveTestPartList = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { id } = req.params as { id: string };
  const user = req.user!;
  const updated = await testPartListService.approve(id, user.id);
  return sendSuccess(res, 200, 'Test Part List approved successfully', updated);
});

export const rejectTestPartList = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { id } = req.params as { id: string };
  const user = req.user!;
  const body = req.validatedBody as { remark: string };
  const userName = `${user.firstName} ${user.lastName}`;
  const updated = await testPartListService.reject(id, user.id, userName, body.remark);
  return sendSuccess(res, 200, 'Test Part List rejected successfully', updated);
});

export const resubmitTestPartList = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { id } = req.params as { id: string };
  const user = req.user!;
  const updated = await testPartListService.resubmit(id, user.id);
  return sendSuccess(res, 200, 'Test Part List resubmitted successfully', updated);
});

export const generateTestPartList = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { id } = req.params as { id: string };
  const user = req.user!;
  const updated = await testPartListService.generate(id, user.id);
  return sendSuccess(res, 200, 'Test Part List generated successfully', updated);
});

export const saveTestPartListDraft = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { id } = req.params as { id: string };
  const user = req.user!;
  const updated = await testPartListService.saveDraft(id, user.id);
  return sendSuccess(res, 200, 'Test Part List saved as draft successfully', updated);
});

export const getTestPartListDrafts = asyncHandler(async (req: AuthRequest, res: Response) => {
  const user = req.user!;
  const drafts = await testPartListService.getDrafts(user.id);
  return sendSuccess(res, 200, 'Draft test part lists fetched successfully', drafts);
});

export const deleteTestPartListDraft = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { id } = req.params as { id: string };
  const user = req.user!;
  await testPartListService.deleteDraft(id, user.id);
  return sendNoContentSuccess(res, 'Draft deleted successfully');
});
export const deleteTestPartList = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { id } = req.params as { id: string };
  const user = req.user!;
  await testPartListService.delete(id, user.id);
  return sendNoContentSuccess(res, 'Test Part List deleted successfully');
});
