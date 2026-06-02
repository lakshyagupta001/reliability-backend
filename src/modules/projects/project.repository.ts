import { prisma } from '../../prisma/prisma.client';

export class ProjectRepository {
  protected readonly db = prisma.project;
}

export const projectRepository = new ProjectRepository();
