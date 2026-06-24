export interface TestSummaryListUser {
  firstName: string;
  lastName: string;
  email: string;
}

export interface TestSummaryListDetail {
  id: string;
  summaryReportId: string;
  status: string;
  isDraft: boolean;
  checkedById?: string | null;
  checkedByName?: string | null;
  approvedById?: string | null;
  approvedByName?: string | null;
  formData: Record<string, unknown>;
  lastActionBy?: string | null;
  lastActionType?: string | null;
  lastActionAt?: Date | null;
  rejectionHistory?: any;
  createdAt: Date;
  updatedAt: Date;
  checker?: TestSummaryListUser | null;
  approver?: TestSummaryListUser | null;
  summaryReport?: {
    id: string;
    projectId: string;
    preparedById: string | null;
  };
}

export interface UpdateTestSummaryListBody {
  formData?: Record<string, unknown>;
  checkedById?: string | null;
  checkedByName?: string | null;
  approvedById?: string | null;
  approvedByName?: string | null;
}
