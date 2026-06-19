import { NotFoundError } from '../../shared/utils/errors/not-found-error';
import { AuthorizationError } from '../../shared/utils/errors/authorization-error';
import { BadRequestError } from '../../shared/utils/errors/bad-request-error';
import { prisma } from '../../prisma/prisma.client';
import { reportRepository } from './report.repository';
import type {
  CreateReportBody,
  UpdateReportBody,
  ListReportsQuery,
  ReportDetail,
} from './report.types';
import type { UserRole } from '../users/user.types';

export class ReportService {
  private normalizeAssignmentValue(value: string | null | undefined): string | null {
    return value || null;
  }

  private hasWorkflowAssignmentChange(report: ReportDetail, data: UpdateReportBody): boolean {
    const assignmentFields: Array<keyof Pick<
      UpdateReportBody,
      'checkedByUserId' | 'checkedByName' | 'approvedByUserId' | 'approvedByName'
    >> = ['checkedByUserId', 'checkedByName', 'approvedByUserId', 'approvedByName'];

    return assignmentFields.some((field) => (
      data[field] !== undefined &&
      this.normalizeAssignmentValue(data[field]) !== this.normalizeAssignmentValue(report[field])
    ));
  }

  private assertWorkflowAssignmentsCanChange(
    report: ReportDetail,
    data: UpdateReportBody,
    userId: string,
    userRole: UserRole,
  ): void {
    const isCreator = report.createdBy === userId;
    const isAdmin = userRole === 'MANAGER' || userRole === 'TEAM_LEAD';
    const isWorkflowAssignee = report.checkedByUserId === userId || report.approvedByUserId === userId;

    const checkedByChanged = 
      (data.checkedByUserId !== undefined && this.normalizeAssignmentValue(data.checkedByUserId) !== this.normalizeAssignmentValue(report.checkedByUserId)) ||
      (data.checkedByName !== undefined && this.normalizeAssignmentValue(data.checkedByName) !== this.normalizeAssignmentValue(report.checkedByName));

    const approvedByChanged = 
      (data.approvedByUserId !== undefined && this.normalizeAssignmentValue(data.approvedByUserId) !== this.normalizeAssignmentValue(report.approvedByUserId)) ||
      (data.approvedByName !== undefined && this.normalizeAssignmentValue(data.approvedByName) !== this.normalizeAssignmentValue(report.approvedByName));

    if (!checkedByChanged && !approvedByChanged) return;

    if (checkedByChanged) {
      if (!isCreator && !(isAdmin && !isWorkflowAssignee)) {
        throw new AuthorizationError('Reviewer assignment can only be changed by the creator or an authorized workflow owner');
      }
    }

    if (approvedByChanged) {
      if (report.approvedByUserId && !isCreator && !(isAdmin && !isWorkflowAssignee)) {
        throw new AuthorizationError('Approver assignment is locked and can only be changed by authorized workflow owners');
      }
    }
  }

  async listReports(query: ListReportsQuery) {
    return reportRepository.findAll(query);
  }

  async getReportById(id: string): Promise<ReportDetail> {
    const report = await reportRepository.findById(id);
    if (!report) throw new NotFoundError('Report');
    return report;
  }

  async createReport(data: CreateReportBody, userId: string, _userRole: UserRole): Promise<ReportDetail> {
    const report = await reportRepository.create(data, userId);
    
    // Log history for generation
    await prisma.reportApprovalHistory.create({
      data: {
        reportId: report.id,
        userId,
        action: 'Generated',
        status: 'Completed',
      }
    });

    return report;
  }

  async updateReport(
    id: string,
    data: UpdateReportBody,
    userId: string,
    userRole: UserRole,
  ): Promise<ReportDetail> {
    const current = await this.getReportById(id);
    this.assertWorkflowAssignmentsCanChange(current, data, userId, userRole);

    const report = await reportRepository.update(id, data);
    return report;
  }

  async deleteReport(id: string, _userRole: UserRole): Promise<void> {
    const exists = await reportRepository.exists(id);
    if (!exists) throw new NotFoundError('Report');
    await reportRepository.delete(id);
  }

  async getProjectReports(projectId: string): Promise<{
    PART_REPORT: ReportDetail | null;
    SUMMARY_REPORT: ReportDetail | null;
    TEST_LIST: ReportDetail | null;
  }> {
    return reportRepository.findByProjectId(projectId);
  }

  async reviewReport(
    id: string,
    userId: string
  ): Promise<ReportDetail> {
    const report = await this.getReportById(id);
    if (report.status !== 'PENDING_REVIEW') {
      throw new BadRequestError('Report is not pending review');
    }
    if (report.checkedByUserId !== userId) {
      throw new AuthorizationError('Not authorized to review this report');
    }

    const nextStatus = report.approvedByUserId ? 'PENDING_APPROVAL' : 'REVIEWED';

    const updated = await prisma.report.update({
      where: { id },
      data: {
        status: nextStatus,
        lastActionBy: report.checker ? `${report.checker.firstName} ${report.checker.lastName}` : null,
        lastActionType: 'REVIEWED',
        lastActionAt: new Date(),
      },
      include: {
        creator: { select: { firstName: true, lastName: true, email: true } },
        checker: { select: { firstName: true, lastName: true, email: true } },
        approver: { select: { firstName: true, lastName: true, email: true } },
      }
    });

    await prisma.reportApprovalHistory.create({
      data: {
        reportId: id,
        userId,
        action: 'Reviewed',
        status: 'Completed',
      }
    });

    return updated as unknown as ReportDetail;
  }

  async approveReport(id: string, userId: string): Promise<ReportDetail> {
    const report = await this.getReportById(id);
    if (report.status !== 'PENDING_APPROVAL') {
      throw new BadRequestError('Report must be reviewed before it can be approved');
    }
    if (report.approvedByUserId !== userId) {
      throw new AuthorizationError('Not authorized to approve this report');
    }

    const updated = await prisma.report.update({
      where: { id },
      data: { 
        status: 'APPROVED',
        lastActionBy: report.approver ? `${report.approver.firstName} ${report.approver.lastName}` : null,
        lastActionType: 'APPROVED',
        lastActionAt: new Date(),
      },
      include: {
        creator: { select: { firstName: true, lastName: true, email: true } },
        checker: { select: { firstName: true, lastName: true, email: true } },
        approver: { select: { firstName: true, lastName: true, email: true } },
      }
    });

    await prisma.reportApprovalHistory.create({
      data: {
        reportId: id,
        userId,
        action: 'Approved',
        status: 'Completed',
      }
    });

    return updated as unknown as ReportDetail;
  }

  async rejectReport(id: string, userId: string, userName: string, remark: string): Promise<ReportDetail> {
    const report = await this.getReportById(id);
    
    let nextStatus: 'REVIEW_REJECTED' | 'APPROVAL_REJECTED';
    let stage: 'REVIEW' | 'APPROVAL';

    if (report.status === 'PENDING_REVIEW') {
      if (report.checkedByUserId !== userId) throw new AuthorizationError('Not authorized to reject this review');
      nextStatus = 'REVIEW_REJECTED';
      stage = 'REVIEW';
    } else if (report.status === 'PENDING_APPROVAL') {
      if (report.approvedByUserId !== userId) throw new AuthorizationError('Not authorized to reject this approval');
      nextStatus = 'APPROVAL_REJECTED';
      stage = 'APPROVAL';
    } else {
      throw new BadRequestError('Report is not pending review or approval');
    }

    const currentRejection = {
      rejectedBy: userName,
      stage,
      remark,
      rejectedAt: new Date().toISOString()
    };

    // Accumulate full history (never cleared)
    const existingHistory = Array.isArray(report.rejectionHistory)
      ? [...report.rejectionHistory]
      : (report.rejectionHistory ? [report.rejectionHistory] : []);
    const rejectionHistory = [...existingHistory, currentRejection];

    const updated = await prisma.report.update({
      where: { id },
      data: {
        status: nextStatus,
        lastActionBy: userName,
        lastActionType: nextStatus,
        lastActionAt: new Date(),
        rejectionHistory: rejectionHistory as any,
      },
      include: {
        creator: { select: { firstName: true, lastName: true, email: true } },
        checker: { select: { firstName: true, lastName: true, email: true } },
        approver: { select: { firstName: true, lastName: true, email: true } },
      }
    });

    await prisma.reportApprovalHistory.create({
      data: {
        reportId: id,
        userId,
        action: nextStatus === 'REVIEW_REJECTED' ? 'Review Rejected' : 'Approval Rejected',
        status: 'Completed',
      }
    });

    return updated as unknown as ReportDetail;
  }

  async resubmitReport(id: string, userId: string): Promise<ReportDetail> {
    const report = await this.getReportById(id);
    
    if (report.createdBy !== userId) {
      throw new AuthorizationError('Only the creator can resubmit the report');
    }

    let nextStatus: 'PENDING_REVIEW' | 'PENDING_APPROVAL';

    if (report.status === 'REVIEW_REJECTED') {
      nextStatus = 'PENDING_REVIEW';
    } else if (report.status === 'APPROVAL_REJECTED') {
      nextStatus = 'PENDING_APPROVAL';
    } else {
      throw new BadRequestError('Report is not in a rejected state');
    }

    const updated = await prisma.report.update({
      where: { id },
      data: {
        status: nextStatus,
        lastActionBy: report.creator ? `${report.creator.firstName} ${report.creator.lastName}` : null,
        lastActionType: 'RESUBMITTED',
        lastActionAt: new Date(),
      },
      include: {
        creator: { select: { firstName: true, lastName: true, email: true } },
        checker: { select: { firstName: true, lastName: true, email: true } },
        approver: { select: { firstName: true, lastName: true, email: true } },
      }
    });

    await prisma.reportApprovalHistory.create({
      data: {
        reportId: id,
        userId,
        action: 'Resubmitted',
        status: 'Completed',
      }
    });

    return updated as unknown as ReportDetail;
  }

  async getActiveRequests(userId: string) {
    return prisma.report.findMany({
      where: {
        OR: [
          { checkedByUserId: userId, status: 'PENDING_REVIEW' },
          { approvedByUserId: userId, status: 'PENDING_APPROVAL' },
          { createdBy: userId, status: { in: ['REVIEW_REJECTED', 'APPROVAL_REJECTED'] } }
        ]
      },
      include: {
        project: { select: { name: true } },
        creator: { select: { firstName: true, lastName: true } },
        checker: { select: { firstName: true, lastName: true } },
        approver: { select: { firstName: true, lastName: true } }
      },
      orderBy: { updatedAt: 'desc' }
    });
  }

  async getApprovals(userId: string) {
    return prisma.reportApprovalHistory.findMany({
      where: { userId, action: { in: ['Reviewed', 'Approved'] } },
      include: {
        report: {
          include: {
            project: { select: { name: true } }
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });
  }
}

export const reportService = new ReportService();
