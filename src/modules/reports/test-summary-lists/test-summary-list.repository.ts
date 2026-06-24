import { prisma } from '../../../prisma/prisma.client';
import type { Prisma } from '@prisma/client';
import type { TestSummaryListDetail } from './test-summary-list.types';

const userSelect = { firstName: true, lastName: true, email: true } as const;

export class TestSummaryListRepository {
  private mapToDetail(row: any, allUsers: any[], summaryReportRow?: any): TestSummaryListDetail {
    const data = (row.data as Record<string, any>) || {};
    
    const checkedUser = allUsers.find(u => u.id === data.checkedById);
    const approvedUser = allUsers.find(u => u.id === data.approvedById);

    let summaryReport = null;
    if (summaryReportRow) {
      summaryReport = {
        id: summaryReportRow.id,
        projectId: summaryReportRow.projectId,
        preparedById: (summaryReportRow.data as any)?.preparedById || summaryReportRow.createdBy,
      };
    }

    return {
      id: row.id,
      summaryReportId: data.summaryReportId,
      status: data.status || 'PENDING',
      isDraft: data.isDraft ?? true,
      checkedById: data.checkedById || null,
      checkedByName: data.checkedByName || null,
      approvedById: data.approvedById || null,
      approvedByName: data.approvedByName || null,
      formData: data.formData || {},
      lastActionBy: data.lastActionBy || null,
      lastActionType: data.lastActionType || null,
      lastActionAt: data.lastActionAt ? new Date(data.lastActionAt) : null,
      rejectionHistory: data.rejectionHistory || [],
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
      checker: checkedUser || null,
      approver: approvedUser || null,
      summaryReport: summaryReport || undefined,
    };
  }

  async findBySummaryReportId(summaryReportId: string): Promise<TestSummaryListDetail | null> {
    const row = await prisma.reports.findFirst({
      where: { type: 'TEST_LIST', data: { path: ['summaryReportId'], equals: summaryReportId } }
    });
    if (!row) return null;

    const userIds = [(row.data as any)?.checkedById, (row.data as any)?.approvedById].filter(Boolean);
    const users = await prisma.user.findMany({ where: { id: { in: userIds } }, select: { id: true, ...userSelect } });

    const summaryReport = await prisma.reports.findUnique({ where: { id: summaryReportId } });

    return this.mapToDetail(row, users, summaryReport);
  }

  async findById(id: string): Promise<TestSummaryListDetail | null> {
    const row = await prisma.reports.findUnique({ where: { id } });
    if (!row || row.type !== 'TEST_LIST' || !(row.data as any)?.summaryReportId) return null;

    const userIds = [(row.data as any)?.checkedById, (row.data as any)?.approvedById].filter(Boolean);
    const users = await prisma.user.findMany({ where: { id: { in: userIds } }, select: { id: true, ...userSelect } });

    const summaryReportId = (row.data as any).summaryReportId;
    const summaryReport = await prisma.reports.findUnique({ where: { id: summaryReportId } });

    return this.mapToDetail(row, users, summaryReport);
  }

  async update(id: string, updateData: Record<string, any>): Promise<TestSummaryListDetail> {
    const row = await prisma.reports.findUnique({ where: { id } });
    if (!row) throw new Error('Not found');

    const oldData = (row.data as Record<string, any>) || {};
    
    Object.assign(oldData, updateData);

    const result = await prisma.reports.update({
      where: { id },
      data: {
        data: oldData as Prisma.InputJsonValue,
      }
    });

    return this.findById(result.id) as Promise<TestSummaryListDetail>;
  }

  async createApprovalHistory(testSummaryListId: string, userId: string, action: string, status: string): Promise<void> {
    // No-op
  }

  async findDraftsByUserId(userId: string): Promise<TestSummaryListDetail[]> {
    const testLists = await prisma.reports.findMany({
      where: { type: 'TEST_LIST' }
    });
    const summaryReportIds = testLists.map(t => (t.data as any)?.summaryReportId).filter(Boolean);

    // Filter summary reports where preparedById (in json data) or createdBy matches userId
    const summaryReports = await prisma.reports.findMany({
      where: { id: { in: summaryReportIds }, type: 'SUMMARY_REPORT' }
    });

    const userSummaryReports = summaryReports.filter(sr => ((sr.data as any)?.preparedById || sr.createdBy) === userId);
    const validSummaryReportIds = new Set(userSummaryReports.map(sr => sr.id));

    const drafts = testLists.filter(t => 
      validSummaryReportIds.has((t.data as any)?.summaryReportId) && 
      (t.data as any)?.isDraft === true
    );

    const userIds = new Set<string>();
    drafts.forEach(r => {
      if ((r.data as any)?.checkedById) userIds.add((r.data as any).checkedById);
      if ((r.data as any)?.approvedById) userIds.add((r.data as any).approvedById);
    });
    const users = await prisma.user.findMany({ where: { id: { in: Array.from(userIds) } }, select: { id: true, ...userSelect } });

    return drafts.map(row => {
      const sr = userSummaryReports.find(s => s.id === (row.data as any)?.summaryReportId);
      return this.mapToDetail(row, users, sr);
    });
  }

  async deleteDraft(id: string): Promise<void> {
    await prisma.reports.delete({ where: { id } });
  }

  async delete(id: string): Promise<void> {
    await prisma.reports.delete({ where: { id } });
  }
}

export const testSummaryListRepository = new TestSummaryListRepository();
