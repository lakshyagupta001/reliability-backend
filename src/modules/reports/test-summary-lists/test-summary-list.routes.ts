import { Router } from 'express';
import { authenticate } from '../../../shared/middlewares/auth.middleware';
import { authorizeRoles } from '../../../shared/middlewares/role.middleware';
import { validateBody, validateParams } from '../../../shared/middlewares/validate.middleware';
import {
  getTestSummaryListBySrId,
  getTestSummaryListById,
  updateTestSummaryList,
  reviewTestSummaryList,
  approveTestSummaryList,
  rejectTestSummaryList,
  resubmitTestSummaryList,
  generateTestSummaryList,
  saveTestSummaryListDraft,
  getTestSummaryListDrafts,
  deleteTestSummaryListDraft,
  deleteTestSummaryList,
} from './test-summary-list.controller';
import {
  tslIdParam,
  rejectTslSchema,
  resubmitTslSchema,
} from './test-summary-list.validation';

// ─── Routes ──────────────────────────────────────────────────────────────────

// Mounted at /summary-reports/:id/test-summary-list
export const summaryReportTestSummaryListRouter = Router({ mergeParams: true });
summaryReportTestSummaryListRouter.get(
  '/',
  authenticate,
  getTestSummaryListBySrId,
);

// Mounted at /test-summary-lists
export const testSummaryListRouter = Router();

testSummaryListRouter.get(
  '/drafts',
  authenticate,
  getTestSummaryListDrafts,
);

testSummaryListRouter.delete(
  '/drafts/:id',
  authenticate,
  validateParams(tslIdParam),
  deleteTestSummaryListDraft,
);

testSummaryListRouter.get(
  '/:id',
  authenticate,
  validateParams(tslIdParam),
  getTestSummaryListById,
);

testSummaryListRouter.delete(
  '/:id',
  authenticate,
  authorizeRoles('MANAGER', 'TEAM_LEAD', 'EMPLOYEE'),
  validateParams(tslIdParam),
  deleteTestSummaryList,
);

testSummaryListRouter.put(
  '/:id',
  authenticate,
  authorizeRoles('MANAGER', 'TEAM_LEAD', 'EMPLOYEE'),
  validateParams(tslIdParam),
  updateTestSummaryList,
);

testSummaryListRouter.patch(
  '/:id/review',
  authenticate,
  authorizeRoles('MANAGER', 'TEAM_LEAD', 'EMPLOYEE'),
  validateParams(tslIdParam),
  reviewTestSummaryList,
);

testSummaryListRouter.patch(
  '/:id/approve',
  authenticate,
  authorizeRoles('MANAGER', 'TEAM_LEAD'),
  validateParams(tslIdParam),
  approveTestSummaryList,
);

testSummaryListRouter.patch(
  '/:id/reject',
  authenticate,
  authorizeRoles('MANAGER', 'TEAM_LEAD', 'EMPLOYEE'),
  validateParams(tslIdParam),
  validateBody(rejectTslSchema),
  rejectTestSummaryList,
);

testSummaryListRouter.patch(
  '/:id/resubmit',
  authenticate,
  authorizeRoles('MANAGER', 'TEAM_LEAD', 'EMPLOYEE'),
  validateParams(tslIdParam),
  validateBody(resubmitTslSchema),
  resubmitTestSummaryList,
);

testSummaryListRouter.patch(
  '/:id/generate',
  authenticate,
  authorizeRoles('MANAGER', 'TEAM_LEAD', 'EMPLOYEE'),
  validateParams(tslIdParam),
  generateTestSummaryList,
);

testSummaryListRouter.patch(
  '/:id/save-draft',
  authenticate,
  authorizeRoles('MANAGER', 'TEAM_LEAD', 'EMPLOYEE'),
  validateParams(tslIdParam),
  saveTestSummaryListDraft,
);
