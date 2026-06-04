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
  createProjectWithSubcategoryRule,
  updateProjectWithSubcategoryRule,
  projectIdParamSchema,
} from './project.validation';
import { upload } from '../../shared/config/upload.config';

const router = Router();

// GET /projects — any authenticated user
router.get(
  '/',
  authenticate,
  validateQuery(listProjectsQuerySchema),
  listProjects,
);

// GET /projects/:id — any authenticated user
router.get(
  '/:id',
  authenticate,
  validateParams(projectIdParamSchema),
  getProject,
);

// POST /projects — ADMIN or EMPLOYEE can create
router.post(
  '/',
  authenticate,
  authorizeRoles('ADMIN', 'EMPLOYEE'),
  validateBody(createProjectWithSubcategoryRule),
  createProject,
);

// PATCH /projects/:id — ADMIN only
router.patch(
  '/:id',
  authenticate,
  authorizeRoles('ADMIN'),
  validateParams(projectIdParamSchema),
  validateBody(updateProjectWithSubcategoryRule),
  updateProject,
);

// DELETE /projects/:id — ADMIN only
router.delete(
  '/:id',
  authenticate,
  authorizeRoles('ADMIN'),
  validateParams(projectIdParamSchema),
  deleteProject,
);

// POST /projects/:id/documents — ADMIN or EMPLOYEE
router.post(
  '/:id/documents',
  authenticate,
  authorizeRoles('ADMIN', 'EMPLOYEE'),
  upload.single('file'),
  uploadDocument,
);

// DELETE /projects/documents/:documentId — ADMIN only
router.delete(
  '/documents/:documentId',
  authenticate,
  authorizeRoles('ADMIN'),
  removeDocument,
);

export default router;
