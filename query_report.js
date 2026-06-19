const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
async function main() {
  const report = await prisma.report.findFirst({
    where: { type: 'PART_REPORT' },
    select: { id: true, data: true, creator: { select: { firstName: true, lastName: true } } }
  });
  console.log(JSON.stringify(report.data.approvals, null, 2));
  console.log("Creator:", report.creator);
}
main().finally(() => prisma.$disconnect());
