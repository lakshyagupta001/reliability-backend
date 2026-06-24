import { NotFoundError } from '../../../shared/utils/errors/not-found-error';
import { AuthorizationError } from '../../../shared/utils/errors/authorization-error';
import { BadRequestError } from '../../../shared/utils/errors/bad-request-error';
import { prisma } from '../../../prisma/prisma.client';
import { partReportRepository } from './part-report.repository';
import { Prisma } from '@prisma/client';
import type {
  CreatePartReportBody,
  UpdatePartReportBody,
  PartReportDetail,
  PartReportListItem,
} from './part-report.types';
import type { UserRole } from '../../users/user.types';

export class PartReportService {
  async listByProject(projectId: string): Promise<PartReportListItem[]> {
    return partReportRepository.findByProjectId(projectId);
  }

  async getById(id: string): Promise<PartReportDetail> {
    const report = await partReportRepository.findById(id);
    if (!report) throw new NotFoundError('Part Report');
    return report;
  }

  async create(
    data: CreatePartReportBody,
    userId: string,
    _userRole: UserRole,
  ): Promise<PartReportDetail> {
    const isDraft = data.isDraft ?? true;
    const report = await partReportRepository.create(data, userId);

    // Auto-create linked TestPartList (always isDraft=false — it manages its own draft state independently)
    const crypto = require('crypto');
    await prisma.reports.create({
      data: {
        id: crypto.randomUUID(),
        type: 'TEST_LIST',
        projectId: report.projectId,
        title: 'Test Part List',
        format: 'TEST_LIST',
        createdBy: userId,
        updatedAt: new Date(),
        data: {
          partReportId: report.id,
          formData: {},
          isDraft: false,
          status: 'PENDING',
        }
      },
    });

    // Only create approval history if NOT a draft
    if (!isDraft) {
      await partReportRepository.createApprovalHistory(report.id, userId, 'Created', 'Completed');
    }

    // Return with testPartList populated
    return partReportRepository.findById(report.id) as Promise<PartReportDetail>;
  }

  async update(
    id: string,
    data: UpdatePartReportBody,
    userId: string,
    _userRole: UserRole,
  ): Promise<PartReportDetail> {
    const current = await this.getById(id);
    return partReportRepository.update(id, data, current, userId);
  }

  async delete(id: string, _userRole: UserRole): Promise<void> {
    await this.getById(id);
    await partReportRepository.delete(id);
  }

  async deleteSection(id: string, _userRole: UserRole): Promise<void> {
    const report = await this.getById(id);
    
    // Logical reset deletion if associated TestPartList exists
    if (report.testPartList) {
      const resetUpdateData: Record<string, any> = {
        reportName: '',
        isDraft: false,
        data: {},
        checkedByName: null,
        approvedByName: null,
        formatNumber: null,
        reportNumber: null,
        lastActionBy: null,
        lastActionType: null,
        generatedAt: null,
      };
      if (report.preparedById) resetUpdateData.preparedById = null;
      if (report.checkedById) resetUpdateData.checkedById = null;
      if (report.approvedById) resetUpdateData.approvedById = null;
      resetUpdateData.rejectionHistory = [];

      await partReportRepository.updateStatus(id, 'PENDING', resetUpdateData);
    } else {
      await partReportRepository.delete(id);
    }
  }

  async review(id: string, userId: string): Promise<PartReportDetail> {
    const report = await this.getById(id);
    if (report.reportStatus !== 'PENDING_REVIEW') {
      throw new BadRequestError('Part Report is not pending review');
    }
    if (report.checkedById !== userId) {
      throw new AuthorizationError('Not authorized to review this Part Report');
    }
    const nextStatus = report.approvedById ? 'PENDING_APPROVAL' : 'REVIEWED';
    const updated = await partReportRepository.updateStatus(id, nextStatus, {
      lastActionBy: report.checker
        ? `${report.checker.firstName} ${report.checker.lastName}`
        : null,
      lastActionType: 'REVIEWED',
      lastActionAt: new Date(),
    });
    await partReportRepository.createApprovalHistory(id, userId, 'Reviewed', 'Completed');
    return updated;
  }

  async approve(id: string, userId: string): Promise<PartReportDetail> {
    const report = await this.getById(id);
    if (report.reportStatus !== 'PENDING_APPROVAL') {
      throw new BadRequestError('Part Report must be reviewed before it can be approved');
    }
    if (report.approvedById !== userId) {
      throw new AuthorizationError('Not authorized to approve this Part Report');
    }
    const updated = await partReportRepository.updateStatus(id, 'APPROVED', {
      lastActionBy: report.approver
        ? `${report.approver.firstName} ${report.approver.lastName}`
        : null,
      lastActionType: 'APPROVED',
      lastActionAt: new Date(),
    });
    await partReportRepository.createApprovalHistory(id, userId, 'Approved', 'Completed');
    return updated;
  }

  async reject(id: string, userId: string, userName: string, remark: string): Promise<PartReportDetail> {
    const report = await this.getById(id);

    let nextStatus: 'REVIEW_REJECTED' | 'APPROVAL_REJECTED';
    let stage: 'REVIEW' | 'APPROVAL';

    if (report.reportStatus === 'PENDING_REVIEW') {
      if (report.checkedById !== userId) throw new AuthorizationError('Not authorized to reject this review');
      nextStatus = 'REVIEW_REJECTED';
      stage = 'REVIEW';
    } else if (report.reportStatus === 'PENDING_APPROVAL') {
      if (report.approvedById !== userId) throw new AuthorizationError('Not authorized to reject this approval');
      nextStatus = 'APPROVAL_REJECTED';
      stage = 'APPROVAL';
    } else {
      throw new BadRequestError('Part Report is not pending review or approval');
    }

    const existingHistory = Array.isArray(report.rejectionHistory)
      ? [...report.rejectionHistory]
      : report.rejectionHistory
        ? [report.rejectionHistory]
        : [];
    const rejectionHistory = [
      ...existingHistory,
      { rejectedBy: userName, stage, remark, rejectedAt: new Date().toISOString() },
    ];

    const updated = await partReportRepository.updateStatus(id, nextStatus, {
      lastActionBy: userName,
      lastActionType: nextStatus,
      lastActionAt: new Date(),
      rejectionHistory,
    });
    await partReportRepository.createApprovalHistory(
      id,
      userId,
      nextStatus === 'REVIEW_REJECTED' ? 'Review Rejected' : 'Approval Rejected',
      'Completed',
    );
    return updated;
  }

  async resubmit(id: string, userId: string): Promise<PartReportDetail> {
    const report = await this.getById(id);
    if (report.createdById !== userId) {
      throw new AuthorizationError('Only the creator can resubmit the Part Report');
    }

    let nextStatus: 'PENDING_REVIEW' | 'PENDING_APPROVAL';
    if (report.reportStatus === 'REVIEW_REJECTED') {
      nextStatus = 'PENDING_REVIEW';
    } else if (report.reportStatus === 'APPROVAL_REJECTED') {
      nextStatus = 'PENDING_APPROVAL';
    } else {
      throw new BadRequestError('Part Report is not in a rejected state');
    }

    const updated = await partReportRepository.updateStatus(id, nextStatus, {
      lastActionBy: report.creator
        ? `${report.creator.firstName} ${report.creator.lastName}`
        : null,
      lastActionType: 'RESUBMITTED',
      lastActionAt: new Date(),
    });
    await partReportRepository.createApprovalHistory(id, userId, 'Resubmitted', 'Completed');
    return updated;
  }

  async generate(id: string, userId: string): Promise<PartReportDetail> {
    const report = await this.getById(id);
    if (report.reportStatus !== 'PENDING') {
      throw new BadRequestError('Only PENDING reports can be generated');
    }
    if (report.createdById !== userId) {
      throw new AuthorizationError('Only the creator can generate the Part Report');
    }

    // Determine next workflow status
    const reportData = report.data as Record<string, any>;
    const hasCheckedBy = report.checkedById || reportData?.approvals?.checkedByUserId;
    const nextStatus = hasCheckedBy ? 'PENDING_REVIEW' : 'GENERATED';
    
    await partReportRepository.updateStatus(id, nextStatus, {
      isDraft: false,
      generatedAt: new Date(),
    });

    // Note: TestPartList manages its own isDraft independently — do NOT update it here

    await partReportRepository.createApprovalHistory(id, userId, 'Generated', 'Completed');

    return partReportRepository.findById(id) as Promise<PartReportDetail>;
  }

  async saveDraft(id: string, userId: string): Promise<PartReportDetail> {
    const report = await this.getById(id);
    if (report.reportStatus !== 'PENDING') {
      throw new BadRequestError('Only PENDING reports can be saved as draft');
    }
    if (report.createdById !== userId) {
      throw new AuthorizationError('Only the creator can save this report as draft');
    }
    return partReportRepository.updateStatus(id, 'PENDING', { isDraft: true });
  }

  async getDrafts(userId: string): Promise<PartReportListItem[]> {
    return partReportRepository.findDraftsByUserId(userId);
  }

  async deleteDraft(id: string, userId: string): Promise<void> {
    const report = await this.getById(id);
    if (!report.isDraft) {
      throw new BadRequestError('Cannot delete a generated report as draft');
    }
    if (report.createdById !== userId) {
      throw new AuthorizationError('Only the creator can delete the draft');
    }
    await partReportRepository.deleteDraft(id);
  }
}

export const partReportService = new PartReportService();
