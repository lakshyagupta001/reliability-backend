import { z } from 'zod';

// ============================================================================
// MasterData schemas
// ============================================================================

export const masterDataIdParamSchema = z.object({
  id: z.string().uuid('Invalid master data ID'),
});

export const listMasterDataQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(200).default(50),
  search: z.string().optional(),
  level: z.enum(['CATEGORY', 'SUBCATEGORY', 'TYPE']).optional(),
  parentId: z.string().optional(), // can be a UUID or 'null' string
  isActive: z
    .string()
    .optional()
    .transform((v) => (v === 'true' ? true : v === 'false' ? false : undefined)),
});

export const createMasterDataSchema = z.object({
  name: z.string().min(1, 'Name is required').max(100, 'Name must be at most 100 characters').trim(),
  level: z.enum(['CATEGORY', 'SUBCATEGORY', 'TYPE'], {
    required_error: 'Level is required',
    invalid_type_error: 'Level must be CATEGORY, SUBCATEGORY, or TYPE',
  }),
  parentId: z.string().uuid('Invalid parent ID').optional(),
});

export const updateMasterDataSchema = z.object({
  name: z.string().min(1, 'Name is required').max(100, 'Name must be at most 100 characters').trim(),
});

// ============================================================================
// Status schemas (unchanged)
// ============================================================================

export const statusIdParamSchema = z.object({
  id: z.string().uuid('Invalid status ID'),
});

export const listStatusesQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  search: z.string().optional(),
  isActive: z
    .string()
    .optional()
    .transform((v) => (v === 'true' ? true : v === 'false' ? false : undefined)),
});

export const createStatusSchema = z.object({
  code: z.string().min(1).max(50).toUpperCase(),
  displayName: z.string().min(1).max(100),
  color: z
    .string()
    .regex(/^#[0-9A-Fa-f]{6}$/, 'Color must be a valid hex color')
    .optional(),
});

export const updateStatusSchema = z.object({
  displayName: z.string().min(1).max(100).optional(),
  color: z
    .string()
    .regex(/^#[0-9A-Fa-f]{6}$/, 'Color must be a valid hex color')
    .optional(),
  isActive: z.boolean().optional(),
});

// ============================================================================
// Legacy schemas (kept for deprecated alias endpoints)
// ============================================================================

export const categoryIdParamSchema = z.object({
  id: z.string().uuid('Invalid category ID'),
});

export const listCategoriesQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  search: z.string().optional(),
  isActive: z
    .string()
    .optional()
    .transform((v) => (v === 'true' ? true : v === 'false' ? false : undefined)),
});

export const subcategoryIdParamSchema = z.object({
  id: z.string().uuid('Invalid subcategory ID'),
});

export const listSubcategoriesQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  categoryId: z.string().uuid().optional(),
  search: z.string().optional(),
  isActive: z
    .string()
    .optional()
    .transform((v) => (v === 'true' ? true : v === 'false' ? false : undefined)),
});

export const typeIdParamSchema = z.object({
  id: z.string().uuid('Invalid type ID'),
});

export const listTypesQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  categoryId: z.string().uuid().optional(),
  subcategoryId: z.string().uuid().optional(),
  search: z.string().optional(),
  isActive: z
    .string()
    .optional()
    .transform((v) => (v === 'true' ? true : v === 'false' ? false : undefined)),
});