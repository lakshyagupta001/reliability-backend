import { Router } from 'express';
import { authenticate } from '../../shared/middlewares/auth.middleware';
import { multerUpload } from '../../middlewares/upload';
import { uploadImage } from './upload.controller';

const router = Router();

/**
 * POST /api/v1/uploads/image
 *
 * Requires authentication.
 * Accepts multipart/form-data with an "image" field.
 * Returns { success: true, data: { imageUrl: "https://res.cloudinary.com/..." } }
 */
router.post('/image', authenticate, multerUpload.single('image'), uploadImage);

export default router;
