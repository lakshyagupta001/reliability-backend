import type { Response } from 'express';
import type { AuthRequest } from '../../shared/middlewares/auth.middleware';
import { asyncHandler } from '../../shared/utils/async-handler';
import { sendSuccess } from '../../shared/utils/api-response';
import { AppError } from '../../shared/utils/errors/app-error';
import { uploadService } from './upload.service';
import type { UploadImageResponse, CloudinarySignatureResponse } from './upload.types';

/**
 * GET /api/v1/uploads/signature
 *
 * Returns a short-lived Cloudinary upload signature so the browser can upload
 * an image directly to Cloudinary (bypassing Express).
 *
 * Flow:
 *   1. Browser calls this endpoint (authenticated).
 *   2. Server signs { folder, timestamp } with CLOUDINARY_API_SECRET.
 *   3. Browser POSTs the image + these credentials directly to Cloudinary.
 *   4. No image bytes ever pass through Express.
 *
 * Response: { success: true, data: { signature, timestamp, cloudName, apiKey, folder } }
 */
export const getUploadSignature = asyncHandler(async (_req: AuthRequest, res: Response) => {
  const signatureData = uploadService.generateUploadSignature();
  return sendSuccess<CloudinarySignatureResponse>(res, 200, 'Upload signature generated', signatureData);
});

/**
 * POST /api/v1/uploads/image  [FALLBACK — kept for backward compatibility]
 *
 * Accepts a single image file (multipart/form-data, field name: "image"),
 * uploads it to Cloudinary via the server, and returns the secure URL.
 * Prefer the signature-based direct upload for performance.
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
