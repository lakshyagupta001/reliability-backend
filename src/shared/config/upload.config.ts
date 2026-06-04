import multer from 'multer';
import path from 'path';
import { appConfig } from './app.config';

const ALLOWED_MIME_TYPES = [
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'image/png',
  'image/jpeg',
  'image/jpg',
];

export const upload = multer({
  dest: path.join(process.cwd(), 'uploads'),
  limits: { fileSize: 10 * 1024 * 1024 }, // 10 MB
  fileFilter: (_req, file, cb) => {
    if (ALLOWED_MIME_TYPES.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Only PDF, DOC, DOCX, PNG, JPG files are allowed'));
    }
  },
});

export const uploadConfig = {
  maxFileSize: 10 * 1024 * 1024,
  allowedMimeTypes: ALLOWED_MIME_TYPES,
};