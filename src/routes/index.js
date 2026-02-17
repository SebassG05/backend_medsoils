import express from 'express';
import authRoutes from './authRoutes.js';

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
      auth: '/api/v1/auth',
    },
  });
});

// Auth routes
router.use('/auth', authRoutes);

export default router;
