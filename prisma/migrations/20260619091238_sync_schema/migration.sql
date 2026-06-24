-- CreateEnum
CREATE TYPE "ReportStatus" AS ENUM ('GENERATED', 'PENDING_REVIEW', 'REVIEWED', 'PENDING_APPROVAL', 'APPROVED', 'REVIEW_REJECTED', 'APPROVAL_REJECTED');

-- AlterTable
ALTER TABLE "reports" ADD COLUMN     "approvedByName" VARCHAR(100),
ADD COLUMN     "approvedByUserId" UUID,
ADD COLUMN     "checkedByName" VARCHAR(100),
ADD COLUMN     "checkedByUserId" UUID,
ADD COLUMN     "lastActionAt" TIMESTAMP(3),
ADD COLUMN     "lastActionBy" VARCHAR(100),
ADD COLUMN     "lastActionType" VARCHAR(50),
ADD COLUMN     "rejectionHistory" JSONB,
ADD COLUMN     "status" "ReportStatus" NOT NULL DEFAULT 'GENERATED';

-- CreateTable
CREATE TABLE "report_approval_history" (
    "id" UUID NOT NULL,
    "reportId" UUID NOT NULL,
    "userId" UUID NOT NULL,
    "action" VARCHAR(50) NOT NULL,
    "status" VARCHAR(50) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "report_approval_history_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "report_approval_history_reportId_idx" ON "report_approval_history"("reportId");

-- CreateIndex
CREATE INDEX "report_approval_history_userId_idx" ON "report_approval_history"("userId");

-- CreateIndex
CREATE INDEX "reports_format_idx" ON "reports"("format");

-- AddForeignKey
ALTER TABLE "reports" ADD CONSTRAINT "reports_checkedByUserId_fkey" FOREIGN KEY ("checkedByUserId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "reports" ADD CONSTRAINT "reports_approvedByUserId_fkey" FOREIGN KEY ("approvedByUserId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "report_approval_history" ADD CONSTRAINT "report_approval_history_reportId_fkey" FOREIGN KEY ("reportId") REFERENCES "reports"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "report_approval_history" ADD CONSTRAINT "report_approval_history_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
