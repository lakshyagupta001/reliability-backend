import { Router } from 'express';
import { authenticate } from '../../../shared/middlewares/auth.middleware';
import { authorizeRoles } from '../../../shared/middlewares/role.middleware';
import { validateBody, validateParams } from '../../../shared/middlewares/validate.middleware';
import {
  projectIdParam,
  summaryReportIdParam,
  createSummaryReportSchema,
  updateSummaryReportSchema,
  rejectSchema,
  resubmitSchema,
} from './summary-report.validation';
import {
  getSummaryReport,
  getSummaryReportById,
  createSummaryReport,
  updateSummaryReport,
  reviewSummaryReport,
  approveSummaryReport,
  rejectSummaryReport,
  resubmitSummaryReport,
  deleteSummaryReport,
  deleteSummaryReportSection,
  generateSummaryReport,
  saveSummaryReportDraft,
  getSummaryReportDrafts,
  deleteSummaryReportDraft,
} from './summary-report.controller';

// ─── Routes ──────────────────────────────────────────────────────────────────

// Mounted at /projects/:projectId/summary-report
export const projectSummaryReportRouter = Router({ mergeParams: true });

projectSummaryReportRouter.get(
  '/',
  authenticate,
  validateParams(projectIdParam),
  getSummaryReport,
);

projectSummaryReportRouter.post(
  '/',
  authenticate,
  authorizeRoles('MANAGER', 'TEAM_LEAD', 'EMPLOYEE'),
  validateParams(projectIdParam),
  validateBody(createSummaryReportSchema),
  createSummaryReport,
);

// Mounted at /summary-reports
export const summaryReportRouter = Router();

// Draft-specific routes
summaryReportRouter.get(
  '/drafts/mine',
  authenticate,
  getSummaryReportDrafts,
);

summaryReportRouter.get(
  '/:id',
  authenticate,
  validateParams(summaryReportIdParam),
  getSummaryReportById,
);

summaryReportRouter.put(
  '/:id',
  authenticate,
  authorizeRoles('MANAGER', 'TEAM_LEAD', 'EMPLOYEE'),
  validateParams(summaryReportIdParam),
  validateBody(updateSummaryReportSchema),
  updateSummaryReport,
);

summaryReportRouter.patch(
  '/:id/review',
  authenticate,
  authorizeRoles('MANAGER', 'TEAM_LEAD', 'EMPLOYEE'),
  validateParams(summaryReportIdParam),
  reviewSummaryReport,
);

summaryReportRouter.patch(
  '/:id/approve',
  authenticate,
  authorizeRoles('MANAGER', 'TEAM_LEAD'),
  validateParams(summaryReportIdParam),
  approveSummaryReport,
);

summaryReportRouter.delete(
  '/:id',
  authenticate,
  authorizeRoles('MANAGER', 'TEAM_LEAD'),
  validateParams(summaryReportIdParam),
  deleteSummaryReport,
);

summaryReportRouter.delete(
  '/:id/section',
  authenticate,
  authorizeRoles('MANAGER', 'TEAM_LEAD'),
  validateParams(summaryReportIdParam),
  deleteSummaryReportSection,
);

summaryReportRouter.patch(
  '/:id/reject',
  authenticate,
  authorizeRoles('MANAGER', 'TEAM_LEAD', 'EMPLOYEE'),
  validateParams(summaryReportIdParam),
  validateBody(rejectSchema),
  rejectSummaryReport,
);

summaryReportRouter.patch(
  '/:id/resubmit',
  authenticate,
  authorizeRoles('MANAGER', 'TEAM_LEAD', 'EMPLOYEE'),
  validateParams(summaryReportIdParam),
  validateBody(resubmitSchema),
  resubmitSummaryReport,
);

summaryReportRouter.patch(
  '/:id/generate',
  authenticate,
  authorizeRoles('MANAGER', 'TEAM_LEAD', 'EMPLOYEE'),
  validateParams(summaryReportIdParam),
  generateSummaryReport,
);

summaryReportRouter.patch(
  '/:id/save-draft',
  authenticate,
  authorizeRoles('MANAGER', 'TEAM_LEAD', 'EMPLOYEE'),
  validateParams(summaryReportIdParam),
  saveSummaryReportDraft,
);

summaryReportRouter.delete(
  '/:id/draft',
  authenticate,
  authorizeRoles('MANAGER', 'TEAM_LEAD', 'EMPLOYEE'),
  validateParams(summaryReportIdParam),
  deleteSummaryReportDraft,
);

