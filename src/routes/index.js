import express from 'express';
import authRoutes from './auth.routes.js';

const router = express.Router();

// Welcome endpoint
router.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'Welcome to MedSoils API',
    version: '1.0.0',
    endpoints: {
      health: '/health',
      api: '/api/v1',
      auth: {
        register: 'POST /api/auth/register',
        login: 'POST /api/auth/login',
        profile: 'GET /api/auth/profile',
      },
    },
  });
});

// Auth routes
router.use('/auth', authRoutes);

export default router;
