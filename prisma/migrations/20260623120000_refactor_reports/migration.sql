-- ============================================================================
-- Migration: Refactor Reports Module
-- Replaces: reports + report_approval_history tables
-- Creates: part_reports, test_part_lists, summary_reports, test_summary_lists
--          + 4 approval history tables
-- Data migration: existing PART_REPORT → part_reports + test_part_lists
--                 existing SUMMARY_REPORT → summary_reports
--                 existing TEST_LIST → test_part_lists (linked to part_report)
-- ============================================================================

-- Step 1: Create new tables

-- Part Reports
CREATE TABLE "part_reports" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "projectId" UUID NOT NULL,
    "reportName" VARCHAR(255) NOT NULL,
    "reportStatus" "ReportStatus" NOT NULL DEFAULT 'GENERATED',
    "createdById" UUID NOT NULL,
    "preparedById" UUID,
    "checkedById" UUID,
    "checkedByName" VARCHAR(100),
    "approvedById" UUID,
    "approvedByName" VARCHAR(100),
    "data" JSONB NOT NULL DEFAULT '{}',
    "formatNumber" VARCHAR(100),
    "reportNumber" VARCHAR(100),
    "lastActionBy" VARCHAR(100),
    "lastActionType" VARCHAR(50),
    "lastActionAt" TIMESTAMP(3),
    "rejectionHistory" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "part_reports_pkey" PRIMARY KEY ("id")
);

-- Test Part Lists
CREATE TABLE "test_part_lists" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "partReportId" UUID NOT NULL,
    "status" "ReportStatus" NOT NULL DEFAULT 'GENERATED',
    "checkedById" UUID,
    "checkedByName" VARCHAR(100),
    "approvedById" UUID,
    "approvedByName" VARCHAR(100),
    "formData" JSONB NOT NULL DEFAULT '{}',
    "lastActionBy" VARCHAR(100),
    "lastActionType" VARCHAR(50),
    "lastActionAt" TIMESTAMP(3),
    "rejectionHistory" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "test_part_lists_pkey" PRIMARY KEY ("id")
);

-- Summary Reports
CREATE TABLE "summary_reports" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "projectId" UUID NOT NULL,
    "reportStatus" "ReportStatus" NOT NULL DEFAULT 'GENERATED',
    "preparedById" UUID,
    "checkedById" UUID,
    "checkedByName" VARCHAR(100),
    "approvedById" UUID,
    "approvedByName" VARCHAR(100),
    "data" JSONB NOT NULL DEFAULT '{}',
    "formatNumber" VARCHAR(100),
    "reportNumber" VARCHAR(100),
    "lastActionBy" VARCHAR(100),
    "lastActionType" VARCHAR(50),
    "lastActionAt" TIMESTAMP(3),
    "rejectionHistory" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "summary_reports_pkey" PRIMARY KEY ("id")
);

-- Test Summary Lists
CREATE TABLE "test_summary_lists" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "summaryReportId" UUID NOT NULL,
    "status" "ReportStatus" NOT NULL DEFAULT 'GENERATED',
    "checkedById" UUID,
    "checkedByName" VARCHAR(100),
    "approvedById" UUID,
    "approvedByName" VARCHAR(100),
    "formData" JSONB NOT NULL DEFAULT '{}',
    "lastActionBy" VARCHAR(100),
    "lastActionType" VARCHAR(50),
    "lastActionAt" TIMESTAMP(3),
    "rejectionHistory" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "test_summary_lists_pkey" PRIMARY KEY ("id")
);

-- Part Report Approval History
CREATE TABLE "part_report_approval_history" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "partReportId" UUID NOT NULL,
    "userId" UUID NOT NULL,
    "action" VARCHAR(50) NOT NULL,
    "status" VARCHAR(50) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "part_report_approval_history_pkey" PRIMARY KEY ("id")
);

-- Test Part List Approval History
CREATE TABLE "test_part_list_approval_history" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "testPartListId" UUID NOT NULL,
    "userId" UUID NOT NULL,
    "action" VARCHAR(50) NOT NULL,
    "status" VARCHAR(50) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "test_part_list_approval_history_pkey" PRIMARY KEY ("id")
);

-- Summary Report Approval History
CREATE TABLE "summary_report_approval_history" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "summaryReportId" UUID NOT NULL,
    "userId" UUID NOT NULL,
    "action" VARCHAR(50) NOT NULL,
    "status" VARCHAR(50) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "summary_report_approval_history_pkey" PRIMARY KEY ("id")
);

-- Test Summary List Approval History
CREATE TABLE "test_summary_list_approval_history" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "testSummaryListId" UUID NOT NULL,
    "userId" UUID NOT NULL,
    "action" VARCHAR(50) NOT NULL,
    "status" VARCHAR(50) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "test_summary_list_approval_history_pkey" PRIMARY KEY ("id")
);

-- Step 2: Migrate existing data

-- 2a. Migrate PART_REPORT records → part_reports
-- Use the report title as reportName (fallback to 'Part Report')
INSERT INTO "part_reports" (
    "id", "projectId", "reportName", "reportStatus", "createdById",
    "preparedById", "checkedById", "checkedByName", "approvedById", "approvedByName",
    "data", "formatNumber", "reportNumber",
    "lastActionBy", "lastActionType", "lastActionAt", "rejectionHistory",
    "createdAt", "updatedAt"
)
SELECT
    r."id",
    r."projectId",
    COALESCE(r."title", 'Part Report') AS "reportName",
    r."status" AS "reportStatus",
    r."createdBy" AS "createdById",
    r."preparedById",
    r."checkedByUserId" AS "checkedById",
    r."checkedByName",
    r."approvedByUserId" AS "approvedById",
    r."approvedByName",
    r."data",
    r."formatNumber",
    r."reportNumber",
    r."lastActionBy",
    r."lastActionType",
    r."lastActionAt",
    r."rejectionHistory",
    r."createdAt",
    r."updatedAt"
FROM "reports" r
WHERE r."type" = 'PART_REPORT';

-- 2b. Migrate TEST_LIST records → test_part_lists (linked to the part_report for same project)
-- Each TEST_LIST should pair with its project's PART_REPORT
INSERT INTO "test_part_lists" (
    "id", "partReportId", "status", "formData", "createdAt", "updatedAt"
)
SELECT
    tl."id",
    pr."id" AS "partReportId",
    tl."status",
    tl."data" AS "formData",
    tl."createdAt",
    tl."updatedAt"
FROM "reports" tl
JOIN "reports" pr ON pr."projectId" = tl."projectId" AND pr."type" = 'PART_REPORT'
WHERE tl."type" = 'TEST_LIST';

-- For projects that have TEST_LIST but no PART_REPORT, create a placeholder part_report first
-- then link the test_part_list to it
-- (handle orphan test lists)
DO $$
DECLARE
    rec RECORD;
    new_part_report_id UUID;
BEGIN
    FOR rec IN
        SELECT tl.*
        FROM "reports" tl
        WHERE tl."type" = 'TEST_LIST'
          AND NOT EXISTS (
              SELECT 1 FROM "reports" pr
              WHERE pr."projectId" = tl."projectId" AND pr."type" = 'PART_REPORT'
          )
    LOOP
        new_part_report_id := gen_random_uuid();
        INSERT INTO "part_reports" (
            "id", "projectId", "reportName", "reportStatus", "createdById", "data", "createdAt", "updatedAt"
        ) VALUES (
            new_part_report_id,
            rec."projectId",
            'Part Report (Migrated)',
            'GENERATED',
            rec."createdBy",
            '{}',
            rec."createdAt",
            rec."updatedAt"
        );
        INSERT INTO "test_part_lists" (
            "id", "partReportId", "status", "formData", "createdAt", "updatedAt"
        ) VALUES (
            rec."id",
            new_part_report_id,
            rec."status",
            rec."data",
            rec."createdAt",
            rec."updatedAt"
        );
    END LOOP;
END $$;

-- 2c. Migrate SUMMARY_REPORT records → summary_reports
INSERT INTO "summary_reports" (
    "id", "projectId", "reportStatus",
    "preparedById", "checkedById", "checkedByName", "approvedById", "approvedByName",
    "data", "formatNumber", "reportNumber",
    "lastActionBy", "lastActionType", "lastActionAt", "rejectionHistory",
    "createdAt", "updatedAt"
)
SELECT
    r."id",
    r."projectId",
    r."status" AS "reportStatus",
    r."preparedById",
    r."checkedByUserId" AS "checkedById",
    r."checkedByName",
    r."approvedByUserId" AS "approvedById",
    r."approvedByName",
    r."data",
    r."formatNumber",
    r."reportNumber",
    r."lastActionBy",
    r."lastActionType",
    r."lastActionAt",
    r."rejectionHistory",
    r."createdAt",
    r."updatedAt"
FROM "reports" r
WHERE r."type" = 'SUMMARY_REPORT';

-- 2d. Migrate approval history for PART_REPORT → part_report_approval_history
INSERT INTO "part_report_approval_history" ("id", "partReportId", "userId", "action", "status", "createdAt")
SELECT h."id", h."reportId" AS "partReportId", h."userId", h."action", h."status", h."createdAt"
FROM "report_approval_history" h
WHERE EXISTS (
    SELECT 1 FROM "reports" r WHERE r."id" = h."reportId" AND r."type" = 'PART_REPORT'
);

-- 2e. Migrate approval history for SUMMARY_REPORT → summary_report_approval_history
INSERT INTO "summary_report_approval_history" ("id", "summaryReportId", "userId", "action", "status", "createdAt")
SELECT h."id", h."reportId" AS "summaryReportId", h."userId", h."action", h."status", h."createdAt"
FROM "report_approval_history" h
WHERE EXISTS (
    SELECT 1 FROM "reports" r WHERE r."id" = h."reportId" AND r."type" = 'SUMMARY_REPORT'
);

-- 2f. Migrate TEST_LIST approval history → test_part_list_approval_history
-- The test list ID was kept during migration so we can reference it directly
INSERT INTO "test_part_list_approval_history" ("id", "testPartListId", "userId", "action", "status", "createdAt")
SELECT h."id", h."reportId" AS "testPartListId", h."userId", h."action", h."status", h."createdAt"
FROM "report_approval_history" h
WHERE EXISTS (
    SELECT 1 FROM "reports" r WHERE r."id" = h."reportId" AND r."type" = 'TEST_LIST'
)
AND EXISTS (
    SELECT 1 FROM "test_part_lists" tpl WHERE tpl."id" = h."reportId"
);

-- Step 3: Add indexes and constraints

-- Part reports
CREATE INDEX "part_reports_projectId_idx" ON "part_reports"("projectId");
CREATE INDEX "part_reports_createdById_idx" ON "part_reports"("createdById");
CREATE INDEX "part_reports_reportStatus_idx" ON "part_reports"("reportStatus");
CREATE INDEX "part_reports_createdAt_idx" ON "part_reports"("createdAt");

-- Test part lists
CREATE UNIQUE INDEX "test_part_lists_partReportId_key" ON "test_part_lists"("partReportId");
CREATE INDEX "test_part_lists_partReportId_idx" ON "test_part_lists"("partReportId");

-- Part report approval history
CREATE INDEX "part_report_approval_history_partReportId_idx" ON "part_report_approval_history"("partReportId");
CREATE INDEX "part_report_approval_history_userId_idx" ON "part_report_approval_history"("userId");

-- Test part list approval history
CREATE INDEX "test_part_list_approval_history_testPartListId_idx" ON "test_part_list_approval_history"("testPartListId");
CREATE INDEX "test_part_list_approval_history_userId_idx" ON "test_part_list_approval_history"("userId");

-- Summary reports
CREATE UNIQUE INDEX "summary_reports_projectId_key" ON "summary_reports"("projectId");
CREATE INDEX "summary_reports_projectId_idx" ON "summary_reports"("projectId");
CREATE INDEX "summary_reports_reportStatus_idx" ON "summary_reports"("reportStatus");
CREATE INDEX "summary_reports_createdAt_idx" ON "summary_reports"("createdAt");

-- Test summary lists
CREATE UNIQUE INDEX "test_summary_lists_summaryReportId_key" ON "test_summary_lists"("summaryReportId");
CREATE INDEX "test_summary_lists_summaryReportId_idx" ON "test_summary_lists"("summaryReportId");

-- Summary report approval history
CREATE INDEX "summary_report_approval_history_summaryReportId_idx" ON "summary_report_approval_history"("summaryReportId");
CREATE INDEX "summary_report_approval_history_userId_idx" ON "summary_report_approval_history"("userId");

-- Test summary list approval history
CREATE INDEX "test_summary_list_approval_history_testSummaryListId_idx" ON "test_summary_list_approval_history"("testSummaryListId");
CREATE INDEX "test_summary_list_approval_history_userId_idx" ON "test_summary_list_approval_history"("userId");

-- Step 4: Add foreign key constraints

-- Part reports
ALTER TABLE "part_reports" ADD CONSTRAINT "part_reports_projectId_fkey"
    FOREIGN KEY ("projectId") REFERENCES "projects"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "part_reports" ADD CONSTRAINT "part_reports_createdById_fkey"
    FOREIGN KEY ("createdById") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "part_reports" ADD CONSTRAINT "part_reports_preparedById_fkey"
    FOREIGN KEY ("preparedById") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "part_reports" ADD CONSTRAINT "part_reports_checkedById_fkey"
    FOREIGN KEY ("checkedById") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "part_reports" ADD CONSTRAINT "part_reports_approvedById_fkey"
    FOREIGN KEY ("approvedById") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- Test part lists
ALTER TABLE "test_part_lists" ADD CONSTRAINT "test_part_lists_partReportId_fkey"
    FOREIGN KEY ("partReportId") REFERENCES "part_reports"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "test_part_lists" ADD CONSTRAINT "test_part_lists_checkedById_fkey"
    FOREIGN KEY ("checkedById") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "test_part_lists" ADD CONSTRAINT "test_part_lists_approvedById_fkey"
    FOREIGN KEY ("approvedById") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- Part report approval history
ALTER TABLE "part_report_approval_history" ADD CONSTRAINT "part_report_approval_history_partReportId_fkey"
    FOREIGN KEY ("partReportId") REFERENCES "part_reports"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "part_report_approval_history" ADD CONSTRAINT "part_report_approval_history_userId_fkey"
    FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Test part list approval history
ALTER TABLE "test_part_list_approval_history" ADD CONSTRAINT "test_part_list_approval_history_testPartListId_fkey"
    FOREIGN KEY ("testPartListId") REFERENCES "test_part_lists"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "test_part_list_approval_history" ADD CONSTRAINT "test_part_list_approval_history_userId_fkey"
    FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Summary reports
ALTER TABLE "summary_reports" ADD CONSTRAINT "summary_reports_projectId_fkey"
    FOREIGN KEY ("projectId") REFERENCES "projects"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "summary_reports" ADD CONSTRAINT "summary_reports_preparedById_fkey"
    FOREIGN KEY ("preparedById") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "summary_reports" ADD CONSTRAINT "summary_reports_checkedById_fkey"
    FOREIGN KEY ("checkedById") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "summary_reports" ADD CONSTRAINT "summary_reports_approvedById_fkey"
    FOREIGN KEY ("approvedById") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- Test summary lists
ALTER TABLE "test_summary_lists" ADD CONSTRAINT "test_summary_lists_summaryReportId_fkey"
    FOREIGN KEY ("summaryReportId") REFERENCES "summary_reports"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "test_summary_lists" ADD CONSTRAINT "test_summary_lists_checkedById_fkey"
    FOREIGN KEY ("checkedById") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "test_summary_lists" ADD CONSTRAINT "test_summary_lists_approvedById_fkey"
    FOREIGN KEY ("approvedById") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- Summary report approval history
ALTER TABLE "summary_report_approval_history" ADD CONSTRAINT "summary_report_approval_history_summaryReportId_fkey"
    FOREIGN KEY ("summaryReportId") REFERENCES "summary_reports"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "summary_report_approval_history" ADD CONSTRAINT "summary_report_approval_history_userId_fkey"
    FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Test summary list approval history
ALTER TABLE "test_summary_list_approval_history" ADD CONSTRAINT "test_summary_list_approval_history_testSummaryListId_fkey"
    FOREIGN KEY ("testSummaryListId") REFERENCES "test_summary_lists"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "test_summary_list_approval_history" ADD CONSTRAINT "test_summary_list_approval_history_userId_fkey"
    FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Step 5: Drop old tables (data already migrated)
DROP TABLE IF EXISTS "report_approval_history";
DROP TABLE IF EXISTS "reports";

-- Step 6: Drop old ReportType enum (no longer needed)
DROP TYPE IF EXISTS "ReportType";
