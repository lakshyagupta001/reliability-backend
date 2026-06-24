import { PrismaClient, Prisma } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  try {
    const report = await prisma.partReport.findFirst();
    if (!report) {
      console.log("No report found");
      return;
    }

    console.log("Found report:", report.id);
    
    const resetUpdateData: Prisma.PartReportUpdateInput = {
      reportName: '',
      reportStatus: 'PENDING',
      isDraft: false,
      data: {},
      checkedByName: null,
      approvedByName: null,
      formatNumber: null,
      reportNumber: null,
      lastActionBy: null,
      lastActionType: null,
      generatedAt: null,
      rejectionHistory: Prisma.DbNull,
    };
    
    if (report.preparedById) resetUpdateData.preparedBy = { disconnect: true };
    if (report.checkedById) resetUpdateData.checker = { disconnect: true };
    if (report.approvedById) resetUpdateData.approver = { disconnect: true };

    await prisma.partReport.update({
      where: { id: report.id },
      data: resetUpdateData
    });

    console.log("Update successful!");
  } catch (err) {
    console.error("PRISMA ERROR:", err);
  } finally {
    await prisma.();
  }
}

main();
