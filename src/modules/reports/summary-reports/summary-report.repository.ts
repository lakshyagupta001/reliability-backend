import { prisma } from '../../../prisma/prisma.client';
import type { Prisma } from '@prisma/client';
import type { 
  CreateSummaryReportBody, 
  UpdateSummaryReportBody,
  SummaryReportDetail,
  SummaryReportSummary
} from './summary-report.types';

const userSelect = { firstName: true, lastName: true, email: true } as const;

const summaryReportInclude = {
  preparedBy: { select: userSelect },
  checker: { select: userSelect },
  approver: { select: userSelect },
  testSummaryList: { select: { id: true, status: true } },
  project: { select: { id: true, name: true } },
} as const;

export class SummaryReportRepository {
  async findByProjectId(projectId: string): Promise<SummaryReportSummary | null> {
    const sr = await prisma.summaryReport.findFirst({
      where: { projectId },
      include: summaryReportInclude,
    });
    return sr as unknown as SummaryReportSummary | null;
  }

  async findById(id: string): Promise<SummaryReportDetail | null> {
    const sr = await prisma.summaryReport.findUnique({
      where: { id },
      include: summaryReportInclude,
    });
    return sr as unknown as SummaryReportDetail | null;
  }

  async create(data: CreateSummaryReportBody, userId: string): Promise<SummaryReportDetail> {
    const isDraft = data.isDraft ?? true;
    const sr = await prisma.summaryReport.create({
      data: {
        projectId: data.projectId,
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
      include: summaryReportInclude,
    });
    return sr as unknown as SummaryReportDetail;
  }

  async createLinkedTestSummaryList(summaryReportId: string): Promise<void> {
    await prisma.testSummaryList.create({
      data: {
        summaryReportId,
        formData: {},
        isDraft: false,  // Always false — TestSummaryList manages its own isDraft independently
        status: 'PENDING',
      },
    });
  }

  async update(id: string, updateData: Prisma.SummaryReportUpdateInput): Promise<SummaryReportDetail> {
    const result = await prisma.summaryReport.update({
      where: { id },
      data: updateData,
      include: summaryReportInclude,
    });
    return result as unknown as SummaryReportDetail;
  }

  async existsByProjectId(projectId: string): Promise<boolean> {
    const existing = await prisma.summaryReport.findUnique({ where: { projectId }, select: { id: true } });
    return existing !== null;
  }

  async createApprovalHistory(summaryReportId: string, userId: string, action: string, status: string) {
    return prisma.summaryReportApprovalHistory.create({
      data: { summaryReportId, userId, action, status },
    });
  }



  async exists(id: string): Promise<boolean> {
    const count = await prisma.summaryReport.count({ where: { id } });
    return count > 0;
  }

  async generate(id: string): Promise<SummaryReportDetail> {
    const result = await prisma.summaryReport.update({
      where: { id },
      data: {
        isDraft: false,
        generatedAt: new Date(),
      },
      include: summaryReportInclude,
    });
    return result as unknown as SummaryReportDetail;
  }

  async findDraftsByUserId(userId: string): Promise<SummaryReportSummary[]> {
    const results = await prisma.summaryReport.findMany({
      where: { preparedById: userId, isDraft: true },
      include: summaryReportInclude,
      orderBy: { updatedAt: 'desc' },
    });
    return results as unknown as SummaryReportSummary[];
  }

  async deleteDraft(id: string): Promise<void> {
    await prisma.summaryReport.delete({ where: { id } });
  }

  async delete(id: string): Promise<void> {
    await prisma.summaryReport.delete({ where: { id } });
  }
}

export const summaryReportRepository = new SummaryReportRepository();
