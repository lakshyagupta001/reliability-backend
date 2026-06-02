import { prisma } from '../../prisma/prisma.client';

export class ReportRepository {
  protected readonly db = prisma.generatedReport;
}

export const reportRepository = new ReportRepository();
