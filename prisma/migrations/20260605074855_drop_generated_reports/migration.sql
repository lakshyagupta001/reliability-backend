/*
  Warnings:

  - You are about to drop the `generated_reports` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "generated_reports" DROP CONSTRAINT "generated_reports_generatedBy_fkey";

-- DropForeignKey
ALTER TABLE "generated_reports" DROP CONSTRAINT "generated_reports_projectId_fkey";

-- DropTable
DROP TABLE "generated_reports";

-- DropEnum
DROP TYPE "ReportStatus";
