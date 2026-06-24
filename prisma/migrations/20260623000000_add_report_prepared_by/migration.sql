ALTER TABLE "reports" ADD COLUMN "preparedById" UUID;

UPDATE "reports"
SET "preparedById" = "createdBy"
WHERE "preparedById" IS NULL;

CREATE INDEX "reports_preparedById_idx" ON "reports"("preparedById");

ALTER TABLE "reports" ADD CONSTRAINT "reports_preparedById_fkey" FOREIGN KEY ("preparedById") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
