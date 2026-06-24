import { prisma } from '../../prisma/prisma.client';
import type { ReportStatus } from '../../shared/types/reports.types';

const userSelect = { firstName: true, lastName: true, email: true } as const;

export const reportsDashboardService = {
  async getActiveRequests(userId: string) {
    const allReports = await prisma.reports.findMany({
      include: {
        projects: { select: { id: true, name: true } },
        users: { select: userSelect }
      }
    });

    const allUsers = await prisma.user.findMany({ select: { id: true, ...userSelect } });

    const activeReports = allReports.filter(r => {
      const d = r.data as any;
      if (d.isDraft !== false) return false;
      
      const status = d.reportStatus || d.status;
      if (status === 'PENDING_REVIEW' && d.checkedById === userId) return true;
      if (status === 'PENDING_APPROVAL' && d.approvedById === userId) return true;
      
      if (['REVIEW_REJECTED', 'APPROVAL_REJECTED'].includes(status)) {
        if (r.type === 'PART_REPORT' && r.createdBy === userId) return true;
        if (r.type === 'SUMMARY_REPORT' && (d.preparedById || r.createdBy) === userId) return true;
        
        if (r.type === 'TEST_LIST') {
          if (d.partReportId) {
            const parent = allReports.find(p => p.id === d.partReportId);
            if (parent && parent.createdBy === userId) return true;
          }
          if (d.summaryReportId) {
            const parent = allReports.find(p => p.id === d.summaryReportId);
            if (parent && ((parent.data as any)?.preparedById || parent.createdBy) === userId) return true;
          }
        }
      }
      return false;
    });

    return activeReports.map(r => this.mapReport(r, allReports, allUsers))
      .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
  },

  async getApprovals(userId: string) {
    const statuses: ReportStatus[] = ['REVIEWED', 'PENDING_APPROVAL', 'APPROVED', 'REVIEW_REJECTED', 'APPROVAL_REJECTED'];
    
    const allReports = await prisma.reports.findMany({
      include: {
        projects: { select: { id: true, name: true } },
        users: { select: userSelect }
      }
    });

    const allUsers = await prisma.user.findMany({ select: { id: true, ...userSelect } });

    const approvalReports = allReports.filter(r => {
      const d = r.data as any;
      if (d.isDraft !== false) return false;
      const status = d.reportStatus || d.status;
      
      if (!statuses.includes(status as ReportStatus)) return false;
      if (d.checkedById === userId || d.approvedById === userId) return true;
      
      return false;
    });

    return approvalReports.map(r => this.mapReport(r, allReports, allUsers))
      .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
  },

  async getDrafts(userId: string) {
    const allReports = await prisma.reports.findMany({
      include: {
        projects: { select: { id: true, name: true } },
        users: { select: userSelect }
      }
    });

    const allUsers = await prisma.user.findMany({ select: { id: true, ...userSelect } });

    const draftReports = allReports.filter(r => {
      const d = r.data as any;
      if (d.isDraft !== true) return false;
      
      if (r.type === 'PART_REPORT' && r.createdBy === userId) return true;
      if (r.type === 'SUMMARY_REPORT' && (d.preparedById || r.createdBy) === userId) return true;
      
      if (r.type === 'TEST_LIST') {
        if (d.partReportId) {
          const parent = allReports.find(p => p.id === d.partReportId);
          if (parent && parent.createdBy === userId) return true;
        }
        if (d.summaryReportId) {
          const parent = allReports.find(p => p.id === d.summaryReportId);
          if (parent && ((parent.data as any)?.preparedById || parent.createdBy) === userId) return true;
        }
      }
      return false;
    });

    return draftReports.map(r => this.mapReport(r, allReports, allUsers))
      .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
  },

  mapReport(r: any, allReports: any[], allUsers: any[]) {
    const d = r.data as any;
    
    let creator = r.users;
    let createdById = r.createdBy;
    let project = r.projects;
    let reportName = r.title;

    if (r.type === 'SUMMARY_REPORT') {
      createdById = d.preparedById || r.createdBy;
      creator = allUsers.find(u => u.id === createdById) || creator;
    } else if (r.type === 'TEST_LIST') {
      if (d.partReportId) {
        const p = allReports.find(x => x.id === d.partReportId);
        if (p) {
          project = p.projects;
          creator = p.users;
          createdById = p.createdBy;
          reportName = p.title;
        }
      } else if (d.summaryReportId) {
        const p = allReports.find(x => x.id === d.summaryReportId);
        if (p) {
          project = p.projects;
          createdById = (p.data as any)?.preparedById || p.createdBy;
          creator = allUsers.find(u => u.id === createdById) || p.users;
          reportName = p.title;
        }
      }
    }

    const checker = allUsers.find(u => u.id === d.checkedById);
    const approver = allUsers.find(u => u.id === d.approvedById);

    // Map to frontend expected shape
    const typeMap: Record<string, string> = {
      'PART_REPORT': 'PART_REPORT',
      'SUMMARY_REPORT': 'SUMMARY_REPORT',
      'TEST_LIST': d.partReportId ? 'TEST_PART_LIST' : 'TEST_SUMMARY_LIST'
    };

    return {
      id: r.id,
      projectId: r.projectId,
      reportName,
      reportStatus: d.reportStatus || d.status || 'PENDING',
      status: d.reportStatus || d.status || 'PENDING',
      isDraft: d.isDraft ?? true,
      createdById,
      checkedById: d.checkedById || null,
      approvedById: d.approvedById || null,
      createdAt: r.createdAt,
      updatedAt: r.updatedAt,
      type: typeMap[r.type] || r.type,
      project,
      creator,
      checker: checker || null,
      approver: approver || null,
    };
  }
};
