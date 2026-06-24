import { Router } from 'express';
import { authenticate } from '../../shared/middlewares/auth.middleware';
import { authorizeRoles } from '../../shared/middlewares/role.middleware';
import { validateBody, validateParams, validateQuery } from '../../shared/middlewares/validate.middleware';
import {
  // New unified endpoints
  listMasterData,
  getMasterDataTree,
  getCategories,
  getMasterDataById,
  getChildrenByParent,
  createMasterData,
  updateMasterData,
  activateMasterData,
  deactivateMasterData,
  deleteMasterData,
  // Deprecated aliases
  listCategories,
  getCategory,
  listSubcategories,
  getSubcategoriesByCategory,
  listTypes,
  getTypesBySubcategory,
  getAllActiveTypes,
  // Status (unchanged)
  listStatuses,
  getStatus,
  getAllActiveStatuses,
  createStatus,
  updateStatus,
  toggleStatusActive,
} from './master-data.controller';
import {
  masterDataIdParamSchema,
  listMasterDataQuerySchema,
  createMasterDataSchema,
  updateMasterDataSchema,
  statusIdParamSchema,
  listStatusesQuerySchema,
  createStatusSchema,
  updateStatusSchema,
  // Legacy
  categoryIdParamSchema,
  listCategoriesQuerySchema,
  subcategoryIdParamSchema,
  listSubcategoriesQuerySchema,
  typeIdParamSchema,
  listTypesQuerySchema,
} from './master-data.validation';

const router = Router();
router.use(authenticate);

// ============================================================================
// NEW: Unified MasterData endpoints
// ============================================================================

/** GET / — list nodes (filterable by level, parentId, isActive, search) */
router.get('/', validateQuery(listMasterDataQuerySchema), listMasterData);

/** GET /tree — full nested tree (category → subcategory → type) */
router.get('/tree', getMasterDataTree);

/** GET /categories — all top-level categories */
router.get('/categories', getCategories);

/** POST / — create a new node */
router.post(
  '/',
  authorizeRoles('MANAGER', 'TEAM_LEAD'),
  validateBody(createMasterDataSchema),
  createMasterData,
);

// ============================================================================
// DEPRECATED: Legacy endpoints — backed by MasterData service
// Will be removed after frontend migrates to /master-data endpoints.
// ============================================================================

/** @deprecated */
router.get('/categories', validateQuery(listCategoriesQuerySchema), listCategories);
/** @deprecated */
router.get('/categories/:id', validateParams(categoryIdParamSchema), getCategory);
/** @deprecated */
router.get('/categories/:categoryId/subcategories', getSubcategoriesByCategory);
/** @deprecated */
router.get('/subcategories', validateQuery(listSubcategoriesQuerySchema), listSubcategories);
/** @deprecated */
router.get('/types/active', getAllActiveTypes);
/** @deprecated */
router.get('/types', validateQuery(listTypesQuerySchema), listTypes);
/** @deprecated */
router.get('/subcategories/:subcategoryId/types', getTypesBySubcategory);

// ============================================================================
// Status Master (unchanged)
// ============================================================================

router.get('/statuses', validateQuery(listStatusesQuerySchema), listStatuses);
router.get('/statuses/active', getAllActiveStatuses);
router.get('/statuses/:id', validateParams(statusIdParamSchema), getStatus);

router.post(
  '/statuses',
  authorizeRoles('MANAGER', 'TEAM_LEAD'),
  validateBody(createStatusSchema),
  createStatus,
);

router.patch(
  '/statuses/:id',
  authorizeRoles('MANAGER', 'TEAM_LEAD'),
  validateParams(statusIdParamSchema),
  validateBody(updateStatusSchema),
  updateStatus,
);

router.patch(
  '/statuses/:id/status',
  authorizeRoles('MANAGER', 'TEAM_LEAD'),
  validateParams(statusIdParamSchema),
  validateBody(updateStatusSchema.pick({ isActive: true })),
  toggleStatusActive,
);

// ============================================================================
// GENERIC ID ROUTES (MUST BE LAST to avoid matching string paths like /subcategories)
// ============================================================================

/** GET /:id — single node with its direct children */
router.get('/:id', validateParams(masterDataIdParamSchema), getMasterDataById);

/** GET /:id/children — direct children of a node */
router.get('/:id/children', validateParams(masterDataIdParamSchema), getChildrenByParent);

/** PATCH /:id — update node name */
router.patch(
  '/:id',
  authorizeRoles('MANAGER', 'TEAM_LEAD'),
  validateParams(masterDataIdParamSchema),
  validateBody(updateMasterDataSchema),
  updateMasterData,
);

/** PATCH /:id/activate — activate a single node */
router.patch(
  '/:id/activate',
  authorizeRoles('MANAGER', 'TEAM_LEAD'),
  validateParams(masterDataIdParamSchema),
  activateMasterData,
);

/** PATCH /:id/deactivate — deactivate node + all descendants */
router.patch(
  '/:id/deactivate',
  authorizeRoles('MANAGER', 'TEAM_LEAD'),
  validateParams(masterDataIdParamSchema),
  deactivateMasterData,
);

/** DELETE /:id — hard delete node if unused */
router.delete(
  '/:id',
  authorizeRoles('MANAGER', 'TEAM_LEAD'),
  validateParams(masterDataIdParamSchema),
  deleteMasterData,
);

export default router;