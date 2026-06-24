import { testSummaryListRepository } from './test-summary-list.repository';
import { summaryReportRepository } from '../summary-reports/summary-report.repository';
import { Prisma, type ReportStatus } from '@prisma/client';
import { NotFoundError } from '../../../shared/utils/errors/not-found-error';
import { AuthorizationError } from '../../../shared/utils/errors/authorization-error';
import { BadRequestError } from '../../../shared/utils/errors/bad-request-error';
import type { UpdateTestSummaryListBody } from './test-summary-list.types';

export class TestSummaryListService {
  async getById(id: string) {
    const tsl = await testSummaryListRepository.findById(id);
    if (!tsl) throw new NotFoundError('Test Summary List');
    return tsl;
  }

  async getBySummaryReportId(summaryReportId: string) {
    const tsl = await testSummaryListRepository.findBySummaryReportId(summaryReportId);
    if (!tsl) throw new NotFoundError('Test Summary List');
    return tsl;
  }

  async update(id: string, data: UpdateTestSummaryListBody, userId: string) {
    const current = await this.getById(id);
    const updateData: Prisma.TestSummaryListUpdateInput = {};

    // Re-connect the parent report preparer if it was logically deleted/reset previously
    if (current.summaryReport && !current.summaryReport.preparedById) {
      await summaryReportRepository.update(current.summaryReportId, { preparedBy: { connect: { id: userId } } });
    }

    if (data.formData !== undefined) {
      updateData.formData = data.formData as Prisma.InputJsonValue;
    }
    if (data.checkedByName !== undefined) updateData.checkedByName = data.checkedByName;
    if (data.approvedByName !== undefined) updateData.approvedByName = data.approvedByName;

    if (data.checkedById !== undefined) {
      const cid = data.checkedById || null;
      updateData.checker = cid ? { connect: { id: cid } } : { disconnect: true };
      if (cid && (current.status === 'PENDING' || current.status === 'GENERATED')) updateData.status = 'PENDING_REVIEW';
      else if (!cid && current.status === 'PENDING_REVIEW') updateData.status = 'PENDING';
    }

    if (data.approvedById !== undefined) {
      const aid = data.approvedById || null;
      updateData.approver = aid ? { connect: { id: aid } } : { disconnect: true };
      if (aid && current.status === 'REVIEWED') updateData.status = 'PENDING_APPROVAL';
      else if (!aid && current.status === 'PENDING_APPROVAL') updateData.status = 'REVIEWED';
    }

    return testSummaryListRepository.update(id, updateData);
  }

  async review(id: string, userId: string) {
    const tsl = await this.getById(id);
    if (tsl.status !== 'PENDING_REVIEW') throw new BadRequestError('Not pending review');
    if (tsl.checkedById !== userId) throw new AuthorizationError('Not authorized to review');
    
    const nextStatus: ReportStatus = tsl.approvedById ? 'PENDING_APPROVAL' : 'REVIEWED';
    const updateData: Prisma.TestSummaryListUpdateInput = {
      status: nextStatus,
      lastActionBy: tsl.checker ? `${tsl.checker.firstName} ${tsl.checker.lastName}` : null,
      lastActionType: 'REVIEWED',
      lastActionAt: new Date(),
    };
    
    const updated = await testSummaryListRepository.update(id, updateData);
    await testSummaryListRepository.createApprovalHistory(id, userId, 'Reviewed', 'Completed');
    return updated;
  }

  async approve(id: string, userId: string) {
    const tsl = await this.getById(id);
    if (tsl.status !== 'PENDING_APPROVAL') throw new BadRequestError('Must be reviewed before approval');
    if (tsl.approvedById !== userId) throw new AuthorizationError('Not authorized to approve');
    
    const updateData: Prisma.TestSummaryListUpdateInput = {
      status: 'APPROVED',
      lastActionBy: tsl.approver ? `${tsl.approver.firstName} ${tsl.approver.lastName}` : null,
      lastActionType: 'APPROVED',
      lastActionAt: new Date(),
    };

    const updated = await testSummaryListRepository.update(id, updateData);
    await testSummaryListRepository.createApprovalHistory(id, userId, 'Approved', 'Completed');
    return updated;
  }

  async reject(id: string, userId: string, userName: string, remark: string) {
    const tsl = await this.getById(id);
    let nextStatus: ReportStatus;
    let stage: string;
    
    if (tsl.status === 'PENDING_REVIEW') {
      if (tsl.checkedById !== userId) throw new AuthorizationError('Not authorized');
      nextStatus = 'REVIEW_REJECTED';
      stage = 'REVIEW';
    } else if (tsl.status === 'PENDING_APPROVAL') {
      if (tsl.approvedById !== userId) throw new AuthorizationError('Not authorized');
      nextStatus = 'APPROVAL_REJECTED';
      stage = 'APPROVAL';
    } else {
      throw new BadRequestError('Not pending review or approval');
    }

    const existingHistory = Array.isArray(tsl.rejectionHistory) ? [...tsl.rejectionHistory] : [];
    const rejectionHistory = [...existingHistory, { rejectedBy: userName, stage, remark, rejectedAt: new Date().toISOString() }];
    
    const updateData: Prisma.TestSummaryListUpdateInput = {
      status: nextStatus, 
      lastActionBy: userName, 
      lastActionType: nextStatus, 
      lastActionAt: new Date(), 
      rejectionHistory: rejectionHistory as any
    };

    const updated = await testSummaryListRepository.update(id, updateData);
    await testSummaryListRepository.createApprovalHistory(
      id, 
      userId, 
      nextStatus === 'REVIEW_REJECTED' ? 'Review Rejected' : 'Approval Rejected', 
      'Completed'
    );
    return updated;
  }

  async resubmit(id: string, userId: string) {
    const tsl = await this.getById(id);
    if (tsl.summaryReport?.preparedById !== userId) throw new AuthorizationError('Only the preparer can resubmit');
    
    let nextStatus: ReportStatus;
    if (tsl.status === 'REVIEW_REJECTED') nextStatus = 'PENDING_REVIEW';
    else if (tsl.status === 'APPROVAL_REJECTED') nextStatus = 'PENDING_APPROVAL';
    else throw new BadRequestError('Not in a rejected state');
    
    const updateData: Prisma.TestSummaryListUpdateInput = {
      status: nextStatus, 
      lastActionType: 'RESUBMITTED', 
      lastActionAt: new Date()
    };

    const updated = await testSummaryListRepository.update(id, updateData);
    await testSummaryListRepository.createApprovalHistory(id, userId, 'Resubmitted', 'Completed');
    return updated;
  }

  async generate(id: string, userId: string) {
    const tsl = await this.getById(id);
    if (tsl.status !== 'PENDING') throw new BadRequestError('Only PENDING Test Summary Lists can be generated');
    if (tsl.summaryReport?.preparedById !== userId) {
       throw new AuthorizationError('Only the creator can generate the Test Summary List');
    }

    const hasCheckedBy = tsl.checkedById;
    const nextStatus: ReportStatus = hasCheckedBy ? 'PENDING_REVIEW' : 'GENERATED';

    const updateData: Prisma.TestSummaryListUpdateInput = {
      status: nextStatus,
      isDraft: false,
      generatedAt: new Date(),
    };

    const updated = await testSummaryListRepository.update(id, updateData);
    await testSummaryListRepository.createApprovalHistory(id, userId, 'Generated', 'Completed');
    return testSummaryListRepository.findById(id);
  }

  async saveDraft(id: string, userId: string) {
    const tsl = await this.getById(id);
    if (tsl.status !== 'PENDING') throw new BadRequestError('Only PENDING Test Summary Lists can be saved as draft');
    if (tsl.summaryReport?.preparedById !== userId) {
      throw new AuthorizationError('Only the creator can save this Test Summary List as draft');
    }
    return testSummaryListRepository.update(id, { isDraft: true });
  }

  async getDrafts(userId: string) {
    return testSummaryListRepository.findDraftsByUserId(userId);
  }

  async deleteDraft(id: string, userId: string) {
    const tsl = await this.getById(id);
    if (!tsl.isDraft) throw new BadRequestError('Cannot delete a generated list as draft');
    if (tsl.summaryReport?.preparedById !== userId) throw new AuthorizationError('Only the creator can delete the draft');
    await testSummaryListRepository.deleteDraft(id);
  }

  async delete(id: string, userId: string) {
    const tsl = await this.getById(id);
    if (tsl.summaryReport?.preparedById && tsl.summaryReport.preparedById !== userId) throw new AuthorizationError('Only the creator can delete the list');

    // Reset the Test Summary List in place — do NOT touch the parent Summary Report
    await testSummaryListRepository.update(id, {
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

export const testSummaryListService = new TestSummaryListService();
