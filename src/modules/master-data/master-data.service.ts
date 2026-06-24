import { NotFoundError } from '../../shared/utils/errors/not-found-error';
import { BadRequestError } from '../../shared/utils/errors/bad-request-error';
import { masterDataRepository } from './master-data.repository';
import type {
  PublicMasterData,
  MasterDataTree,
  CreateMasterDataBody,
  UpdateMasterDataBody,
  ListMasterDataQuery,
} from './master-data.types';
import type { MasterDataLevel } from '@prisma/client';

// ============================================================================
// Mapping helpers
// ============================================================================

type RawNode = {
  id: string;
  name: string;
  level: MasterDataLevel;
  parentId: string | null;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  children?: RawNode[];
  _count?: {
    projectsAsCategory: number;
    projectsAsSubcategory: number;
    projectsAsType: number;
  };
};

function toPublic(node: RawNode): PublicMasterData {
  let projectCount = 0;
  if (node._count) {
    projectCount = node._count.projectsAsCategory + node._count.projectsAsSubcategory + node._count.projectsAsType;
  }
  return {
    id: node.id,
    name: node.name,
    level: node.level,
    parentId: node.parentId,
    isActive: node.isActive,
    createdAt: node.createdAt.toISOString(),
    updatedAt: node.updatedAt.toISOString(),
    children: node.children ? node.children.map(toPublic) : undefined,
    projectCount,
  };
}

function toTree(categories: RawNode[]): MasterDataTree[] {
  return categories.map((cat) => ({
    id: cat.id,
    name: cat.name,
    level: 'CATEGORY' as const,
    isActive: cat.isActive,
    children: (cat.children ?? []).map((sub) => ({
      id: sub.id,
      name: sub.name,
      level: 'SUBCATEGORY' as const,
      parentId: sub.parentId!,
      isActive: sub.isActive,
      children: (sub.children ?? []).map((type) => ({
        id: type.id,
        name: type.name,
        level: 'TYPE' as const,
        parentId: type.parentId!,
        isActive: type.isActive,
      })),
    })),
  }));
}

// ============================================================================
// Level validation rules
// ============================================================================

const LEVEL_ORDER: MasterDataLevel[] = ['CATEGORY', 'SUBCATEGORY', 'TYPE'];

function expectedParentLevel(level: MasterDataLevel): MasterDataLevel | null {
  const idx = LEVEL_ORDER.indexOf(level);
  return idx > 0 ? LEVEL_ORDER[idx - 1] : null;
}

// ============================================================================
// Service
// ============================================================================

export class MasterDataService {
  // --------------------------------------------------------------------------
  // MasterData CRUD
  // --------------------------------------------------------------------------

  async list(query: ListMasterDataQuery) {
    const result = await masterDataRepository.findAll(query);
    return {
      ...result,
      rows: result.rows.map((row) => toPublic(row as RawNode)),
    };
  }

  async getById(id: string): Promise<PublicMasterData> {
    const node = await masterDataRepository.findById(id);
    if (!node) throw new NotFoundError('MasterData node');
    return toPublic(node as RawNode);
  }

  async getCategories(isActive?: boolean): Promise<PublicMasterData[]> {
    const cats = await masterDataRepository.findCategories(isActive);
    return cats.map((c) => toPublic(c as RawNode));
  }

  async getChildren(parentId: string, isActive?: boolean): Promise<PublicMasterData[]> {
    const parent = await masterDataRepository.findByIdSimple(parentId);
    if (!parent) throw new NotFoundError('Parent node');
    const children = await masterDataRepository.findChildren(parentId, isActive);
    return children.map((c) => toPublic(c as RawNode));
  }

  async getTree(isActive?: boolean): Promise<MasterDataTree[]> {
    const categories = await masterDataRepository.getFullTree(isActive);
    return toTree(categories as RawNode[]);
  }

  async create(data: CreateMasterDataBody): Promise<PublicMasterData> {
    // Validate parentId rules
    const requiredParentLevel = expectedParentLevel(data.level);

    if (requiredParentLevel === null) {
      // CATEGORY — must not have a parent
      if (data.parentId) {
        throw new BadRequestError('Categories must not have a parent.');
      }
    } else {
      // SUBCATEGORY or TYPE — must have a valid parent of the correct level
      if (!data.parentId) {
        throw new BadRequestError(
          `A ${data.level} must have a parent ${requiredParentLevel}.`,
        );
      }
      const parent = await masterDataRepository.findByIdSimple(data.parentId);
      if (!parent) throw new NotFoundError('Parent node');
      if (parent.level !== requiredParentLevel) {
        throw new BadRequestError(
          `A ${data.level} must have a parent of level ${requiredParentLevel}, but the provided parent has level ${parent.level}.`,
        );
      }
    }

    // Check for duplicate name under same parent
    const duplicate = await masterDataRepository.findByNameAndParent(
      data.name,
      data.parentId ?? null,
      data.level,
    );
    if (duplicate) {
      throw new BadRequestError(
        `A ${data.level} with name "${data.name}" already exists under this parent.`,
      );
    }

    const node = await masterDataRepository.create(data);
    return toPublic(node as RawNode);
  }

  async update(id: string, data: UpdateMasterDataBody): Promise<PublicMasterData> {
    const existing = await masterDataRepository.findByIdSimple(id);
    if (!existing) throw new NotFoundError('MasterData node');

    // Check for duplicate name under same parent
    const duplicate = await masterDataRepository.findByNameAndParent(
      data.name,
      existing.parentId,
      existing.level,
    );
    if (duplicate && duplicate.id !== id) {
      throw new BadRequestError(
        `A ${existing.level} with name "${data.name}" already exists under this parent.`,
      );
    }

    const node = await masterDataRepository.update(id, data);
    return toPublic(node as RawNode);
  }

  async deactivate(id: string): Promise<PublicMasterData> {
    const existing = await masterDataRepository.findByIdSimple(id);
    if (!existing) throw new NotFoundError('MasterData node');

    await masterDataRepository.cascadeDeactivate(id);

    const updated = await masterDataRepository.findByIdSimple(id);
    return toPublic(updated as RawNode);
  }

  async activate(id: string): Promise<PublicMasterData> {
    const existing = await masterDataRepository.findByIdSimple(id);
    if (!existing) throw new NotFoundError('MasterData node');

    const updated = await masterDataRepository.activate(id);
    return toPublic(updated as RawNode);
  }

  async toggleStatus(id: string, isActive: boolean) {
    const node = await masterDataRepository.findById(id);
    if (!node) throw new NotFoundError('Node not found');

    if (isActive) {
      return toPublic(await masterDataRepository.activate(id));
    } else {
      await masterDataRepository.cascadeDeactivate(id);
      return toPublic(await masterDataRepository.findById(id) as any);
    }
  }

  async deleteNode(id: string) {
    const node = await masterDataRepository.findById(id);
    if (!node) throw new NotFoundError('Node not found');

    if (node.children && node.children.length > 0) {
      throw new BadRequestError('Cannot delete node because it has children. Please delete all children first.');
    }

    const projectCount = (node._count?.projectsAsCategory || 0) + 
                         (node._count?.projectsAsSubcategory || 0) + 
                         (node._count?.projectsAsType || 0);

    if (projectCount > 0) {
      throw new BadRequestError(`Cannot delete node because it is used in ${projectCount} project(s).`);
    }

    await masterDataRepository.delete(id);
  }

  // --------------------------------------------------------------------------
  // StatusMaster (unchanged interface)
  // --------------------------------------------------------------------------

  async listStatuses(query: { page: number; limit: number; search?: string; isActive?: boolean }) {
    return masterDataRepository.findAllStatuses(query);
  }

  async getStatusById(id: string) {
    const status = await masterDataRepository.findStatusById(id);
    if (!status) throw new NotFoundError('Status');
    return status;
  }

  async getAllActiveStatuses() {
    return masterDataRepository.findAllActiveStatuses();
  }

  async createStatus(data: { code: string; displayName: string; color?: string }) {
    const existing = await masterDataRepository.findStatusByCode(data.code);
    if (existing) throw new BadRequestError('Status with this code already exists');
    return masterDataRepository.createStatus(data);
  }

  async updateStatus(id: string, data: { displayName?: string; color?: string; isActive?: boolean }) {
    const existing = await masterDataRepository.findStatusById(id);
    if (!existing) throw new NotFoundError('Status');
    return masterDataRepository.updateStatus(id, data);
  }

  async toggleStatusActive(id: string, isActive: boolean) {
    const existing = await masterDataRepository.findStatusById(id);
    if (!existing) throw new NotFoundError('Status');
    if (existing.isSystem) throw new BadRequestError('Cannot deactivate a system status');
    return masterDataRepository.updateStatus(id, { isActive });
  }
}

export const masterDataService = new MasterDataService();