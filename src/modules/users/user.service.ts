import bcrypt from 'bcryptjs';
import { AppError } from '../../shared/utils/errors/app-error';
import { NotFoundError } from '../../shared/utils/errors/not-found-error';
import { PaginationMeta } from '../../shared/utils/api-response';
import {
  ListUsersQuery,
  PublicUser,
  UpdateUserBody,
  User
} from "./user.types";
import { userRepository } from "./user.repository";

export class UserService {
  findByEmail(email: string): Promise<User | null> {
    return userRepository.findByEmail(email);
  }

  findById(id: string): Promise<User | null> {
    return userRepository.findById(id);
  }

  findAuthStatusById(id: string): Promise<User | null> {
    return userRepository.findAuthStatusById(id);
  }

  async listUsers(query: ListUsersQuery): Promise<{ users: PublicUser[]; pagination: PaginationMeta }> {
    const { users, total } = await userRepository.list(query);
    const totalPages = Math.ceil(total / query.limit);

    return {
      users: users.map((user) => this.toPublicUser(user)),
      pagination: {
        page: query.page,
        limit: query.limit,
        total,
        totalPages,
        hasNextPage: query.page < totalPages,
        hasPreviousPage: query.page > 1
      }
    };
  }

  async getUserById(id: string): Promise<PublicUser> {
    const user = await userRepository.findById(id);

    if (!user) {
      throw new NotFoundError('User');
    }

    return this.toPublicUser(user);
  }

  async updateUser(id: string, data: UpdateUserBody): Promise<PublicUser> {
    const existingUser = await userRepository.findById(id);

    if (!existingUser) {
      throw new NotFoundError('User');
    }

    if (data.email && data.email !== existingUser.email) {
      await this.ensureEmailIsAvailable(data.email);
    }

    const updatedUser = await userRepository.update(id, data);

    return this.toPublicUser(updatedUser);
  }

  async updateUserStatus(id: string, isActive: boolean): Promise<PublicUser> {
    return this.updateUser(id, { isActive });
  }

  toPublicUser(user: User): PublicUser {
    const { passwordHash: _passwordHash, ...publicUser } = user;
    return publicUser;
  }

  private async ensureEmailIsAvailable(email: string): Promise<void> {
    const existingUser = await userRepository.findByEmail(email);

    if (existingUser) {
      throw new AppError(409, 'Email is already in use', 'USER_EMAIL_CONFLICT');
    }
  }
}

export const userService = new UserService();
