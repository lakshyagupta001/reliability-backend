import { prisma } from '../../../prisma/prisma.client';
import type { Prisma } from '@prisma/client';
import type {
  CreatePartReportBody,
  UpdatePartReportBody,
  PartReportDetail,
  PartReportListItem,
} from './part-report.types';

const userSelect = { firstName: true, lastName: true, email: true } as const;

const partReportInclude = {
  creator: { select: userSelect },
  preparedBy: { select: userSelect },
  checker: { select: userSelect },
  approver: { select: userSelect },
  testPartList: { select: { id: true, status: true } },
} as const;

const listSelect = {
  id: true,
  projectId: true,
  reportName: true,
  reportStatus: true,
  createdById: true,
  preparedById: true,
  checkedById: true,
  checkedByName: true,
  approvedById: true,
  approvedByName: true,
  formatNumber: true,
  reportNumber: true,
  isDraft: true,
  generatedAt: true,
  createdAt: true,
  updatedAt: true,
  lastActionBy: true,
  lastActionType: true,
  lastActionAt: true,
  creator: { select: userSelect },
  preparedBy: { select: userSelect },
  checker: { select: userSelect },
  approver: { select: userSelect },
  testPartList: { select: { id: true, status: true } }
} as const;

export class PartReportRepository {
  async findById(id: string): Promise<PartReportDetail | null> {
    const result = await prisma.partReport.findUnique({
      where: { id },
      include: partReportInclude,
    });
    return result as unknown as PartReportDetail | null;
  }

  async findByProjectId(projectId: string): Promise<PartReportListItem[]> {
    const results = await prisma.partReport.findMany({
      where: { projectId, isDraft: false },
      select: listSelect,
      orderBy: { createdAt: 'asc' },
    });
    return results as unknown as PartReportListItem[];
  }

  async create(data: CreatePartReportBody, userId: string): Promise<PartReportDetail> {
    const isDraft = data.isDraft ?? true;
    const result = await prisma.partReport.create({
      data: {
        projectId: data.projectId,
        reportName: data.reportName,
        createdById: userId,
        preparedById: userId,
        checkedById: data.checkedById ?? null,
        checkedByName: data.checkedByName ?? null,
        approvedById: data.approvedById ?? null,
        approvedByName: data.approvedByName ?? null,
        data: (data.data ?? {}) as Prisma.InputJsonValue,
        formatNumber: data.formatNumber ?? null,
        reportNumber: data.reportNumber ?? null,
        isDraft,
        reportStatus: 'PENDING',
      },
      include: partReportInclude,
    });
    return result as unknown as PartReportDetail;
  }

  async update(id: string, data: UpdatePartReportBody, current: PartReportDetail, userId?: string): Promise<PartReportDetail> {
    const updateData: Prisma.PartReportUpdateInput = {};

    if (userId && !current.createdById) {
      updateData.creator = { connect: { id: userId } };
      updateData.preparedBy = { connect: { id: userId } };
    }

    if (data.reportName !== undefined) updateData.reportName = data.reportName;
    if (data.data !== undefined) updateData.data = data.data as Prisma.InputJsonValue;
    if (data.formatNumber !== undefined) updateData.formatNumber = data.formatNumber;
    if (data.reportNumber !== undefined) updateData.reportNumber = data.reportNumber;
    if (data.checkedByName !== undefined) updateData.checkedByName = data.checkedByName;
    if (data.approvedByName !== undefined) updateData.approvedByName = data.approvedByName;

    if (data.checkedById !== undefined) {
      const checkedId = data.checkedById || null;
      updateData.checker = checkedId ? { connect: { id: checkedId } } : { disconnect: true };
      if (checkedId && current.reportStatus === 'GENERATED') {
        updateData.reportStatus = 'PENDING_REVIEW';
      } else if (!checkedId && current.reportStatus === 'PENDING_REVIEW') {
        updateData.reportStatus = 'GENERATED';
      }
    }

    if (data.approvedById !== undefined) {
      const approvedId = data.approvedById || null;
      updateData.approver = approvedId ? { connect: { id: approvedId } } : { disconnect: true };
      if (approvedId && current.reportStatus === 'REVIEWED') {
        updateData.reportStatus = 'PENDING_APPROVAL';
      } else if (!approvedId && current.reportStatus === 'PENDING_APPROVAL') {
        updateData.reportStatus = 'REVIEWED';
      }
    }

    const result = await prisma.partReport.update({
      where: { id },
      data: updateData,
      include: partReportInclude,
    });
    return result as unknown as PartReportDetail;
  }

  async updateStatus(
    id: string,
    status: string,
    extra: Record<string, unknown> = {},
  ): Promise<PartReportDetail> {
    const result = await prisma.partReport.update({
      where: { id },
      data: { reportStatus: status as any, ...extra },
      include: partReportInclude,
    });
    return result as unknown as PartReportDetail;
  }

  async delete(id: string): Promise<void> {
    await prisma.partReport.delete({ where: { id } });
  }

  async exists(id: string): Promise<boolean> {
    const found = await prisma.partReport.findFirst({ where: { id }, select: { id: true } });
    return found !== null;
  }

  async generate(id: string): Promise<PartReportDetail> {
    const result = await prisma.partReport.update({
      where: { id },
      data: {
        isDraft: false,
        generatedAt: new Date(),
      },
      include: partReportInclude,
    });
    return result as unknown as PartReportDetail;
  }

  async findDraftsByUserId(userId: string): Promise<PartReportListItem[]> {
    const results = await prisma.partReport.findMany({
      where: { createdById: userId, isDraft: true },
      select: listSelect,
      orderBy: { updatedAt: 'desc' },
    });
    return results as unknown as PartReportListItem[];
  }

  async deleteDraft(id: string): Promise<void> {
    await prisma.partReport.delete({ where: { id } });
  }

  async createApprovalHistory(partReportId: string, userId: string, action: string, status: string) {
    return prisma.partReportApprovalHistory.create({
      data: { partReportId, userId, action, status },
    });
  }
}

export const partReportRepository = new PartReportRepository();
