import { Router } from 'express';
import { authenticate } from '../../shared/middlewares/auth.middleware';
import { multerUpload } from '../../shared/middlewares/upload';
import { getUploadSignature, uploadImage } from './upload.controller';

const router = Router();

/**
 * GET /api/v1/uploads/signature
 *
 * Returns a short-lived Cloudinary upload signature.
 * The browser uses it to upload directly to Cloudinary (no file bytes through Express).
 * Requires authentication — no file parsing needed.
 */
router.get('/signature', authenticate, getUploadSignature);

/**
 * POST /api/v1/uploads/image  [FALLBACK]
 *
 * Legacy server-proxy upload. Kept for backward compatibility.
 * Prefer GET /signature + direct browser upload for performance.
 * Returns { success: true, data: { imageUrl: "https://res.cloudinary.com/..." } }
 */
router.post('/image', authenticate, multerUpload.single('image'), uploadImage);

export default router;
