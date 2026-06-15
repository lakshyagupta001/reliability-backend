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
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateReportBody {
  projectId: string;
  type: 'REPORT_FORMAT' | 'SUMMARY_FORMAT' | 'CONTROLLER_TEST_LIST';
  title: string;
  format: string;
  formatNumber?: string;
  reportNumber?: string;
  data: Record<string, unknown>;
}

export interface UpdateReportBody {
  title?: string;
  formatNumber?: string;
  reportNumber?: string;
  data?: Record<string, unknown>;
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
