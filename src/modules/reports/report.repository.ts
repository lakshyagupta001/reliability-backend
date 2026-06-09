import { prisma } from '../../prisma/prisma.client';
import type {
  CreateReportBody,
  UpdateReportBody,
  ListReportsQuery,
  ReportDetail,
} from './report.types';
import type { Prisma } from '@prisma/client';

export class ReportRepository {
  protected readonly db = prisma.report;

  async findById(id: string): Promise<ReportDetail | null> {
    return this.db.findUnique({
      where: { id },
      include: {
        creator: { select: { firstName: true, lastName: true, email: true } },
      },
    }) as Promise<ReportDetail | null>;
  }

  async findAll(query: ListReportsQuery) {
    const page = query.page ?? 1;
    const limit = query.limit ?? 10;
    const skip = (page - 1) * limit;

    const where: Prisma.ReportWhereInput = {};
    if (query.search) {
      where.title = { contains: query.search, mode: 'insensitive' };
    }
    if (query.format) {
      where.format = query.format;
    }

    const [rows, total] = await Promise.all([
      this.db.findMany({
        where,
        skip,
        take: limit,
        orderBy: { [query.sortBy ?? 'createdAt']: query.sortOrder ?? 'desc' },
        include: {
          creator: { select: { firstName: true, lastName: true, email: true } },
        },
      }),
      this.db.count({ where }),
    ]);

    return {
      rows: rows as ReportDetail[],
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async create(data: CreateReportBody, userId: string): Promise<ReportDetail> {
    return this.db.create({
      data: {
        projectId: data.projectId,
        type: data.type as any, // Enum ReportType
        title: data.title,
        format: data.format,
        formatNumber: data.formatNumber,
        reportNumber: data.reportNumber,
        data: data.data as import('@prisma/client').Prisma.InputJsonValue,
        createdBy: userId,
      },
      include: {
        creator: { select: { firstName: true, lastName: true, email: true } },
      },
    }) as Promise<ReportDetail>;
  }

  async update(id: string, data: UpdateReportBody): Promise<ReportDetail> {
    const updateData: Prisma.ReportUpdateInput = {};
    if (data.title !== undefined) updateData.title = data.title;
    if (data.formatNumber !== undefined) updateData.formatNumber = data.formatNumber;
    if (data.reportNumber !== undefined) updateData.reportNumber = data.reportNumber;
    if (data.data !== undefined) updateData.data = data.data as import('@prisma/client').Prisma.InputJsonValue;

    return this.db.update({
      where: { id },
      data: updateData,
      include: {
        creator: { select: { firstName: true, lastName: true, email: true } },
      },
    }) as Promise<ReportDetail>;
  }

  async delete(id: string): Promise<void> {
    await this.db.delete({ where: { id } });
  }

  async findByProjectId(projectId: string): Promise<{
    REPORT_FORMAT: ReportDetail | null;
    SUMMARY_FORMAT: ReportDetail | null;
  }> {
    const reports = await this.db.findMany({
      where: { projectId },
      include: {
        creator: { select: { firstName: true, lastName: true, email: true } },
      },
    }) as ReportDetail[];

    const result = {
      REPORT_FORMAT: null as ReportDetail | null,
      SUMMARY_FORMAT: null as ReportDetail | null,
    };

    reports.forEach((report) => {
      if (report.type === 'REPORT_FORMAT') result.REPORT_FORMAT = report;
      if (report.type === 'SUMMARY_FORMAT') result.SUMMARY_FORMAT = report;
    });

    return result;
  }

  async exists(id: string): Promise<boolean> {
    const found = await this.db.findFirst({ where: { id }, select: { id: true } });
    return found !== null;
  }
}

export const reportRepository = new ReportRepository();
