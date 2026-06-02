export type UserRole = 'ADMIN' | 'EMPLOYEE';

export interface User {
  id: string;
  email: string;
  passwordHash: string;
  firstName: string;
  lastName: string;
  role: UserRole;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export type PublicUser = Omit<User, 'passwordHash'>;

export type UserSortBy = 'createdAt' | 'updatedAt' | 'email' | 'firstName' | 'lastName' | 'role' | 'isActive';
export type SortOrder = 'asc' | 'desc';

export interface ListUsersQuery {
  page: number;
  limit: number;
  search?: string;
  role?: UserRole;
  isActive?: boolean;
  sortBy: UserSortBy;
  sortOrder: SortOrder;
}

export interface UpdateUserBody {
  email?: string;
  firstName?: string;
  lastName?: string;
  role?: UserRole;
  isActive?: boolean;
}

export interface UpdateUserStatusBody {
  isActive: boolean;
}

export interface UserIdParams {
  id: string;
}
