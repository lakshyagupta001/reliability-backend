import { Router } from 'express';
import { authenticate } from '../../../shared/middlewares/auth.middleware';
import { authorizeRoles } from '../../../shared/middlewares/role.middleware';
import { validateBody, validateParams } from '../../../shared/middlewares/validate.middleware';
import {
  listPartReports,
  getPartReport,
  createPartReport,
  updatePartReport,
  deletePartReport,
  deletePartReportSection,
  reviewPartReport,
  approvePartReport,
  rejectPartReport,
  resubmitPartReport,
  generatePartReport,
  savePartReportDraft,
  getPartReportDrafts,
  deletePartReportDraft,
} from './part-report.controller';
import {
  createPartReportSchema,
  updatePartReportSchema,
  partReportIdParamSchema,
  projectIdParamSchema,
  rejectPartReportSchema,
  resubmitPartReportSchema,
} from './part-report.validation';

// Router for routes mounted at /projects/:projectId/part-reports
export const projectPartReportRouter = Router({ mergeParams: true });

projectPartReportRouter.get(
  '/',
  authenticate,
  validateParams(projectIdParamSchema),
  listPartReports,
);

projectPartReportRouter.post(
  '/',
  authenticate,
  authorizeRoles('MANAGER', 'TEAM_LEAD', 'EMPLOYEE'),
  validateParams(projectIdParamSchema),
  validateBody(createPartReportSchema),
  createPartReport,
);

// Router for routes mounted at /part-reports
export const partReportRouter = Router();

// Draft-specific routes
partReportRouter.get(
  '/drafts/mine',
  authenticate,
  getPartReportDrafts,
);

partReportRouter.get(
  '/:id',
  authenticate,
  validateParams(partReportIdParamSchema),
  getPartReport,
);

partReportRouter.put(
  '/:id',
  authenticate,
  authorizeRoles('MANAGER', 'TEAM_LEAD', 'EMPLOYEE'),
  validateParams(partReportIdParamSchema),
  validateBody(updatePartReportSchema),
  updatePartReport,
);

partReportRouter.delete(
  '/:id',
  authenticate,
  authorizeRoles('MANAGER', 'TEAM_LEAD'),
  validateParams(partReportIdParamSchema),
  deletePartReport,
);

partReportRouter.delete(
  '/:id/section',
  authenticate,
  authorizeRoles('MANAGER', 'TEAM_LEAD'),
  validateParams(partReportIdParamSchema),
  deletePartReportSection,
);

partReportRouter.patch(
  '/:id/review',
  authenticate,
  authorizeRoles('MANAGER', 'TEAM_LEAD', 'EMPLOYEE'),
  validateParams(partReportIdParamSchema),
  reviewPartReport,
);

partReportRouter.patch(
  '/:id/approve',
  authenticate,
  authorizeRoles('MANAGER', 'TEAM_LEAD'),
  validateParams(partReportIdParamSchema),
  approvePartReport,
);

partReportRouter.patch(
  '/:id/reject',
  authenticate,
  authorizeRoles('MANAGER', 'TEAM_LEAD', 'EMPLOYEE'),
  validateParams(partReportIdParamSchema),
  validateBody(rejectPartReportSchema),
  rejectPartReport,
);

partReportRouter.patch(
  '/:id/resubmit',
  authenticate,
  authorizeRoles('MANAGER', 'TEAM_LEAD', 'EMPLOYEE'),
  validateParams(partReportIdParamSchema),
  validateBody(resubmitPartReportSchema),
  resubmitPartReport,
);

partReportRouter.patch(
  '/:id/generate',
  authenticate,
  authorizeRoles('MANAGER', 'TEAM_LEAD', 'EMPLOYEE'),
  validateParams(partReportIdParamSchema),
  generatePartReport,
);

partReportRouter.patch(
  '/:id/save-draft',
  authenticate,
  authorizeRoles('MANAGER', 'TEAM_LEAD', 'EMPLOYEE'),
  validateParams(partReportIdParamSchema),
  savePartReportDraft,
);

partReportRouter.delete(
  '/:id/draft',
  authenticate,
  authorizeRoles('MANAGER', 'TEAM_LEAD', 'EMPLOYEE'),
  validateParams(partReportIdParamSchema),
  deletePartReportDraft,
);
