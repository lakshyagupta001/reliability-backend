import type { Response } from 'express';
import type { AuthRequest } from '../../shared/middlewares/auth.middleware';
import { asyncHandler } from '../../shared/utils/async-handler';
import { sendSuccess } from '../../shared/utils/api-response';
import { AppError } from '../../shared/utils/errors/app-error';
import { uploadService } from './upload.service';
import type { UploadImageResponse } from './upload.types';

/**
 * POST /api/v1/uploads/image
 *
 * Accepts a single image file (multipart/form-data, field name: "image"),
 * uploads it to Cloudinary, and returns the secure URL.
 *
 * Response: { success: true, data: { imageUrl: "https://res.cloudinary.com/..." } }
 */
export const uploadImage = asyncHandler(async (req: AuthRequest, res: Response) => {
  if (!req.file) {
    throw new AppError(400, 'No image file provided. Include an image in the "image" field.');
  }

  const imageUrl = await uploadService.uploadImageBuffer(req.file.buffer, req.file.mimetype);

  const responseData: UploadImageResponse = { imageUrl };

  return sendSuccess<UploadImageResponse>(res, 200, 'Image uploaded successfully', responseData);
});
