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
} from './report.controller';
import {
  listReportsQuerySchema,
  createReportSchema,
  updateReportSchema,
  reportIdParamSchema,
} from './report.validation';

const router = Router();

// GET /reports — any authenticated user
router.get(
  '/',
  authenticate,
  validateQuery(listReportsQuerySchema),
  listReports,
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
  authorizeRoles('ADMIN', 'EMPLOYEE'),
  validateBody(createReportSchema),
  createReport,
);

// PATCH /reports/:id — ADMIN or EMPLOYEE can update
router.patch(
  '/:id',
  authenticate,
  authorizeRoles('ADMIN', 'EMPLOYEE'),
  validateParams(reportIdParamSchema),
  validateBody(updateReportSchema),
  updateReport,
);

// DELETE /reports/:id — ADMIN only
router.delete(
  '/:id',
  authenticate,
  authorizeRoles('ADMIN'),
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
