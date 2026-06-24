import { prisma } from '../../../prisma/prisma.client';
import type { Prisma } from '@prisma/client';
import type { TestPartListDetail } from './test-part-list.types';

const userSelect = { firstName: true, lastName: true, email: true } as const;

const testPartListInclude = {
  checker: { select: userSelect },
  approver: { select: userSelect },
  partReport: {
    select: {
      id: true,
      projectId: true,
      reportName: true,
      createdById: true,
      preparedBy: { select: userSelect },
    },
  },
} as const;

export class TestPartListRepository {
  async findByPartReportId(partReportId: string): Promise<TestPartListDetail | null> {
    const tpl = await prisma.testPartList.findUnique({
      where: { partReportId },
      include: testPartListInclude,
    });
    return tpl as unknown as TestPartListDetail | null;
  }

  async findById(id: string): Promise<TestPartListDetail | null> {
    const tpl = await prisma.testPartList.findUnique({
      where: { id },
      include: testPartListInclude,
    });
    return tpl as unknown as TestPartListDetail | null;
  }

  async update(id: string, updateData: Prisma.TestPartListUpdateInput): Promise<TestPartListDetail> {
    const result = await prisma.testPartList.update({
      where: { id },
      data: updateData,
      include: testPartListInclude,
    });
    return result as unknown as TestPartListDetail;
  }

  async createApprovalHistory(testPartListId: string, userId: string, action: string, status: string): Promise<void> {
    await prisma.testPartListApprovalHistory.create({
      data: { testPartListId, userId, action, status },
    });
  }

  async findDraftsByUserId(userId: string) {
    const results = await prisma.testPartList.findMany({
      where: { partReport: { createdById: userId }, isDraft: true },
      include: testPartListInclude,
      orderBy: { updatedAt: 'desc' },
    });
    return results;
  }

  async deleteDraft(id: string): Promise<void> {
    await prisma.testPartList.delete({ where: { id } });
  }

  async delete(id: string): Promise<void> {
    await prisma.testPartList.delete({ where: { id } });
  }
}

export const testPartListRepository = new TestPartListRepository();
