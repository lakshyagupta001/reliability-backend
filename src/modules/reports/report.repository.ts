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
        checker: { select: { firstName: true, lastName: true, email: true } },
        approver: { select: { firstName: true, lastName: true, email: true } },
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
          checker: { select: { firstName: true, lastName: true, email: true } },
          approver: { select: { firstName: true, lastName: true, email: true } },
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
        checkedByUserId: data.checkedByUserId,
        checkedByName: data.checkedByName,
        approvedByUserId: data.approvedByUserId,
        approvedByName: data.approvedByName,
        status: data.checkedByUserId ? 'PENDING_REVIEW' : 'GENERATED',
        createdBy: userId,
      },
      include: {
        creator: { select: { firstName: true, lastName: true, email: true } },
        checker: { select: { firstName: true, lastName: true, email: true } },
        approver: { select: { firstName: true, lastName: true, email: true } },
      },
    }) as Promise<ReportDetail>;
  }

  async update(id: string, data: UpdateReportBody): Promise<ReportDetail> {
    const updateData: Prisma.ReportUpdateInput = {};
    const current = data.checkedByUserId !== undefined || data.approvedByUserId !== undefined
      ? await this.findById(id)
      : null;

    if (data.title !== undefined) updateData.title = data.title;
    if (data.formatNumber !== undefined) updateData.formatNumber = data.formatNumber;
    if (data.reportNumber !== undefined) updateData.reportNumber = data.reportNumber;
    if (data.data !== undefined) updateData.data = data.data as import('@prisma/client').Prisma.InputJsonValue;
    if (data.checkedByUserId !== undefined) {
      if (current && ['REVIEWED', 'PENDING_APPROVAL', 'APPROVED'].includes(current.status)) {
        if (current.checkedByUserId !== data.checkedByUserId) {
          throw new Error('Cannot change Checked By after report is reviewed');
        }
      } else {
        const checkedId = data.checkedByUserId || null; // treat empty string as null
        updateData.checker = checkedId ? { connect: { id: checkedId } } : { disconnect: true };
        if (checkedId && current?.status === 'GENERATED') {
          updateData.status = 'PENDING_REVIEW';
        } else if (!checkedId && current?.status === 'PENDING_REVIEW') {
          updateData.status = 'GENERATED';
        }
      }
    }
    if (data.checkedByName !== undefined) updateData.checkedByName = data.checkedByName;
    
    if (data.approvedByUserId !== undefined) {
      if (current && current.status === 'APPROVED') {
        if (current.approvedByUserId !== data.approvedByUserId) {
          throw new Error('Cannot change Approved By after report is approved');
        }
      } else {
        const approvedId = data.approvedByUserId || null; // treat empty string as null
        updateData.approver = approvedId ? { connect: { id: approvedId } } : { disconnect: true };
        if (approvedId && current?.status === 'REVIEWED') {
          updateData.status = 'PENDING_APPROVAL';
        } else if (!approvedId && current?.status === 'PENDING_APPROVAL') {
          updateData.status = 'REVIEWED';
        }
      }
    }
    if (data.approvedByName !== undefined) updateData.approvedByName = data.approvedByName;

    return this.db.update({
      where: { id },
      data: updateData,
      include: {
        creator: { select: { firstName: true, lastName: true, email: true } },
        checker: { select: { firstName: true, lastName: true, email: true } },
        approver: { select: { firstName: true, lastName: true, email: true } },
      },
    }) as Promise<ReportDetail>;
  }

  async delete(id: string): Promise<void> {
    await this.db.delete({ where: { id } });
  }

  async findByProjectId(projectId: string): Promise<{
    PART_REPORT: ReportDetail | null;
    SUMMARY_REPORT: ReportDetail | null;
    TEST_LIST: ReportDetail | null;
  }> {
    const reports = await this.db.findMany({
      where: { projectId },
      include: {
        creator: { select: { firstName: true, lastName: true, email: true } },
        checker: { select: { firstName: true, lastName: true, email: true } },
        approver: { select: { firstName: true, lastName: true, email: true } },
      },
    }) as ReportDetail[];

    const result = {
      PART_REPORT: null as ReportDetail | null,
      SUMMARY_REPORT: null as ReportDetail | null,
      TEST_LIST: null as ReportDetail | null,
    };

    reports.forEach((report) => {
      if (report.type === 'PART_REPORT') result.PART_REPORT = report;
      if (report.type === 'SUMMARY_REPORT') result.SUMMARY_REPORT = report;
      if (report.type === 'TEST_LIST') result.TEST_LIST = report;
    });

    return result;
  }

  async exists(id: string): Promise<boolean> {
    const found = await this.db.findFirst({ where: { id }, select: { id: true } });
    return found !== null;
  }
}

export const reportRepository = new ReportRepository();
