import { Router } from 'express';
import { authenticate } from '../../shared/middlewares/auth.middleware';
import { authorizeRoles } from '../../shared/middlewares/role.middleware';
import { validateBody, validateParams, validateQuery } from '../../shared/middlewares/validate.middleware';
import {
  listProjects,
  getProject,
  createProject,
  updateProject,
  deleteProject,
  uploadDocument,
  removeDocument,
} from './project.controller';
import {
  listProjectsQuerySchema,
  createProjectSchema,
  updateProjectSchema,
  projectIdParamSchema,
} from './project.validation';
import { upload } from '../../shared/config/upload.config';

// Import new nested report routers
import { projectPartReportRouter } from '../reports/part-reports/part-report.routes';
import { partReportTestPartListRouter } from '../reports/test-part-lists/test-part-list.routes';
import { projectSummaryReportRouter } from '../reports/summary-reports/summary-report.routes';
import { summaryReportTestSummaryListRouter } from '../reports/test-summary-lists/test-summary-list.routes';

const router = Router();

router.get(
  '/',
  authenticate,
  validateQuery(listProjectsQuerySchema),
  listProjects,
);

router.get(
  '/:id',
  authenticate,
  validateParams(projectIdParamSchema),
  getProject,
);

router.post(
  '/',
  authenticate,
  authorizeRoles('MANAGER', 'TEAM_LEAD', 'EMPLOYEE'),
  validateBody(createProjectSchema),
  createProject,
);

router.patch(
  '/:id',
  authenticate,
  authorizeRoles('MANAGER', 'TEAM_LEAD'),
  validateParams(projectIdParamSchema),
  validateBody(updateProjectSchema),
  updateProject,
);

router.delete(
  '/:id',
  authenticate,
  authorizeRoles('MANAGER', 'TEAM_LEAD'),
  validateParams(projectIdParamSchema),
  deleteProject,
);

router.post(
  '/:id/documents',
  authenticate,
  authorizeRoles('MANAGER', 'TEAM_LEAD', 'EMPLOYEE'),
  upload.single('file'),
  uploadDocument,
);

router.delete(
  '/documents/:documentId',
  authenticate,
  authorizeRoles('MANAGER', 'TEAM_LEAD'),
  removeDocument,
);

// Nested report routes
router.use('/:projectId/part-reports', projectPartReportRouter);
router.use('/:projectId/summary-report', projectSummaryReportRouter);

// Also expose test-part-list access via part-reports (not project-level, but part-report level)
// These are wired in app.ts via /part-reports/:id/test-part-list

export default router;