/*
  Warnings:

  - You are about to drop the column `documentType` on the `project_documents` table. All the data in the column will be lost.
  - You are about to drop the column `category` on the `projects` table. All the data in the column will be lost.
  - You are about to drop the column `status` on the `projects` table. All the data in the column will be lost.
  - You are about to drop the column `subcategory` on the `projects` table. All the data in the column will be lost.
  - You are about to drop the column `type` on the `projects` table. All the data in the column will be lost.
  - Added the required column `originalName` to the `project_documents` table without a default value. This is not possible if the table is not empty.
  - Added the required column `categoryId` to the `projects` table without a default value. This is not possible if the table is not empty.
  - Added the required column `statusId` to the `projects` table without a default value. This is not possible if the table is not empty.
  - Added the required column `subcategoryId` to the `projects` table without a default value. This is not possible if the table is not empty.
  - Added the required column `typeId` to the `projects` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX "project_documents_documentType_idx";

-- DropIndex
DROP INDEX "projects_category_idx";

-- DropIndex
DROP INDEX "projects_category_subcategory_type_idx";

-- DropIndex
DROP INDEX "projects_status_idx";

-- DropIndex
DROP INDEX "projects_subcategory_idx";

-- DropIndex
DROP INDEX "projects_type_idx";

-- AlterTable
ALTER TABLE "project_documents" DROP COLUMN "documentType",
ADD COLUMN     "originalName" VARCHAR(255) NOT NULL;

-- AlterTable
ALTER TABLE "projects" DROP COLUMN "category",
DROP COLUMN "status",
DROP COLUMN "subcategory",
DROP COLUMN "type",
ADD COLUMN     "categoryId" UUID NOT NULL,
ADD COLUMN     "statusId" UUID NOT NULL,
ADD COLUMN     "statusRemark" VARCHAR(1000),
ADD COLUMN     "subcategoryId" UUID NOT NULL,
ADD COLUMN     "typeId" UUID NOT NULL;

-- DropEnum
DROP TYPE "DocumentType";

-- DropEnum
DROP TYPE "ProjectCategory";

-- DropEnum
DROP TYPE "ProjectStatus";

-- DropEnum
DROP TYPE "ProjectSubcategory";

-- DropEnum
DROP TYPE "ProjectType";

-- CreateTable
CREATE TABLE "categories" (
    "id" UUID NOT NULL,
    "name" VARCHAR(100) NOT NULL,
    "code" VARCHAR(50) NOT NULL,
    "description" VARCHAR(500),
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "categories_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "subcategories" (
    "id" UUID NOT NULL,
    "categoryId" UUID NOT NULL,
    "name" VARCHAR(100) NOT NULL,
    "code" VARCHAR(50) NOT NULL,
    "description" VARCHAR(500),
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "subcategories_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "types" (
    "id" UUID NOT NULL,
    "subcategoryId" UUID NOT NULL,
    "name" VARCHAR(100) NOT NULL,
    "code" VARCHAR(50) NOT NULL,
    "description" VARCHAR(500),
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "types_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "status_master" (
    "id" UUID NOT NULL,
    "code" VARCHAR(50) NOT NULL,
    "displayName" VARCHAR(100) NOT NULL,
    "color" VARCHAR(20) NOT NULL DEFAULT '#6B7280',
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "isSystem" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "status_master_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "project_status_history" (
    "id" UUID NOT NULL,
    "projectId" UUID NOT NULL,
    "statusId" UUID NOT NULL,
    "remark" VARCHAR(1000),
    "changedBy" UUID NOT NULL,
    "changedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "project_status_history_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "categories_code_key" ON "categories"("code");

-- CreateIndex
CREATE INDEX "categories_code_idx" ON "categories"("code");

-- CreateIndex
CREATE INDEX "categories_isActive_idx" ON "categories"("isActive");

-- CreateIndex
CREATE UNIQUE INDEX "subcategories_code_key" ON "subcategories"("code");

-- CreateIndex
CREATE INDEX "subcategories_categoryId_idx" ON "subcategories"("categoryId");

-- CreateIndex
CREATE INDEX "subcategories_code_idx" ON "subcategories"("code");

-- CreateIndex
CREATE INDEX "subcategories_isActive_idx" ON "subcategories"("isActive");

-- CreateIndex
CREATE INDEX "types_subcategoryId_idx" ON "types"("subcategoryId");

-- CreateIndex
CREATE INDEX "types_code_idx" ON "types"("code");

-- CreateIndex
CREATE INDEX "types_isActive_idx" ON "types"("isActive");

-- CreateIndex
CREATE UNIQUE INDEX "types_subcategoryId_code_key" ON "types"("subcategoryId", "code");

-- CreateIndex
CREATE UNIQUE INDEX "status_master_code_key" ON "status_master"("code");

-- CreateIndex
CREATE INDEX "status_master_code_idx" ON "status_master"("code");

-- CreateIndex
CREATE INDEX "status_master_isActive_idx" ON "status_master"("isActive");

-- CreateIndex
CREATE INDEX "status_master_isSystem_idx" ON "status_master"("isSystem");

-- CreateIndex
CREATE INDEX "project_status_history_projectId_idx" ON "project_status_history"("projectId");

-- CreateIndex
CREATE INDEX "project_status_history_statusId_idx" ON "project_status_history"("statusId");

-- CreateIndex
CREATE INDEX "project_status_history_changedAt_idx" ON "project_status_history"("changedAt");

-- CreateIndex
CREATE INDEX "projects_categoryId_idx" ON "projects"("categoryId");

-- CreateIndex
CREATE INDEX "projects_subcategoryId_idx" ON "projects"("subcategoryId");

-- CreateIndex
CREATE INDEX "projects_typeId_idx" ON "projects"("typeId");

-- CreateIndex
CREATE INDEX "projects_statusId_idx" ON "projects"("statusId");

-- AddForeignKey
ALTER TABLE "subcategories" ADD CONSTRAINT "subcategories_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "categories"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "types" ADD CONSTRAINT "types_subcategoryId_fkey" FOREIGN KEY ("subcategoryId") REFERENCES "subcategories"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "projects" ADD CONSTRAINT "projects_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "categories"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "projects" ADD CONSTRAINT "projects_subcategoryId_fkey" FOREIGN KEY ("subcategoryId") REFERENCES "subcategories"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "projects" ADD CONSTRAINT "projects_typeId_fkey" FOREIGN KEY ("typeId") REFERENCES "types"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "projects" ADD CONSTRAINT "projects_statusId_fkey" FOREIGN KEY ("statusId") REFERENCES "status_master"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "project_status_history" ADD CONSTRAINT "project_status_history_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "projects"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "project_status_history" ADD CONSTRAINT "project_status_history_statusId_fkey" FOREIGN KEY ("statusId") REFERENCES "status_master"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
