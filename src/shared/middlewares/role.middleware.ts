import { NextFunction, Response } from 'express';
import { AuthorizationError } from '../utils/errors/authorization-error';
import { AuthenticationError } from '../utils/errors/authentication-error';
import { UserRole } from '../../modules/users/user.types';
import { AuthRequest } from './auth.middleware';

export const ROLE_PERMISSIONS = {
  MANAGER: [
    'dashboard:view',
    'projects:view',
    'projects:create',
    'projects:update',
    'projects:delete',
    'documents:view',
    'documents:upload',
    'documents:delete',
    'reports:view',
    'reports:create',
    'reports:update',
    'reports:delete',
    'users:view',
    'users:manage',
    'master-data:view',
    'master-data:manage',
  ],
  TEAM_LEAD: [
    'dashboard:view',
    'projects:view',
    'projects:create',
    'projects:update',
    'projects:delete',
    'documents:view',
    'documents:upload',
    'documents:delete',
    'reports:view',
    'reports:create',
    'reports:update',
    'reports:delete',
    'users:view',
    'users:manage',
    'master-data:view',
    'master-data:manage',
  ],
  EMPLOYEE: [
    'dashboard:view',
    'projects:view',
    'projects:create',
    'documents:view',
    'documents:upload',
    'reports:view',
    'reports:create',
    'master-data:view',
    'users:view',
  ],
} as const;

export type Permission = (typeof ROLE_PERMISSIONS)[UserRole][number];

export function authorizeRoles(...allowedRoles: UserRole[]) {
  return (req: AuthRequest, _res: Response, next: NextFunction) => {
    if (!req.user) {
      throw new AuthenticationError();
    }

    const role = req.user.role as UserRole;

    if (!allowedRoles.includes(role)) {
      throw new AuthorizationError();
    }

    next();
  };
}

export function authorizePermissions(...requiredPermissions: Permission[]) {
  return (req: AuthRequest, _res: Response, next: NextFunction) => {
    if (!req.user) {
      throw new AuthenticationError();
    }

    const role = req.user.role as UserRole;
    const permissions = ROLE_PERMISSIONS[role] as readonly Permission[];
    const hasAllPermissions = requiredPermissions.every((permission) =>
      permissions.includes(permission),
    );

    if (!hasAllPermissions) {
      throw new AuthorizationError();
    }

    next();
  };
}