export interface TestPartListUser {
  firstName: string;
  lastName: string;
  email: string;
}

export interface TestPartListDetail {
  id: string;
  partReportId: string;
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
  checker?: TestPartListUser | null;
  approver?: TestPartListUser | null;
  partReport?: {
    id: string;
    projectId: string;
    reportName: string;
    createdById: string;
  };
}

export interface UpdateTestPartListBody {
  formData?: Record<string, unknown>;
  checkedById?: string | null;
  checkedByName?: string | null;
  approvedById?: string | null;
  approvedByName?: string | null;
}
