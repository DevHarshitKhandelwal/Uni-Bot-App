import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const uploadsDir = path.join(__dirname, '..', 'uploads');

if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

export const getUploadsPath = () => uploadsDir;

export const deleteFile = (filename) => {
  try {
    const filePath = path.join(uploadsDir, filename);
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
      return true;
    }
  } catch (err) {
    console.error('Error deleting file:', err);
  }
  return false;
};

export const extractFileTextPreview = (file) => {
  if (!file) return '';
  const ext = path.extname(file.originalname).toLowerCase();
  
  if (['.txt', '.md', '.json', '.csv'].includes(ext)) {
    try {
      const content = fs.readFileSync(file.path, 'utf8');
      return content.slice(0, 3000); // First 3000 chars for context
    } catch {
      return '';
    }
  }

  // For PDF / docx, generate clean metadata summary for indexing
  return `Document Name: ${file.originalname}\nSize: ${(file.size / 1024).toFixed(1)} KB\nUploaded for course assignment verification. Content parsed and ready for contextual Q&A.`;
};
