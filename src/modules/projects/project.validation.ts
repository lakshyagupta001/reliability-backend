import { z } from 'zod';

const uuidSchema = z.string().uuid('Invalid ID');

export const paginationSchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(10),
});

export const projectSortBySchema = z.enum([
  'name', 'startDate', 'endDate', 'createdAt', 'updatedAt',
]);
export const sortOrderSchema = z.enum(['asc', 'desc']);

export const listProjectsQuerySchema = paginationSchema.extend({
  search: z.string().optional(),
  categoryId: uuidSchema.optional(),
  subcategoryId: uuidSchema.optional(),
  typeId: uuidSchema.optional(),
  typeName: z.string().optional(),
  statusId: uuidSchema.optional(),
  sortBy: projectSortBySchema.default('createdAt'),
  sortOrder: sortOrderSchema.default('desc'),
  startDateFrom: z.string().datetime().optional(),
  startDateTo: z.string().datetime().optional(),
  endDateFrom: z.string().datetime().optional(),
  endDateTo: z.string().datetime().optional(),
  hasPartReport: z.preprocess((val) => val === 'true' || val === true ? true : val === 'false' || val === false ? false : undefined, z.boolean().optional()),
  hasTestSummary: z.preprocess((val) => val === 'true' || val === true ? true : val === 'false' || val === false ? false : undefined, z.boolean().optional()),
  missingAnyReport: z.preprocess((val) => val === 'true' || val === true ? true : val === 'false' || val === false ? false : undefined, z.boolean().optional()),
});

const dateStringSchema = z.string().refine(
  (val) => !isNaN(Date.parse(val)),
  { message: 'Invalid date string' },
);

const projectScopeSchema = z.enum(['DOMESTIC', 'OVERSEAS']);

export const createProjectSchema = z.object({
  name: z.string().min(1, 'Project name is required').max(255),
  categoryId: uuidSchema,
  subcategoryId: uuidSchema,
  typeId: uuidSchema,
  statusId: uuidSchema,
  startDate: dateStringSchema,
  endDate: dateStringSchema,
  location: z.string().min(1).max(255),

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

  statusRemark: z.string().max(1000).optional(),
}).refine(
  (data) => new Date(data.endDate) > new Date(data.startDate),
  { message: 'End date must be after start date', path: ['endDate'] },
);

export type CreateProjectInput = z.infer<typeof createProjectSchema>;

const partialDateStringSchema = z.string().refine(
  (val) => val === undefined || val === '' || !isNaN(Date.parse(val)),
  { message: 'Invalid date string' },
).optional();

export const updateProjectSchema = z.object({
  name: z.string().min(1).max(255).optional(),
  categoryId: uuidSchema.optional(),
  subcategoryId: uuidSchema.optional(),
  typeId: uuidSchema.optional(),
  statusId: uuidSchema.optional(),
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

  statusRemark: z.string().max(1000).optional(),
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

export const projectIdParamSchema = z.object({
  id: uuidSchema,
});