import type { Prisma, User as PrismaUser } from '@prisma/client';
import { prisma } from '../../prisma/prisma.client';
import { ListUsersQuery, UpdateUserBody, User } from './user.types';

export class UserRepository {
  private readonly db = prisma.user;

  async findByEmail(email: string): Promise<User | null> {
    const normalizedEmail = email.trim().toLowerCase();

    const user = await this.db.findUnique({
      where: { email: normalizedEmail }
    });

    return user ? this.toDomainUser(user) : null;
  }

  async findById(id: string): Promise<User | null> {
    const user = await this.db.findUnique({
      where: { id }
    });

    return user ? this.toDomainUser(user) : null;
  }

  async findAuthStatusById(id: string): Promise<User | null> {
    const user = await this.db.findUnique({
      where: { id }
    });

    return user ? this.toDomainUser(user) : null;
  }

  async list(query: ListUsersQuery): Promise<{ users: User[]; total: number }> {
    const where = this.toListWhereInput(query);
    const orderBy: Prisma.UserOrderByWithRelationInput = {
      [query.sortBy]: query.sortOrder
    };
    const skip = (query.page - 1) * query.limit;

    const [users, total] = await prisma.$transaction([
      this.db.findMany({
        where,
        orderBy,
        skip,
        take: query.limit
      }),
      this.db.count({ where })
    ]);

    return {
      users: users.map((user) => this.toDomainUser(user)),
      total
    };
  }

  async update(id: string, data: UpdateUserBody): Promise<User> {
    const updatedUser = await this.db.update({
      where: { id },
      data: {
        ...data,
        ...(data.email ? { email: data.email.trim().toLowerCase() } : {})
      }
    });

    return this.toDomainUser(updatedUser);
  }

  private toListWhereInput(query: ListUsersQuery): Prisma.UserWhereInput {
    return {
      ...(query.role ? { role: query.role } : {}),
      ...(query.isActive === undefined ? {} : { isActive: query.isActive }),
      ...(query.search
        ? {
            OR: [
              { email: { contains: query.search, mode: 'insensitive' } },
              { firstName: { contains: query.search, mode: 'insensitive' } },
              { lastName: { contains: query.search, mode: 'insensitive' } }
            ]
          }
        : {})
    };
  }

  private toDomainUser(user: PrismaUser): User {
    return {
      id: user.id,
      email: user.email,
      passwordHash: user.password,
      firstName: user.firstName,
      lastName: user.lastName,
      role: user.role,
      isActive: user.isActive,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt
    };
  }
}

export const userRepository = new UserRepository();
