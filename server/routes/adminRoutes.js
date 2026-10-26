import express from 'express';
import { adminLogin } from '../controllers/authController.js';
import {
  getAiSettings,
  updateAiProvider,
} from '../controllers/adminController.js';
import { requireAdmin, requireAuth } from '../middleware/authMiddleware.js';

const router = express.Router();
const loginAttempts = new Map();

const limitAdminLoginAttempts = (req, res, next) => {
  const now = Date.now();
  const key = req.ip;
  const current = loginAttempts.get(key);
  if (!current || current.resetAt <= now) {
    loginAttempts.set(key, { count: 1, resetAt: now + 15 * 60 * 1000 });
    return next();
  }
  if (current.count >= 10) {
    return res.status(429).json({
      success: false,
      message: 'Too many administrator login attempts. Try again in 15 minutes.',
    });
  }
  current.count += 1;
  return next();
};

router.post('/login', limitAdminLoginAttempts, adminLogin);
router.use(requireAuth, requireAdmin);
router.get('/ai', getAiSettings);
router.put('/ai/provider', updateAiProvider);

export default router;
