import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'unibot_academic_jwt_secret_token_secure_2026';

export const requireAuth = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required. Please log in to your student account.',
      });
    }

    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(401).json({
      success: false,
      message: 'Invalid or expired session token. Please log in again.',
    });
  }
};

export const requireAdmin = (req, res, next) => {
  if (!process.env.JWT_SECRET) {
    return res.status(503).json({
      success: false,
      message: 'Admin authentication is not configured securely on the server.',
    });
  }
  if (req.user?.role !== 'admin') {
    return res.status(403).json({
      success: false,
      message: 'Administrator access is required.',
    });
  }
  next();
};

export const optionalAuth = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.split(' ')[1];
      const decoded = jwt.verify(token, JWT_SECRET);
      req.user = decoded;
    }
  } catch {
    // Guest user, continue
  }
  next();
};
