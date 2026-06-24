import { prisma } from '../../prisma/prisma.client';
import type { ProjectScope } from '@prisma/client';
import type { PublicProject, PublicProjectDocument } from './project.types';
import type {
  CreateProjectBody,
  UpdateProjectBody,
  ListProjectsQuery,
} from './project.types';
import type { Prisma } from '@prisma/client';

export interface ProjectWithRelations {
  id: string;
  name: string;
  categoryId: string;
  subcategoryId: string | null;
  typeId: string | null;
  statusId: string;
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
  statusRemark: string | null;
  creator?: { firstName: string; lastName: string; email: string } | null;
  category?: { id: string; name: string } | null;
  subcategory?: { id: string; name: string } | null;
  type?: { id: string; name: string } | null;
  status?: { id: string; code: string; displayName: string; color: string } | null;
  documents?: ProjectDocumentRecord[];
  partReports?: Array<{ id: string; reportStatus: string; reportName: string; updatedAt: Date; testPartList?: { id: string; status: string } | null }>;
  summaryReport?: { id: string; reportStatus: string; updatedAt: Date; testSummaryList?: { id: string; status: string } | null } | null;
}

export interface ProjectDocumentRecord {
  id: string;
  projectId: string;
  fileName: string;
  originalName: string;
  fileUrl: string;
  fileSize: number | null;
  mimeType: string | null;
  uploadedBy: string;
  uploadedAt: Date;
  uploader?: { firstName: string; lastName: string; email: string } | null;
}

export class ProjectRepository {
  protected readonly db = prisma.project;

  async findById(id: string): Promise<ProjectWithRelations | null> {
    return this.db.findUnique({
      where: { id },
      include: {
        creator: { select: { firstName: true, lastName: true, email: true } },
        category: { select: { id: true, name: true } },
        subcategory: { select: { id: true, name: true } },
        type: { select: { id: true, name: true } },
        status: { select: { id: true, code: true, displayName: true, color: true } },
        documents: {
          include: { uploader: { select: { firstName: true, lastName: true, email: true } } },
          orderBy: { uploadedAt: 'desc' },
        },
      },
    }) as Promise<ProjectWithRelations | null>;
  }

  async findAll(query: ListProjectsQuery) {
    const page = query.page ?? 1;
    const limit = query.limit ?? 10;
    const skip = (page - 1) * limit;

    const where: Prisma.ProjectWhereInput = {
      // Only show projects whose master data hierarchy is entirely active
      category: { isActive: true },
      subcategory: { isActive: true },
      AND: [
        { OR: [{ typeId: null }, { type: { isActive: true } }] }
      ]
    };
    if (query.search) {
      where.name = { contains: query.search, mode: 'insensitive' };
    }
    if (query.categoryId) where.categoryId = query.categoryId;
    if (query.subcategoryId) where.subcategoryId = query.subcategoryId;
    if (query.typeId) where.typeId = query.typeId;
    if (query.typeName) {
      where.type = { isActive: true, name: query.typeName };
    }
    if (query.statusId) where.statusId = query.statusId;
    if (query.startDateFrom || query.startDateTo) {
      where.startDate = {};
      if (query.startDateFrom) where.startDate.gte = new Date(query.startDateFrom);
      if (query.startDateTo) where.startDate.lte = new Date(query.startDateTo);
    }
    if (query.endDateFrom || query.endDateTo) {
      where.endDate = {};
      if (query.endDateFrom) where.endDate.gte = new Date(query.endDateFrom);
      if (query.endDateTo) where.endDate.lte = new Date(query.endDateTo);
    }
    
    if (query.missingAnyReport) {
      // Filter to projects that have no part reports or no summary report
      where.OR = [
        { partReports: { none: {} } },
        { summaryReport: null },
      ];
    } else {
      if (query.hasPartReport !== undefined) {
        where.partReports = query.hasPartReport ? { some: {} } : { none: {} };
      }
      if (query.hasTestSummary !== undefined) {
        if (!where.AND) where.AND = [];
        const andArray = where.AND as Prisma.ProjectWhereInput[];
        if (query.hasPartReport !== undefined) {
          andArray.push(query.hasPartReport ? { partReports: { some: {} } } : { partReports: { none: {} } });
        }
        if (query.hasTestSummary !== undefined) {
          andArray.push(query.hasTestSummary ? { summaryReport: { isNot: null } } : { summaryReport: null });
        }
        delete (where as any).partReports;
      } else if (query.hasPartReport !== undefined) {
        where.partReports = query.hasPartReport ? { some: {} } : { none: {} };
      }
    }

    const [rows, total] = await Promise.all([
      this.db.findMany({
        where,
        skip,
        take: limit,
        orderBy: { [query.sortBy ?? 'createdAt']: query.sortOrder ?? 'desc' },
        include: {
          creator: { select: { firstName: true, lastName: true, email: true } },
          category: { select: { id: true, name: true } },
          subcategory: { select: { id: true, name: true } },
          type: { select: { id: true, name: true } },
          status: { select: { id: true, code: true, displayName: true, color: true } },
          _count: { select: { documents: true } },
          partReports: { select: { id: true, reportStatus: true, reportName: true, updatedAt: true, testPartList: { select: { id: true, status: true } } } },
          summaryReport: { select: { id: true, reportStatus: true, updatedAt: true, testSummaryList: { select: { id: true, status: true } } } },
        },
      }),
      this.db.count({ where }),
    ]);

    return {
      rows: rows as ProjectWithRelations[],
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async create(data: CreateProjectBody, userId: string, initialStatusId: string): Promise<ProjectWithRelations> {
    return this.db.create({
      data: {
        name: data.name,
        categoryId: data.categoryId,
        subcategoryId: data.subcategoryId,
        typeId: data.typeId,
        statusId: initialStatusId,
        startDate: new Date(data.startDate),
        endDate: new Date(data.endDate),
        location: data.location,
        sampleSubmissionDate: data.sampleSubmissionDate ? new Date(data.sampleSubmissionDate) : undefined,
        massProductionDate: data.massProductionDate ? new Date(data.massProductionDate) : undefined,
        createdBy: userId,
        partName: data.partName,
        modelName: data.modelName,
        projectPIC: data.projectPIC,
        projectScope: data.projectScope,
        applicableCompliance: data.applicableCompliance,
        partSampleCount: data.partSampleCount,
        productSampleCount: data.productSampleCount,
        projectPriorityScale: data.projectPriorityScale,
        operatingVoltageRange: data.operatingVoltageRange,
        ambientOperatingRange: data.ambientOperatingRange,
        iduHardwareVersion: data.iduHardwareVersion,
        oduHardwareVersion: data.oduHardwareVersion,
        iduFirmwareVersion: data.iduFirmwareVersion,
        oduFirmwareVersion: data.oduFirmwareVersion,
        partNumberAndMake: data.partNumberAndMake,
        technicalDataSheetReference: data.technicalDataSheetReference,
        maximumPipingLength: data.maximumPipingLength,
        maximumCommunicationWireLength: data.maximumCommunicationWireLength,
        oduFanMotorDetails: data.oduFanMotorDetails,
        iduFanMotorDetails: data.iduFanMotorDetails,
        compressorDetails: data.compressorDetails,
        refrigerantName: data.refrigerantName,
        refrigerantQuantity: data.refrigerantQuantity,
        statusRemark: data.statusRemark,
      },
      include: {
        creator: { select: { firstName: true, lastName: true, email: true } },
        category: { select: { id: true, name: true } },
        subcategory: { select: { id: true, name: true } },
        type: { select: { id: true, name: true } },
        status: { select: { id: true, code: true, displayName: true, color: true } },
      },
    }) as Promise<ProjectWithRelations>;
  }

  async update(id: string, data: UpdateProjectBody): Promise<ProjectWithRelations> {
    const updateData: Prisma.ProjectUpdateInput = { ...data };
    if (data.startDate) (updateData as Record<string, unknown>).startDate = new Date(data.startDate);
    if (data.endDate) (updateData as Record<string, unknown>).endDate = new Date(data.endDate);
    if (data.sampleSubmissionDate) {
      (updateData as Record<string, unknown>).sampleSubmissionDate = new Date(data.sampleSubmissionDate);
    }
    if (data.massProductionDate) {
      (updateData as Record<string, unknown>).massProductionDate = new Date(data.massProductionDate);
    }

    return this.db.update({
      where: { id },
      data: updateData,
      include: {
        creator: { select: { firstName: true, lastName: true, email: true } },
        category: { select: { id: true, name: true } },
        subcategory: { select: { id: true, name: true } },
        type: { select: { id: true, name: true } },
        status: { select: { id: true, code: true, displayName: true, color: true } },
        documents: {
          include: { uploader: { select: { firstName: true, lastName: true, email: true } } },
          orderBy: { uploadedAt: 'desc' },
        },
      },
    }) as Promise<ProjectWithRelations>;
  }

  async updateStatus(id: string, statusId: string, remark?: string): Promise<ProjectWithRelations> {
    return this.db.update({
      where: { id },
      data: {
        statusId,
        statusRemark: remark,
      },
      include: {
        creator: { select: { firstName: true, lastName: true, email: true } },
        category: { select: { id: true, name: true } },
        subcategory: { select: { id: true, name: true } },
        type: { select: { id: true, name: true } },
        status: { select: { id: true, code: true, displayName: true, color: true } },
        documents: {
          include: { uploader: { select: { firstName: true, lastName: true, email: true } } },
          orderBy: { uploadedAt: 'desc' },
        },
      },
    }) as Promise<ProjectWithRelations>;
  }

  async delete(id: string): Promise<void> {
    await this.db.delete({ where: { id } });
  }

  async exists(id: string): Promise<boolean> {
    const found = await this.db.findFirst({ where: { id }, select: { id: true } });
    return found !== null;
  }

  async createDocument(data: {
    projectId: string;
    fileName: string;
    originalName: string;
    fileUrl: string;
    fileSize?: number | null;
    mimeType?: string | null;
    uploadedBy: string;
  }): Promise<ProjectDocumentRecord> {
    return prisma.projectDocument.create({
      data: {
        projectId: data.projectId,
        fileName: data.fileName,
        originalName: data.originalName,
        fileUrl: data.fileUrl,
        fileSize: data.fileSize ?? null,
        mimeType: data.mimeType ?? null,
        uploadedBy: data.uploadedBy,
      },
      include: {
        uploader: { select: { firstName: true, lastName: true, email: true } },
      },
    }) as Promise<ProjectDocumentRecord>;
  }

  async deleteDocument(id: string): Promise<void> {
    await prisma.projectDocument.delete({ where: { id } });
  }

  async getDocumentById(id: string): Promise<ProjectDocumentRecord | null> {
    return prisma.projectDocument.findUnique({
      where: { id },
      include: {
        uploader: { select: { firstName: true, lastName: true, email: true } },
      },
    }) as Promise<ProjectDocumentRecord | null>;
  }

  async createStatusHistory(data: {
    projectId: string;
    statusId: string;
    remark?: string;
    changedBy: string;
  }): Promise<void> {
    await prisma.projectStatusHistory.create({
      data: {
        projectId: data.projectId,
        statusId: data.statusId,
        remark: data.remark,
        changedBy: data.changedBy,
      },
    });
  }

  async getDefaultStatusId(): Promise<string> {
    const status = await prisma.statusMaster.findFirst({
      where: { code: 'NOT_STARTED', isActive: true },
    });
    return status?.id ?? '';
  }
}

export const projectRepository = new ProjectRepository();
