import { z } from 'zod';
import {
  ProjectCategory,
  ProjectSubcategory,
  ProjectType,
  ProjectStatus,
  ProjectScope,
  DocumentType,
} from '@prisma/client';

// ============================================================================
// ENUM SCHEMAS
// ============================================================================

export const projectCategorySchema = z.nativeEnum(ProjectCategory);
export const projectSubcategorySchema = z.nativeEnum(ProjectSubcategory);
export const projectTypeSchema = z.nativeEnum(ProjectType);
export const projectStatusSchema = z.nativeEnum(ProjectStatus);
export const projectScopeSchema = z.nativeEnum(ProjectScope);
export const documentTypeSchema = z.nativeEnum(DocumentType);

// ============================================================================
// PAGINATION + FILTER SCHEMAS
// ============================================================================

export const paginationSchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(10),
});

export const projectSortBySchema = z.enum([
  'name', 'category', 'subcategory', 'type', 'status',
  'startDate', 'endDate', 'createdAt',
]);
export const sortOrderSchema = z.enum(['asc', 'desc']);

export const listProjectsQuerySchema = paginationSchema.extend({
  search: z.string().optional(),
  category: projectCategorySchema.optional(),
  subcategory: projectSubcategorySchema.optional(),
  type: projectTypeSchema.optional(),
  status: projectStatusSchema.optional(),
  sortBy: projectSortBySchema.default('createdAt'),
  sortOrder: sortOrderSchema.default('desc'),
  startDateFrom: z.string().datetime().optional(),
  startDateTo: z.string().datetime().optional(),
  endDateFrom: z.string().datetime().optional(),
  endDateTo: z.string().datetime().optional(),
});

// ============================================================================
// CREATE PROJECT SCHEMA
// ============================================================================

const dateStringSchema = z.string().refine(
  (val) => !isNaN(Date.parse(val)),
  { message: 'Invalid date string' },
);

export const createProjectSchema = z.object({
  name: z.string().min(1, 'Project name is required').max(255),
  category: projectCategorySchema,
  subcategory: projectSubcategorySchema,
  type: projectTypeSchema,
  startDate: dateStringSchema,
  endDate: dateStringSchema,
  location: z.string().min(1).max(255),

  // Basic Details
  partName: z.string().max(255).optional(),
  modelName: z.string().max(255).optional(),
  projectPIC: z.string().max(255).optional(),
  projectScope: projectScopeSchema.optional(),
  applicableCompliance: z.string().max(500).optional(),

  sampleSubmissionDate: dateStringSchema.optional(),
  massProductionDate: dateStringSchema.optional(),

  partSampleCount: z.number().int().nonnegative().optional(),
  productSampleCount: z.number().int().nonnegative().optional(),

  projectPriorityScale: z.string().max(50).optional(),

  // Technical Details
  operatingVoltageRange: z.string().max(100).optional(),
  ambientOperatingRange: z.string().max(100).optional(),

  iduHardwareVersion: z.string().max(100).optional(),
  oduHardwareVersion: z.string().max(100).optional(),

  iduFirmwareVersion: z.string().max(100).optional(),
  oduFirmwareVersion: z.string().max(100).optional(),

  partNumberAndMake: z.string().max(5000).optional(),
  technicalDataSheetReference: z.string().max(5000).optional(),

  maximumPipingLength: z.string().max(100).optional(),
  maximumCommunicationWireLength: z.string().max(100).optional(),

  oduFanMotorDetails: z.string().max(5000).optional(),
  iduFanMotorDetails: z.string().max(5000).optional(),

  compressorDetails: z.string().max(5000).optional(),

  refrigerantName: z.string().max(100).optional(),
  refrigerantQuantity: z.string().max(50).optional(),
}).refine(
  (data) => new Date(data.endDate) > new Date(data.startDate),
  { message: 'End date must be after start date', path: ['endDate'] },
);

export type CreateProjectInput = z.infer<typeof createProjectSchema>;

// ============================================================================
// UPDATE PROJECT SCHEMA (partial, all optional except at least one field)
// ============================================================================

const partialDateStringSchema = z.string().refine(
  (val) => val === undefined || val === '' || !isNaN(Date.parse(val)),
  { message: 'Invalid date string' },
).optional();

export const updateProjectSchema = z.object({
  name: z.string().min(1).max(255).optional(),
  category: projectCategorySchema.optional(),
  subcategory: projectSubcategorySchema.optional(),
  type: projectTypeSchema.optional(),
  status: projectStatusSchema.optional(),
  startDate: partialDateStringSchema,
  endDate: partialDateStringSchema,
  location: z.string().max(255).optional(),

  partName: z.string().max(255).optional(),
  modelName: z.string().max(255).optional(),
  projectPIC: z.string().max(255).optional(),
  projectScope: projectScopeSchema.optional(),
  applicableCompliance: z.string().max(500).optional(),

  sampleSubmissionDate: partialDateStringSchema,
  massProductionDate: partialDateStringSchema,

  partSampleCount: z.number().int().nonnegative().optional().nullable(),
  productSampleCount: z.number().int().nonnegative().optional().nullable(),

  projectPriorityScale: z.string().max(50).optional(),

  operatingVoltageRange: z.string().max(100).optional(),
  ambientOperatingRange: z.string().max(100).optional(),

  iduHardwareVersion: z.string().max(100).optional(),
  oduHardwareVersion: z.string().max(100).optional(),

  iduFirmwareVersion: z.string().max(100).optional(),
  oduFirmwareVersion: z.string().max(100).optional(),

  partNumberAndMake: z.string().max(5000).optional(),
  technicalDataSheetReference: z.string().max(5000).optional(),

  maximumPipingLength: z.string().max(100).optional(),
  maximumCommunicationWireLength: z.string().max(100).optional(),

  oduFanMotorDetails: z.string().max(5000).optional(),
  iduFanMotorDetails: z.string().max(5000).optional(),

  compressorDetails: z.string().max(5000).optional(),

  refrigerantName: z.string().max(100).optional(),
  refrigerantQuantity: z.string().max(50).optional(),
}).refine(
  (data) => {
    if (data.startDate && data.endDate) {
      return new Date(data.endDate) > new Date(data.startDate);
    }
    return true;
  },
  { message: 'End date must be after start date', path: ['endDate'] },
).refine(
  (data) => {
    if (data.startDate === undefined || data.startDate === '') return true;
    return !isNaN(Date.parse(data.startDate));
  },
  { message: 'Invalid start date', path: ['startDate'] },
).refine(
  (data) => {
    if (data.endDate === undefined || data.endDate === '') return true;
    return !isNaN(Date.parse(data.endDate));
  },
  { message: 'Invalid end date', path: ['endDate'] },
);

export type UpdateProjectInput = z.infer<typeof updateProjectSchema>;

// ============================================================================
// DOCUMENT UPLOAD SCHEMA
// ============================================================================

export const documentTypeParamSchema = z.object({
  documentType: documentTypeSchema,
});

export const projectIdParamSchema = z.object({
  id: z.string().uuid('Invalid project ID'),
});

// ============================================================================
// SUB-CATEGORY RULES (cross-field validation)
// ============================================================================

const RAC_SUBCATEGORIES = ['HP', 'SRICITY'] as const;
const CAG_SUBCATEGORIES = ['VRF', 'DUCTED', 'IBG', 'CHILLERS'] as const;

export const createProjectWithSubcategoryRule = createProjectSchema.refine(
  (data) => {
    if (data.category === 'RAC') {
      return (RAC_SUBCATEGORIES as unknown as string[]).includes(data.subcategory);
    }
    if (data.category === 'CAG') {
      return (CAG_SUBCATEGORIES as unknown as string[]).includes(data.subcategory);
    }
    return false;
  },
  { message: 'Invalid subcategory for selected category', path: ['subcategory'] },
);

export const updateProjectWithSubcategoryRule = updateProjectSchema.refine(
  (data) => {
    if (data.category !== undefined && data.subcategory !== undefined) {
      if (data.category === 'RAC') {
        return (RAC_SUBCATEGORIES as unknown as string[]).includes(data.subcategory);
      }
      if (data.category === 'CAG') {
        return (CAG_SUBCATEGORIES as unknown as string[]).includes(data.subcategory);
      }
    }
    return true;
  },
  { message: 'Invalid subcategory for selected category', path: ['subcategory'] },
);
