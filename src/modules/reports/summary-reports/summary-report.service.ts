import { summaryReportRepository } from './summary-report.repository';
import { prisma } from '../../../prisma/prisma.client';
import { Prisma } from '@prisma/client';
import type { ReportStatus } from '../../../shared/types/reports.types';
import { NotFoundError } from '../../../shared/utils/errors/not-found-error';
import { AuthorizationError } from '../../../shared/utils/errors/authorization-error';
import { BadRequestError } from '../../../shared/utils/errors/bad-request-error';
import { ConflictError } from '../../../shared/utils/errors/conflict-error';
import type { CreateSummaryReportBody, UpdateSummaryReportBody } from './summary-report.types';

export class SummaryReportService {
  async getByProjectId(projectId: string) {
    return summaryReportRepository.findByProjectId(projectId);
  }

  async getById(id: string) {
    const sr = await summaryReportRepository.findById(id);
    if (!sr) {
      throw new NotFoundError('Summary Report');
    }
    return sr;
  }

  async create(data: CreateSummaryReportBody, userId: string) {
    const isDraft = data.isDraft ?? true;

    const existing = await summaryReportRepository.existsByProjectId(data.projectId);
    if (existing) throw new ConflictError('A Summary Report already exists for this project');

    const sr = await summaryReportRepository.create(data, userId);

    await summaryReportRepository.createLinkedTestSummaryList(sr.id, data.projectId, userId);

    if (!isDraft) {
      await summaryReportRepository.createApprovalHistory(sr.id, userId, 'Created', 'Completed');
    }

    return summaryReportRepository.findById(sr.id);
  }

  async update(id: string, data: UpdateSummaryReportBody, userId: string) {
    const current = await this.getById(id);
    const updateData: Record<string, any> = {};

    if (!current.preparedById) {
      updateData.preparedById = userId;
    }

    if (data.data !== undefined) updateData.data = data.data;
    if (data.formatNumber !== undefined) updateData.formatNumber = data.formatNumber;
    if (data.reportNumber !== undefined) updateData.reportNumber = data.reportNumber;
    if (data.checkedByName !== undefined) updateData.checkedByName = data.checkedByName;
    if (data.approvedByName !== undefined) updateData.approvedByName = data.approvedByName;

    if (data.checkedById !== undefined) {
      const checkedId = data.checkedById || null;
      updateData.checkedById = checkedId;
      if (checkedId && current.reportStatus === 'GENERATED') {
        updateData.reportStatus = 'PENDING_REVIEW';
      } else if (!checkedId && current.reportStatus === 'PENDING_REVIEW') {
        updateData.reportStatus = 'GENERATED';
      }
    }

    if (data.approvedById !== undefined) {
      const approvedId = data.approvedById || null;
      updateData.approvedById = approvedId;
      if (approvedId && current.reportStatus === 'REVIEWED') {
        updateData.reportStatus = 'PENDING_APPROVAL';
      } else if (!approvedId && current.reportStatus === 'PENDING_APPROVAL') {
        updateData.reportStatus = 'REVIEWED';
      }
    }

    return summaryReportRepository.update(id, updateData);
  }

  async review(id: string, userId: string) {
    const sr = await this.getById(id);
    if (sr.reportStatus !== 'PENDING_REVIEW') throw new BadRequestError('Summary Report is not pending review');
    if (sr.checkedById !== userId) throw new AuthorizationError('Not authorized to review this Summary Report');

    const nextStatus: ReportStatus = sr.approvedById ? 'PENDING_APPROVAL' : 'REVIEWED';
    const updateData: Record<string, any> = {
      reportStatus: nextStatus,
      lastActionBy: sr.checker ? `${sr.checker.firstName} ${sr.checker.lastName}` : null,
      lastActionType: 'REVIEWED',
      lastActionAt: new Date(),
    };

    const updated = await summaryReportRepository.update(id, updateData);
    await summaryReportRepository.createApprovalHistory(id, userId, 'Reviewed', 'Completed');
    return updated;
  }

  async approve(id: string, userId: string) {
    const sr = await this.getById(id);
    if (sr.reportStatus !== 'PENDING_APPROVAL') throw new BadRequestError('Summary Report must be reviewed before approval');
    if (sr.approvedById !== userId) throw new AuthorizationError('Not authorized to approve this Summary Report');

    const updateData: Record<string, any> = {
      reportStatus: 'APPROVED',
      lastActionBy: sr.approver ? `${sr.approver.firstName} ${sr.approver.lastName}` : null,
      lastActionType: 'APPROVED',
      lastActionAt: new Date(),
    };

    const updated = await summaryReportRepository.update(id, updateData);
    await summaryReportRepository.createApprovalHistory(id, userId, 'Approved', 'Completed');
    return updated;
  }

  async reject(id: string, userId: string, userName: string, remark: string) {
    const sr = await this.getById(id);
    let nextStatus: ReportStatus;
    let stage: string;

    if (sr.reportStatus === 'PENDING_REVIEW') {
      if (sr.checkedById !== userId) throw new AuthorizationError('Not authorized to reject this review');
      nextStatus = 'REVIEW_REJECTED';
      stage = 'REVIEW';
    } else if (sr.reportStatus === 'PENDING_APPROVAL') {
      if (sr.approvedById !== userId) throw new AuthorizationError('Not authorized to reject this approval');
      nextStatus = 'APPROVAL_REJECTED';
      stage = 'APPROVAL';
    } else {
      throw new BadRequestError('Summary Report is not pending review or approval');
    }

    const existingHistory = Array.isArray(sr.rejectionHistory) ? [...sr.rejectionHistory] : [];
    const rejectionHistory = [
      ...existingHistory,
      { rejectedBy: userName, stage, remark, rejectedAt: new Date().toISOString() },
    ];

    const updateData: Record<string, any> = {
      reportStatus: nextStatus,
      lastActionBy: userName,
      lastActionType: nextStatus,
      lastActionAt: new Date(),
      rejectionHistory,
    };

    const updated = await summaryReportRepository.update(id, updateData);
    await summaryReportRepository.createApprovalHistory(
      id,
      userId,
      nextStatus === 'REVIEW_REJECTED' ? 'Review Rejected' : 'Approval Rejected',
      'Completed'
    );
    return updated;
  }

  async resubmit(id: string, userId: string) {
    const sr = await this.getById(id);
    if (sr.preparedById !== userId) {
      throw new AuthorizationError('Only the preparer can resubmit the Summary Report');
    }

    let nextStatus: ReportStatus;
    if (sr.reportStatus === 'REVIEW_REJECTED') {
      nextStatus = 'PENDING_REVIEW';
    } else if (sr.reportStatus === 'APPROVAL_REJECTED') {
      nextStatus = 'PENDING_APPROVAL';
    } else {
      throw new BadRequestError('Summary Report is not in a rejected state');
    }

    const updateData: Record<string, any> = {
      reportStatus: nextStatus,
      lastActionType: 'RESUBMITTED',
      lastActionAt: new Date(),
    };

    const updated = await summaryReportRepository.update(id, updateData);
    await summaryReportRepository.createApprovalHistory(id, userId, 'Resubmitted', 'Completed');
    return updated;
  }

  async delete(id: string, _userRole: string): Promise<void> {
    await this.getById(id);
    await summaryReportRepository.delete(id);
  }

  async deleteSection(id: string, _userRole: string): Promise<void> {
    const report = await this.getById(id);

    if (report.testSummaryList) {
      const resetUpdateData: Record<string, any> = {
        reportStatus: 'PENDING',
        isDraft: false,
        data: {},
        checkedByName: null,
        approvedByName: null,
        formatNumber: null,
        reportNumber: null,
        lastActionBy: null,
        lastActionType: null,
        rejectionHistory: [],
        generatedAt: null,
      };

      if (report.preparedById) resetUpdateData.preparedById = null;
      if (report.checkedById) resetUpdateData.checkedById = null;
      if (report.approvedById) resetUpdateData.approvedById = null;

      await summaryReportRepository.update(id, resetUpdateData);
    } else {
      await summaryReportRepository.delete(id);
    }
  }

  async generate(id: string, userId: string) {
    const sr = await this.getById(id);
    if (sr.reportStatus !== 'PENDING') {
      throw new BadRequestError('Only PENDING reports can be generated');
    }
    if (sr.preparedById !== userId) {
      throw new AuthorizationError('Only the preparer can generate the Summary Report');
    }

    const srData = sr.data as Record<string, any>;
    const hasCheckedBy = sr.checkedById || srData?.approvals?.checkedByUserId;
    const nextStatus: ReportStatus = hasCheckedBy ? 'PENDING_REVIEW' : 'GENERATED';

    const updateData: Record<string, any> = {
      isDraft: false,
      generatedAt: new Date(),
      reportStatus: nextStatus,
    };

    const updated = await summaryReportRepository.update(id, updateData);
    await summaryReportRepository.createApprovalHistory(id, userId, 'Generated', 'Completed');
    return summaryReportRepository.findById(id);
  }

  async saveDraft(id: string, userId: string) {
    const sr = await this.getById(id);
    if (sr.reportStatus !== 'PENDING') {
      throw new BadRequestError('Only PENDING reports can be saved as draft');
    }
    if (sr.preparedById !== userId) {
      throw new AuthorizationError('Only the preparer can save this report as draft');
    }
    return summaryReportRepository.update(id, { isDraft: true });
  }

  async getDrafts(userId: string) {
    return summaryReportRepository.findDraftsByUserId(userId);
  }

  async deleteDraft(id: string, userId: string): Promise<void> {
    const sr = await this.getById(id);
    if (!sr.isDraft) {
      throw new BadRequestError('Cannot delete a generated report as draft');
    }
    if (sr.preparedById !== userId) {
      throw new AuthorizationError('Only the preparer can delete the draft');
    }
    await summaryReportRepository.deleteDraft(id);
  }
}

export const summaryReportService = new SummaryReportService();
