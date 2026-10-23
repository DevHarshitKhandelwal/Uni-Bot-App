import express from 'express';
import {
  sendMessage,
  getMySessions,
  getSessionMessages
} from '../controllers/chatController.js';
import { optionalAuth } from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(optionalAuth);

router.post('/message', sendMessage);
router.get('/sessions', getMySessions);
router.get('/sessions/:id', getSessionMessages);

export default router;
