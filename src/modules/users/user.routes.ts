import { Router } from 'express';
import { authenticate } from '../../shared/middlewares/auth.middleware';
import { authorizePermissions } from '../../shared/middlewares/role.middleware';
import {
  getCurrentUser,
  getUserById,
  listUsers,
  updateUser,
  updateUserStatus
} from './user.controller';
import { validateBody, validateParams, validateQuery } from '../../shared/middlewares/validate.middleware';
import {
  listUsersQuerySchema,
  updateUserSchema,
  updateUserStatusSchema,
  userIdParamsSchema
} from './user.validation';

const router = Router();

router.use(authenticate);

router.get('/me', getCurrentUser);
router.get('/', authorizePermissions('users:view'), validateQuery(listUsersQuerySchema), listUsers);
router.get('/:id', authorizePermissions('users:view'), validateParams(userIdParamsSchema), getUserById);
router.patch(
  '/:id',
  authorizePermissions('users:manage'),
  validateParams(userIdParamsSchema),
  validateBody(updateUserSchema),
  updateUser
);
router.patch(
  '/:id/status',
  authorizePermissions('users:manage'),
  validateParams(userIdParamsSchema),
  validateBody(updateUserStatusSchema),
  updateUserStatus
);

export default router;
