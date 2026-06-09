import { prisma } from '../../prisma/prisma.client';
import type {
  Category,
  Subcategory,
  Type,
  StatusMaster,
  CreateCategoryBody,
  UpdateCategoryBody,
  CreateSubcategoryBody,
  UpdateSubcategoryBody,
  CreateTypeBody,
  UpdateTypeBody,
  CreateStatusBody,
  UpdateStatusBody,
} from './master-data.types';
import type { Prisma } from '@prisma/client';

export class MasterDataRepository {
  async findCategoryById(id: string): Promise<Category | null> {
    return prisma.category.findUnique({ where: { id } });
  }

  async findCategoryByCode(code: string): Promise<Category | null> {
    return prisma.category.findUnique({ where: { code } });
  }

  async findAllCategories(query: {
    page: number;
    limit: number;
    search?: string;
    isActive?: boolean;
  }) {
    const { page, limit, search, isActive } = query;
    const skip = (page - 1) * limit;

    const where: Prisma.CategoryWhereInput = {};
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { code: { contains: search, mode: 'insensitive' } },
      ];
    }
    if (isActive !== undefined) {
      where.isActive = isActive;
    }

    const [rows, total] = await Promise.all([
      prisma.category.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          subcategories: {
            where: isActive !== undefined ? { isActive } : undefined,
            orderBy: { name: 'asc' },
          },
        },
      }),
      prisma.category.count({ where }),
    ]);

    return { rows, total, page, limit, totalPages: Math.ceil(total / limit) };
  }

  async createCategory(data: CreateCategoryBody): Promise<Category> {
    return prisma.category.create({
      data: {
        name: data.name,
        code: data.code,
        description: data.description,
      },
    });
  }

  async updateCategory(id: string, data: UpdateCategoryBody): Promise<Category> {
    return prisma.category.update({
      where: { id },
      data,
    });
  }

  async deleteCategory(id: string): Promise<void> {
    await prisma.category.delete({ where: { id } });
  }

  async findSubcategoryById(id: string): Promise<Subcategory | null> {
    return prisma.subcategory.findUnique({ where: { id } });
  }

  async findSubcategoryByCode(code: string): Promise<Subcategory | null> {
    return prisma.subcategory.findUnique({ where: { code } });
  }

  async findAllSubcategories(query: {
    page: number;
    limit: number;
    categoryId?: string;
    search?: string;
    isActive?: boolean;
  }) {
    const { page, limit, categoryId, search, isActive } = query;
    const skip = (page - 1) * limit;

    const where: Prisma.SubcategoryWhereInput = {};
    if (categoryId) {
      where.categoryId = categoryId;
    }
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { code: { contains: search, mode: 'insensitive' } },
      ];
    }
    if (isActive !== undefined) {
      where.isActive = isActive;
    }

    const [rows, total] = await Promise.all([
      prisma.subcategory.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          category: { select: { id: true, name: true, code: true } },
          types: {
            select: { id: true, name: true, code: true, isActive: true },
            orderBy: { name: 'asc' },
          },
        },
      }),
      prisma.subcategory.count({ where }),
    ]);

    return { rows, total, page, limit, totalPages: Math.ceil(total / limit) };
  }

  async findSubcategoriesByCategoryId(categoryId: string, isActive?: boolean): Promise<Subcategory[]> {
    return prisma.subcategory.findMany({
      where: { categoryId, ...(isActive !== undefined ? { isActive } : {}) },
      orderBy: { name: 'asc' },
    });
  }

  async createSubcategory(data: CreateSubcategoryBody): Promise<Subcategory> {
    return prisma.subcategory.create({
      data: {
        categoryId: data.categoryId,
        name: data.name,
        code: data.code,
        description: data.description,
      },
    });
  }

  async updateSubcategory(id: string, data: UpdateSubcategoryBody): Promise<Subcategory> {
    return prisma.subcategory.update({
      where: { id },
      data,
    });
  }

  async deleteSubcategory(id: string): Promise<void> {
    await prisma.subcategory.delete({ where: { id } });
  }

  async findTypeById(id: string): Promise<Type | null> {
    return prisma.type.findUnique({ where: { id } });
  }

  async findTypeByCodeAndSubcategory(code: string, subcategoryId: string): Promise<Type | null> {
    return prisma.type.findUnique({ 
      where: { 
        subcategoryId_code: { subcategoryId, code } 
      } 
    });
  }

  async findAllTypes(query: {
    page: number;
    limit: number;
    search?: string;
    isActive?: boolean;
    categoryId?: string;
    subcategoryId?: string;
  }) {
    const { page, limit, search, isActive, categoryId, subcategoryId } = query;
    const skip = (page - 1) * limit;

    const where: Prisma.TypeWhereInput = {};
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { code: { contains: search, mode: 'insensitive' } },
      ];
    }
    if (isActive !== undefined) {
      where.isActive = isActive;
    }
    if (subcategoryId) {
      where.subcategoryId = subcategoryId;
    } else if (categoryId) {
      where.subcategory = { categoryId };
    }

    const [rows, total] = await Promise.all([
      prisma.type.findMany({
        where,
        skip,
        take: limit,
        orderBy: { name: 'asc' },
        include: {
          subcategory: {
            include: {
              category: { select: { id: true, name: true, code: true } },
            },
          },
        },
      }),
      prisma.type.count({ where }),
    ]);

    return { rows, total, page, limit, totalPages: Math.ceil(total / limit) };
  }

  async findAllActiveTypes(): Promise<Type[]> {
    return prisma.type.findMany({
      where: { isActive: true },
      orderBy: { name: 'asc' },
    });
  }

  async createType(data: CreateTypeBody): Promise<Type> {
    return prisma.type.create({
      data: {
        subcategoryId: data.subcategoryId,
        name: data.name,
        code: data.code,
        description: data.description,
      },
    });
  }

  async updateType(id: string, data: UpdateTypeBody): Promise<Type> {
    return prisma.type.update({
      where: { id },
      data,
    });
  }

  async deleteType(id: string): Promise<void> {
    await prisma.type.delete({ where: { id } });
  }

  async findTypesBySubcategoryId(subcategoryId: string): Promise<Type[]> {
    return prisma.type.findMany({
      where: { subcategoryId },
      orderBy: { name: 'asc' },
    });
  }

  /**
   * Transactionally set category + all its subcategories + all their types to inactive.
   */
  async cascadeInactivateCategory(id: string): Promise<void> {
    await prisma.$transaction(async (tx) => {
      // 1. Find all subcategory IDs under this category
      const subcategories = await tx.subcategory.findMany({
        where: { categoryId: id },
        select: { id: true },
      });
      const subcategoryIds = subcategories.map((s) => s.id);

      // 2. Inactivate all types under those subcategories
      if (subcategoryIds.length > 0) {
        await tx.type.updateMany({
          where: { subcategoryId: { in: subcategoryIds } },
          data: { isActive: false },
        });
      }

      // 3. Inactivate all subcategories
      await tx.subcategory.updateMany({
        where: { categoryId: id },
        data: { isActive: false },
      });

      // 4. Inactivate the category itself
      await tx.category.update({
        where: { id },
        data: { isActive: false },
      });
    });
  }

  /**
   * Transactionally set subcategory + all its types to inactive.
   */
  async cascadeInactivateSubcategory(id: string): Promise<void> {
    await prisma.$transaction(async (tx) => {
      // 1. Inactivate all types under this subcategory
      await tx.type.updateMany({
        where: { subcategoryId: id },
        data: { isActive: false },
      });

      // 2. Inactivate the subcategory itself
      await tx.subcategory.update({
        where: { id },
        data: { isActive: false },
      });
    });
  }



  async findStatusById(id: string): Promise<StatusMaster | null> {
    return prisma.statusMaster.findUnique({ where: { id } });
  }

  async findStatusByCode(code: string): Promise<StatusMaster | null> {
    return prisma.statusMaster.findUnique({ where: { code } });
  }

  async findAllStatuses(query: {
    page: number;
    limit: number;
    search?: string;
    isActive?: boolean;
  }) {
    const { page, limit, search, isActive } = query;
    const skip = (page - 1) * limit;

    const where: Prisma.StatusMasterWhereInput = {};
    if (search) {
      where.OR = [
        { displayName: { contains: search, mode: 'insensitive' } },
        { code: { contains: search, mode: 'insensitive' } },
      ];
    }
    if (isActive !== undefined) {
      where.isActive = isActive;
    }

    const [rows, total] = await Promise.all([
      prisma.statusMaster.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      prisma.statusMaster.count({ where }),
    ]);

    return { rows, total, page, limit, totalPages: Math.ceil(total / limit) };
  }

  async findAllActiveStatuses(): Promise<StatusMaster[]> {
    return prisma.statusMaster.findMany({
      where: { isActive: true },
      orderBy: { displayName: 'asc' },
    });
  }

  async createStatus(data: CreateStatusBody): Promise<StatusMaster> {
    return prisma.statusMaster.create({
      data: {
        code: data.code,
        displayName: data.displayName,
        color: data.color,
        isSystem: false,
      },
    });
  }

  async updateStatus(id: string, data: UpdateStatusBody): Promise<StatusMaster> {
    return prisma.statusMaster.update({
      where: { id },
      data,
    });
  }

  async deleteStatus(id: string): Promise<void> {
    await prisma.statusMaster.delete({ where: { id } });
  }

  async seedDefaultStatuses(): Promise<void> {
    const defaultStatuses = [
      { code: 'NOT_STARTED', displayName: 'Not Started', color: '#6B7280', isSystem: true },
      { code: 'ONGOING', displayName: 'Ongoing', color: '#3B82F6', isSystem: true },
      { code: 'COMPLETED', displayName: 'Completed', color: '#22C55E', isSystem: true },
      { code: 'ON_HOLD', displayName: 'On Hold', color: '#F59E0B', isSystem: true },
      { code: 'DROPPED', displayName: 'Dropped', color: '#EF4444', isSystem: true },
    ];

    for (const status of defaultStatuses) {
      const existing = await this.findStatusByCode(status.code);
      if (!existing) {
        await prisma.statusMaster.create({ data: status });
      }
    }
  }
}

export const masterDataRepository = new MasterDataRepository();