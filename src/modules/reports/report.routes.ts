import { Router } from 'express';
import { authenticate } from '../../shared/middlewares/auth.middleware';
import { authorizeRoles } from '../../shared/middlewares/role.middleware';
import { validateBody, validateParams, validateQuery } from '../../shared/middlewares/validate.middleware';
import {
  listReports,
  getReport,
  createReport,
  updateReport,
  deleteReport,
  exportReportPdf,
  getActiveRequests,
  getApprovals,
  reviewReport,
  approveReport,
  rejectReport,
  resubmitReport,
} from './report.controller';
import {
  listReportsQuerySchema,
  createReportSchema,
  updateReportSchema,
  reportIdParamSchema,
  rejectReportSchema,
  resubmitReportSchema,
} from './report.validation';

const router = Router();

// GET /reports — any authenticated user
router.get(
  '/',
  authenticate,
  validateQuery(listReportsQuerySchema),
  listReports,
);

// GET /reports/active-requests — any authenticated user
router.get(
  '/active-requests',
  authenticate,
  getActiveRequests,
);

// GET /reports/approvals — any authenticated user
router.get(
  '/approvals',
  authenticate,
  getApprovals,
);

// GET /reports/:id — any authenticated user
router.get(
  '/:id',
  authenticate,
  validateParams(reportIdParamSchema),
  getReport,
);

// POST /reports — ADMIN or EMPLOYEE can create
router.post(
  '/',
  authenticate,
  authorizeRoles('MANAGER', 'TEAM_LEAD', 'EMPLOYEE'),
  validateBody(createReportSchema),
  createReport,
);

// PATCH /reports/:id — All users can update their reports (Wait, if we strictly follow prior roles, MANAGER/TEAM_LEAD, but Employee generates. Let's allow EMPLOYEE to update reports)
router.patch(
  '/:id',
  authenticate,
  authorizeRoles('MANAGER', 'TEAM_LEAD', 'EMPLOYEE'),
  validateParams(reportIdParamSchema),
  validateBody(updateReportSchema),
  updateReport,
);

// PATCH /reports/:id/review — Any user can review
router.patch(
  '/:id/review',
  authenticate,
  authorizeRoles('MANAGER', 'TEAM_LEAD', 'EMPLOYEE'),
  validateParams(reportIdParamSchema),
  reviewReport,
);

// PATCH /reports/:id/approve — MANAGER or TEAM_LEAD can approve
router.patch(
  '/:id/approve',
  authenticate,
  authorizeRoles('MANAGER', 'TEAM_LEAD'),
  validateParams(reportIdParamSchema),
  approveReport,
);

// PATCH /reports/:id/reject — Any user can reject if they are the assigned reviewer or approver
router.patch(
  '/:id/reject',
  authenticate,
  authorizeRoles('MANAGER', 'TEAM_LEAD', 'EMPLOYEE'),
  validateParams(reportIdParamSchema),
  validateBody(rejectReportSchema),
  rejectReport,
);

// PATCH /reports/:id/resubmit — Only the creator can resubmit
router.patch(
  '/:id/resubmit',
  authenticate,
  authorizeRoles('MANAGER', 'TEAM_LEAD', 'EMPLOYEE'),
  validateParams(reportIdParamSchema),
  validateBody(resubmitReportSchema),
  resubmitReport,
);

// DELETE /reports/:id — ADMIN only
router.delete(
  '/:id',
  authenticate,
  authorizeRoles('MANAGER', 'TEAM_LEAD'),
  validateParams(reportIdParamSchema),
  deleteReport,
);

// POST /reports/:id/export-pdf — any authenticated user
router.post(
  '/:id/export-pdf',
  authenticate,
  validateParams(reportIdParamSchema),
  exportReportPdf,
);

export default router;
