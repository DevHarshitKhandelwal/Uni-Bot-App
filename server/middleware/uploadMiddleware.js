import multer from 'multer';
import path from 'path';
import { getUploadsPath } from '../services/storageService.js';

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, getUploadsPath());
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e6);
    const ext = path.extname(file.originalname);
    const basename = path.basename(file.originalname, ext).replace(/[^a-zA-Z0-9_-]/g, '_');
    cb(null, `${basename}-${uniqueSuffix}${ext}`);
  }
});

const fileFilter = (req, file, cb) => {
  const allowedExtensions = ['.pdf', '.docx', '.doc', '.txt', '.pptx', '.png', '.jpg', '.jpeg', '.zip'];
  const ext = path.extname(file.originalname).toLowerCase();
  if (allowedExtensions.includes(ext)) {
    cb(null, true);
  } else {
    cb(new Error(`File format ${ext} not supported. Allowed formats: PDF, DOCX, TXT, PPTX, Images, ZIP`), false);
  }
};

export const upload = multer({
  storage,
  limits: {
    fileSize: 30 * 1024 * 1024, // 30 MB max
  },
  fileFilter,
});
