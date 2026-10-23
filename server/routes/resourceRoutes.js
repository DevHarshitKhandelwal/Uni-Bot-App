import express from 'express';
import {
  getAllResources,
  getResourceById,
  createResource,
  toggleUpvote,
  downloadResource
} from '../controllers/resourceController.js';
import { requireAuth, optionalAuth } from '../middleware/authMiddleware.js';
import { upload } from '../middleware/uploadMiddleware.js';

const router = express.Router();

router.get('/', optionalAuth, getAllResources);
router.get('/:id', optionalAuth, getResourceById);
router.post('/', optionalAuth, upload.single('file'), createResource);
router.post('/:id/upvote', requireAuth, toggleUpvote);
router.get('/:id/download', downloadResource);

export default router;
