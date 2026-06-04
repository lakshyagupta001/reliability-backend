import type { Request, Response } from 'express';
import { asyncHandler } from '../../shared/utils/async-handler';
import {
  sendSuccess,
  sendPaginatedSuccess,
  sendNoContentSuccess,
  type PaginationMeta,
} from '../../shared/utils/api-response';
import { type AuthRequest } from '../../shared/middlewares/auth.middleware';
import { AppError } from '../../shared/utils/errors/app-error';
import { toPublicProject } from '../../shared/utils/project.mapper';
import { projectService } from './project.service';
import type { CreateProjectBody, UpdateProjectBody, ListProjectsQuery } from './project.types';

export const listProjects = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    const query = req.validatedQuery as ListProjectsQuery;
    const { rows, total, page, limit, totalPages } = await projectService.listProjects(query);

    const pagination: PaginationMeta = {
      page,
      limit,
      total,
      totalPages,
      hasNextPage: page < totalPages,
      hasPreviousPage: page > 1,
    };

    // Map directly from findAll rows — avoids N+1 DB queries
    const publicProjects = rows.map((p) => toPublicProject(p));

    return sendPaginatedSuccess(res, 200, 'Projects fetched successfully', publicProjects, pagination);
  },
);

export const getProject = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    const { id } = req.params as { id: string };
    const project = await projectService.getProjectById(id);
    return sendSuccess(res, 200, 'Project fetched successfully', project);
  },
);

export const createProject = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    const user = req.user!;
    const body = req.validatedBody as CreateProjectBody;
    const project = await projectService.createProject(body, user.id, user.role);
    return sendSuccess(res, 201, 'Project created successfully', project);
  },
);

export const updateProject = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    const { id } = req.params as { id: string };
    const user = req.user!;
    const body = req.validatedBody as UpdateProjectBody;
    const project = await projectService.updateProject(id, body, user.id, user.role);
    return sendSuccess(res, 200, 'Project updated successfully', project);
  },
);

export const deleteProject = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    const { id } = req.params as { id: string };
    const user = req.user!;
    await projectService.deleteProject(id, user.role);
    return sendNoContentSuccess(res, 'Project deleted successfully');
  },
);

export const uploadDocument = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    const { id } = req.params as { id: string };
    const { documentType } = req.body as { documentType: string };

    if (!req.file) {
      throw new AppError(400, 'No file uploaded', 'FILE_REQUIRED');
    }

    const user = req.user!;
    const document = await projectService.addDocument(
      id,
      documentType,
      req.file.originalname,
      req.file.path,
      user.id,
      { fileSize: req.file.size, mimeType: req.file.mimetype },
    );

    return sendSuccess(res, 201, 'Document uploaded successfully', document);
  },
);

export const removeDocument = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    const { documentId } = req.params as { documentId: string };
    const user = req.user!;
    await projectService.removeDocument(documentId, user.role);
    return sendNoContentSuccess(res, 'Document deleted successfully');
  },
);