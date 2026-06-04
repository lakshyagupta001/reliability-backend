import type { DocumentType } from '@prisma/client';
import type { Project, PublicProject } from '../../modules/projects/project.types';

export type ProjectWithRelations = Project & {
  creator?: { firstName: string; lastName: string; email: string } | null;
  documents?: Array<Record<string, unknown>>;
};

interface PublicProjectDocument {
  id: string;
  projectId: string;
  documentType: DocumentType;
  fileName: string;
  fileUrl: string;
  fileSize: number | null;
  mimeType: string | null;
  uploadedBy: string;
  uploadedAt: string;
  uploader?: { firstName: string; lastName: string; email: string };
}

function mapDocument(d: Record<string, unknown>): PublicProjectDocument {
  return {
    id: String(d['id']),
    projectId: String(d['projectId']),
    documentType: d['documentType'] as DocumentType,
    fileName: String(d['fileName']),
    fileUrl: String(d['fileUrl']),
    fileSize: d['fileSize'] as number | null,
    mimeType: d['mimeType'] as string | null,
    uploadedBy: String(d['uploadedBy']),
    uploadedAt: new Date(d['uploadedAt'] as Date).toISOString(),
    uploader: d['uploader']
      ? (d['uploader'] as { firstName: string; lastName: string; email: string })
      : undefined,
  };
}

export function toPublicProject(p: ProjectWithRelations): PublicProject {
  return {
    id: p.id,
    name: p.name,
    category: p.category,
    subcategory: p.subcategory,
    type: p.type,
    status: p.status,
    startDate: p.startDate.toISOString(),
    endDate: p.endDate.toISOString(),
    location: p.location,
    createdBy: p.createdBy,
    createdAt: p.createdAt.toISOString(),
    updatedAt: p.updatedAt.toISOString(),
    partName: p.partName ?? null,
    modelName: p.modelName ?? null,
    projectPIC: p.projectPIC ?? null,
    projectScope: p.projectScope ?? null,
    applicableCompliance: p.applicableCompliance ?? null,
    sampleSubmissionDate: p.sampleSubmissionDate?.toISOString() ?? null,
    massProductionDate: p.massProductionDate?.toISOString() ?? null,
    partSampleCount: p.partSampleCount ?? null,
    productSampleCount: p.productSampleCount ?? null,
    projectPriorityScale: p.projectPriorityScale ?? null,
    operatingVoltageRange: p.operatingVoltageRange ?? null,
    ambientOperatingRange: p.ambientOperatingRange ?? null,
    iduHardwareVersion: p.iduHardwareVersion ?? null,
    oduHardwareVersion: p.oduHardwareVersion ?? null,
    iduFirmwareVersion: p.iduFirmwareVersion ?? null,
    oduFirmwareVersion: p.oduFirmwareVersion ?? null,
    partNumberAndMake: p.partNumberAndMake ?? null,
    technicalDataSheetReference: p.technicalDataSheetReference ?? null,
    maximumPipingLength: p.maximumPipingLength ?? null,
    maximumCommunicationWireLength: p.maximumCommunicationWireLength ?? null,
    oduFanMotorDetails: p.oduFanMotorDetails ?? null,
    iduFanMotorDetails: p.iduFanMotorDetails ?? null,
    compressorDetails: p.compressorDetails ?? null,
    refrigerantName: p.refrigerantName ?? null,
    refrigerantQuantity: p.refrigerantQuantity ?? null,
    creator: p.creator
      ? { firstName: p.creator.firstName, lastName: p.creator.lastName, email: p.creator.email }
      : undefined,
    documents: (p.documents ?? []).map(mapDocument),
  };
}