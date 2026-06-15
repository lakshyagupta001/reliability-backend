import { NotFoundError } from '../../shared/utils/errors/not-found-error';
import { reportRepository } from './report.repository';
import type {
  CreateReportBody,
  UpdateReportBody,
  ListReportsQuery,
  PublicReport,
  ReportDetail,
} from './report.types';
import type { UserRole } from '../users/user.types';

export class ReportService {
  async listReports(query: ListReportsQuery) {
    return reportRepository.findAll(query);
  }

  async getReportById(id: string): Promise<ReportDetail> {
    const report = await reportRepository.findById(id);
    if (!report) throw new NotFoundError('Report');
    return report;
  }

  async createReport(data: CreateReportBody, userId: string, _userRole: UserRole): Promise<ReportDetail> {
    const report = await reportRepository.create(data, userId);
    return report;
  }

  async updateReport(
    id: string,
    data: UpdateReportBody,
    _userId: string,
    _userRole: UserRole,
  ): Promise<ReportDetail> {
    const exists = await reportRepository.exists(id);
    if (!exists) throw new NotFoundError('Report');

    const report = await reportRepository.update(id, data);
    return report;
  }

  async deleteReport(id: string, _userRole: UserRole): Promise<void> {
    const exists = await reportRepository.exists(id);
    if (!exists) throw new NotFoundError('Report');
    await reportRepository.delete(id);
  }

  async getProjectReports(projectId: string): Promise<{
    REPORT_FORMAT: ReportDetail | null;
    SUMMARY_FORMAT: ReportDetail | null;
    CONTROLLER_TEST_LIST: ReportDetail | null;
  }> {
    return reportRepository.findByProjectId(projectId);
  }
}

export const reportService = new ReportService();
