export type MasterDataLevel = 'CATEGORY' | 'SUBCATEGORY' | 'TYPE';

// ============================================================================
// Public response shapes
// ============================================================================

export interface PublicMasterData {
  id: string;
  name: string;
  level: MasterDataLevel;
  parentId: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  children?: PublicMasterData[];
  projectCount?: number;
  /** breadcrumb: [category, subcategory?, type?] */
  ancestors?: { id: string; name: string; level: MasterDataLevel }[];
}

export interface MasterDataTree {
  id: string;
  name: string;
  level: 'CATEGORY';
  isActive: boolean;
  children: MasterDataSubcategoryNode[];
}

export interface MasterDataSubcategoryNode {
  id: string;
  name: string;
  level: 'SUBCATEGORY';
  parentId: string;
  isActive: boolean;
  children: MasterDataTypeNode[];
}

export interface MasterDataTypeNode {
  id: string;
  name: string;
  level: 'TYPE';
  parentId: string;
  isActive: boolean;
}

// ============================================================================
// Request body shapes
// ============================================================================

export interface CreateMasterDataBody {
  name: string;
  level: MasterDataLevel;
  /** Required when level = SUBCATEGORY or TYPE */
  parentId?: string;
}

export interface UpdateMasterDataBody {
  name: string;
}

// ============================================================================
// Query shapes
// ============================================================================

export interface ListMasterDataQuery {
  page: number;
  limit: number;
  search?: string;
  level?: MasterDataLevel;
  parentId?: string;
  isActive?: boolean;
}