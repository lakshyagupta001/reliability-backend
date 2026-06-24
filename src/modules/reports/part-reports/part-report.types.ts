import type { ReportStatus } from '../../../shared/types/reports.types';

export interface PartReportUserSummary {
  firstName: string;
  lastName: string;
  email: string;
}

export interface PartReportListItem {
  id: string;
  projectId: string;
  reportName: string;
  reportStatus: ReportStatus;
  createdById: string;
  preparedById?: string | null;
  checkedById?: string | null;
  checkedByName?: string | null;
  approvedById?: string | null;
  approvedByName?: string | null;
  formatNumber?: string | null;
  reportNumber?: string | null;
  isDraft: boolean;
  generatedAt?: Date | null;
  createdAt: Date;
  updatedAt: Date;
  creator?: PartReportUserSummary;
  preparedBy?: PartReportUserSummary | null;
  checker?: PartReportUserSummary | null;
  approver?: PartReportUserSummary | null;
  testPartList?: {
    id: string;
    status: ReportStatus;
  } | null;
  lastActionBy?: string | null;
  lastActionType?: string | null;
  lastActionAt?: Date | null;
}

export interface PartReportDetail extends PartReportListItem {
  data: Record<string, unknown>;
  rejectionHistory?: any;
}

export interface CreatePartReportBody {
  projectId: string;
  reportName: string;
  data?: Record<string, unknown>;
  formatNumber?: string;
  reportNumber?: string;
  checkedById?: string;
  checkedByName?: string;
  approvedById?: string;
  approvedByName?: string;
  isDraft?: boolean;
}

export interface UpdatePartReportBody {
  reportName?: string;
  data?: Record<string, unknown>;
  formatNumber?: string | null;
  reportNumber?: string | null;
  checkedById?: string | null;
  checkedByName?: string | null;
  approvedById?: string | null;
  approvedByName?: string | null;
}

export interface RejectPartReportBody {
  remark: string;
}

export interface ResubmitPartReportBody {
  remark?: string;
}
