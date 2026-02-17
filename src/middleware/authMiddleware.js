import { verifyAccessToken, verifyRefreshToken } from '../services/authService.js';

export const authMiddleware = (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(' ')[1]; // Bearer token
    
    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'No token provided',
      });
    }
    
    const decoded = verifyAccessToken(token);
    
    if (!decoded) {
      return res.status(401).json({
        success: false,
        message: 'Invalid or expired token',
      });
    }
    
    req.user = decoded;
    next();
  } catch (error) {
    res.status(401).json({
      success: false,
      message: 'Authentication failed',
    });
  }
};

export const requireTwoFactor = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({
      success: false,
      message: 'Not authenticated',
    });
  }
  
  if (!req.user.requiresTwoFactor) {
    return res.status(403).json({
      success: false,
      message: 'This endpoint requires 2FA verification',
    });
  }
  
  next();
};
