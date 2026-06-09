-- Migration Script: Backfill foreign keys from enum values
-- Uses Prisma's camelCase column naming

BEGIN;

-- ============================================================================
-- STEP 1: Seed master data (ignore if already exists)
-- ============================================================================

-- Seed categories
INSERT INTO categories (id, name, code, description, "isActive", "createdAt", "updatedAt")
VALUES
  ('a1b2c3d4-e5f6-7890-abcd-ef1234567801', 'RAC', 'RAC', 'Room Air Conditioners', true, NOW(), NOW()),
  ('a1b2c3d4-e5f6-7890-abcd-ef1234567802', 'CAG', 'CAG', 'Commercial Air Conditioning Group', true, NOW(), NOW())
ON CONFLICT (code) DO NOTHING;

-- Seed subcategories
INSERT INTO subcategories (id, "categoryId", name, code, description, "isActive", "createdAt", "updatedAt")
VALUES
  ('b2c3d4e5-f6a7-8901-bcde-f12345678901', 'a1b2c3d4-e5f6-7890-abcd-ef1234567801', 'HP', 'HP', 'Heat Pump', true, NOW(), NOW()),
  ('b2c3d4e5-f6a7-8901-bcde-f12345678902', 'a1b2c3d4-e5f6-7890-abcd-ef1234567801', 'SRICITY', 'SRICITY', 'Smart Inverter Technology', true, NOW(), NOW()),
  ('b2c3d4e5-f6a7-8901-bcde-f12345678903', 'a1b2c3d4-e5f6-7890-abcd-ef1234567802', 'VRF', 'VRF', 'Variable Refrigerant Flow', true, NOW(), NOW()),
  ('b2c3d4e5-f6a7-8901-bcde-f12345678904', 'a1b2c3d4-e5f6-7890-abcd-ef1234567802', 'DUCTED', 'DUCTED', 'Ducted Air Systems', true, NOW(), NOW()),
  ('b2c3d4e5-f6a7-8901-bcde-f12345678905', 'a1b2c3d4-e5f6-7890-abcd-ef1234567802', 'IBG', 'IBG', 'Industrial Batch Galleria', true, NOW(), NOW()),
  ('b2c3d4e5-f6a7-8901-bcde-f12345678906', 'a1b2c3d4-e5f6-7890-abcd-ef1234567802', 'CHILLERS', 'CHILLERS', 'Chiller Systems', true, NOW(), NOW())
ON CONFLICT (code) DO NOTHING;

-- Seed project types
INSERT INTO project_types (id, "subcategoryId", name, code, description, "isActive", "createdAt", "updatedAt")
VALUES
  ('c3d4e5f6-a7b8-9012-cdef-123456789001', 'b2c3d4e5-f6a7-8901-bcde-f12345678901', 'ODU', 'ODU', 'Outdoor Unit', true, NOW(), NOW()),
  ('c3d4e5f6-a7b8-9012-cdef-123456789002', 'b2c3d4e5-f6a7-8901-bcde-f12345678901', 'IDU', 'IDU', 'Indoor Unit', true, NOW(), NOW()),
  ('c3d4e5f6-a7b8-9012-cdef-123456789003', 'b2c3d4e5-f6a7-8901-bcde-f12345678902', 'ODU', 'ODU', 'Outdoor Unit', true, NOW(), NOW()),
  ('c3d4e5f6-a7b8-9012-cdef-123456789004', 'b2c3d4e5-f6a7-8901-bcde-f12345678902', 'IDU', 'IDU', 'Indoor Unit', true, NOW(), NOW()),
  ('c3d4e5f6-a7b8-9012-cdef-123456789005', 'b2c3d4e5-f6a7-8901-bcde-f12345678902', 'DRIVE', 'DRIVE', 'Drive Controller', true, NOW(), NOW()),
  ('c3d4e5f6-a7b8-9012-cdef-123456789006', 'b2c3d4e5-f6a7-8901-bcde-f12345678903', 'ODU', 'ODU', 'Outdoor Unit', true, NOW(), NOW()),
  ('c3d4e5f6-a7b8-9012-cdef-123456789007', 'b2c3d4e5-f6a7-8901-bcde-f12345678903', 'IDU', 'IDU', 'Indoor Unit', true, NOW(), NOW()),
  ('c3d4e5f6-a7b8-9012-cdef-123456789008', 'b2c3d4e5-f6a7-8901-bcde-f12345678903', 'DRIVE', 'DRIVE', 'Drive Controller', true, NOW(), NOW()),
  ('c3d4e5f6-a7b8-9012-cdef-123456789009', 'b2c3d4e5-f6a7-8901-bcde-f12345678903', 'COMPONENT', 'COMPONENT', 'Component', true, NOW(), NOW()),
  ('c3d4e5f6-a7b8-9012-cdef-123456789010', 'b2c3d4e5-f6a7-8901-bcde-f12345678904', 'ODU', 'ODU', 'Outdoor Unit', true, NOW(), NOW()),
  ('c3d4e5f6-a7b8-9012-cdef-123456789011', 'b2c3d4e5-f6a7-8901-bcde-f12345678904', 'IDU', 'IDU', 'Indoor Unit', true, NOW(), NOW()),
  ('c3d4e5f6-a7b8-9012-cdef-123456789012', 'b2c3d4e5-f6a7-8901-bcde-f12345678905', 'ODU', 'ODU', 'Outdoor Unit', true, NOW(), NOW()),
  ('c3d4e5f6-a7b8-9012-cdef-123456789013', 'b2c3d4e5-f6a7-8901-bcde-f12345678905', 'IDU', 'IDU', 'Indoor Unit', true, NOW(), NOW()),
  ('c3d4e5f6-a7b8-9012-cdef-123456789014', 'b2c3d4e5-f6a7-8901-bcde-f12345678906', 'ODU', 'ODU', 'Outdoor Unit', true, NOW(), NOW()),
  ('c3d4e5f6-a7b8-9012-cdef-123456789015', 'b2c3d4e5-f6a7-8901-bcde-f12345678906', 'IDU', 'IDU', 'Indoor Unit', true, NOW(), NOW())
ON CONFLICT (code) DO NOTHING;

-- Seed status master
INSERT INTO status_master (id, code, "displayName", color, "isActive", "isSystem", "createdAt", "updatedAt")
VALUES
  ('d4e5f6a7-b8c9-0123-def0-234567890001', 'NOT_STARTED', 'Not Started', '#6B7280', true, true, NOW(), NOW()),
  ('d4e5f6a7-b8c9-0123-def0-234567890002', 'ONGOING', 'Ongoing', '#3B82F6', true, true, NOW(), NOW()),
  ('d4e5f6a7-b8c9-0123-def0-234567890003', 'COMPLETED', 'Completed', '#22C55E', true, true, NOW(), NOW()),
  ('d4e5f6a7-b8c9-0123-def0-234567890004', 'ON_HOLD', 'On Hold', '#F59E0B', true, true, NOW(), NOW()),
  ('d4e5f6a7-b8c9-0123-def0-234567890005', 'DROPPED', 'Dropped', '#EF4444', true, true, NOW(), NOW())
ON CONFLICT (code) DO NOTHING;

-- ============================================================================
-- STEP 2: Backfill foreign keys from existing enum values
-- ============================================================================

-- Update projects with category_id (RAC or CAG)
UPDATE projects p SET "categoryId" = c.id
FROM categories c
WHERE c.code = p.category::text AND p."categoryId" IS NULL;

-- Update projects with subcategory_id
UPDATE projects p SET "subcategoryId" = s.id
FROM subcategories s
WHERE s.code = p.subcategory::text AND p."subcategoryId" IS NULL;

-- Update projects with type_id (need to match by looking up the correct type based on subcategory)
UPDATE projects p
SET "typeId" = (
  SELECT t.id FROM project_types t
  WHERE t.code = p.type::text
  AND t."subcategoryId" = p."subcategoryId"
  LIMIT 1
)
WHERE p."typeId" IS NULL;

-- Update projects with status_id
UPDATE projects p SET "statusId" = s.id
FROM status_master s
WHERE s.code = p.status::text AND p."statusId" IS NULL;

-- Update project_documents with original_name (copy from file_name if not set)
UPDATE project_documents SET "originalName" = "fileName" WHERE "originalName" IS NULL;

-- ============================================================================
-- STEP 3: Create indexes for new columns (ignore if already exist)
-- ============================================================================

CREATE INDEX IF NOT EXISTS "idx_projects_categoryId" ON projects("categoryId");
CREATE INDEX IF NOT EXISTS "idx_projects_subcategoryId" ON projects("subcategoryId");
CREATE INDEX IF NOT EXISTS "idx_projects_typeId" ON projects("typeId");
CREATE INDEX IF NOT EXISTS "idx_projects_statusId" ON projects("statusId");
CREATE INDEX IF NOT EXISTS "idx_subcategories_categoryId" ON subcategories("categoryId");
CREATE INDEX IF NOT EXISTS "idx_project_types_subcategoryId" ON project_types("subcategoryId");
CREATE INDEX IF NOT EXISTS "idx_project_status_history_projectId" ON project_status_history("projectId");
CREATE INDEX IF NOT EXISTS "idx_project_status_history_statusId" ON project_status_history("statusId");

-- ============================================================================
-- STEP 4: Add NOT NULL constraints (ignore errors if already set)
-- ============================================================================

DO $$
BEGIN
  ALTER TABLE projects ALTER COLUMN "categoryId" SET NOT NULL;
EXCEPTION WHEN others THEN
  RAISE NOTICE 'categoryId NOT NULL already set or error: %', SQLERRM;
END;
$$;

DO $$
BEGIN
  ALTER TABLE projects ALTER COLUMN "subcategoryId" SET NOT NULL;
EXCEPTION WHEN others THEN
  RAISE NOTICE 'subcategoryId NOT NULL already set or error: %', SQLERRM;
END;
$$;

DO $$
BEGIN
  ALTER TABLE projects ALTER COLUMN "typeId" SET NOT NULL;
EXCEPTION WHEN others THEN
  RAISE NOTICE 'typeId NOT NULL already set or error: %', SQLERRM;
END;
$$;

DO $$
BEGIN
  ALTER TABLE projects ALTER COLUMN "statusId" SET NOT NULL;
EXCEPTION WHEN others THEN
  RAISE NOTICE 'statusId NOT NULL already set or error: %', SQLERRM;
END;
$$;

DO $$
BEGIN
  ALTER TABLE project_documents ALTER COLUMN "originalName" SET NOT NULL;
EXCEPTION WHEN others THEN
  RAISE NOTICE 'originalName NOT NULL already set or error: %', SQLERRM;
END;
$$;

COMMIT;