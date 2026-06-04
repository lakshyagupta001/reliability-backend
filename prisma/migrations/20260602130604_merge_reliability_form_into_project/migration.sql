-- CreateEnum
CREATE TYPE "UserRole" AS ENUM ('ADMIN', 'EMPLOYEE');

-- CreateEnum
CREATE TYPE "ProjectCategory" AS ENUM ('RAC', 'CAG');

-- CreateEnum
CREATE TYPE "ProjectSubcategory" AS ENUM ('HP', 'SRICITY', 'VRF', 'DUCTED', 'IBG', 'CHILLERS');

-- CreateEnum
CREATE TYPE "ProjectType" AS ENUM ('ODU', 'IDU', 'DRIVE', 'COMPONENT');

-- CreateEnum
CREATE TYPE "ProjectStatus" AS ENUM ('NOT_STARTED', 'ONGOING', 'COMPLETED', 'ON_HOLD', 'DROPPED');

-- CreateEnum
CREATE TYPE "ProjectPriority" AS ENUM ('LOW', 'MEDIUM', 'HIGH', 'CRITICAL');

-- CreateEnum
CREATE TYPE "ProjectScope" AS ENUM ('DOMESTIC', 'OVERSEAS');

-- CreateEnum
CREATE TYPE "ReportStatus" AS ENUM ('PENDING', 'GENERATING', 'COMPLETED', 'FAILED');

-- CreateEnum
CREATE TYPE "DocumentType" AS ENUM ('DESIGN_DOCUMENT', 'HARDWARE_EVALUATION_REPORT', 'LOGIC_EVALUATION_REPORT', 'CHANGE_POINT_DOCUMENT');

-- CreateTable
CREATE TABLE "users" (
    "id" UUID NOT NULL,
    "email" VARCHAR(255) NOT NULL,
    "password" VARCHAR(255) NOT NULL,
    "role" "UserRole" NOT NULL DEFAULT 'EMPLOYEE',
    "firstName" VARCHAR(100) NOT NULL,
    "lastName" VARCHAR(100) NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "auth_sessions" (
    "id" UUID NOT NULL,
    "userId" UUID NOT NULL,
    "tokenHash" VARCHAR(255) NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "revokedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "auth_sessions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "projects" (
    "id" UUID NOT NULL,
    "name" VARCHAR(255) NOT NULL,
    "category" "ProjectCategory" NOT NULL,
    "subcategory" "ProjectSubcategory" NOT NULL,
    "type" "ProjectType" NOT NULL,
    "status" "ProjectStatus" NOT NULL DEFAULT 'NOT_STARTED',
    "priority" "ProjectPriority" NOT NULL DEFAULT 'MEDIUM',
    "startDate" DATE NOT NULL,
    "endDate" DATE NOT NULL,
    "location" VARCHAR(255) NOT NULL,
    "description" TEXT,
    "partName" VARCHAR(255),
    "modelName" VARCHAR(255),
    "projectPIC" VARCHAR(255),
    "projectScope" "ProjectScope",
    "applicableCompliance" VARCHAR(500),
    "sampleSubmissionDate" DATE,
    "massProductionDate" DATE,
    "partSampleCount" INTEGER,
    "productSampleCount" INTEGER,
    "projectPriorityScale" VARCHAR(50),
    "operatingVoltageRange" VARCHAR(100),
    "ambientOperatingRange" VARCHAR(100),
    "iduHardwareVersion" VARCHAR(100),
    "oduHardwareVersion" VARCHAR(100),
    "iduFirmwareVersion" VARCHAR(100),
    "oduFirmwareVersion" VARCHAR(100),
    "partNumberAndMake" TEXT,
    "technicalDataSheetReference" TEXT,
    "maximumPipingLength" VARCHAR(100),
    "maximumCommunicationWireLength" VARCHAR(100),
    "oduFanMotorDetails" TEXT,
    "iduFanMotorDetails" TEXT,
    "compressorDetails" TEXT,
    "refrigerantName" VARCHAR(100),
    "refrigerantQuantity" VARCHAR(50),
    "createdBy" UUID NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "projects_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "project_documents" (
    "id" UUID NOT NULL,
    "projectId" UUID NOT NULL,
    "documentType" "DocumentType" NOT NULL,
    "fileName" VARCHAR(255) NOT NULL,
    "fileUrl" VARCHAR(500) NOT NULL,
    "fileSize" INTEGER,
    "mimeType" VARCHAR(100),
    "uploadedBy" UUID NOT NULL,
    "uploadedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "project_documents_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "generated_reports" (
    "id" UUID NOT NULL,
    "reportName" VARCHAR(255) NOT NULL,
    "reportType" VARCHAR(100) NOT NULL,
    "storagePath" VARCHAR(500) NOT NULL,
    "fileFormat" VARCHAR(50) NOT NULL,
    "fileSize" INTEGER,
    "status" "ReportStatus" NOT NULL DEFAULT 'PENDING',
    "projectId" UUID,
    "generatedBy" UUID NOT NULL,
    "metadata" JSONB,
    "generatedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "generated_reports_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE INDEX "users_email_idx" ON "users"("email");

-- CreateIndex
CREATE INDEX "users_role_idx" ON "users"("role");

-- CreateIndex
CREATE INDEX "users_isActive_idx" ON "users"("isActive");

-- CreateIndex
CREATE UNIQUE INDEX "auth_sessions_tokenHash_key" ON "auth_sessions"("tokenHash");

-- CreateIndex
CREATE INDEX "auth_sessions_userId_idx" ON "auth_sessions"("userId");

-- CreateIndex
CREATE INDEX "auth_sessions_tokenHash_idx" ON "auth_sessions"("tokenHash");

-- CreateIndex
CREATE INDEX "auth_sessions_expiresAt_idx" ON "auth_sessions"("expiresAt");

-- CreateIndex
CREATE INDEX "auth_sessions_revokedAt_idx" ON "auth_sessions"("revokedAt");

-- CreateIndex
CREATE INDEX "projects_category_idx" ON "projects"("category");

-- CreateIndex
CREATE INDEX "projects_subcategory_idx" ON "projects"("subcategory");

-- CreateIndex
CREATE INDEX "projects_type_idx" ON "projects"("type");

-- CreateIndex
CREATE INDEX "projects_status_idx" ON "projects"("status");

-- CreateIndex
CREATE INDEX "projects_priority_idx" ON "projects"("priority");

-- CreateIndex
CREATE INDEX "projects_startDate_idx" ON "projects"("startDate");

-- CreateIndex
CREATE INDEX "projects_endDate_idx" ON "projects"("endDate");

-- CreateIndex
CREATE INDEX "projects_createdBy_idx" ON "projects"("createdBy");

-- CreateIndex
CREATE INDEX "projects_category_subcategory_type_idx" ON "projects"("category", "subcategory", "type");

-- CreateIndex
CREATE INDEX "projects_status_priority_idx" ON "projects"("status", "priority");

-- CreateIndex
CREATE INDEX "projects_name_idx" ON "projects"("name");

-- CreateIndex
CREATE INDEX "project_documents_projectId_idx" ON "project_documents"("projectId");

-- CreateIndex
CREATE INDEX "project_documents_documentType_idx" ON "project_documents"("documentType");

-- CreateIndex
CREATE INDEX "project_documents_uploadedBy_idx" ON "project_documents"("uploadedBy");

-- CreateIndex
CREATE INDEX "generated_reports_reportType_idx" ON "generated_reports"("reportType");

-- CreateIndex
CREATE INDEX "generated_reports_status_idx" ON "generated_reports"("status");

-- CreateIndex
CREATE INDEX "generated_reports_projectId_idx" ON "generated_reports"("projectId");

-- CreateIndex
CREATE INDEX "generated_reports_generatedBy_idx" ON "generated_reports"("generatedBy");

-- CreateIndex
CREATE INDEX "generated_reports_generatedAt_idx" ON "generated_reports"("generatedAt");

-- AddForeignKey
ALTER TABLE "auth_sessions" ADD CONSTRAINT "auth_sessions_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "projects" ADD CONSTRAINT "projects_createdBy_fkey" FOREIGN KEY ("createdBy") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "project_documents" ADD CONSTRAINT "project_documents_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "projects"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "project_documents" ADD CONSTRAINT "project_documents_uploadedBy_fkey" FOREIGN KEY ("uploadedBy") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "generated_reports" ADD CONSTRAINT "generated_reports_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "projects"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "generated_reports" ADD CONSTRAINT "generated_reports_generatedBy_fkey" FOREIGN KEY ("generatedBy") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
