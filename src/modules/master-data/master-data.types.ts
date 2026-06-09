import { Category, Subcategory, Type, StatusMaster } from '@prisma/client';

export type { Category, Subcategory, Type, StatusMaster };

export interface PublicCategory {
  id: string;
  name: string;
  code: string;
  description: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  subcategories?: PublicSubcategory[];
}

export interface PublicSubcategory {
  id: string;
  categoryId: string;
  name: string;
  code: string;
  description: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  category?: { id: string; name: string; code: string };
  types?: PublicType[];
}

export interface PublicType {
  id: string;
  subcategoryId: string;
  name: string;
  code: string;
  description: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  subcategory?: {
    id: string;
    name: string;
    code: string;
    category?: { id: string; name: string; code: string };
  };
}

export interface PublicStatusMaster {
  id: string;
  code: string;
  displayName: string;
  color: string;
  isActive: boolean;
  isSystem: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateCategoryBody {
  name: string;
  code: string;
  description?: string;
}

export interface UpdateCategoryBody {
  name?: string;
  description?: string;
  isActive?: boolean;
}

export interface CreateSubcategoryBody {
  categoryId: string;
  name: string;
  code: string;
  description?: string;
}

export interface UpdateSubcategoryBody {
  categoryId?: string;
  name?: string;
  description?: string;
  isActive?: boolean;
}

export interface CreateTypeBody {
  subcategoryId: string;
  name: string;
  code: string;
  description?: string;
}

export interface UpdateTypeBody {
  subcategoryId?: string;
  name?: string;
  description?: string;
  isActive?: boolean;
}

export interface CreateStatusBody {
  code: string;
  displayName: string;
  color?: string;
}

export interface UpdateStatusBody {
  displayName?: string;
  color?: string;
  isActive?: boolean;
}

export interface ListMasterDataQuery {
  page?: number;
  limit?: number;
  search?: string;
  isActive?: boolean;
  categoryId?: string;
}

export interface SubcategoryListQuery {
  categoryId?: string;
  isActive?: boolean;
}

export interface TypeListQuery {
  isActive?: boolean;
  categoryId?: string;
  subcategoryId?: string;
}