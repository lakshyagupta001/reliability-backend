import { NotFoundError } from '../../shared/utils/errors/not-found-error';
import { BadRequestError } from '../../shared/utils/errors/bad-request-error';
import { masterDataRepository } from './master-data.repository';
import type {
  PublicCategory,
  PublicSubcategory,
  PublicType,
  PublicStatusMaster,
  CreateCategoryBody,
  UpdateCategoryBody,
  CreateSubcategoryBody,
  UpdateSubcategoryBody,
  CreateTypeBody,
  UpdateTypeBody,
  CreateStatusBody,
  UpdateStatusBody,
} from './master-data.types';

function toPublicCategory(c: { id: string; name: string; code: string; description: string | null; isActive: boolean; createdAt: Date; updatedAt: Date; subcategories?: unknown[] }): PublicCategory {
  return {
    id: c.id,
    name: c.name,
    code: c.code,
    description: c.description,
    isActive: c.isActive,
    createdAt: c.createdAt.toISOString(),
    updatedAt: c.updatedAt.toISOString(),
    subcategories: c.subcategories as PublicSubcategory[] | undefined,
  };
}

function toPublicSubcategory(s: { id: string; categoryId: string; name: string; code: string; description: string | null; isActive: boolean; createdAt: Date; updatedAt: Date; category?: unknown; types?: unknown[] }): PublicSubcategory {
  return {
    id: s.id,
    categoryId: s.categoryId,
    name: s.name,
    code: s.code,
    description: s.description,
    isActive: s.isActive,
    createdAt: s.createdAt.toISOString(),
    updatedAt: s.updatedAt.toISOString(),
    types: s.types as PublicType[] | undefined,
  };
}

function toPublicType(t: { id: string; subcategoryId: string; name: string; code: string; description: string | null; isActive: boolean; createdAt: Date; updatedAt: Date; subcategory?: unknown }): PublicType {
  return {
    id: t.id,
    subcategoryId: t.subcategoryId,
    name: t.name,
    code: t.code,
    description: t.description,
    isActive: t.isActive,
    createdAt: t.createdAt.toISOString(),
    updatedAt: t.updatedAt.toISOString(),
    subcategory: t.subcategory as PublicType['subcategory'],
  };
}

function toPublicStatus(s: { id: string; code: string; displayName: string; color: string; isActive: boolean; isSystem: boolean; createdAt: Date; updatedAt: Date }): PublicStatusMaster {
  return {
    id: s.id,
    code: s.code,
    displayName: s.displayName,
    color: s.color,
    isActive: s.isActive,
    isSystem: s.isSystem,
    createdAt: s.createdAt.toISOString(),
    updatedAt: s.updatedAt.toISOString(),
  };
}

export class MasterDataService {
  async listCategories(query: { page: number; limit: number; search?: string; isActive?: boolean }) {
    return masterDataRepository.findAllCategories(query);
  }

  async getCategoryById(id: string): Promise<PublicCategory> {
    const category = await masterDataRepository.findCategoryById(id);
    if (!category) throw new NotFoundError('Category');
    return toPublicCategory(category);
  }

  async createCategory(data: CreateCategoryBody): Promise<PublicCategory> {
    const existing = await masterDataRepository.findCategoryByCode(data.code);
    if (existing) {
      throw new BadRequestError('Category with this code already exists');
    }
    const category = await masterDataRepository.createCategory(data);
    return toPublicCategory(category);
  }

  async updateCategory(id: string, data: UpdateCategoryBody): Promise<PublicCategory> {
    const existing = await masterDataRepository.findCategoryById(id);
    if (!existing) throw new NotFoundError('Category');

    const category = await masterDataRepository.updateCategory(id, data);
    return toPublicCategory(category);
  }

  async toggleCategoryStatus(id: string, isActive: boolean): Promise<PublicCategory> {
    const existing = await masterDataRepository.findCategoryById(id);
    if (!existing) throw new NotFoundError('Category');

    if (!isActive) {
      // Cascade: inactivate category, all its subcategories, and all their types
      await masterDataRepository.cascadeInactivateCategory(id);
    } else {
      // Simple activate — children keep their current status
      await masterDataRepository.updateCategory(id, { isActive: true });
    }

    const updated = await masterDataRepository.findCategoryById(id);
    return toPublicCategory(updated!);
  }

  async listSubcategories(query: { page: number; limit: number; categoryId?: string; search?: string; isActive?: boolean }) {
    return masterDataRepository.findAllSubcategories(query);
  }

  async getSubcategoryById(id: string): Promise<PublicSubcategory> {
    const subcategory = await masterDataRepository.findSubcategoryById(id);
    if (!subcategory) throw new NotFoundError('Subcategory');
    return toPublicSubcategory(subcategory);
  }

  async getSubcategoriesByCategoryId(categoryId: string, isActive?: boolean): Promise<PublicSubcategory[]> {
    const subcategories = await masterDataRepository.findSubcategoriesByCategoryId(categoryId, isActive);
    return subcategories.map(toPublicSubcategory);
  }

  async createSubcategory(data: CreateSubcategoryBody): Promise<PublicSubcategory> {
    const existing = await masterDataRepository.findSubcategoryByCode(data.code);
    if (existing) {
      throw new BadRequestError('Subcategory with this code already exists');
    }

    const category = await masterDataRepository.findCategoryById(data.categoryId);
    if (!category) throw new NotFoundError('Category');

    const subcategory = await masterDataRepository.createSubcategory(data);
    return toPublicSubcategory(subcategory);
  }

  async updateSubcategory(id: string, data: UpdateSubcategoryBody): Promise<PublicSubcategory> {
    const existing = await masterDataRepository.findSubcategoryById(id);
    if (!existing) throw new NotFoundError('Subcategory');

    if (data.categoryId) {
      const category = await masterDataRepository.findCategoryById(data.categoryId);
      if (!category) throw new NotFoundError('Category');
    }

    const subcategory = await masterDataRepository.updateSubcategory(id, data);
    return toPublicSubcategory(subcategory);
  }

  async toggleSubcategoryStatus(id: string, isActive: boolean): Promise<PublicSubcategory> {
    const existing = await masterDataRepository.findSubcategoryById(id);
    if (!existing) throw new NotFoundError('Subcategory');

    if (!isActive) {
      // Cascade: inactivate subcategory and all its types
      await masterDataRepository.cascadeInactivateSubcategory(id);
    } else {
      // Simple activate — types keep their current status
      await masterDataRepository.updateSubcategory(id, { isActive: true });
    }

    const updated = await masterDataRepository.findSubcategoryById(id);
    return toPublicSubcategory(updated!);
  }

  async listTypes(query: { page: number; limit: number; search?: string; isActive?: boolean; categoryId?: string; subcategoryId?: string }) {
    return masterDataRepository.findAllTypes(query);
  }

  async getAllActiveTypes(): Promise<PublicType[]> {
    const types = await masterDataRepository.findAllActiveTypes();
    return types.map(toPublicType);
  }

  async getTypeById(id: string): Promise<PublicType> {
    const type = await masterDataRepository.findTypeById(id);
    if (!type) throw new NotFoundError('Type');
    return toPublicType(type);
  }

  async getTypesBySubcategoryId(subcategoryId: string): Promise<PublicType[]> {
    const types = await masterDataRepository.findTypesBySubcategoryId(subcategoryId);
    return types.map(toPublicType);
  }

  async createType(data: CreateTypeBody): Promise<PublicType> {
    const existing = await masterDataRepository.findTypeByCodeAndSubcategory(data.code, data.subcategoryId);
    if (existing) {
      throw new BadRequestError('Type with this code already exists in the selected subcategory');
    }

    const type = await masterDataRepository.createType(data);
    return toPublicType(type);
  }

  async updateType(id: string, data: UpdateTypeBody): Promise<PublicType> {
    const existing = await masterDataRepository.findTypeById(id);
    if (!existing) throw new NotFoundError('Type');

    const type = await masterDataRepository.updateType(id, data);
    return toPublicType(type);
  }

  async toggleTypeStatus(id: string, isActive: boolean): Promise<PublicType> {
    const existing = await masterDataRepository.findTypeById(id);
    if (!existing) throw new NotFoundError('Type');

    const type = await masterDataRepository.updateType(id, { isActive });
    return toPublicType(type);
  }



  async listStatuses(query: { page: number; limit: number; search?: string; isActive?: boolean }) {
    return masterDataRepository.findAllStatuses(query);
  }

  async getStatusById(id: string): Promise<PublicStatusMaster> {
    const status = await masterDataRepository.findStatusById(id);
    if (!status) throw new NotFoundError('Status');
    return toPublicStatus(status);
  }

  async getAllActiveStatuses(): Promise<PublicStatusMaster[]> {
    const statuses = await masterDataRepository.findAllActiveStatuses();
    return statuses.map(toPublicStatus);
  }

  async createStatus(data: CreateStatusBody): Promise<PublicStatusMaster> {
    const existing = await masterDataRepository.findStatusByCode(data.code);
    if (existing) {
      throw new BadRequestError('Status with this code already exists');
    }

    const status = await masterDataRepository.createStatus(data);
    return toPublicStatus(status);
  }

  async updateStatus(id: string, data: UpdateStatusBody): Promise<PublicStatusMaster> {
    const existing = await masterDataRepository.findStatusById(id);
    if (!existing) throw new NotFoundError('Status');

    const status = await masterDataRepository.updateStatus(id, data);
    return toPublicStatus(status);
  }

  async toggleStatusActive(id: string, isActive: boolean): Promise<PublicStatusMaster> {
    const existing = await masterDataRepository.findStatusById(id);
    if (!existing) throw new NotFoundError('Status');

    if (existing.isSystem) {
      throw new BadRequestError('Cannot deactivate system status');
    }

    const status = await masterDataRepository.updateStatus(id, { isActive });
    return toPublicStatus(status);
  }
}

export const masterDataService = new MasterDataService();