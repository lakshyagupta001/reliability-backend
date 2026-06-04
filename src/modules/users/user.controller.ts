import { Response } from 'express';
import { asyncHandler } from '../../shared/utils/async-handler';
import { sendPaginatedSuccess, sendSuccess } from '../../shared/utils/api-response';
import { AuthRequest } from '../../shared/middlewares/auth.middleware';
import { userService } from './user.service';
import type { ListUsersQuery, UpdateUserBody, UpdateUserStatusBody, UserIdParams } from './user.types';

export const getCurrentUser = asyncHandler(async (req: AuthRequest, res: Response) => {
  return sendSuccess(res, 200, 'User profile fetched successfully', req.user);
});

export const listUsers = asyncHandler(async (req: AuthRequest, res: Response) => {
  // Use validatedQuery — populated by validateQuery(listUsersQuerySchema) in routes
  const query = req.validatedQuery as ListUsersQuery;
  const result = await userService.listUsers(query);

  return sendPaginatedSuccess(
    res,
    200,
    'Users fetched successfully',
    result.users,
    result.pagination,
  );
});

export const getUserById = asyncHandler(async (req: AuthRequest, res: Response) => {
  const params = req.validatedParams as UserIdParams;
  const user = await userService.getUserById(params.id);
  return sendSuccess(res, 200, 'User fetched successfully', user);
});

export const updateUser = asyncHandler(async (req: AuthRequest, res: Response) => {
  const params = req.validatedParams as UserIdParams;
  const body = req.validatedBody as UpdateUserBody;
  const user = await userService.updateUser(params.id, body);
  return sendSuccess(res, 200, 'User updated successfully', user);
});

export const updateUserStatus = asyncHandler(async (req: AuthRequest, res: Response) => {
  const params = req.validatedParams as UserIdParams;
  const body = req.validatedBody as UpdateUserStatusBody;
  const user = await userService.updateUserStatus(params.id, body.isActive);
  return sendSuccess(res, 200, 'User status updated successfully', user);
});
