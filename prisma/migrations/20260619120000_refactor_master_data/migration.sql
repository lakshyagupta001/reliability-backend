-- ============================================================================
-- Migration: Refactor Master Data
-- Replaces the three fixed tables (categories, subcategories, types) with a
-- single self-referencing master_data table that supports dynamic hierarchy
-- depths (1-level, 2-level, or 3-level).
--
-- Also makes projects.subcategory_id and projects.type_id nullable so that
-- projects in a 2-level hierarchy (e.g. CAG → VRF) can store typeId = NULL.
-- ============================================================================

-- Step 1: Create the MasterDataLevel enum
CREATE TYPE "MasterDataLevel" AS ENUM ('CATEGORY', 'SUBCATEGORY', 'TYPE');

-- Step 2: Create the self-referencing master_data table
CREATE TABLE "master_data" (
    "id"         UUID         NOT NULL DEFAULT gen_random_uuid(),
    "name"       VARCHAR(100) NOT NULL,
    "level"      "MasterDataLevel" NOT NULL,
    "parentId"   UUID,
    "isActive"   BOOLEAN      NOT NULL DEFAULT true,
    "createdAt"  TIMESTAMPTZ  NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt"  TIMESTAMPTZ  NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "master_data_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "master_data_parentId_fkey"
        FOREIGN KEY ("parentId") REFERENCES "master_data"("id")
        ON DELETE RESTRICT ON UPDATE CASCADE
);

CREATE INDEX "master_data_parentId_idx" ON "master_data"("parentId");
CREATE INDEX "master_data_level_idx" ON "master_data"("level");
CREATE INDEX "master_data_isActive_idx" ON "master_data"("isActive");

-- Step 3: Drop old FK constraints on projects that reference the old tables
ALTER TABLE "projects" DROP CONSTRAINT IF EXISTS "projects_categoryId_fkey";
ALTER TABLE "projects" DROP CONSTRAINT IF EXISTS "projects_subcategoryId_fkey";
ALTER TABLE "projects" DROP CONSTRAINT IF EXISTS "projects_typeId_fkey";

-- Step 4: Make subcategoryId and typeId nullable (they may be null for 2-level hierarchies)
ALTER TABLE "projects" ALTER COLUMN "subcategoryId" DROP NOT NULL;
ALTER TABLE "projects" ALTER COLUMN "typeId" DROP NOT NULL;

-- Step 5: Clear existing project data (local dev seed data — no production data exists)
DELETE FROM "projects";

-- Step 6: Drop old master data tables (after clearing project FKs)
DROP TABLE IF EXISTS "types";
DROP TABLE IF EXISTS "subcategories";
DROP TABLE IF EXISTS "categories";

-- Step 7: Add new FK constraints from projects to master_data
ALTER TABLE "projects"
    ADD CONSTRAINT "projects_categoryId_fkey"
    FOREIGN KEY ("categoryId") REFERENCES "master_data"("id")
    ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "projects"
    ADD CONSTRAINT "projects_subcategoryId_fkey"
    FOREIGN KEY ("subcategoryId") REFERENCES "master_data"("id")
    ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "projects"
    ADD CONSTRAINT "projects_typeId_fkey"
    FOREIGN KEY ("typeId") REFERENCES "master_data"("id")
    ON DELETE RESTRICT ON UPDATE CASCADE;
