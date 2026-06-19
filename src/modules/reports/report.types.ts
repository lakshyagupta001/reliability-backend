export interface ReportListItem {
  id: string;
  projectId: string;
  type: string;
  title: string;
  format: string;
  formatNumber?: string;
  reportNumber?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface ReportDetail {
  id: string;
  projectId: string;
  type: string;
  title: string;
  format: string;
  formatNumber?: string;
  reportNumber?: string;
  data: Record<string, unknown>;
  status: 'GENERATED' | 'PENDING_REVIEW' | 'REVIEWED' | 'PENDING_APPROVAL' | 'APPROVED' | 'REVIEW_REJECTED' | 'APPROVAL_REJECTED';
  checkedByUserId?: string | null;
  checkedByName?: string | null;
  approvedByUserId?: string | null;
  approvedByName?: string | null;
  lastActionBy?: string | null;
  lastActionType?: string | null;
  lastActionAt?: Date | null;
  rejectionHistory?: any;
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
  creator?: { firstName: string; lastName: string; email: string };
  checker?: { firstName: string; lastName: string; email: string } | null;
  approver?: { firstName: string; lastName: string; email: string } | null;
}

export interface CreateReportBody {
  projectId: string;
  type: 'PART_REPORT' | 'SUMMARY_REPORT' | 'TEST_LIST';
  title: string;
  format: string;
  formatNumber?: string;
  reportNumber?: string;
  data: Record<string, unknown>;
  checkedByUserId?: string;
  checkedByName?: string;
  approvedByUserId?: string;
  approvedByName?: string;
}

export interface UpdateReportBody {
  title?: string;
  formatNumber?: string;
  reportNumber?: string;
  data?: Record<string, unknown>;
  checkedByUserId?: string | null;
  checkedByName?: string | null;
  approvedByUserId?: string | null;
  approvedByName?: string | null;
}

export interface RejectReportBody {
  remark: string;
}

export interface ListReportsQuery {
  page?: number;
  limit?: number;
  search?: string;
  format?: 'report' | 'summary';
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface PublicReport {
  id: string;
  title: string;
  format: string;
  formatNumber: string | null;
  reportNumber: string | null;
  createdAt: string;
  updatedAt: string;
}
