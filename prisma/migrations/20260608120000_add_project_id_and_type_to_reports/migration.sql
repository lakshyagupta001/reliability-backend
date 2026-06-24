-- CreateEnum
CREATE TYPE "ReportType" AS ENUM ('PART_REPORT', 'SUMMARY_REPORT', 'TEST_LIST');

-- DropIndex
DROP INDEX "reports_format_idx";

-- AlterTable
ALTER TABLE "reports" ADD COLUMN "projectId" UUID NOT NULL DEFAULT '00000000-0000-0000-0000-000000000000';
ALTER TABLE "reports" ADD COLUMN "type" "ReportType" NOT NULL DEFAULT 'PART_REPORT';

-- Remove defaults (they were only for migration)
ALTER TABLE "reports" ALTER COLUMN "projectId" DROP DEFAULT;
ALTER TABLE "reports" ALTER COLUMN "type" DROP DEFAULT;

-- CreateIndex
CREATE UNIQUE INDEX "reports_projectId_type_key" ON "reports"("projectId", "type");

-- CreateIndex
CREATE INDEX "reports_projectId_idx" ON "reports"("projectId");

-- AddForeignKey
ALTER TABLE "reports" ADD CONSTRAINT "reports_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "projects"("id") ON DELETE CASCADE ON UPDATE CASCADE;
