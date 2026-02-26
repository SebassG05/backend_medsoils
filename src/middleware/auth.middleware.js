import jwt from 'jsonwebtoken';
import config from '../config/index.js';

export const authenticate = async (req, res, next) => {
  try {
    // Get token from header
    const token = req.headers.authorization?.split(' ')[1];
    
    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'No token provided',
      });
    }
    
    // Verify token
    const decoded = jwt.verify(token, config.jwt.secret);
    req.user = decoded;
    
    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: 'Invalid or expired token',
    });
  }
};

export const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Unauthorized',
      });
    }
    
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: 'Forbidden: Insufficient permissions',
      });
    }
    
    next();
  };
};

// Optional authentication - sets req.user if token is valid, but doesn't fail if no token
export const optionalAuth = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    
    if (token) {
      const decoded = jwt.verify(token, config.jwt.secret);
      req.user = decoded;
    }
    
    next();
  } catch (error) {
    // Invalid token, but continue without user
    next();
  }
};
