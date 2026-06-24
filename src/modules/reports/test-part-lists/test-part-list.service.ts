import { testPartListRepository } from './test-part-list.repository';
import { NotFoundError } from '../../../shared/utils/errors/not-found-error';
import { AuthorizationError } from '../../../shared/utils/errors/authorization-error';
import { BadRequestError } from '../../../shared/utils/errors/bad-request-error';
import type { ReportStatus } from '../../../shared/types/reports.types';
import type { UpdateTestPartListBody } from './test-part-list.types';

export class TestPartListService {
  async getById(id: string) {
    const tpl = await testPartListRepository.findById(id);
    if (!tpl) throw new NotFoundError('Test Part List');
    return tpl;
  }

  async getByPartReportId(partReportId: string) {
    const tpl = await testPartListRepository.findByPartReportId(partReportId);
    if (!tpl) throw new NotFoundError('Test Part List');
    return tpl;
  }

  async update(id: string, data: UpdateTestPartListBody, userId: string) {
    const current = await this.getById(id);
    const updateData: Record<string, any> = {};

    if (data.formData !== undefined) {
      updateData.formData = data.formData;
    }
    if (data.checkedByName !== undefined) updateData.checkedByName = data.checkedByName;
    if (data.approvedByName !== undefined) updateData.approvedByName = data.approvedByName;

    if (data.checkedById !== undefined) {
      const cid = data.checkedById || null;
      updateData.checkedById = cid;
      if (cid && (current.status === 'PENDING' || current.status === 'GENERATED')) updateData.status = 'PENDING_REVIEW';
      else if (!cid && current.status === 'PENDING_REVIEW') updateData.status = 'PENDING';
    }

    if (data.approvedById !== undefined) {
      const aid = data.approvedById || null;
      updateData.approvedById = aid;
      if (aid && current.status === 'REVIEWED') updateData.status = 'PENDING_APPROVAL';
      else if (!aid && current.status === 'PENDING_APPROVAL') updateData.status = 'REVIEWED';
    }

    return testPartListRepository.update(id, updateData);
  }

  async review(id: string, userId: string) {
    const tpl = await this.getById(id);
    if (tpl.status !== 'PENDING_REVIEW') throw new BadRequestError('Not pending review');
    if (tpl.checkedById !== userId) throw new AuthorizationError('Not authorized to review');
    
    const nextStatus: ReportStatus = tpl.approvedById ? 'PENDING_APPROVAL' : 'REVIEWED';
    const updateData: Record<string, any> = {
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
    if (tpl.status !== 'PENDING_APPROVAL') throw new BadRequestError('Must be reviewed before approval');
    if (tpl.approvedById !== userId) throw new AuthorizationError('Not authorized to approve');
    
    const updateData: Record<string, any> = {
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
      if (tpl.checkedById !== userId) throw new AuthorizationError('Not authorized');
      nextStatus = 'REVIEW_REJECTED';
      stage = 'REVIEW';
    } else if (tpl.status === 'PENDING_APPROVAL') {
      if (tpl.approvedById !== userId) throw new AuthorizationError('Not authorized');
      nextStatus = 'APPROVAL_REJECTED';
      stage = 'APPROVAL';
    } else {
      throw new BadRequestError('Not pending review or approval');
    }

    const existingHistory = Array.isArray(tpl.rejectionHistory) ? [...tpl.rejectionHistory] : [];
    const rejectionHistory = [...existingHistory, { rejectedBy: userName, stage, remark, rejectedAt: new Date().toISOString() }];
    
    const updateData: Record<string, any> = {
      status: nextStatus, 
      lastActionBy: userName, 
      lastActionType: nextStatus, 
      lastActionAt: new Date(), 
      rejectionHistory
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
    if (tpl.partReport?.createdById !== userId) throw new AuthorizationError('Only the creator can resubmit');
    
    let nextStatus: ReportStatus;
    if (tpl.status === 'REVIEW_REJECTED') nextStatus = 'PENDING_REVIEW';
    else if (tpl.status === 'APPROVAL_REJECTED') nextStatus = 'PENDING_APPROVAL';
    else throw new BadRequestError('Not in a rejected state');
    
    const updateData: Record<string, any> = {
      status: nextStatus, 
      lastActionType: 'RESUBMITTED', 
      lastActionAt: new Date()
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

    const updateData: Record<string, any> = {
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
    if (tpl.partReport?.createdById && tpl.partReport.createdById !== userId) throw new AuthorizationError('Only the creator can delete the list');

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
      rejectionHistory: [],
      checkedById: null,
      approvedById: null,
    });
  }
}

export const testPartListService = new TestPartListService();
