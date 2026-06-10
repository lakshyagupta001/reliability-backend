import { cloudinary } from '../../shared/config/cloudinary';
import { AppError } from '../../shared/utils/errors/app-error';

export class UploadService {
  /**
   * Uploads an image buffer to Cloudinary and returns the secure URL.
   *
   * Uses upload_stream so we never write the file to disk — the buffer from
   * multer memoryStorage is piped directly to Cloudinary.
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
          folder: 'reliability-dashboard/reports',
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
