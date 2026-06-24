import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  await prisma.$executeRaw`ALTER TABLE "reports" DROP CONSTRAINT IF EXISTS "reports_projectId_type_key"`;
  await prisma.$executeRaw`DROP INDEX IF EXISTS "reports_projectId_type_key"`;
  console.log("Dropped unique constraint");
}
main().catch(console.error).finally(() => prisma.$disconnect());
