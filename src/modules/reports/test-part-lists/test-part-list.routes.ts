import { Router } from 'express';
import { authenticate } from '../../../shared/middlewares/auth.middleware';
import { authorizeRoles } from '../../../shared/middlewares/role.middleware';
import { validateBody, validateParams } from '../../../shared/middlewares/validate.middleware';
import {
  getTestPartList,
  getTestPartListById,
  updateTestPartList,
  reviewTestPartList,
  approveTestPartList,
  rejectTestPartList,
  resubmitTestPartList,
  generateTestPartList,
  saveTestPartListDraft,
  getTestPartListDrafts,
  deleteTestPartListDraft,
  deleteTestPartList,
} from './test-part-list.controller';
import {
  tplIdParam,
  rejectTplSchema,
  resubmitTplSchema,
} from './test-part-list.validation';

// ─── Routes ──────────────────────────────────────────────────────────────────

// Mounted at /part-reports/:id/test-part-list
export const partReportTestPartListRouter = Router({ mergeParams: true });
partReportTestPartListRouter.get(
  '/',
  authenticate,
  getTestPartList,
);

// Mounted at /test-part-lists
export const testPartListRouter = Router();

testPartListRouter.get(
  '/drafts',
  authenticate,
  getTestPartListDrafts,
);

testPartListRouter.delete(
  '/drafts/:id',
  authenticate,
  validateParams(tplIdParam),
  deleteTestPartListDraft,
);

testPartListRouter.get(
  '/:id',
  authenticate,
  validateParams(tplIdParam),
  getTestPartListById,
);

testPartListRouter.delete(
  '/:id',
  authenticate,
  authorizeRoles('MANAGER', 'TEAM_LEAD', 'EMPLOYEE'),
  validateParams(tplIdParam),
  deleteTestPartList,
);

testPartListRouter.put(
  '/:id',
  authenticate,
  authorizeRoles('MANAGER', 'TEAM_LEAD', 'EMPLOYEE'),
  validateParams(tplIdParam),
  updateTestPartList,
);

testPartListRouter.patch(
  '/:id/review',
  authenticate,
  authorizeRoles('MANAGER', 'TEAM_LEAD', 'EMPLOYEE'),
  validateParams(tplIdParam),
  reviewTestPartList,
);

testPartListRouter.patch(
  '/:id/approve',
  authenticate,
  authorizeRoles('MANAGER', 'TEAM_LEAD'),
  validateParams(tplIdParam),
  approveTestPartList,
);

testPartListRouter.patch(
  '/:id/reject',
  authenticate,
  authorizeRoles('MANAGER', 'TEAM_LEAD', 'EMPLOYEE'),
  validateParams(tplIdParam),
  validateBody(rejectTplSchema),
  rejectTestPartList,
);

testPartListRouter.patch(
  '/:id/resubmit',
  authenticate,
  authorizeRoles('MANAGER', 'TEAM_LEAD', 'EMPLOYEE'),
  validateParams(tplIdParam),
  validateBody(resubmitTplSchema),
  resubmitTestPartList,
);

testPartListRouter.patch(
  '/:id/generate',
  authenticate,
  authorizeRoles('MANAGER', 'TEAM_LEAD', 'EMPLOYEE'),
  validateParams(tplIdParam),
  generateTestPartList,
);

testPartListRouter.patch(
  '/:id/save-draft',
  authenticate,
  authorizeRoles('MANAGER', 'TEAM_LEAD', 'EMPLOYEE'),
  validateParams(tplIdParam),
  saveTestPartListDraft,
);
