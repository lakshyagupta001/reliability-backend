import type { ProjectScope, ReportStatus } from '@prisma/client';

export type { ProjectScope };
export type { ReportStatus };

export type SortOrder = 'asc' | 'desc';

export type ProjectSortBy =
  | 'name'
  | 'startDate'
  | 'endDate'
  | 'createdAt'
  | 'updatedAt';

export interface ListProjectsQuery {
  page: number;
  limit: number;
  search?: string;
  categoryId?: string;
  subcategoryId?: string;
  typeId?: string;
  typeName?: string;
  statusId?: string;
  sortBy?: ProjectSortBy;
  sortOrder?: SortOrder;
  startDateFrom?: string;
  startDateTo?: string;
  endDateFrom?: string;
  endDateTo?: string;
  hasPartReport?: boolean;
  hasTestSummary?: boolean;
  missingAnyReport?: boolean;
}

export interface CreateProjectBody {
  name: string;
  categoryId: string;
  subcategoryId: string;
  typeId: string;
  statusId: string;
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
  statusRemark?: string;
}

export interface UpdateProjectBody {
  name?: string;
  categoryId?: string;
  subcategoryId?: string;
  typeId?: string;
  statusId?: string;
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
  statusRemark?: string;
}

export interface ProjectIdParams {
  id: string;
}

export interface PublicProjectDocument {
  id: string;
  projectId: string;
  fileName: string;
  originalName: string;
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

export interface PublicProject {
  id: string;
  name: string;
  categoryId: string;
  subcategoryId: string;
  typeId: string;
  statusId: string;
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
  statusRemark: string | null;
  category?: {
    id: string;
    name: string;
    code: string;
  };
  subcategory?: {
    id: string;
    name: string;
    code: string;
  };
  type?: {
    id: string;
    name: string;
    code: string;
  };
  status?: {
    id: string;
    code: string;
    displayName: string;
    color: string;
  };
  documents?: PublicProjectDocument[];
  reports?: {
    id: string;
    type: 'PART_REPORT' | 'SUMMARY_REPORT' | 'TEST_LIST';
    status: ReportStatus;
    updatedAt: string;
  }[];
}
