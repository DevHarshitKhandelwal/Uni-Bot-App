import express from 'express';
import {
  getMyAssignments,
  createAssignment,
  uploadAssignmentFiles,
  updateAssignmentStatus,
  deleteAssignment,
  downloadAssignmentFile
} from '../controllers/assignmentController.js';
import { requireAuth } from '../middleware/authMiddleware.js';
import { upload } from '../middleware/uploadMiddleware.js';

const router = express.Router();

router.use(requireAuth); // All vault routes require authenticated student

router.get('/', getMyAssignments);
router.post('/', upload.array('files', 5), createAssignment);
router.post('/:id/files', upload.array('files', 5), uploadAssignmentFiles);
router.patch('/:id/status', updateAssignmentStatus);
router.delete('/:id', deleteAssignment);
router.get('/:id/download/:fileName', downloadAssignmentFile);

export default router;
