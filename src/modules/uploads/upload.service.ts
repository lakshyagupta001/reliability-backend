import { cloudinary } from '../../shared/config/cloudinary';
import { AppError } from '../../shared/utils/errors/app-error';
import type { CloudinarySignatureResponse } from './upload.types';

/** Folder where all report images are stored in Cloudinary. */
const UPLOAD_FOLDER = 'reliability-dashboard/reports';

export class UploadService {
  /**
   * Generates a short-lived Cloudinary upload signature so the browser can
   * POST an image directly to Cloudinary without routing bytes through Express.
   *
   * How it works:
   *   1. Frontend calls GET /api/v1/uploads/signature (authenticated).
   *   2. This method signs { folder, timestamp } with CLOUDINARY_API_SECRET.
   *   3. Frontend builds a FormData with the file + these credentials and POSTs
   *      straight to https://api.cloudinary.com/v1_1/{cloudName}/image/upload.
   *   4. Cloudinary validates the signature, stores the image, and returns the URL.
   *
   * Security:
   *   - CLOUDINARY_API_SECRET never leaves the server.
   *   - Signature is valid for 60 seconds (Cloudinary enforces this).
   *   - CLOUDINARY_API_KEY is a public identifier — safe to send to the browser.
   */
  generateUploadSignature(): CloudinarySignatureResponse {
    const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
    const apiKey = process.env.CLOUDINARY_API_KEY;
    const apiSecret = process.env.CLOUDINARY_API_SECRET;

    if (!cloudName || !apiKey || !apiSecret) {
      throw new AppError(500, 'Cloudinary environment variables are not configured.');
    }

    const timestamp = Math.round(Date.now() / 1000);

    // api_sign_request signs the params object with the API secret.
    // The params must exactly match what the browser will send in the upload form.
    const paramsToSign = { folder: UPLOAD_FOLDER, timestamp };
    const signature = cloudinary.utils.api_sign_request(paramsToSign, apiSecret);

    return { signature, timestamp, cloudName, apiKey, folder: UPLOAD_FOLDER };
  }

  /**
   * [FALLBACK] Uploads an image buffer to Cloudinary via the server.
   *
   * Kept for backward compatibility. Prefer generateUploadSignature() +
   * direct browser upload for new work — it is significantly faster.
   *
   * @param buffer   - Raw image buffer from multer
   * @param mimetype - MIME type (e.g. "image/png") used to detect the format
   * @returns        Secure Cloudinary URL (https://res.cloudinary.com/...)
   */
  async uploadImageBuffer(buffer: Buffer, mimetype: string): Promise<string> {
    return new Promise((resolve, reject) => {
      // Derive Cloudinary format from MIME type (e.g. "image/jpeg" → "jpeg")
      const format = mimetype.split('/')[1];

      const uploadStream = cloudinary.uploader.upload_stream(
        {
          folder: UPLOAD_FOLDER,
          resource_type: 'image',
          format,
        },
        (error, result) => {
          if (error) {
            reject(
              new AppError(
                502,
                `Cloudinary upload failed: ${error.message ?? 'Unknown error'}`,
              ),
            );
            return;
          }

          if (!result?.secure_url) {
            reject(new AppError(502, 'Cloudinary did not return an image URL'));
            return;
          }

          resolve(result.secure_url);
        },
      );

      uploadStream.end(buffer);
    });
  }
}

export const uploadService = new UploadService();
