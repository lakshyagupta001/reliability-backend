import { z } from 'zod';

const uuidSchema = z.string().uuid('Invalid ID');

export const paginationSchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(10),
});

export const listCategoriesQuerySchema = paginationSchema.extend({
  search: z.string().optional(),
  isActive: z.coerce.boolean().optional(),
});

export const createCategorySchema = z.object({
  name: z.string().min(1, 'Name is required').max(100),
  code: z.string().min(1, 'Code is required').max(50).toUpperCase(),
  description: z.string().max(500).optional(),
});

export const updateCategorySchema = z.object({
  name: z.string().min(1).max(100).optional(),
  description: z.string().max(500).optional().nullable(),
  isActive: z.boolean().optional(),
});

export const categoryIdParamSchema = z.object({
  id: uuidSchema,
});

export const listSubcategoriesQuerySchema = paginationSchema.extend({
  categoryId: z.string().uuid('Invalid category ID').optional().or(z.literal('')),
  search: z.string().optional(),
  isActive: z.coerce.boolean().optional(),
});

export const createSubcategorySchema = z.object({
  categoryId: uuidSchema,
  name: z.string().min(1, 'Name is required').max(100),
  code: z.string().min(1, 'Code is required').max(50).toUpperCase(),
  description: z.string().max(500).optional(),
});

export const updateSubcategorySchema = z.object({
  categoryId: uuidSchema.optional(),
  name: z.string().min(1).max(100).optional(),
  description: z.string().max(500).optional().nullable(),
  isActive: z.boolean().optional(),
});

export const subcategoryIdParamSchema = z.object({
  id: uuidSchema,
});

export const listTypesQuerySchema = paginationSchema.extend({
  search: z.string().optional(),
  isActive: z.coerce.boolean().optional(),
  categoryId: z.string().uuid('Invalid category ID').optional().or(z.literal('')),
  subcategoryId: z.string().uuid('Invalid subcategory ID').optional().or(z.literal('')),
});

export const createTypeSchema = z.object({
  subcategoryId: uuidSchema,
  name: z.string().min(1, 'Name is required').max(100),
  code: z.string().min(1, 'Code is required').max(50).toUpperCase(),
  description: z.string().max(500).optional(),
});

export const updateTypeSchema = z.object({
  subcategoryId: uuidSchema.optional(),
  name: z.string().min(1).max(100).optional(),
  description: z.string().max(500).optional().nullable(),
  isActive: z.boolean().optional(),
});

export const typeIdParamSchema = z.object({
  id: uuidSchema,
});



export const getTypesBySubcategorySchema = z.object({
  subcategoryId: uuidSchema,
});

export const listStatusesQuerySchema = paginationSchema.extend({
  search: z.string().optional(),
  isActive: z.coerce.boolean().optional(),
});

export const createStatusSchema = z.object({
  code: z.string().min(1, 'Code is required').max(50).toUpperCase(),
  displayName: z.string().min(1, 'Display name is required').max(100),
  color: z.string().max(20).default('#6B7280'),
});

export const updateStatusSchema = z.object({
  displayName: z.string().min(1).max(100).optional(),
  color: z.string().max(20).optional(),
  isActive: z.boolean().optional(),
});

export const statusIdParamSchema = z.object({
  id: uuidSchema,
});