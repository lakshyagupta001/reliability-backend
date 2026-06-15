export interface UploadImageResponse {
  imageUrl: string;
}

/**
 * Returned by GET /api/v1/uploads/signature.
 * The frontend uses these fields to POST an image directly to Cloudinary,
 * bypassing the Express server entirely.
 *
 * Security note:
 *  - `signature` is HMAC-SHA1 of the upload params, signed server-side with
 *    CLOUDINARY_API_SECRET (never sent to the browser).
 *  - `apiKey` is Cloudinary's public identifier — safe to expose.
 *  - The signature is valid for 60 seconds (Cloudinary default TTL).
 */
export interface CloudinarySignatureResponse {
  signature: string;
  timestamp: number;
  cloudName: string;
  apiKey: string;
  folder: string;
}
