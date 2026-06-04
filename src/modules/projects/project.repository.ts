import { prisma } from '../../prisma/prisma.client';
import { Project, ProjectDocument } from './project.types';
import type {
  CreateProjectBody,
  UpdateProjectBody,
  ListProjectsQuery,
} from './project.types';
import type { Prisma } from '@prisma/client';

export class ProjectRepository {
  protected readonly db = prisma.project;

  async findById(id: string): Promise<Project | null> {
    return this.db.findUnique({
      where: { id },
      include: {
        creator: { select: { firstName: true, lastName: true, email: true } },
        documents: {
          include: { uploader: { select: { firstName: true, lastName: true, email: true } } },
          orderBy: { uploadedAt: 'desc' },
        },
      },
    }) as Promise<Project | null>;
  }

  async findAll(query: ListProjectsQuery) {
    const page = query.page ?? 1;
    const limit = query.limit ?? 10;
    const skip = (page - 1) * limit;

    const where: Prisma.ProjectWhereInput = {};
    if (query.search) {
      where.name = { contains: query.search, mode: 'insensitive' };
    }
    if (query.category) where.category = query.category;
    if (query.subcategory) where.subcategory = query.subcategory;
    if (query.type) where.type = query.type;
    if (query.status) where.status = query.status;
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

    const [rows, total] = await Promise.all([
      this.db.findMany({
        where,
        skip,
        take: limit,
        orderBy: { [query.sortBy ?? 'createdAt']: query.sortOrder ?? 'desc' },
        include: {
          creator: { select: { firstName: true, lastName: true, email: true } },
          _count: { select: { reports: true, documents: true } },
        },
      }),
      this.db.count({ where }),
    ]);

    return {
      rows: rows as Project[],
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async create(data: CreateProjectBody, userId: string): Promise<Project> {
    return this.db.create({
      data: {
        ...data,
        startDate: new Date(data.startDate),
        endDate: new Date(data.endDate),
        sampleSubmissionDate: data.sampleSubmissionDate ? new Date(data.sampleSubmissionDate) : undefined,
        massProductionDate: data.massProductionDate ? new Date(data.massProductionDate) : undefined,
        createdBy: userId,
      },
      include: {
        creator: { select: { firstName: true, lastName: true, email: true } },
      },
    }) as Promise<Project>;
  }

  async update(id: string, data: UpdateProjectBody): Promise<Project> {
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
        documents: {
          include: { uploader: { select: { firstName: true, lastName: true, email: true } } },
          orderBy: { uploadedAt: 'desc' },
        },
      },
    }) as Promise<Project>;
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
    documentType: string;
    fileName: string;
    fileUrl: string;
    fileSize?: number | null;
    mimeType?: string | null;
    uploadedBy: string;
  }): Promise<ProjectDocument> {
    return prisma.projectDocument.create({
      data: {
        projectId: data.projectId,
        documentType: data.documentType as import('@prisma/client').DocumentType,
        fileName: data.fileName,
        fileUrl: data.fileUrl,
        fileSize: data.fileSize ?? null,
        mimeType: data.mimeType ?? null,
        uploadedBy: data.uploadedBy,
      },
      include: {
        uploader: { select: { firstName: true, lastName: true, email: true } },
      },
    }) as Promise<ProjectDocument>;
  }

  async deleteDocument(id: string): Promise<void> {
    await prisma.projectDocument.delete({ where: { id } });
  }

  async getDocumentById(id: string): Promise<ProjectDocument | null> {
    return prisma.projectDocument.findUnique({
      where: { id },
      include: {
        uploader: { select: { firstName: true, lastName: true, email: true } },
      },
    }) as Promise<ProjectDocument | null>;
  }
}

export const projectRepository = new ProjectRepository();
