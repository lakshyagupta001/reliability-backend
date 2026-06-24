import { prisma } from '../../../prisma/prisma.client';
import type { Prisma } from '@prisma/client';
import type { TestPartListDetail } from './test-part-list.types';

const userSelect = { firstName: true, lastName: true, email: true } as const;

export class TestPartListRepository {
  private mapToDetail(row: any, allUsers: any[], partReportRow?: any): TestPartListDetail {
    const data = (row.data as Record<string, any>) || {};
    
    const checkedUser = allUsers.find(u => u.id === data.checkedById);
    const approvedUser = allUsers.find(u => u.id === data.approvedById);

    let partReport = null;
    if (partReportRow) {
      partReport = {
        id: partReportRow.id,
        projectId: partReportRow.projectId,
        reportName: partReportRow.title,
        createdById: partReportRow.createdBy,
      };
    }

    return {
      id: row.id,
      partReportId: data.partReportId,
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
      partReport: partReport || undefined,
    };
  }

  async findByPartReportId(partReportId: string): Promise<TestPartListDetail | null> {
    const row = await prisma.reports.findFirst({
      where: { type: 'TEST_LIST', data: { path: ['partReportId'], equals: partReportId } }
    });
    if (!row) return null;

    const userIds = [(row.data as any)?.checkedById, (row.data as any)?.approvedById].filter(Boolean);
    const users = await prisma.user.findMany({ where: { id: { in: userIds } }, select: { id: true, ...userSelect } });

    const partReport = await prisma.reports.findUnique({ where: { id: partReportId } });

    return this.mapToDetail(row, users, partReport);
  }

  async findById(id: string): Promise<TestPartListDetail | null> {
    const row = await prisma.reports.findUnique({ where: { id } });
    if (!row || row.type !== 'TEST_LIST' || !(row.data as any)?.partReportId) return null;

    const userIds = [(row.data as any)?.checkedById, (row.data as any)?.approvedById].filter(Boolean);
    const users = await prisma.user.findMany({ where: { id: { in: userIds } }, select: { id: true, ...userSelect } });

    const partReportId = (row.data as any).partReportId;
    const partReport = await prisma.reports.findUnique({ where: { id: partReportId } });

    return this.mapToDetail(row, users, partReport);
  }

  async update(id: string, updateData: Record<string, any>): Promise<TestPartListDetail> {
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

    return this.findById(result.id) as Promise<TestPartListDetail>;
  }

  async createApprovalHistory(testPartListId: string, userId: string, action: string, status: string): Promise<void> {
    // No-op
  }

  async findDraftsByUserId(userId: string): Promise<TestPartListDetail[]> {
    // Need to find TEST_LISTs where partReport.createdBy == userId AND isDraft == true
    // This requires fetching all drafts and then matching
    const testLists = await prisma.reports.findMany({
      where: { type: 'TEST_LIST' }
    });
    const partReportIds = testLists.map(t => (t.data as any)?.partReportId).filter(Boolean);

    const partReports = await prisma.reports.findMany({
      where: { id: { in: partReportIds }, createdBy: userId }
    });

    const validPartReportIds = new Set(partReports.map(pr => pr.id));

    const drafts = testLists.filter(t => 
      validPartReportIds.has((t.data as any)?.partReportId) && 
      (t.data as any)?.isDraft === true
    );

    const userIds = new Set<string>();
    drafts.forEach(r => {
      if ((r.data as any)?.checkedById) userIds.add((r.data as any).checkedById);
      if ((r.data as any)?.approvedById) userIds.add((r.data as any).approvedById);
    });
    const users = await prisma.user.findMany({ where: { id: { in: Array.from(userIds) } }, select: { id: true, ...userSelect } });

    return drafts.map(row => {
      const pr = partReports.find(p => p.id === (row.data as any)?.partReportId);
      return this.mapToDetail(row, users, pr);
    });
  }

  async deleteDraft(id: string): Promise<void> {
    await prisma.reports.delete({ where: { id } });
  }

  async delete(id: string): Promise<void> {
    await prisma.reports.delete({ where: { id } });
  }
}

export const testPartListRepository = new TestPartListRepository();
