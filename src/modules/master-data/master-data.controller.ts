import type { Response } from 'express';
import { asyncHandler } from '../../shared/utils/async-handler';
import { sendSuccess, sendPaginatedSuccess, sendNoContentSuccess, type PaginationMeta } from '../../shared/utils/api-response';
import { type AuthRequest } from '../../shared/middlewares/auth.middleware';
import { masterDataService } from './master-data.service';
import type {
  CreateCategoryBody,
  UpdateCategoryBody,
  CreateSubcategoryBody,
  UpdateSubcategoryBody,
  CreateTypeBody,
  UpdateTypeBody,
  CreateStatusBody,
  UpdateStatusBody,
} from './master-data.types';

export const listCategories = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    const query = req.validatedQuery as { page: number; limit: number; search?: string; isActive?: boolean };
    const { rows, total, page, limit, totalPages } = await masterDataService.listCategories(query);

    const pagination: PaginationMeta = {
      page,
      limit,
      total,
      totalPages,
      hasNextPage: page < totalPages,
      hasPreviousPage: page > 1,
    };

    return sendPaginatedSuccess(res, 200, 'Categories fetched successfully', rows, pagination);
  },
);

export const getCategory = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    const { id } = req.params as { id: string };
    const category = await masterDataService.getCategoryById(id);
    return sendSuccess(res, 200, 'Category fetched successfully', category);
  },
);

export const createCategory = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    const body = req.validatedBody as CreateCategoryBody;
    const category = await masterDataService.createCategory(body);
    return sendSuccess(res, 201, 'Category created successfully', category);
  },
);

export const updateCategory = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    const { id } = req.params as { id: string };
    const body = req.validatedBody as UpdateCategoryBody;
    const category = await masterDataService.updateCategory(id, body);
    return sendSuccess(res, 200, 'Category updated successfully', category);
  },
);

export const toggleCategoryStatus = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    const { id } = req.params as { id: string };
    const { isActive } = req.body as { isActive: boolean };
    const category = await masterDataService.toggleCategoryStatus(id, isActive);
    return sendSuccess(res, 200, `Category ${isActive ? 'activated' : 'deactivated'} successfully`, category);
  },
);

export const listSubcategories = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    const query = req.validatedQuery as { page: number; limit: number; categoryId?: string; search?: string; isActive?: boolean };
    const { rows, total, page, limit, totalPages } = await masterDataService.listSubcategories(query);

    const pagination: PaginationMeta = {
      page,
      limit,
      total,
      totalPages,
      hasNextPage: page < totalPages,
      hasPreviousPage: page > 1,
    };

    return sendPaginatedSuccess(res, 200, 'Subcategories fetched successfully', rows, pagination);
  },
);

export const getSubcategory = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    const { id } = req.params as { id: string };
    const subcategory = await masterDataService.getSubcategoryById(id);
    return sendSuccess(res, 200, 'Subcategory fetched successfully', subcategory);
  },
);

export const getSubcategoriesByCategory = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    const { categoryId } = req.params as { categoryId: string };
    const { isActive } = req.query as { isActive?: string };
    const subcategories = await masterDataService.getSubcategoriesByCategoryId(
      categoryId,
      isActive === 'true' ? true : isActive === 'false' ? false : undefined,
    );
    return sendSuccess(res, 200, 'Subcategories fetched successfully', subcategories);
  },
);

export const createSubcategory = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    const body = req.validatedBody as CreateSubcategoryBody;
    const subcategory = await masterDataService.createSubcategory(body);
    return sendSuccess(res, 201, 'Subcategory created successfully', subcategory);
  },
);

export const updateSubcategory = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    const { id } = req.params as { id: string };
    const body = req.validatedBody as UpdateSubcategoryBody;
    const subcategory = await masterDataService.updateSubcategory(id, body);
    return sendSuccess(res, 200, 'Subcategory updated successfully', subcategory);
  },
);

export const toggleSubcategoryStatus = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    const { id } = req.params as { id: string };
    const { isActive } = req.body as { isActive: boolean };
    const subcategory = await masterDataService.toggleSubcategoryStatus(id, isActive);
    return sendSuccess(res, 200, `Subcategory ${isActive ? 'activated' : 'deactivated'} successfully`, subcategory);
  },
);

export const listTypes = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    const query = req.validatedQuery as { page: number; limit: number; search?: string; isActive?: boolean; categoryId?: string; subcategoryId?: string };
    const { rows, total, page, limit, totalPages } = await masterDataService.listTypes(query);

    const pagination: PaginationMeta = {
      page,
      limit,
      total,
      totalPages,
      hasNextPage: page < totalPages,
      hasPreviousPage: page > 1,
    };

    return sendPaginatedSuccess(res, 200, 'Types fetched successfully', rows, pagination);
  },
);

export const getAllActiveTypes = asyncHandler(
  async (_req: AuthRequest, res: Response) => {
    const types = await masterDataService.getAllActiveTypes();
    return sendSuccess(res, 200, 'Types fetched successfully', types);
  },
);

export const getType = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    const { id } = req.params as { id: string };
    const type = await masterDataService.getTypeById(id);
    return sendSuccess(res, 200, 'Type fetched successfully', type);
  },
);

export const getTypesBySubcategory = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    const { subcategoryId } = req.params as { subcategoryId: string };
    const types = await masterDataService.getTypesBySubcategoryId(subcategoryId);
    return sendSuccess(res, 200, 'Types fetched successfully', types);
  },
);

export const createType = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    const body = req.validatedBody as CreateTypeBody;
    const type = await masterDataService.createType(body);
    return sendSuccess(res, 201, 'Type created successfully', type);
  },
);

export const updateType = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    const { id } = req.params as { id: string };
    const body = req.validatedBody as UpdateTypeBody;
    const type = await masterDataService.updateType(id, body);
    return sendSuccess(res, 200, 'Type updated successfully', type);
  },
);

export const toggleTypeStatus = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    const { id } = req.params as { id: string };
    const { isActive } = req.body as { isActive: boolean };
    const type = await masterDataService.toggleTypeStatus(id, isActive);
    return sendSuccess(res, 200, `Type ${isActive ? 'activated' : 'deactivated'} successfully`, type);
  },
);



export const listStatuses = asyncHandler(
  async (req: AuthRequest, res: Response) => {
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
  },
);

export const getStatus = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    const { id } = req.params as { id: string };
    const status = await masterDataService.getStatusById(id);
    return sendSuccess(res, 200, 'Status fetched successfully', status);
  },
);

export const getAllActiveStatuses = asyncHandler(
  async (_req: AuthRequest, res: Response) => {
    const statuses = await masterDataService.getAllActiveStatuses();
    return sendSuccess(res, 200, 'Statuses fetched successfully', statuses);
  },
);

export const createStatus = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    const body = req.validatedBody as CreateStatusBody;
    const status = await masterDataService.createStatus(body);
    return sendSuccess(res, 201, 'Status created successfully', status);
  },
);

export const updateStatus = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    const { id } = req.params as { id: string };
    const body = req.validatedBody as UpdateStatusBody;
    const status = await masterDataService.updateStatus(id, body);
    return sendSuccess(res, 200, 'Status updated successfully', status);
  },
);

export const toggleStatusActive = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    const { id } = req.params as { id: string };
    const { isActive } = req.body as { isActive: boolean };
    const status = await masterDataService.toggleStatusActive(id, isActive);
    return sendSuccess(res, 200, `Status ${isActive ? 'activated' : 'deactivated'} successfully`, status);
  },
);