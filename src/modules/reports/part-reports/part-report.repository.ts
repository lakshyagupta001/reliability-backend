import { prisma } from '../../../prisma/prisma.client';
import type { Prisma } from '@prisma/client';
import type {
  CreatePartReportBody,
  UpdatePartReportBody,
  PartReportDetail,
  PartReportListItem,
} from './part-report.types';
import { ReportStatus } from '../../../shared/types/reports.types';

const userSelect = { firstName: true, lastName: true, email: true } as const;

export class PartReportRepository {
  private mapToDetail(row: any, allUsers: any[], testPartListRow?: any): PartReportDetail {
    const data = (row.data as Record<string, any>) || {};
    
    // Manual user mapping since relation is lost
    const creatorUser = allUsers.find(u => u.id === row.createdBy);
    const preparedUser = allUsers.find(u => u.id === data.preparedById);
    const checkedUser = allUsers.find(u => u.id === data.checkedById);
    const approvedUser = allUsers.find(u => u.id === data.approvedById);

    let testPartList = null;
    if (testPartListRow) {
      testPartList = {
        id: testPartListRow.id,
        status: (testPartListRow.data as any)?.status || 'PENDING'
      };
    }

    return {
      id: row.id,
      projectId: row.projectId,
      reportName: row.title,
      reportStatus: data.reportStatus || 'PENDING',
      createdById: row.createdBy,
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
      creator: creatorUser,
      preparedBy: preparedUser || creatorUser,
      checker: checkedUser || null,
      approver: approvedUser || null,
      testPartList,
      lastActionBy: data.lastActionBy || null,
      lastActionType: data.lastActionType || null,
      lastActionAt: data.lastActionAt ? new Date(data.lastActionAt) : null,
      data: data.formData || {},
      rejectionHistory: data.rejectionHistory || [],
    };
  }

  async findById(id: string): Promise<PartReportDetail | null> {
    const row = await prisma.reports.findUnique({
      where: { id },
    });
    if (!row || row.type !== 'PART_REPORT') return null;

    // Fetch related users manually
    const userIds = [row.createdBy, (row.data as any)?.preparedById, (row.data as any)?.checkedById, (row.data as any)?.approvedById].filter(Boolean);
    const users = await prisma.user.findMany({ where: { id: { in: userIds } }, select: { id: true, ...userSelect } });

    // Fetch testPartList manually
    const testList = await prisma.reports.findFirst({
      where: { projectId: row.projectId, type: 'TEST_LIST' }
    }); // Assuming one per project, or we should check partReportId in data

    return this.mapToDetail(row, users, testList);
  }

  async findByProjectId(projectId: string): Promise<PartReportListItem[]> {
    const rows = await prisma.reports.findMany({
      where: { projectId, type: 'PART_REPORT' },
      orderBy: { createdAt: 'asc' },
    });
    
    // Filter out drafts manually
    const nonDrafts = rows.filter(r => (r.data as any)?.isDraft === false);

    // Fetch users in bulk
    const userIds = new Set<string>();
    nonDrafts.forEach(r => {
      userIds.add(r.createdBy);
      if ((r.data as any)?.preparedById) userIds.add((r.data as any).preparedById);
      if ((r.data as any)?.checkedById) userIds.add((r.data as any).checkedById);
      if ((r.data as any)?.approvedById) userIds.add((r.data as any).approvedById);
    });
    const users = await prisma.user.findMany({ where: { id: { in: Array.from(userIds) } }, select: { id: true, ...userSelect } });

    // Fetch test lists for this project
    const testLists = await prisma.reports.findMany({
      where: { projectId, type: 'TEST_LIST' }
    });

    return nonDrafts.map(row => {
      const tl = testLists.find(t => (t.data as any)?.partReportId === row.id);
      return this.mapToDetail(row, users, tl);
    });
  }

  async create(data: CreatePartReportBody, userId: string): Promise<PartReportDetail> {
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
        type: 'PART_REPORT',
        title: data.reportName,
        format: 'PART_REPORT',
        formatNumber: data.formatNumber || null,
        reportNumber: data.reportNumber || null,
        projectId: data.projectId,
        createdBy: userId,
        updatedAt: new Date(),
        data: jsonData as Prisma.InputJsonValue,
      }
    });

    return this.findById(result.id) as Promise<PartReportDetail>;
  }

  async update(id: string, data: UpdatePartReportBody, current: PartReportDetail, userId?: string): Promise<PartReportDetail> {
    const row = await prisma.reports.findUnique({ where: { id } });
    if (!row) throw new Error('Not found');

    const oldData = (row.data as Record<string, any>) || {};
    
    if (userId && !row.createdBy) {
      // In reports, createdBy is required, so this shouldn't happen, but we can update preparedById
      oldData.preparedById = userId;
    }

    if (data.data !== undefined) oldData.formData = data.data;
    if (data.checkedByName !== undefined) oldData.checkedByName = data.checkedByName;
    if (data.approvedByName !== undefined) oldData.approvedByName = data.approvedByName;

    if (data.checkedById !== undefined) {
      const checkedId = data.checkedById || null;
      oldData.checkedById = checkedId;
      if (checkedId && oldData.reportStatus === 'GENERATED') {
        oldData.reportStatus = 'PENDING_REVIEW';
      } else if (!checkedId && oldData.reportStatus === 'PENDING_REVIEW') {
        oldData.reportStatus = 'GENERATED';
      }
    }

    if (data.approvedById !== undefined) {
      const approvedId = data.approvedById || null;
      oldData.approvedById = approvedId;
      if (approvedId && oldData.reportStatus === 'REVIEWED') {
        oldData.reportStatus = 'PENDING_APPROVAL';
      } else if (!approvedId && oldData.reportStatus === 'PENDING_APPROVAL') {
        oldData.reportStatus = 'REVIEWED';
      }
    }

    const result = await prisma.reports.update({
      where: { id },
      data: {
        title: data.reportName !== undefined ? data.reportName : row.title,
        formatNumber: data.formatNumber !== undefined ? data.formatNumber : row.formatNumber,
        reportNumber: data.reportNumber !== undefined ? data.reportNumber : row.reportNumber,
        data: oldData as Prisma.InputJsonValue,
      }
    });

    return this.findById(result.id) as Promise<PartReportDetail>;
  }

  async updateStatus(
    id: string,
    status: string,
    extra: Record<string, unknown> = {},
  ): Promise<PartReportDetail> {
    const row = await prisma.reports.findUnique({ where: { id } });
    if (!row) throw new Error('Not found');

    const oldData = (row.data as Record<string, any>) || {};
    oldData.reportStatus = status;

    // Merge extra fields into oldData, but some belong to root
    let rootTitle = row.title;
    let rootFormat = row.formatNumber;
    let rootReport = row.reportNumber;

    if (extra.reportName !== undefined) { rootTitle = extra.reportName as string; delete extra.reportName; }
    if (extra.formatNumber !== undefined) { rootFormat = extra.formatNumber as string; delete extra.formatNumber; }
    if (extra.reportNumber !== undefined) { rootReport = extra.reportNumber as string; delete extra.reportNumber; }

    if (extra.data !== undefined) { oldData.formData = extra.data; delete extra.data; }

    Object.assign(oldData, extra);

    const result = await prisma.reports.update({
      where: { id },
      data: {
        title: rootTitle,
        formatNumber: rootFormat,
        reportNumber: rootReport,
        data: oldData as Prisma.InputJsonValue,
      }
    });

    return this.findById(result.id) as Promise<PartReportDetail>;
  }

  async delete(id: string): Promise<void> {
    await prisma.reports.delete({ where: { id } });
  }

  async exists(id: string): Promise<boolean> {
    const found = await prisma.reports.findFirst({ where: { id }, select: { id: true } });
    return found !== null;
  }

  async findDraftsByUserId(userId: string): Promise<PartReportListItem[]> {
    const rows = await prisma.reports.findMany({
      where: { createdBy: userId, type: 'PART_REPORT' },
      orderBy: { updatedAt: 'desc' },
    });
    
    const drafts = rows.filter(r => (r.data as any)?.isDraft === true);
    
    // Fetch users in bulk
    const users = await prisma.user.findMany({ where: { id: userId }, select: { id: true, ...userSelect } });

    // Fetch test lists for the draft projects
    const testLists = await prisma.reports.findMany({
      where: { type: 'TEST_LIST' }
    });

    return drafts.map(row => {
      const tl = testLists.find(t => (t.data as any)?.partReportId === row.id);
      return this.mapToDetail(row, users, tl);
    });
  }

  async deleteDraft(id: string): Promise<void> {
    await prisma.reports.delete({ where: { id } });
  }

  async createApprovalHistory(partReportId: string, userId: string, action: string, status: string) {
    // History table was removed. We could append to JSON, but for now we'll do nothing 
    // to match the requested simplification.
    return Promise.resolve();
  }
}

export const partReportRepository = new PartReportRepository();
