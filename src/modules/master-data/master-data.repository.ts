import { prisma } from '../../prisma/prisma.client';
import type { MasterDataLevel, Prisma } from '@prisma/client';
import type { CreateMasterDataBody, UpdateMasterDataBody, ListMasterDataQuery } from './master-data.types';

// The shape that master-data.service.ts expects
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

export class MasterDataRepository {
  // --------------------------------------------------------------------------
  // Reads
  // --------------------------------------------------------------------------

  async findById(id: string): Promise<RawNode | null> {
    const cat = await prisma.categories.findUnique({
      where: { id },
      include: {
        subcategories: { orderBy: { name: 'asc' } },
        _count: { select: { projectsAsCategory: true } }
      }
    });
    if (cat) return this.mapCategory(cat);

    const sub = await prisma.subcategories.findUnique({
      where: { id },
      include: {
        types: { orderBy: { name: 'asc' } },
        _count: { select: { projectsAsSubcategory: true } }
      }
    });
    if (sub) return this.mapSubcategory(sub);

    const typ = await prisma.types.findUnique({
      where: { id },
      include: { _count: { select: { projectsAsType: true } } }
    });
    if (typ) return this.mapType(typ);

    return null;
  }

  async findByIdSimple(id: string): Promise<RawNode | null> {
    const cat = await prisma.categories.findUnique({
      where: { id },
      include: { _count: { select: { projectsAsCategory: true } } }
    });
    if (cat) return this.mapCategory(cat);

    const sub = await prisma.subcategories.findUnique({
      where: { id },
      include: { _count: { select: { projectsAsSubcategory: true } } }
    });
    if (sub) return this.mapSubcategory(sub);

    const typ = await prisma.types.findUnique({
      where: { id },
      include: { _count: { select: { projectsAsType: true } } }
    });
    if (typ) return this.mapType(typ);

    return null;
  }

  async findAll(query: ListMasterDataQuery) {
    const { page, limit, search, level, parentId, isActive } = query;
    const skip = (page - 1) * limit;

    let rows: RawNode[] = [];
    let total = 0;

    if (!level || level === 'CATEGORY') {
      const where: Prisma.categoriesWhereInput = {};
      if (isActive !== undefined) where.isActive = isActive;
      if (search) where.name = { contains: search, mode: 'insensitive' };
      
      if (!level || !parentId) {
        const [cats, catTotal] = await Promise.all([
          prisma.categories.findMany({
            where, skip: level ? skip : undefined, take: level ? limit : undefined, orderBy: { name: 'asc' },
            include: { _count: { select: { projectsAsCategory: true } } }
          }),
          prisma.categories.count({ where })
        ]);
        rows.push(...cats.map(c => this.mapCategory(c)));
        total += catTotal;
      }
    }

    if (!level || level === 'SUBCATEGORY') {
      const where: Prisma.subcategoriesWhereInput = {};
      if (isActive !== undefined) where.isActive = isActive;
      if (search) where.name = { contains: search, mode: 'insensitive' };
      if (parentId !== undefined) where.categoryId = parentId === 'null' ? '' : parentId;
      
      const [subs, subTotal] = await Promise.all([
        prisma.subcategories.findMany({
          where, skip: level ? skip : undefined, take: level ? limit : undefined, orderBy: { name: 'asc' },
          include: { _count: { select: { projectsAsSubcategory: true } } }
        }),
        prisma.subcategories.count({ where })
      ]);
      rows.push(...subs.map(s => this.mapSubcategory(s)));
      total += subTotal;
    }

    if (!level || level === 'TYPE') {
      const where: Prisma.typesWhereInput = {};
      if (isActive !== undefined) where.isActive = isActive;
      if (search) where.name = { contains: search, mode: 'insensitive' };
      if (parentId !== undefined) where.subcategoryId = parentId === 'null' ? '' : parentId;
      
      const [typs, typTotal] = await Promise.all([
        prisma.types.findMany({
          where, skip: level ? skip : undefined, take: level ? limit : undefined, orderBy: { name: 'asc' },
          include: { _count: { select: { projectsAsType: true } } }
        }),
        prisma.types.count({ where })
      ]);
      rows.push(...typs.map(t => this.mapType(t)));
      total += typTotal;
    }

    if (!level) {
      // Manual pagination if querying all levels
      rows = rows.slice(skip, skip + limit);
    }

    return { rows, total, page, limit, totalPages: Math.ceil(total / limit) };
  }

  async findCategories(isActive?: boolean) {
    const cats = await prisma.categories.findMany({
      where: isActive !== undefined ? { isActive } : {},
      orderBy: { name: 'asc' },
      include: { _count: { select: { projectsAsCategory: true } } }
    });
    return cats.map(c => this.mapCategory(c));
  }

  async findChildren(parentId: string, isActive?: boolean): Promise<RawNode[]> {
    // Parent could be a category or a subcategory
    const parentCat = await prisma.categories.findUnique({ where: { id: parentId } });
    if (parentCat) {
      const subs = await prisma.subcategories.findMany({
        where: { categoryId: parentId, ...(isActive !== undefined ? { isActive } : {}) },
        orderBy: { name: 'asc' },
        include: { _count: { select: { projectsAsSubcategory: true } } }
      });
      return subs.map(s => this.mapSubcategory(s));
    }

    const parentSub = await prisma.subcategories.findUnique({ where: { id: parentId } });
    if (parentSub) {
      const typs = await prisma.types.findMany({
        where: { subcategoryId: parentId, ...(isActive !== undefined ? { isActive } : {}) },
        orderBy: { name: 'asc' },
        include: { _count: { select: { projectsAsType: true } } }
      });
      return typs.map(t => this.mapType(t));
    }

    return [];
  }

  async getFullTree(isActive?: boolean): Promise<RawNode[]> {
    const categories = await prisma.categories.findMany({
      where: isActive !== undefined ? { isActive } : undefined,
      orderBy: { name: 'asc' },
      include: {
        subcategories: {
          where: isActive !== undefined ? { isActive } : undefined,
          orderBy: { name: 'asc' },
          include: {
            types: {
              where: isActive !== undefined ? { isActive } : undefined,
              orderBy: { name: 'asc' },
            }
          }
        }
      }
    });

    return categories.map(c => ({
      ...this.mapCategory(c),
      children: c.subcategories.map(s => ({
        ...this.mapSubcategory(s),
        children: s.types.map(t => this.mapType(t))
      }))
    }));
  }

  async findByNameAndParent(name: string, parentId: string | null, level: MasterDataLevel) {
    if (level === 'CATEGORY') {
      const cat = await prisma.categories.findFirst({
        where: { name: { equals: name, mode: 'insensitive' } }
      });
      return cat ? this.mapCategory(cat) : null;
    }
    if (level === 'SUBCATEGORY') {
      const sub = await prisma.subcategories.findFirst({
        where: { name: { equals: name, mode: 'insensitive' }, categoryId: parentId || '' }
      });
      return sub ? this.mapSubcategory(sub) : null;
    }
    if (level === 'TYPE') {
      const typ = await prisma.types.findFirst({
        where: { name: { equals: name, mode: 'insensitive' }, subcategoryId: parentId || '' }
      });
      return typ ? this.mapType(typ) : null;
    }
    return null;
  }

  // --------------------------------------------------------------------------
  // Writes
  // --------------------------------------------------------------------------

  async create(data: CreateMasterDataBody) {
    const code = data.name.toUpperCase().replace(/[^A-Z0-9]/g, '_').substring(0, 50);
    const crypto = require('crypto');
    const id = crypto.randomUUID();
    
    if (data.level === 'CATEGORY') {
      const cat = await prisma.categories.create({
        data: { id, name: data.name, code, isActive: true, updatedAt: new Date() }
      });
      return this.mapCategory(cat);
    }
    if (data.level === 'SUBCATEGORY') {
      const sub = await prisma.subcategories.create({
        data: { id, name: data.name, code, categoryId: data.parentId!, isActive: true, updatedAt: new Date() }
      });
      return this.mapSubcategory(sub);
    }
    if (data.level === 'TYPE') {
      const typ = await prisma.types.create({
        data: { id, name: data.name, code, subcategoryId: data.parentId!, isActive: true, updatedAt: new Date() }
      });
      return this.mapType(typ);
    }
    throw new Error('Invalid level');
  }

  async update(id: string, data: UpdateMasterDataBody) {
    const node = await this.findByIdSimple(id);
    if (!node) throw new Error('Not found');

    if (node.level === 'CATEGORY') {
      const cat = await prisma.categories.update({ where: { id }, data: { name: data.name, updatedAt: new Date() } });
      return this.mapCategory(cat);
    }
    if (node.level === 'SUBCATEGORY') {
      const sub = await prisma.subcategories.update({ where: { id }, data: { name: data.name, updatedAt: new Date() } });
      return this.mapSubcategory(sub);
    }
    if (node.level === 'TYPE') {
      const typ = await prisma.types.update({ where: { id }, data: { name: data.name, updatedAt: new Date() } });
      return this.mapType(typ);
    }
    throw new Error('Invalid level');
  }

  async cascadeDeactivate(id: string): Promise<void> {
    const node = await this.findByIdSimple(id);
    if (!node) return;

    if (node.level === 'CATEGORY') {
      await prisma.categories.update({ where: { id }, data: { isActive: false } });
      await prisma.subcategories.updateMany({ where: { categoryId: id }, data: { isActive: false } });
      const subs = await prisma.subcategories.findMany({ where: { categoryId: id }, select: { id: true } });
      if (subs.length > 0) {
        await prisma.types.updateMany({ where: { subcategoryId: { in: subs.map(s => s.id) } }, data: { isActive: false } });
      }
    } else if (node.level === 'SUBCATEGORY') {
      await prisma.subcategories.update({ where: { id }, data: { isActive: false } });
      await prisma.types.updateMany({ where: { subcategoryId: id }, data: { isActive: false } });
    } else if (node.level === 'TYPE') {
      await prisma.types.update({ where: { id }, data: { isActive: false } });
    }
  }

  async activate(id: string) {
    const node = await this.findByIdSimple(id);
    if (!node) throw new Error('Not found');

    if (node.level === 'CATEGORY') {
      const cat = await prisma.categories.update({ where: { id }, data: { isActive: true } });
      return this.mapCategory(cat);
    }
    if (node.level === 'SUBCATEGORY') {
      const sub = await prisma.subcategories.update({ where: { id }, data: { isActive: true } });
      return this.mapSubcategory(sub);
    }
    if (node.level === 'TYPE') {
      const typ = await prisma.types.update({ where: { id }, data: { isActive: true } });
      return this.mapType(typ);
    }
    throw new Error('Invalid level');
  }

  async delete(id: string) {
    const node = await this.findByIdSimple(id);
    if (!node) return;

    if (node.level === 'CATEGORY') {
      await prisma.categories.delete({ where: { id } });
    } else if (node.level === 'SUBCATEGORY') {
      await prisma.subcategories.delete({ where: { id } });
    } else if (node.level === 'TYPE') {
      await prisma.types.delete({ where: { id } });
    }
  }

  // --------------------------------------------------------------------------
  // Helpers
  // --------------------------------------------------------------------------

  private mapCategory(c: any): RawNode {
    return {
      id: c.id,
      name: c.name,
      level: 'CATEGORY',
      parentId: null,
      isActive: c.isActive,
      createdAt: c.createdAt,
      updatedAt: c.updatedAt,
      children: c.subcategories ? c.subcategories.map((s: any) => this.mapSubcategory(s)) : undefined,
      _count: {
        projectsAsCategory: c._count?.projectsAsCategory || 0,
        projectsAsSubcategory: 0,
        projectsAsType: 0,
      }
    };
  }

  private mapSubcategory(s: any): RawNode {
    return {
      id: s.id,
      name: s.name,
      level: 'SUBCATEGORY',
      parentId: s.categoryId,
      isActive: s.isActive,
      createdAt: s.createdAt,
      updatedAt: s.updatedAt,
      children: s.types ? s.types.map((t: any) => this.mapType(t)) : undefined,
      _count: {
        projectsAsCategory: 0,
        projectsAsSubcategory: s._count?.projectsAsSubcategory || 0,
        projectsAsType: 0,
      }
    };
  }

  private mapType(t: any): RawNode {
    return {
      id: t.id,
      name: t.name,
      level: 'TYPE',
      parentId: t.subcategoryId,
      isActive: t.isActive,
      createdAt: t.createdAt,
      updatedAt: t.updatedAt,
      _count: {
        projectsAsCategory: 0,
        projectsAsSubcategory: 0,
        projectsAsType: t._count?.projectsAsType || 0,
      }
    };
  }

  // --------------------------------------------------------------------------
  // Status Master (unchanged)
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