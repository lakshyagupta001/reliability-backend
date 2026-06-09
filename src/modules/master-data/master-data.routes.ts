import { Router } from 'express';
import { authenticate } from '../../shared/middlewares/auth.middleware';
import { authorizeRoles } from '../../shared/middlewares/role.middleware';
import { validateBody, validateParams, validateQuery } from '../../shared/middlewares/validate.middleware';
import {
  listCategories,
  getCategory,
  createCategory,
  updateCategory,
  toggleCategoryStatus,
  listSubcategories,
  getSubcategory,
  getSubcategoriesByCategory,
  createSubcategory,
  updateSubcategory,
  toggleSubcategoryStatus,
  listTypes,
  getAllActiveTypes,
  getType,
  getTypesBySubcategory,
  createType,
  updateType,
  toggleTypeStatus,
  listStatuses,
  getStatus,
  getAllActiveStatuses,
  createStatus,
  updateStatus,
  toggleStatusActive,
} from './master-data.controller';
import {
  listCategoriesQuerySchema,
  createCategorySchema,
  updateCategorySchema,
  categoryIdParamSchema,
  listSubcategoriesQuerySchema,
  createSubcategorySchema,
  updateSubcategorySchema,
  subcategoryIdParamSchema,
  listTypesQuerySchema,
  createTypeSchema,
  updateTypeSchema,
  typeIdParamSchema,
  listStatusesQuerySchema,
  createStatusSchema,
  updateStatusSchema,
  statusIdParamSchema,
} from './master-data.validation';

const router = Router();

router.use(authenticate);

router.get(
  '/categories',
  validateQuery(listCategoriesQuerySchema),
  listCategories,
);

router.get(
  '/categories/:id',
  validateParams(categoryIdParamSchema),
  getCategory,
);

router.get(
  '/categories/:categoryId/subcategories',
  getSubcategoriesByCategory,
);

router.get(
  '/subcategories',
  validateQuery(listSubcategoriesQuerySchema),
  listSubcategories,
);

router.get(
  '/subcategories/:id',
  validateParams(subcategoryIdParamSchema),
  getSubcategory,
);

router.get(
  '/subcategories/:subcategoryId/types',
  getTypesBySubcategory,
);



router.get(
  '/types',
  validateQuery(listTypesQuerySchema),
  listTypes,
);

router.get(
  '/types/active',
  getAllActiveTypes,
);

router.get(
  '/types/:id',
  validateParams(typeIdParamSchema),
  getType,
);

router.get(
  '/statuses',
  validateQuery(listStatusesQuerySchema),
  listStatuses,
);

router.get(
  '/statuses/active',
  getAllActiveStatuses,
);

router.get(
  '/statuses/:id',
  validateParams(statusIdParamSchema),
  getStatus,
);

router.post(
  '/categories',
  authorizeRoles('ADMIN'),
  validateBody(createCategorySchema),
  createCategory,
);

router.patch(
  '/categories/:id',
  authorizeRoles('ADMIN'),
  validateParams(categoryIdParamSchema),
  validateBody(updateCategorySchema),
  updateCategory,
);

router.patch(
  '/categories/:id/status',
  authorizeRoles('ADMIN'),
  validateParams(categoryIdParamSchema),
  validateBody(updateCategorySchema.pick({ isActive: true })),
  toggleCategoryStatus,
);

router.post(
  '/subcategories',
  authorizeRoles('ADMIN'),
  validateBody(createSubcategorySchema),
  createSubcategory,
);

router.patch(
  '/subcategories/:id',
  authorizeRoles('ADMIN'),
  validateParams(subcategoryIdParamSchema),
  validateBody(updateSubcategorySchema),
  updateSubcategory,
);

router.patch(
  '/subcategories/:id/status',
  authorizeRoles('ADMIN'),
  validateParams(subcategoryIdParamSchema),
  validateBody(updateSubcategorySchema.pick({ isActive: true })),
  toggleSubcategoryStatus,
);



router.post(
  '/types',
  authorizeRoles('ADMIN'),
  validateBody(createTypeSchema),
  createType,
);

router.patch(
  '/types/:id',
  authorizeRoles('ADMIN'),
  validateParams(typeIdParamSchema),
  validateBody(updateTypeSchema),
  updateType,
);

router.patch(
  '/types/:id/status',
  authorizeRoles('ADMIN'),
  validateParams(typeIdParamSchema),
  validateBody(updateTypeSchema.pick({ isActive: true })),
  toggleTypeStatus,
);

router.post(
  '/statuses',
  authorizeRoles('ADMIN'),
  validateBody(createStatusSchema),
  createStatus,
);

router.patch(
  '/statuses/:id',
  authorizeRoles('ADMIN'),
  validateParams(statusIdParamSchema),
  validateBody(updateStatusSchema),
  updateStatus,
);

router.patch(
  '/statuses/:id/status',
  authorizeRoles('ADMIN'),
  validateParams(statusIdParamSchema),
  validateBody(updateStatusSchema.pick({ isActive: true })),
  toggleStatusActive,
);

export default router;