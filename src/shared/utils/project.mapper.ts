import type { PublicProject, PublicProjectDocument } from '../../modules/projects/project.types';

export type ProjectWithRelations = Record<string, unknown>;

function mapDocument(d: Record<string, unknown>): PublicProjectDocument {
  return {
    id: String(d['id']),
    projectId: String(d['projectId']),
    fileName: String(d['fileName']),
    originalName: String(d['originalName']),
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
    id: p.id as string,
    name: p.name as string,
    categoryId: p.categoryId as string,
    subcategoryId: p.subcategoryId as string,
    typeId: p.typeId as string,
    statusId: p.statusId as string,
    startDate: (p.startDate as Date).toISOString(),
    endDate: (p.endDate as Date).toISOString(),
    location: p.location as string,
    createdBy: p.createdBy as string,
    createdAt: (p.createdAt as Date).toISOString(),
    updatedAt: (p.updatedAt as Date).toISOString(),
    partName: p.partName as string | null,
    modelName: p.modelName as string | null,
    projectPIC: p.projectPIC as string | null,
    projectScope: p.projectScope as PublicProject['projectScope'],
    applicableCompliance: p.applicableCompliance as string | null,
    sampleSubmissionDate: p.sampleSubmissionDate ? (p.sampleSubmissionDate as Date).toISOString() : null,
    massProductionDate: p.massProductionDate ? (p.massProductionDate as Date).toISOString() : null,
    partSampleCount: p.partSampleCount as number | null,
    productSampleCount: p.productSampleCount as number | null,
    projectPriorityScale: p.projectPriorityScale as string | null,
    operatingVoltageRange: p.operatingVoltageRange as string | null,
    ambientOperatingRange: p.ambientOperatingRange as string | null,
    iduHardwareVersion: p.iduHardwareVersion as string | null,
    oduHardwareVersion: p.oduHardwareVersion as string | null,
    iduFirmwareVersion: p.iduFirmwareVersion as string | null,
    oduFirmwareVersion: p.oduFirmwareVersion as string | null,
    partNumberAndMake: p.partNumberAndMake as string | null,
    technicalDataSheetReference: p.technicalDataSheetReference as string | null,
    maximumPipingLength: p.maximumPipingLength as string | null,
    maximumCommunicationWireLength: p.maximumCommunicationWireLength as string | null,
    oduFanMotorDetails: p.oduFanMotorDetails as string | null,
    iduFanMotorDetails: p.iduFanMotorDetails as string | null,
    compressorDetails: p.compressorDetails as string | null,
    refrigerantName: p.refrigerantName as string | null,
    refrigerantQuantity: p.refrigerantQuantity as string | null,
    statusRemark: p.statusRemark as string | null,
    creator: p.creator as PublicProject['creator'],
    category: p.category as PublicProject['category'],
    subcategory: p.subcategory as PublicProject['subcategory'],
    type: p.type as PublicProject['type'],
    status: p.status as PublicProject['status'],
    documents: (p.documents as Array<Record<string, unknown>>)?.map(mapDocument),
  };
}