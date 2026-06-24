export interface SummaryReportUser {
  firstName: string;
  lastName: string;
  email: string;
}

export interface SummaryReportSummary {
  id: string;
  projectId: string;
  reportStatus: string;
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
  preparedBy?: SummaryReportUser | null;
  checker?: SummaryReportUser | null;
  approver?: SummaryReportUser | null;
  testSummaryList?: { id: string; status: string } | null;
  project?: { id: string; name: string };
}

export interface SummaryReportDetail extends SummaryReportSummary {
  data: Record<string, unknown>;
  lastActionBy?: string | null;
  lastActionType?: string | null;
  lastActionAt?: Date | null;
  rejectionHistory?: any;
}

export interface CreateSummaryReportBody {
  projectId: string;
  data?: Record<string, unknown>;
  formatNumber?: string;
  reportNumber?: string;
  checkedById?: string;
  checkedByName?: string;
  approvedById?: string;
  approvedByName?: string;
  isDraft?: boolean;
}

export interface UpdateSummaryReportBody {
  data?: Record<string, unknown>;
  formatNumber?: string | null;
  reportNumber?: string | null;
  checkedById?: string | null;
  checkedByName?: string | null;
  approvedById?: string | null;
  approvedByName?: string | null;
}
