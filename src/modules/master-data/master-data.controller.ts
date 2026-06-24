import type { Response } from 'express';
import { asyncHandler } from '../../shared/utils/async-handler';
import {
  sendSuccess,
  sendPaginatedSuccess,
  type PaginationMeta,
} from '../../shared/utils/api-response';
import { type AuthRequest } from '../../shared/middlewares/auth.middleware';
import { masterDataService } from './master-data.service';
import type {
  CreateMasterDataBody,
  UpdateMasterDataBody,
  ListMasterDataQuery,
  MasterDataLevel,
} from './master-data.types';

// ============================================================================
// MasterData endpoints
// ============================================================================

export const listMasterData = asyncHandler(async (req: AuthRequest, res: Response) => {
  const query = req.validatedQuery as ListMasterDataQuery;
  const { rows, total, page, limit, totalPages } = await masterDataService.list(query);

  const pagination: PaginationMeta = {
    page,
    limit,
    total,
    totalPages,
    hasNextPage: page < totalPages,
    hasPreviousPage: page > 1,
  };

  return sendPaginatedSuccess(res, 200, 'Master data fetched successfully', rows, pagination);
});

export const getMasterDataTree = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { isActive } = req.query as { isActive?: string };
  const filter = isActive === 'true' ? true : isActive === 'false' ? false : undefined;
  const tree = await masterDataService.getTree(filter);
  return sendSuccess(res, 200, 'Master data tree fetched successfully', tree);
});

export const getCategories = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { isActive } = req.query as { isActive?: string };
  const filter = isActive === 'true' ? true : isActive === 'false' ? false : undefined;
  const categories = await masterDataService.getCategories(filter);
  return sendSuccess(res, 200, 'Categories fetched successfully', categories);
});

export const getMasterDataById = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { id } = req.params as { id: string };
  const node = await masterDataService.getById(id);
  return sendSuccess(res, 200, 'Master data node fetched successfully', node);
});

export const getChildrenByParent = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { id } = req.params as { id: string };
  const { isActive } = req.query as { isActive?: string };
  const filter = isActive === 'true' ? true : isActive === 'false' ? false : undefined;
  const children = await masterDataService.getChildren(id, filter);
  return sendSuccess(res, 200, 'Children fetched successfully', children);
});

export const createMasterData = asyncHandler(async (req: AuthRequest, res: Response) => {
  const body = req.validatedBody as CreateMasterDataBody;
  const node = await masterDataService.create(body);
  return sendSuccess(res, 201, 'Master data node created successfully', node);
});

export const updateMasterData = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { id } = req.params as { id: string };
  const body = req.validatedBody as UpdateMasterDataBody;
  const node = await masterDataService.update(id, body);
  return sendSuccess(res, 200, 'Master data node updated successfully', node);
});

export const activateMasterData = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { id } = req.params as { id: string };
  const node = await masterDataService.activate(id);
  return sendSuccess(res, 200, 'Node activated successfully', node);
});

export const deactivateMasterData = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { id } = req.params as { id: string };
  const node = await masterDataService.deactivate(id);
  return sendSuccess(res, 200, 'Node and all its children deactivated successfully', node);
});

export const deleteMasterData = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { id } = req.params as { id: string };
  await masterDataService.deleteNode(id);
  return sendSuccess(res, 200, 'Master data deleted successfully', null);
});

// ============================================================================
// Deprecated aliases — backed by MasterData service (kept for frontend compatibility)
// These will be removed after the frontend migrates to /master-data endpoints.
// ============================================================================

/** @deprecated Use GET /master-data?level=CATEGORY */
export const listCategories = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { isActive } = req.query as { isActive?: string };
  const filter = isActive === 'true' ? true : isActive === 'false' ? false : undefined;
  const categories = await masterDataService.getCategories(filter);
  return sendSuccess(res, 200, 'Categories fetched successfully', categories);
});

/** @deprecated Use GET /master-data/:id */
export const getCategory = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { id } = req.params as { id: string };
  const node = await masterDataService.getById(id);
  return sendSuccess(res, 200, 'Category fetched successfully', node);
});

/** @deprecated Use GET /master-data?level=SUBCATEGORY&parentId=:categoryId */
export const listSubcategories = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { categoryId, isActive } = req.query as { categoryId?: string; isActive?: string };
  const filter = isActive === 'true' ? true : isActive === 'false' ? false : undefined;
  const children = categoryId
    ? await masterDataService.getChildren(categoryId, filter)
    : (await masterDataService.list({ page: 1, limit: 200, level: 'SUBCATEGORY' as MasterDataLevel, isActive: filter })).rows;
  const mapped = children.map(c => ({ ...c, categoryId: c.parentId }));
  return sendSuccess(res, 200, 'Subcategories fetched successfully', mapped);
});

/** @deprecated Use GET /master-data/:categoryId/children */
export const getSubcategoriesByCategory = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { categoryId } = req.params as { categoryId: string };
  const { isActive } = req.query as { isActive?: string };
  const filter = isActive === 'true' ? true : isActive === 'false' ? false : undefined;
  const children = await masterDataService.getChildren(categoryId, filter);
  const mapped = children.map(c => ({ ...c, categoryId: c.parentId }));
  return sendSuccess(res, 200, 'Subcategories fetched successfully', mapped);
});

/** @deprecated Use GET /master-data?level=TYPE&parentId=:subcategoryId */
export const listTypes = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { subcategoryId, isActive } = req.query as { subcategoryId?: string; isActive?: string };
  const filter = isActive === 'true' ? true : isActive === 'false' ? false : undefined;
  const children = subcategoryId
    ? await masterDataService.getChildren(subcategoryId, filter)
    : (await masterDataService.list({ page: 1, limit: 200, level: 'TYPE' as MasterDataLevel, isActive: filter })).rows;
  const mapped = children.map(c => ({ ...c, subcategoryId: c.parentId }));
  return sendSuccess(res, 200, 'Types fetched successfully', mapped);
});

/** @deprecated Use GET /master-data/:subcategoryId/children */
export const getTypesBySubcategory = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { subcategoryId } = req.params as { subcategoryId: string };
  const { isActive } = req.query as { isActive?: string };
  const filter = isActive === 'true' ? true : isActive === 'false' ? false : undefined;
  const children = await masterDataService.getChildren(subcategoryId, filter);
  const mapped = children.map(c => ({ ...c, subcategoryId: c.parentId }));
  return sendSuccess(res, 200, 'Types fetched successfully', mapped);
});

/** @deprecated Use GET /master-data?level=TYPE&isActive=true */
export const getAllActiveTypes = asyncHandler(async (_req: AuthRequest, res: Response) => {
  const types = await masterDataService.list({ page: 1, limit: 1000, level: 'TYPE' as MasterDataLevel, isActive: true });
  const mapped = types.rows.map(c => ({ ...c, subcategoryId: c.parentId }));
  return sendSuccess(res, 200, 'Active types fetched successfully', mapped);
});

// ============================================================================
// Status Master (unchanged)
// ============================================================================

export const listStatuses = asyncHandler(async (req: AuthRequest, res: Response) => {
  const query = req.validatedQuery as { page: number; limit: number; search?: string; isActive?: boolean };
  const { rows, total, page, limit, totalPages } = await masterDataService.listStatuses(query);
  const pagination: PaginationMeta = {
    page,
    limit,
    total,
    totalPages,
    hasNextPage: page < totalPages,
    hasPreviousPage: page > 1,
  };
  return sendPaginatedSuccess(res, 200, 'Statuses fetched successfully', rows, pagination);
});

export const getStatus = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { id } = req.params as { id: string };
  const status = await masterDataService.getStatusById(id);
  return sendSuccess(res, 200, 'Status fetched successfully', status);
});

export const getAllActiveStatuses = asyncHandler(async (_req: AuthRequest, res: Response) => {
  const statuses = await masterDataService.getAllActiveStatuses();
  return sendSuccess(res, 200, 'Statuses fetched successfully', statuses);
});

export const createStatus = asyncHandler(async (req: AuthRequest, res: Response) => {
  const body = req.validatedBody as { code: string; displayName: string; color?: string };
  const status = await masterDataService.createStatus(body);
  return sendSuccess(res, 201, 'Status created successfully', status);
});

export const updateStatus = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { id } = req.params as { id: string };
  const body = req.validatedBody as { displayName?: string; color?: string; isActive?: boolean };
  const status = await masterDataService.updateStatus(id, body);
  return sendSuccess(res, 200, 'Status updated successfully', status);
});

export const toggleStatusActive = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { id } = req.params as { id: string };
  const { isActive } = req.body as { isActive: boolean };
  const status = await masterDataService.toggleStatusActive(id, isActive);
  return sendSuccess(res, 200, `Status ${isActive ? 'activated' : 'deactivated'} successfully`, status);
});