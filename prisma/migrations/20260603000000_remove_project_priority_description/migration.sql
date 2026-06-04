DROP INDEX IF EXISTS "projects_status_priority_idx";
DROP INDEX IF EXISTS "projects_priority_idx";

ALTER TABLE "projects"
  DROP COLUMN IF EXISTS "priority",
  DROP COLUMN IF EXISTS "description";

DROP TYPE IF EXISTS "ProjectPriority";
