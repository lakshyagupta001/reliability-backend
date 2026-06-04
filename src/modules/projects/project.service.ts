import { NotFoundError } from '../../shared/utils/errors/not-found-error';
import { toPublicProject } from '../../shared/utils/project.mapper';
import { projectRepository } from './project.repository';
import type {
  CreateProjectBody,
  UpdateProjectBody,
  ListProjectsQuery,
  PublicProject,
} from './project.types';
import type { UserRole } from '../users/user.types';

export class ProjectService {
  async listProjects(query: ListProjectsQuery) {
    return projectRepository.findAll(query);
  }

  async getProjectById(id: string): Promise<PublicProject> {
    const project = await projectRepository.findById(id);
    if (!project) throw new NotFoundError('Project');
    return toPublicProject(project);
  }

  async createProject(data: CreateProjectBody, userId: string, _userRole: UserRole): Promise<PublicProject> {
    const project = await projectRepository.create(data, userId);
    return toPublicProject(project);
  }

  async updateProject(
    id: string,
    data: UpdateProjectBody,
    _userId: string,
    _userRole: UserRole,
  ): Promise<PublicProject> {
    const exists = await projectRepository.exists(id);
    if (!exists) throw new NotFoundError('Project');

    const project = await projectRepository.update(id, data);
    return toPublicProject(project);
  }

  async deleteProject(id: string, _userRole: UserRole): Promise<void> {
    const exists = await projectRepository.exists(id);
    if (!exists) throw new NotFoundError('Project');
    await projectRepository.delete(id);
  }

  async addDocument(
    projectId: string,
    documentType: string,
    fileName: string,
    fileUrl: string,
    uploadedBy: string,
    options?: { fileSize?: number | null; mimeType?: string | null },
  ) {
    const exists = await projectRepository.exists(projectId);
    if (!exists) throw new NotFoundError('Project');

    return projectRepository.createDocument({
      projectId,
      documentType,
      fileName,
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
}

export const projectService = new ProjectService();
