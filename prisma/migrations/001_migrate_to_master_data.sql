-- Migration Script: Transition from enums to master data tables
-- This script:
-- 1. Creates new tables with nullable columns
-- 2. Seeds master data
-- 3. Backfills foreign keys
-- 4. Adds NOT NULL constraints

BEGIN;

-- ============================================================================
-- STEP 1: Create new tables with nullable columns
-- ============================================================================

-- Create categories table
CREATE TABLE IF NOT EXISTS categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(100) NOT NULL,
  code VARCHAR(50) UNIQUE NOT NULL,
  description VARCHAR(500),
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create subcategories table
CREATE TABLE IF NOT EXISTS subcategories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  category_id UUID NOT NULL,
  name VARCHAR(100) NOT NULL,
  code VARCHAR(50) UNIQUE NOT NULL,
  description VARCHAR(500),
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT fk_subcategory_category FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE RESTRICT
);

-- Create project_types table
CREATE TABLE IF NOT EXISTS project_types (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  subcategory_id UUID NOT NULL,
  name VARCHAR(100) NOT NULL,
  code VARCHAR(50) UNIQUE NOT NULL,
  description VARCHAR(500),
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT fk_type_subcategory FOREIGN KEY (subcategory_id) REFERENCES subcategories(id) ON DELETE RESTRICT
);

-- Create status_master table
CREATE TABLE IF NOT EXISTS status_master (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code VARCHAR(50) UNIQUE NOT NULL,
  display_name VARCHAR(100) NOT NULL,
  color VARCHAR(20) DEFAULT '#6B7280',
  is_active BOOLEAN DEFAULT true,
  is_system BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create project_status_history table
CREATE TABLE IF NOT EXISTS project_status_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL,
  status_id UUID NOT NULL,
  remark VARCHAR(1000),
  changed_by UUID NOT NULL,
  changed_at TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT fk_history_project FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE,
  CONSTRAINT fk_history_status FOREIGN KEY (status_id) REFERENCES status_master(id) ON DELETE RESTRICT
);

-- ============================================================================
-- STEP 2: Add nullable columns to existing tables
-- ============================================================================

-- Add foreign key columns to projects (nullable initially)
ALTER TABLE projects ADD COLUMN IF NOT EXISTS category_id UUID;
ALTER TABLE projects ADD COLUMN IF NOT EXISTS subcategory_id UUID;
ALTER TABLE projects ADD COLUMN IF NOT EXISTS type_id UUID;
ALTER TABLE projects ADD COLUMN IF NOT EXISTS status_id UUID;
ALTER TABLE projects ADD COLUMN IF NOT EXISTS status_remark VARCHAR(1000);

-- Add original_name column to project_documents (nullable initially)
ALTER TABLE project_documents ADD COLUMN IF NOT EXISTS original_name VARCHAR(255);

-- ============================================================================
-- STEP 3: Seed master data
-- ============================================================================

-- Seed categories
INSERT INTO categories (id, name, code, description, is_active, created_at, updated_at)
VALUES
  ('a1b2c3d4-e5f6-7890-abcd-ef1234567801', 'RAC', 'RAC', 'Room Air Conditioners', true, NOW(), NOW()),
  ('a1b2c3d4-e5f6-7890-abcd-ef1234567802', 'CAG', 'CAG', 'Commercial Air Conditioning Group', true, NOW(), NOW())
ON CONFLICT (code) DO NOTHING;

-- Seed subcategories
INSERT INTO subcategories (id, category_id, name, code, description, is_active, created_at, updated_at)
VALUES
  ('b2c3d4e5-f6a7-8901-bcde-f12345678901', 'a1b2c3d4-e5f6-7890-abcd-ef1234567801', 'HP', 'HP', 'Heat Pump', true, NOW(), NOW()),
  ('b2c3d4e5-f6a7-8901-bcde-f12345678902', 'a1b2c3d4-e5f6-7890-abcd-ef1234567801', 'SRICITY', 'SRICITY', 'Smart Inverter Technology', true, NOW(), NOW()),
  ('b2c3d4e5-f6a7-8901-bcde-f12345678903', 'a1b2c3d4-e5f6-7890-abcd-ef1234567802', 'VRF', 'VRF', 'Variable Refrigerant Flow', true, NOW(), NOW()),
  ('b2c3d4e5-f6a7-8901-bcde-f12345678904', 'a1b2c3d4-e5f6-7890-abcd-ef1234567802', 'DUCTED', 'DUCTED', 'Ducted Air Systems', true, NOW(), NOW()),
  ('b2c3d4e5-f6a7-8901-bcde-f12345678905', 'a1b2c3d4-e5f6-7890-abcd-ef1234567802', 'IBG', 'IBG', 'Industrial Batch Galleria', true, NOW(), NOW()),
  ('b2c3d4e5-f6a7-8901-bcde-f12345678906', 'a1b2c3d4-e5f6-7890-abcd-ef1234567802', 'CHILLERS', 'CHILLERS', 'Chiller Systems', true, NOW(), NOW())
ON CONFLICT (code) DO NOTHING;

-- Seed project types
INSERT INTO project_types (id, subcategory_id, name, code, description, is_active, created_at, updated_at)
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
INSERT INTO status_master (id, code, display_name, color, is_active, is_system, created_at, updated_at)
VALUES
  ('d4e5f6a7-b8c9-0123-def0-234567890001', 'NOT_STARTED', 'Not Started', '#6B7280', true, true, NOW(), NOW()),
  ('d4e5f6a7-b8c9-0123-def0-234567890002', 'ONGOING', 'Ongoing', '#3B82F6', true, true, NOW(), NOW()),
  ('d4e5f6a7-b8c9-0123-def0-234567890003', 'COMPLETED', 'Completed', '#22C55E', true, true, NOW(), NOW()),
  ('d4e5f6a7-b8c9-0123-def0-234567890004', 'ON_HOLD', 'On Hold', '#F59E0B', true, true, NOW(), NOW()),
  ('d4e5f6a7-b8c9-0123-def0-234567890005', 'DROPPED', 'Dropped', '#EF4444', true, true, NOW(), NOW())
ON CONFLICT (code) DO NOTHING;

-- ============================================================================
-- STEP 4: Backfill foreign keys from existing enum values
-- ============================================================================

-- Update projects with category_id
UPDATE projects p SET category_id = c.id
FROM categories c
WHERE c.code = p.category::text AND p.category_id IS NULL;

-- Update projects with subcategory_id
UPDATE projects p SET subcategory_id = s.id
FROM subcategories s
WHERE s.code = p.subcategory::text AND p.subcategory_id IS NULL;

-- Update projects with type_id (need to match by looking up the correct type based on subcategory)
UPDATE projects p
SET type_id = (
  SELECT t.id FROM project_types t
  WHERE t.code = p.type::text
  AND t.subcategory_id = p.subcategory_id
  LIMIT 1
)
WHERE p.type_id IS NULL;

-- Update projects with status_id
UPDATE projects p SET status_id = s.id
FROM status_master s
WHERE s.code = p.status::text AND p.status_id IS NULL;

-- Update project_documents with original_name (copy from file_name if not set)
UPDATE project_documents SET original_name = file_name WHERE original_name IS NULL;

-- ============================================================================
-- STEP 5: Create indexes for new columns
-- ============================================================================

CREATE INDEX IF NOT EXISTS idx_projects_category_id ON projects(category_id);
CREATE INDEX IF NOT EXISTS idx_projects_subcategory_id ON projects(subcategory_id);
CREATE INDEX IF NOT EXISTS idx_projects_type_id ON projects(type_id);
CREATE INDEX IF NOT EXISTS idx_projects_status_id ON projects(status_id);
CREATE INDEX IF NOT EXISTS idx_subcategories_category_id ON subcategories(category_id);
CREATE INDEX IF NOT EXISTS idx_project_types_subcategory_id ON project_types(subcategory_id);
CREATE INDEX IF NOT EXISTS idx_project_status_history_project_id ON project_status_history(project_id);
CREATE INDEX IF NOT EXISTS idx_project_status_history_status_id ON project_status_history(status_id);

-- ============================================================================
-- STEP 6: Add NOT NULL constraints (in separate statements for PostgreSQL)
-- ============================================================================

ALTER TABLE projects ALTER COLUMN category_id SET NOT NULL;
ALTER TABLE projects ALTER COLUMN subcategory_id SET NOT NULL;
ALTER TABLE projects ALTER COLUMN type_id SET NOT NULL;
ALTER TABLE projects ALTER COLUMN status_id SET NOT NULL;
ALTER TABLE project_documents ALTER COLUMN original_name SET NOT NULL;

COMMIT;

-- ============================================================================
-- Verification queries (run these to check the migration)
-- ============================================================================

-- SELECT 'Categories:' AS info, COUNT(*) AS count FROM categories;
-- SELECT 'Subcategories:' AS info, COUNT(*) AS count FROM subcategories;
-- SELECT 'Project Types:' AS info, COUNT(*) AS count FROM project_types;
-- SELECT 'Status Master:' AS info, COUNT(*) AS count FROM status_master;
-- SELECT 'Projects with category_id:' AS info, COUNT(*) AS count FROM projects WHERE category_id IS NOT NULL;
-- SELECT 'Projects without category_id:' AS info, COUNT(*) AS count FROM projects WHERE category_id IS NULL;