-- CreateEnum
CREATE TYPE "ReportType" AS ENUM ('REPORT_FORMAT', 'SUMMARY_FORMAT');

-- AlterTable
ALTER TABLE "reports" ADD COLUMN "projectId" UUID NOT NULL DEFAULT '00000000-0000-0000-0000-000000000000';
ALTER TABLE "reports" ADD COLUMN "type" "ReportType" NOT NULL DEFAULT 'REPORT_FORMAT';

-- Remove defaults (they were only for migration)
ALTER TABLE "reports" ALTER COLUMN "projectId" DROP DEFAULT;
ALTER TABLE "reports" ALTER COLUMN "type" DROP DEFAULT;

-- CreateIndex
CREATE UNIQUE INDEX "reports_projectId_type_key" ON "reports"("projectId", "type");

-- CreateIndex
CREATE INDEX "reports_projectId_idx" ON "reports"("projectId");

-- AddForeignKey
ALTER TABLE "reports" ADD CONSTRAINT "reports_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "projects"("id") ON DELETE CASCADE ON UPDATE CASCADE;
