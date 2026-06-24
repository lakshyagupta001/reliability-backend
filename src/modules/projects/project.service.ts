import { NotFoundError } from '../../shared/utils/errors/not-found-error';
import { projectRepository, ProjectWithRelations, ProjectDocumentRecord } from './project.repository';
import type {
  CreateProjectBody,
  UpdateProjectBody,
  ListProjectsQuery,
  PublicProject,
  PublicProjectDocument,
} from './project.types';
import type { UserRole } from '../users/user.types';

export class ProjectService {
  async listProjects(query: ListProjectsQuery) {
    return projectRepository.findAll(query);
  }

  async getProjectById(id: string): Promise<PublicProject> {
    const project = await projectRepository.findById(id);
    if (!project) throw new NotFoundError('Project');
    return this.toPublicProject(project);
  }

  async createProject(data: CreateProjectBody, userId: string, _userRole: UserRole): Promise<PublicProject> {
    const defaultStatusId = await projectRepository.getDefaultStatusId();
    const project = await projectRepository.create(data, userId, defaultStatusId);

    await projectRepository.createStatusHistory({
      projectId: project.id,
      statusId: defaultStatusId,
      remark: 'Project created',
      changedBy: userId,
    });

    return this.toPublicProject(project);
  }

  async updateProject(
    id: string,
    data: UpdateProjectBody,
    userId: string,
    _userRole: UserRole,
  ): Promise<PublicProject> {
    const exists = await projectRepository.exists(id);
    if (!exists) throw new NotFoundError('Project');

    const oldProject = await projectRepository.findById(id);

    const project = await projectRepository.update(id, data);

    if (data.statusId && data.statusId !== oldProject?.statusId) {
      await projectRepository.createStatusHistory({
        projectId: id,
        statusId: data.statusId,
        remark: data.statusRemark,
        changedBy: userId,
      });
    }

    return this.toPublicProject(project);
  }

  async updateProjectStatus(
    id: string,
    statusId: string,
    remark: string | undefined,
    userId: string,
  ): Promise<PublicProject> {
    const exists = await projectRepository.exists(id);
    if (!exists) throw new NotFoundError('Project');

    const project = await projectRepository.updateStatus(id, statusId, remark);

    await projectRepository.createStatusHistory({
      projectId: id,
      statusId,
      remark,
      changedBy: userId,
    });

    return this.toPublicProject(project);
  }

  async deleteProject(id: string, _userRole: UserRole): Promise<void> {
    const exists = await projectRepository.exists(id);
    if (!exists) throw new NotFoundError('Project');
    await projectRepository.delete(id);
  }

  async addDocument(
    projectId: string,
    fileName: string,
    originalName: string,
    fileUrl: string,
    uploadedBy: string,
    options?: { fileSize?: number | null; mimeType?: string | null },
  ) {
    const exists = await projectRepository.exists(projectId);
    if (!exists) throw new NotFoundError('Project');

    return projectRepository.createDocument({
      projectId,
      fileName,
      originalName,
      fileUrl,
      fileSize: options?.fileSize ?? null,
      mimeType: options?.mimeType ?? null,
      uploadedBy,
    });
  }

  async removeDocument(documentId: string, _userRole: UserRole) {
    const doc = await projectRepository.getDocumentById(documentId);
    if (!doc) throw new NotFoundError('Document');
    await projectRepository.deleteDocument(documentId);
  }

  private toPublicProject(p: ProjectWithRelations): PublicProject {
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
      documents: p.documents?.map((d) => this.toPublicDocument(d)),
      partReports: p.partReports?.map((r) => ({
        id: r.id as string,
        reportName: r.reportName as string,
        reportStatus: r.reportStatus as PublicProject['partReports'] extends Array<infer T> ? T extends { reportStatus: infer S } ? S : never : never,
        updatedAt: (r.updatedAt as Date).toISOString(),
        testPartList: r.testPartList ? { id: r.testPartList.id as string, status: r.testPartList.status as any } : null,
      })),
      summaryReport: p.summaryReport ? {
        id: (p.summaryReport as any).id as string,
        reportStatus: (p.summaryReport as any).reportStatus as any,
        updatedAt: ((p.summaryReport as any).updatedAt as Date).toISOString(),
        testSummaryList: (p.summaryReport as any).testSummaryList ? { id: (p.summaryReport as any).testSummaryList.id as string, status: (p.summaryReport as any).testSummaryList.status as any } : null,
      } : null,
    };
  }

  private toPublicDocument(d: ProjectDocumentRecord): PublicProjectDocument {
    return {
      id: d.id as string,
      projectId: d.projectId as string,
      fileName: d.fileName as string,
      originalName: d.originalName as string,
      fileUrl: d.fileUrl as string,
      fileSize: d.fileSize as number | null,
      mimeType: d.mimeType as string | null,
      uploadedBy: d.uploadedBy as string,
      uploadedAt: (d.uploadedAt as Date).toISOString(),
      uploader: d.uploader as PublicProjectDocument['uploader'],
    };
  }
}

export const projectService = new ProjectService();