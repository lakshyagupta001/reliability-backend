import { prisma } from '../../prisma/prisma.client';
import { ReportStatus } from '@prisma/client';

export const reportsDashboardService = {
  async getActiveRequests(userId: string) {
    const partReports = await prisma.partReport.findMany({
      where: {
        isDraft: false,
        OR: [
          { reportStatus: 'PENDING_REVIEW', checkedById: userId },
          { reportStatus: 'PENDING_APPROVAL', approvedById: userId },
          { reportStatus: { in: ['REVIEW_REJECTED', 'APPROVAL_REJECTED'] }, createdById: userId }
        ]
      },
      include: {
        project: { select: { name: true } },
        creator: { select: { firstName: true, lastName: true } },
        checker: { select: { firstName: true, lastName: true } },
        approver: { select: { firstName: true, lastName: true } }
      }
    });

    const summaryReports = await prisma.summaryReport.findMany({
      where: {
        isDraft: false,
        OR: [
          { reportStatus: 'PENDING_REVIEW', checkedById: userId },
          { reportStatus: 'PENDING_APPROVAL', approvedById: userId },
          { reportStatus: { in: ['REVIEW_REJECTED', 'APPROVAL_REJECTED'] }, preparedById: userId }
        ]
      },
      include: {
        project: { select: { name: true } },
        preparedBy: { select: { firstName: true, lastName: true } },
        checker: { select: { firstName: true, lastName: true } },
        approver: { select: { firstName: true, lastName: true } }
      }
    });

    const testPartLists = await prisma.testPartList.findMany({
      where: {
        isDraft: false,
        OR: [
          { status: 'PENDING_REVIEW', checkedById: userId },
          { status: 'PENDING_APPROVAL', approvedById: userId },
          { status: { in: ['REVIEW_REJECTED', 'APPROVAL_REJECTED'] }, partReport: { createdById: userId } }
        ]
      },
      include: {
        partReport: {
          include: {
            project: { select: { name: true } },
            creator: { select: { firstName: true, lastName: true } }
          }
        },
        checker: { select: { firstName: true, lastName: true } },
        approver: { select: { firstName: true, lastName: true } }
      }
    });

    const testSummaryLists = await prisma.testSummaryList.findMany({
      where: {
        isDraft: false,
        OR: [
          { status: 'PENDING_REVIEW', checkedById: userId },
          { status: 'PENDING_APPROVAL', approvedById: userId },
          { status: { in: ['REVIEW_REJECTED', 'APPROVAL_REJECTED'] }, summaryReport: { preparedById: userId } }
        ]
      },
      include: {
        summaryReport: {
          include: {
            project: { select: { name: true } },
            preparedBy: { select: { firstName: true, lastName: true } }
          }
        },
        checker: { select: { firstName: true, lastName: true } },
        approver: { select: { firstName: true, lastName: true } }
      }
    });

    const mappedPartReports = partReports.map((r: any) => ({
      ...r,
      type: 'PART_REPORT',
    }));

    const mappedSummaryReports = summaryReports.map((r: any) => ({
      ...r,
      type: 'SUMMARY_REPORT',
      creator: r.preparedBy,
      createdById: r.preparedById
    }));

    const mappedTestPartLists = testPartLists.map((r: any) => ({
      ...r,
      type: 'TEST_PART_LIST',
      project: r.partReport?.project,
      creator: r.partReport?.creator,
      createdById: r.partReport?.createdById
    }));

    const mappedTestSummaryLists = testSummaryLists.map((r: any) => ({
      ...r,
      type: 'TEST_SUMMARY_LIST',
      project: r.summaryReport?.project,
      creator: r.summaryReport?.preparedBy,
      createdById: r.summaryReport?.preparedById
    }));

    return [...mappedPartReports, ...mappedSummaryReports, ...mappedTestPartLists, ...mappedTestSummaryLists]
      .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
  },

  async getApprovals(userId: string) {
    const statuses: ReportStatus[] = ['REVIEWED', 'PENDING_APPROVAL', 'APPROVED', 'REVIEW_REJECTED', 'APPROVAL_REJECTED'];
    
    const partReports = await prisma.partReport.findMany({
      where: {
        isDraft: false,
        reportStatus: { in: statuses },
        OR: [
          { checkedById: userId },
          { approvedById: userId }
        ]
      },
      include: {
        project: { select: { name: true } },
        creator: { select: { firstName: true, lastName: true } },
        checker: { select: { firstName: true, lastName: true } },
        approver: { select: { firstName: true, lastName: true } }
      }
    });

    const summaryReports = await prisma.summaryReport.findMany({
      where: {
        isDraft: false,
        reportStatus: { in: statuses },
        OR: [
          { checkedById: userId },
          { approvedById: userId }
        ]
      },
      include: {
        project: { select: { name: true } },
        preparedBy: { select: { firstName: true, lastName: true } },
        checker: { select: { firstName: true, lastName: true } },
        approver: { select: { firstName: true, lastName: true } }
      }
    });

    const testPartLists = await prisma.testPartList.findMany({
      where: {
        isDraft: false,
        status: { in: statuses },
        OR: [
          { checkedById: userId },
          { approvedById: userId }
        ]
      },
      include: {
        partReport: {
          include: {
            project: { select: { name: true } },
            creator: { select: { firstName: true, lastName: true } }
          }
        },
        checker: { select: { firstName: true, lastName: true } },
        approver: { select: { firstName: true, lastName: true } }
      }
    });

    const testSummaryLists = await prisma.testSummaryList.findMany({
      where: {
        isDraft: false,
        status: { in: statuses },
        OR: [
          { checkedById: userId },
          { approvedById: userId }
        ]
      },
      include: {
        summaryReport: {
          include: {
            project: { select: { name: true } },
            preparedBy: { select: { firstName: true, lastName: true } }
          }
        },
        checker: { select: { firstName: true, lastName: true } },
        approver: { select: { firstName: true, lastName: true } }
      }
    });

    const mappedPartReports = partReports.map((r: any) => ({ ...r, type: 'PART_REPORT' }));
    const mappedSummaryReports = summaryReports.map((r: any) => ({ ...r, type: 'SUMMARY_REPORT', creator: r.preparedBy, createdById: r.preparedById }));
    const mappedTestPartLists = testPartLists.map((r: any) => ({ ...r, type: 'TEST_PART_LIST', project: r.partReport?.project, creator: r.partReport?.creator, createdById: r.partReport?.createdById }));
    const mappedTestSummaryLists = testSummaryLists.map((r: any) => ({ ...r, type: 'TEST_SUMMARY_LIST', project: r.summaryReport?.project, creator: r.summaryReport?.preparedBy, createdById: r.summaryReport?.preparedById }));

    return [...mappedPartReports, ...mappedSummaryReports, ...mappedTestPartLists, ...mappedTestSummaryLists]
      .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
  },

  async getDrafts(userId: string) {
    const partReports = await prisma.partReport.findMany({
      where: { isDraft: true, createdById: userId },
      include: {
        project: { select: { id: true, name: true } },
        creator: { select: { firstName: true, lastName: true } }
      }
    });

    const summaryReports = await prisma.summaryReport.findMany({
      where: { isDraft: true, preparedById: userId },
      include: {
        project: { select: { id: true, name: true } },
        preparedBy: { select: { firstName: true, lastName: true } }
      }
    });

    const testPartLists = await prisma.testPartList.findMany({
      where: { isDraft: true, partReport: { createdById: userId } },
      include: {
        partReport: {
          include: {
            project: { select: { id: true, name: true } },
            creator: { select: { firstName: true, lastName: true } }
          }
        }
      }
    });

    const testSummaryLists = await prisma.testSummaryList.findMany({
      where: { isDraft: true, summaryReport: { preparedById: userId } },
      include: {
        summaryReport: {
          include: {
            project: { select: { id: true, name: true } },
            preparedBy: { select: { firstName: true, lastName: true } }
          }
        }
      }
    });

    const mappedPartReports = partReports.map((r: any) => ({ ...r, type: 'PART_REPORT' }));
    const mappedSummaryReports = summaryReports.map((r: any) => ({ ...r, type: 'SUMMARY_REPORT', creator: r.preparedBy, createdById: r.preparedById }));
    const mappedTestPartLists = testPartLists.map((r: any) => ({ ...r, type: 'TEST_PART_LIST', project: r.partReport?.project, creator: r.partReport?.creator, createdById: r.partReport?.createdById }));
    const mappedTestSummaryLists = testSummaryLists.map((r: any) => ({ ...r, type: 'TEST_SUMMARY_LIST', project: r.summaryReport?.project, creator: r.summaryReport?.preparedBy, createdById: r.summaryReport?.preparedById }));

    return [...mappedPartReports, ...mappedSummaryReports, ...mappedTestPartLists, ...mappedTestSummaryLists]
      .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
  }
};
