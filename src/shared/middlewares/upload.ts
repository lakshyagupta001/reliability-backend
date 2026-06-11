import multer from 'multer';
import { AppError } from '../utils/errors/app-error';

const MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024; // 10 MB — matches Cloudinary free-tier limit

const imageFileFilter: multer.Options['fileFilter'] = (_req, file, cb) => {
  if (file.mimetype.startsWith('image/')) {
    cb(null, true);
  } else {
    cb(new AppError(400, 'Only image files are allowed. Supported formats: JPEG, PNG, GIF, WebP.'));
  }
};

export const multerUpload = multer({
  storage: multer.memoryStorage(), // buffer passed directly to Cloudinary — no disk writes
  limits: { fileSize: MAX_FILE_SIZE_BYTES },
  fileFilter: imageFileFilter,
});
