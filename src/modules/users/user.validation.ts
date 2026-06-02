import { z } from 'zod';

const userRoleSchema = z.enum(['ADMIN', 'EMPLOYEE']);

const nameSchema = z.string().trim().min(1).max(100);

export const userIdParamsSchema = z.object({
  id: z.string().uuid()
});

export const listUsersQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(10),
  search: z.string().trim().min(1).max(255).optional(),
  role: userRoleSchema.optional(),
  isActive: z
    .enum(['true', 'false'])
    .transform((value) => value === 'true')
    .optional(),
  sortBy: z
    .enum(['createdAt', 'updatedAt', 'email', 'firstName', 'lastName', 'role', 'isActive'])
    .default('createdAt'),
  sortOrder: z.enum(['asc', 'desc']).default('desc')
});

export const updateUserSchema = z
  .object({
    email: z.string().trim().toLowerCase().email().max(255).optional(),
    firstName: nameSchema.optional(),
    lastName: nameSchema.optional(),
    role: userRoleSchema.optional(),
    isActive: z.boolean().optional()
  })
  .strict()
  .refine((data) => Object.keys(data).length > 0, {
    message: 'At least one field is required'
  });

export const updateUserStatusSchema = z
  .object({
    isActive: z.boolean()
  })
  .strict();
