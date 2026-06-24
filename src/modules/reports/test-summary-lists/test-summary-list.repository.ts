import { prisma } from '../../../prisma/prisma.client';
import type { Prisma } from '@prisma/client';
import type { TestSummaryListDetail } from './test-summary-list.types';

const userSelect = { firstName: true, lastName: true, email: true } as const;
const tslInclude = {
  checker: { select: userSelect },
  approver: { select: userSelect },
  summaryReport: {
    select: {
      id: true,
      projectId: true,
      preparedById: true,
      preparedBy: { select: userSelect },
    },
  },
} as const;

export class TestSummaryListRepository {
  async findById(id: string): Promise<TestSummaryListDetail | null> {
    const tsl = await prisma.testSummaryList.findUnique({
      where: { id },
      include: tslInclude,
    });
    return tsl as unknown as TestSummaryListDetail | null;
  }

  async findBySummaryReportId(summaryReportId: string): Promise<TestSummaryListDetail | null> {
    const tsl = await prisma.testSummaryList.findUnique({
      where: { summaryReportId },
      include: tslInclude,
    });
    return tsl as unknown as TestSummaryListDetail | null;
  }

  async update(id: string, updateData: Prisma.TestSummaryListUpdateInput): Promise<TestSummaryListDetail> {
    const updated = await prisma.testSummaryList.update({
      where: { id },
      data: updateData,
      include: tslInclude,
    });
    return updated as unknown as TestSummaryListDetail;
  }

  async createApprovalHistory(testSummaryListId: string, userId: string, action: string, status: string): Promise<void> {
    await prisma.testSummaryListApprovalHistory.create({
      data: { testSummaryListId, userId, action, status },
    });
  }

  async findDraftsByUserId(userId: string) {
    const results = await prisma.testSummaryList.findMany({
      where: { summaryReport: { preparedById: userId }, isDraft: true },
      include: tslInclude,
      orderBy: { updatedAt: 'desc' },
    });
    return results;
  }

  async deleteDraft(id: string): Promise<void> {
    await prisma.testSummaryList.delete({ where: { id } });
  }

  async delete(id: string): Promise<void> {
    await prisma.testSummaryList.delete({ where: { id } });
  }
}

export const testSummaryListRepository = new TestSummaryListRepository();
