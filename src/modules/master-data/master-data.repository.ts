import { prisma } from '../../prisma/prisma.client';
import type { MasterDataLevel, Prisma } from '@prisma/client';
import type { CreateMasterDataBody, UpdateMasterDataBody, ListMasterDataQuery } from './master-data.types';

export class MasterDataRepository {
  // --------------------------------------------------------------------------
  // Reads
  // --------------------------------------------------------------------------

  async findById(id: string) {
    return prisma.masterData.findUnique({
      where: { id },
      include: {
        children: { orderBy: { name: 'asc' } },
        _count: {
          select: { projectsAsCategory: true, projectsAsSubcategory: true, projectsAsType: true },
        },
      },
    });
  }

  async findByIdSimple(id: string) {
    return prisma.masterData.findUnique({
      where: { id },
      include: {
        _count: {
          select: { projectsAsCategory: true, projectsAsSubcategory: true, projectsAsType: true },
        },
      },
    });
  }

  async findAll(query: ListMasterDataQuery) {
    const { page, limit, search, level, parentId, isActive } = query;
    const skip = (page - 1) * limit;

    const where: Prisma.MasterDataWhereInput = {};
    if (level) where.level = level;
    if (parentId !== undefined) where.parentId = parentId === 'null' ? null : parentId;
    if (isActive !== undefined) where.isActive = isActive;
    if (search) {
      where.name = { contains: search, mode: 'insensitive' };
    }

    const [rows, total] = await Promise.all([
      prisma.masterData.findMany({
        where,
        skip,
        take: limit,
        orderBy: [{ level: 'asc' }, { name: 'asc' }],
        include: {
          children: { orderBy: { name: 'asc' } },
          _count: {
            select: { projectsAsCategory: true, projectsAsSubcategory: true, projectsAsType: true },
          },
        },
      }),
      prisma.masterData.count({ where }),
    ]);

    return { rows, total, page, limit, totalPages: Math.ceil(total / limit) };
  }

  async findCategories(isActive?: boolean) {
    return prisma.masterData.findMany({
      where: {
        level: 'CATEGORY',
        ...(isActive !== undefined ? { isActive } : {}),
      },
      orderBy: { name: 'asc' },
      include: {
        _count: {
          select: { projectsAsCategory: true, projectsAsSubcategory: true, projectsAsType: true },
        },
      },
    });
  }

  async findChildren(parentId: string, isActive?: boolean) {
    return prisma.masterData.findMany({
      where: {
        parentId,
        ...(isActive !== undefined ? { isActive } : {}),
      },
      orderBy: { name: 'asc' },
      include: {
        children: { orderBy: { name: 'asc' } },
        _count: {
          select: { projectsAsCategory: true, projectsAsSubcategory: true, projectsAsType: true },
        },
      },
    });
  }

  /**
   * Returns the full hierarchy tree: all categories with nested
   * subcategories and their nested types.
   */
  async getFullTree(isActive?: boolean) {
    const categories = await prisma.masterData.findMany({
      where: {
        level: 'CATEGORY',
        ...(isActive !== undefined ? { isActive } : {}),
      },
      orderBy: { name: 'asc' },
      include: {
        children: {
          where: isActive !== undefined ? { isActive } : undefined,
          orderBy: { name: 'asc' },
          include: {
            children: {
              where: isActive !== undefined ? { isActive } : undefined,
              orderBy: { name: 'asc' },
            },
          },
        },
      },
    });
    return categories;
  }

  async findByNameAndParent(name: string, parentId: string | null, level: MasterDataLevel) {
    return prisma.masterData.findFirst({
      where: {
        name: { equals: name, mode: 'insensitive' },
        parentId: parentId ?? null,
        level,
      },
    });
  }

  // --------------------------------------------------------------------------
  // Writes
  // --------------------------------------------------------------------------

  async create(data: CreateMasterDataBody) {
    return prisma.masterData.create({
      data: {
        name: data.name,
        level: data.level,
        parentId: data.parentId ?? null,
      },
    });
  }

  async update(id: string, data: UpdateMasterDataBody) {
    return prisma.masterData.update({
      where: { id },
      data: { name: data.name },
    });
  }

  /**
   * Recursively deactivate a node and ALL its descendants.
   * Uses a CTE-based recursive query for efficiency.
   */
  async cascadeDeactivate(id: string): Promise<void> {
    await prisma.$transaction(async (tx) => {
      // Collect all descendant IDs recursively
      const allIds = await this._collectDescendants(id, tx as typeof prisma);
      allIds.push(id);

      await tx.masterData.updateMany({
        where: { id: { in: allIds } },
        data: { isActive: false },
      });
    });
  }

  /**
   * Activate a single node only — children remain at their current state.
   */
  async activate(id: string) {
    return prisma.masterData.update({
      where: { id },
      data: { isActive: true },
    });
  }

  async delete(id: string) {
    return prisma.masterData.delete({
      where: { id },
    });
  }

  // --------------------------------------------------------------------------
  // Helpers
  // --------------------------------------------------------------------------

  private async _collectDescendants(parentId: string, tx: typeof prisma): Promise<string[]> {
    const children = await tx.masterData.findMany({
      where: { parentId },
      select: { id: true },
    });
    const ids = children.map((c) => c.id);
    for (const child of children) {
      const nested = await this._collectDescendants(child.id, tx);
      ids.push(...nested);
    }
    return ids;
  }

  // --------------------------------------------------------------------------
  // Status Master (unchanged — kept separate)
  // --------------------------------------------------------------------------

  async findStatusById(id: string) {
    return prisma.statusMaster.findUnique({ where: { id } });
  }

  async findStatusByCode(code: string) {
    return prisma.statusMaster.findUnique({ where: { code } });
  }

  async findAllStatuses(query: { page: number; limit: number; search?: string; isActive?: boolean }) {
    const { page, limit, search, isActive } = query;
    const skip = (page - 1) * limit;
    const where: Prisma.StatusMasterWhereInput = {};
    if (search) {
      where.OR = [
        { displayName: { contains: search, mode: 'insensitive' } },
        { code: { contains: search, mode: 'insensitive' } },
      ];
    }
    if (isActive !== undefined) where.isActive = isActive;

    const [rows, total] = await Promise.all([
      prisma.statusMaster.findMany({ where, skip, take: limit, orderBy: { createdAt: 'desc' } }),
      prisma.statusMaster.count({ where }),
    ]);
    return { rows, total, page, limit, totalPages: Math.ceil(total / limit) };
  }

  async findAllActiveStatuses() {
    return prisma.statusMaster.findMany({ where: { isActive: true }, orderBy: { displayName: 'asc' } });
  }

  async createStatus(data: { code: string; displayName: string; color?: string }) {
    return prisma.statusMaster.create({
      data: { code: data.code, displayName: data.displayName, color: data.color, isSystem: false },
    });
  }

  async updateStatus(id: string, data: { displayName?: string; color?: string; isActive?: boolean }) {
    return prisma.statusMaster.update({ where: { id }, data });
  }

  async seedDefaultStatuses(): Promise<void> {
    const defaults = [
      { code: 'NOT_STARTED', displayName: 'Not Started', color: '#6B7280', isSystem: true },
      { code: 'ONGOING', displayName: 'Ongoing', color: '#3B82F6', isSystem: true },
      { code: 'COMPLETED', displayName: 'Completed', color: '#22C55E', isSystem: true },
      { code: 'ON_HOLD', displayName: 'On Hold', color: '#F59E0B', isSystem: true },
      { code: 'DROPPED', displayName: 'Dropped', color: '#EF4444', isSystem: true },
    ];
    for (const s of defaults) {
      const existing = await this.findStatusByCode(s.code);
      if (!existing) await prisma.statusMaster.create({ data: s });
    }
  }
}

export const masterDataRepository = new MasterDataRepository();