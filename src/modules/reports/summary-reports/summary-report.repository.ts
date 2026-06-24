import { prisma } from '../../../prisma/prisma.client';
import type { Prisma } from '@prisma/client';
import type { 
  CreateSummaryReportBody, 
  UpdateSummaryReportBody,
  SummaryReportDetail,
  SummaryReportSummary
} from './summary-report.types';
import { ReportStatus } from '../../../shared/types/reports.types';

const userSelect = { firstName: true, lastName: true, email: true } as const;

export class SummaryReportRepository {
  private mapToDetail(row: any, allUsers: any[], testSummaryListRow?: any): SummaryReportDetail {
    const data = (row.data as Record<string, any>) || {};
    
    // Manual user mapping since relation is lost
    const creatorUser = allUsers.find(u => u.id === row.createdBy);
    const preparedUser = allUsers.find(u => u.id === data.preparedById);
    const checkedUser = allUsers.find(u => u.id === data.checkedById);
    const approvedUser = allUsers.find(u => u.id === data.approvedById);

    let testSummaryList = null;
    if (testSummaryListRow) {
      testSummaryList = {
        id: testSummaryListRow.id,
        status: (testSummaryListRow.data as any)?.status || 'PENDING'
      };
    }

    return {
      id: row.id,
      projectId: row.projectId,
      reportStatus: data.reportStatus || 'PENDING',
      preparedById: data.preparedById || row.createdBy,
      checkedById: data.checkedById || null,
      checkedByName: data.checkedByName || null,
      approvedById: data.approvedById || null,
      approvedByName: data.approvedByName || null,
      formatNumber: row.formatNumber,
      reportNumber: row.reportNumber,
      isDraft: data.isDraft ?? true,
      generatedAt: data.generatedAt ? new Date(data.generatedAt) : null,
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
      preparedBy: preparedUser || creatorUser,
      checker: checkedUser || null,
      approver: approvedUser || null,
      testSummaryList,
      lastActionBy: data.lastActionBy || null,
      lastActionType: data.lastActionType || null,
      lastActionAt: data.lastActionAt ? new Date(data.lastActionAt) : null,
      data: data.formData || {},
      rejectionHistory: data.rejectionHistory || [],
    };
  }

  async findByProjectId(projectId: string): Promise<SummaryReportSummary | null> {
    const row = await prisma.reports.findFirst({
      where: { projectId, type: 'SUMMARY_REPORT' }
    });
    if (!row) return null;

    const userIds = [row.createdBy, (row.data as any)?.preparedById, (row.data as any)?.checkedById, (row.data as any)?.approvedById].filter(Boolean);
    const users = await prisma.user.findMany({ where: { id: { in: userIds } }, select: { id: true, ...userSelect } });

    const testList = await prisma.reports.findFirst({
      where: { projectId: row.projectId, type: 'TEST_LIST', data: { path: ['summaryReportId'], equals: row.id } }
    });

    return this.mapToDetail(row, users, testList);
  }

  async findById(id: string): Promise<SummaryReportDetail | null> {
    const row = await prisma.reports.findUnique({
      where: { id },
    });
    if (!row || row.type !== 'SUMMARY_REPORT') return null;

    const userIds = [row.createdBy, (row.data as any)?.preparedById, (row.data as any)?.checkedById, (row.data as any)?.approvedById].filter(Boolean);
    const users = await prisma.user.findMany({ where: { id: { in: userIds } }, select: { id: true, ...userSelect } });

    // Try to find the associated TEST_LIST. 
    // In summary reports, the test list is usually generic for the project or specifically linked
    const testList = await prisma.reports.findFirst({
      where: { type: 'TEST_LIST' }
    });
    // Let's filter it manually since prisma json filtering can be tricky for arbitrary structures
    const linkedTestList = testList && (testList.data as any)?.summaryReportId === id ? testList : null;

    return this.mapToDetail(row, users, linkedTestList);
  }

  async create(data: CreateSummaryReportBody, userId: string): Promise<SummaryReportDetail> {
    const isDraft = data.isDraft ?? true;
    
    const jsonData = {
      formData: data.data || {},
      preparedById: userId,
      checkedById: data.checkedById || null,
      checkedByName: data.checkedByName || null,
      approvedById: data.approvedById || null,
      approvedByName: data.approvedByName || null,
      isDraft,
      reportStatus: 'PENDING',
    };

    const crypto = require('crypto');
    const id = crypto.randomUUID();

    const result = await prisma.reports.create({
      data: {
        id,
        type: 'SUMMARY_REPORT',
        title: 'Summary Report',
        format: 'SUMMARY_REPORT',
        formatNumber: data.formatNumber || null,
        reportNumber: data.reportNumber || null,
        projectId: data.projectId,
        createdBy: userId,
        updatedAt: new Date(),
        data: jsonData as Prisma.InputJsonValue,
      }
    });

    return this.findById(result.id) as Promise<SummaryReportDetail>;
  }

  async createLinkedTestSummaryList(summaryReportId: string, projectId: string, userId: string): Promise<void> {
    const crypto = require('crypto');
    await prisma.reports.create({
      data: {
        id: crypto.randomUUID(),
        type: 'TEST_LIST',
        title: 'Test Summary List',
        format: 'TEST_LIST',
        projectId,
        createdBy: userId,
        updatedAt: new Date(),
        data: {
          summaryReportId,
          formData: {},
          isDraft: false,
          status: 'PENDING',
        }
      },
    });
  }

  async update(id: string, updateData: Record<string, any>): Promise<SummaryReportDetail> {
    const row = await prisma.reports.findUnique({ where: { id } });
    if (!row) throw new Error('Not found');

    const oldData = (row.data as Record<string, any>) || {};
    
    let rootFormat = row.formatNumber;
    let rootReport = row.reportNumber;

    if (updateData.formatNumber !== undefined) { rootFormat = updateData.formatNumber; delete updateData.formatNumber; }
    if (updateData.reportNumber !== undefined) { rootReport = updateData.reportNumber; delete updateData.reportNumber; }
    if (updateData.data !== undefined) { oldData.formData = updateData.data; delete updateData.data; }

    Object.assign(oldData, updateData);

    const result = await prisma.reports.update({
      where: { id },
      data: {
        formatNumber: rootFormat,
        reportNumber: rootReport,
        data: oldData as Prisma.InputJsonValue,
      }
    });

    return this.findById(result.id) as Promise<SummaryReportDetail>;
  }

  async existsByProjectId(projectId: string): Promise<boolean> {
    const existing = await prisma.reports.findFirst({ where: { projectId, type: 'SUMMARY_REPORT' }, select: { id: true } });
    return existing !== null;
  }

  async createApprovalHistory(summaryReportId: string, userId: string, action: string, status: string) {
    // No-op since table was removed
    return Promise.resolve();
  }

  async exists(id: string): Promise<boolean> {
    const count = await prisma.reports.count({ where: { id, type: 'SUMMARY_REPORT' } });
    return count > 0;
  }

  async findDraftsByUserId(userId: string): Promise<SummaryReportSummary[]> {
    const rows = await prisma.reports.findMany({
      where: { createdBy: userId, type: 'SUMMARY_REPORT' },
      orderBy: { updatedAt: 'desc' },
    });
    
    const drafts = rows.filter(r => (r.data as any)?.isDraft === true);
    const users = await prisma.user.findMany({ where: { id: userId }, select: { id: true, ...userSelect } });
    const testLists = await prisma.reports.findMany({ where: { type: 'TEST_LIST' } });

    return drafts.map(row => {
      const tl = testLists.find(t => (t.data as any)?.summaryReportId === row.id);
      return this.mapToDetail(row, users, tl);
    });
  }

  async deleteDraft(id: string): Promise<void> {
    await prisma.reports.delete({ where: { id } });
  }

  async delete(id: string): Promise<void> {
    await prisma.reports.delete({ where: { id } });
  }
}

export const summaryReportRepository = new SummaryReportRepository();
