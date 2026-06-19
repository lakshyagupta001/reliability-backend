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
import { getProjectReports } from '../reports/report.controller';

const router = Router();

router.get(
  '/',
  authenticate,
  validateQuery(listProjectsQuerySchema),
  listProjects,
);

router.get(
  '/:id/reports',
  authenticate,
  validateParams(projectIdParamSchema),
  getProjectReports,
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

export default router;