import { ProjectCategory, ProjectSubcategory, ProjectType, ProjectStatus, ProjectScope, DocumentType } from '@prisma/client';

export type { ProjectCategory, ProjectSubcategory, ProjectType, ProjectStatus, ProjectScope, DocumentType };

// ============================================================================
// DOMAIN TYPES
// ============================================================================

export type SortOrder = 'asc' | 'desc';

export type ProjectSortBy =
  | 'name'
  | 'category'
  | 'subcategory'
  | 'type'
  | 'status'
  | 'startDate'
  | 'endDate'
  | 'createdAt';

export interface ListProjectsQuery {
  page: number;
  limit: number;
  search?: string;
  category?: ProjectCategory;
  subcategory?: ProjectSubcategory;
  type?: ProjectType;
  status?: ProjectStatus;
  sortBy?: ProjectSortBy;
  sortOrder?: SortOrder;
  startDateFrom?: string;
  startDateTo?: string;
  endDateFrom?: string;
  endDateTo?: string;
}

export interface CreateProjectBody {
  name: string;
  category: ProjectCategory;
  subcategory: ProjectSubcategory;
  type: ProjectType;
  startDate: string;
  endDate: string;
  location: string;
  partName?: string;
  modelName?: string;
  projectPIC?: string;
  projectScope?: ProjectScope;
  applicableCompliance?: string;
  sampleSubmissionDate?: string;
  massProductionDate?: string;
  partSampleCount?: number;
  productSampleCount?: number;
  projectPriorityScale?: string;
  operatingVoltageRange?: string;
  ambientOperatingRange?: string;
  iduHardwareVersion?: string;
  oduHardwareVersion?: string;
  iduFirmwareVersion?: string;
  oduFirmwareVersion?: string;
  partNumberAndMake?: string;
  technicalDataSheetReference?: string;
  maximumPipingLength?: string;
  maximumCommunicationWireLength?: string;
  oduFanMotorDetails?: string;
  iduFanMotorDetails?: string;
  compressorDetails?: string;
  refrigerantName?: string;
  refrigerantQuantity?: string;
}

export interface UpdateProjectBody {
  name?: string;
  category?: ProjectCategory;
  subcategory?: ProjectSubcategory;
  type?: ProjectType;
  status?: ProjectStatus;
  startDate?: string;
  endDate?: string;
  location?: string;
  partName?: string;
  modelName?: string;
  projectPIC?: string;
  projectScope?: ProjectScope;
  applicableCompliance?: string;
  sampleSubmissionDate?: string;
  massProductionDate?: string;
  partSampleCount?: number;
  productSampleCount?: number;
  projectPriorityScale?: string;
  operatingVoltageRange?: string;
  ambientOperatingRange?: string;
  iduHardwareVersion?: string;
  oduHardwareVersion?: string;
  iduFirmwareVersion?: string;
  oduFirmwareVersion?: string;
  partNumberAndMake?: string;
  technicalDataSheetReference?: string;
  maximumPipingLength?: string;
  maximumCommunicationWireLength?: string;
  oduFanMotorDetails?: string;
  iduFanMotorDetails?: string;
  compressorDetails?: string;
  refrigerantName?: string;
  refrigerantQuantity?: string;
}

export interface ProjectIdParams {
  id: string;
}

// ============================================================================
// PERSISTENCE / PRISMA MODEL
// ============================================================================

export interface Project {
  id: string;
  name: string;
  category: ProjectCategory;
  subcategory: ProjectSubcategory;
  type: ProjectType;
  status: ProjectStatus;
  startDate: Date;
  endDate: Date;
  location: string;
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
  partName: string | null;
  modelName: string | null;
  projectPIC: string | null;
  projectScope: ProjectScope | null;
  applicableCompliance: string | null;
  sampleSubmissionDate: Date | null;
  massProductionDate: Date | null;
  partSampleCount: number | null;
  productSampleCount: number | null;
  projectPriorityScale: string | null;
  operatingVoltageRange: string | null;
  ambientOperatingRange: string | null;
  iduHardwareVersion: string | null;
  oduHardwareVersion: string | null;
  iduFirmwareVersion: string | null;
  oduFirmwareVersion: string | null;
  partNumberAndMake: string | null;
  technicalDataSheetReference: string | null;
  maximumPipingLength: string | null;
  maximumCommunicationWireLength: string | null;
  oduFanMotorDetails: string | null;
  iduFanMotorDetails: string | null;
  compressorDetails: string | null;
  refrigerantName: string | null;
  refrigerantQuantity: string | null;
}

export interface ProjectDocument {
  id: string;
  projectId: string;
  documentType: DocumentType;
  fileName: string;
  fileUrl: string;
  fileSize: number | null;
  mimeType: string | null;
  uploadedBy: string;
  uploadedAt: Date;
}

// ============================================================================
// API RESPONSE DTOs (no internal fields like passwordHash)
// ============================================================================

export interface PublicProject {
  id: string;
  name: string;
  category: ProjectCategory;
  subcategory: ProjectSubcategory;
  type: ProjectType;
  status: ProjectStatus;
  startDate: string;
  endDate: string;
  location: string;
  createdBy: string;
  creator?: {
    firstName: string;
    lastName: string;
    email: string;
  };
  createdAt: string;
  updatedAt: string;
  partName: string | null;
  modelName: string | null;
  projectPIC: string | null;
  projectScope: ProjectScope | null;
  applicableCompliance: string | null;
  sampleSubmissionDate: string | null;
  massProductionDate: string | null;
  partSampleCount: number | null;
  productSampleCount: number | null;
  projectPriorityScale: string | null;
  operatingVoltageRange: string | null;
  ambientOperatingRange: string | null;
  iduHardwareVersion: string | null;
  oduHardwareVersion: string | null;
  iduFirmwareVersion: string | null;
  oduFirmwareVersion: string | null;
  partNumberAndMake: string | null;
  technicalDataSheetReference: string | null;
  maximumPipingLength: string | null;
  maximumCommunicationWireLength: string | null;
  oduFanMotorDetails: string | null;
  iduFanMotorDetails: string | null;
  compressorDetails: string | null;
  refrigerantName: string | null;
  refrigerantQuantity: string | null;
  documents?: PublicProjectDocument[];
}

export interface PublicProjectDocument {
  id: string;
  projectId: string;
  documentType: DocumentType;
  fileName: string;
  fileUrl: string;
  fileSize: number | null;
  mimeType: string | null;
  uploadedBy: string;
  uploader?: {
    firstName: string;
    lastName: string;
    email: string;
  };
  uploadedAt: string;
}
