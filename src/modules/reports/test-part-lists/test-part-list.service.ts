import { testPartListRepository } from './test-part-list.repository';
import { partReportRepository } from '../part-reports/part-report.repository';
import { Prisma } from '@prisma/client';
import type { ReportStatus } from '@prisma/client';
import { NotFoundError } from '../../../shared/utils/errors/not-found-error';
import { AuthorizationError } from '../../../shared/utils/errors/authorization-error';
import { BadRequestError } from '../../../shared/utils/errors/bad-request-error';
import type { UpdateTestPartListBody } from './test-part-list.types';

export class TestPartListService {
  async getByPartReportId(partReportId: string) {
    const tpl = await testPartListRepository.findByPartReportId(partReportId);
    if (!tpl) throw new NotFoundError('Test Part List');
    return tpl;
  }

  async getById(id: string) {
    const tpl = await testPartListRepository.findById(id);
    if (!tpl) throw new NotFoundError('Test Part List');
    return tpl;
  }

  async update(id: string, data: UpdateTestPartListBody, userId: string) {
    const current = await this.getById(id);
    const updateData: Prisma.TestPartListUpdateInput = {};

    // Re-connect the parent report creator if it was logically deleted/reset previously
    if (current.partReport && !current.partReport.createdById) {
      await partReportRepository.update(current.partReportId, {}, current.partReport as any, userId);
    }

    if (data.formData !== undefined) {
      updateData.formData = data.formData as Prisma.InputJsonValue;
    }
    if (data.checkedByName !== undefined) updateData.checkedByName = data.checkedByName;
    if (data.approvedByName !== undefined) updateData.approvedByName = data.approvedByName;

    if (data.checkedById !== undefined) {
      const checkedId = data.checkedById || null;
      updateData.checker = checkedId ? { connect: { id: checkedId } } : { disconnect: true };
      if (checkedId && (current.status === 'GENERATED' || current.status === 'PENDING')) {
        updateData.status = 'PENDING_REVIEW';
      } else if (!checkedId && current.status === 'PENDING_REVIEW') {
        updateData.status = 'PENDING';
      }
    }

    if (data.approvedById !== undefined) {
      const approvedId = data.approvedById || null;
      updateData.approver = approvedId ? { connect: { id: approvedId } } : { disconnect: true };
      if (approvedId && current.status === 'REVIEWED') {
        updateData.status = 'PENDING_APPROVAL';
      } else if (!approvedId && current.status === 'PENDING_APPROVAL') {
        updateData.status = 'REVIEWED';
      }
    }

    return testPartListRepository.update(id, updateData);
  }

  async review(id: string, userId: string) {
    const tpl = await this.getById(id);
    if (tpl.status !== 'PENDING_REVIEW') throw new BadRequestError('Test Part List is not pending review');
    if (tpl.checkedById !== userId) throw new AuthorizationError('Not authorized to review this Test Part List');

    const nextStatus: ReportStatus = tpl.approvedById ? 'PENDING_APPROVAL' : 'REVIEWED';
    const updateData: Prisma.TestPartListUpdateInput = {
      status: nextStatus,
      lastActionBy: tpl.checker ? `${tpl.checker.firstName} ${tpl.checker.lastName}` : null,
      lastActionType: 'REVIEWED',
      lastActionAt: new Date(),
    };
    
    const updated = await testPartListRepository.update(id, updateData);
    await testPartListRepository.createApprovalHistory(id, userId, 'Reviewed', 'Completed');
    return updated;
  }

  async approve(id: string, userId: string) {
    const tpl = await this.getById(id);
    if (tpl.status !== 'PENDING_APPROVAL') throw new BadRequestError('Test Part List must be reviewed before approval');
    if (tpl.approvedById !== userId) throw new AuthorizationError('Not authorized to approve this Test Part List');

    const updateData: Prisma.TestPartListUpdateInput = {
      status: 'APPROVED',
      lastActionBy: tpl.approver ? `${tpl.approver.firstName} ${tpl.approver.lastName}` : null,
      lastActionType: 'APPROVED',
      lastActionAt: new Date(),
    };
    
    const updated = await testPartListRepository.update(id, updateData);
    await testPartListRepository.createApprovalHistory(id, userId, 'Approved', 'Completed');
    return updated;
  }

  async reject(id: string, userId: string, userName: string, remark: string) {
    const tpl = await this.getById(id);

    let nextStatus: ReportStatus;
    let stage: string;

    if (tpl.status === 'PENDING_REVIEW') {
      if (tpl.checkedById !== userId) throw new AuthorizationError('Not authorized to reject this review');
      nextStatus = 'REVIEW_REJECTED';
      stage = 'REVIEW';
    } else if (tpl.status === 'PENDING_APPROVAL') {
      if (tpl.approvedById !== userId) throw new AuthorizationError('Not authorized to reject this approval');
      nextStatus = 'APPROVAL_REJECTED';
      stage = 'APPROVAL';
    } else {
      throw new BadRequestError('Test Part List is not pending review or approval');
    }

    const existingHistory = Array.isArray(tpl.rejectionHistory) ? [...tpl.rejectionHistory] : [];
    const rejectionHistory = [
      ...existingHistory,
      { rejectedBy: userName, stage, remark, rejectedAt: new Date().toISOString() },
    ];

    const updateData: Prisma.TestPartListUpdateInput = {
      status: nextStatus,
      lastActionBy: userName,
      lastActionType: nextStatus,
      lastActionAt: new Date(),
      rejectionHistory: rejectionHistory as any,
    };
    
    const updated = await testPartListRepository.update(id, updateData);
    await testPartListRepository.createApprovalHistory(
      id,
      userId,
      nextStatus === 'REVIEW_REJECTED' ? 'Review Rejected' : 'Approval Rejected',
      'Completed'
    );
    return updated;
  }

  async resubmit(id: string, userId: string) {
    const tpl = await this.getById(id);

    if (tpl.partReport?.createdById !== userId) {
      throw new AuthorizationError('Only the Part Report creator can resubmit the Test Part List');
    }

    let nextStatus: ReportStatus;
    if (tpl.status === 'REVIEW_REJECTED') {
      nextStatus = 'PENDING_REVIEW';
    } else if (tpl.status === 'APPROVAL_REJECTED') {
      nextStatus = 'PENDING_APPROVAL';
    } else {
      throw new BadRequestError('Test Part List is not in a rejected state');
    }

    const updateData: Prisma.TestPartListUpdateInput = {
      status: nextStatus,
      lastActionType: 'RESUBMITTED',
      lastActionAt: new Date(),
    };

    const updated = await testPartListRepository.update(id, updateData);
    await testPartListRepository.createApprovalHistory(id, userId, 'Resubmitted', 'Completed');
    return updated;
  }

  async generate(id: string, userId: string) {
    const tpl = await this.getById(id);
    if (tpl.status !== 'PENDING') throw new BadRequestError('Only PENDING Test Part Lists can be generated');
    if (tpl.partReport?.createdById !== userId) {
       throw new AuthorizationError('Only the creator can generate the Test Part List');
    }

    const hasCheckedBy = tpl.checkedById;
    const nextStatus: ReportStatus = hasCheckedBy ? 'PENDING_REVIEW' : 'GENERATED';

    const updateData: Prisma.TestPartListUpdateInput = {
      status: nextStatus,
      isDraft: false,
      generatedAt: new Date(),
    };

    const updated = await testPartListRepository.update(id, updateData);
    await testPartListRepository.createApprovalHistory(id, userId, 'Generated', 'Completed');
    return testPartListRepository.findById(id);
  }

  async saveDraft(id: string, userId: string) {
    const tpl = await this.getById(id);
    if (tpl.status !== 'PENDING') throw new BadRequestError('Only PENDING Test Part Lists can be saved as draft');
    if (tpl.partReport?.createdById !== userId) {
      throw new AuthorizationError('Only the creator can save this Test Part List as draft');
    }
    return testPartListRepository.update(id, { isDraft: true });
  }

  async getDrafts(userId: string) {
    return testPartListRepository.findDraftsByUserId(userId);
  }

  async deleteDraft(id: string, userId: string) {
    const tpl = await this.getById(id);
    if (!tpl.isDraft) throw new BadRequestError('Cannot delete a generated list as draft');
    if (tpl.partReport?.createdById !== userId) throw new AuthorizationError('Only the creator can delete the draft');
    await testPartListRepository.deleteDraft(id);
  }

  async delete(id: string, userId: string) {
    const tpl = await this.getById(id);
    if (tpl.partReport?.createdById !== userId) throw new AuthorizationError('Only the creator can delete the list');

    // Reset the Test Part List in place — do NOT touch the parent Part Report
    await testPartListRepository.update(id, {
      status: 'PENDING',
      isDraft: false,
      formData: {},
      checkedByName: null,
      approvedByName: null,
      generatedAt: null,
      lastActionBy: null,
      lastActionType: null,
      lastActionAt: null,
      rejectionHistory: Prisma.DbNull,
      checker: { disconnect: true },
      approver: { disconnect: true },
    });
  }
}

export const testPartListService = new TestPartListService();
