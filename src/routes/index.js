import express from 'express';
<<<<<<< HEAD
import authRoutes from './authRoutes.js';
=======
import authRoutes from './auth.routes.js';
>>>>>>> b6b26b0f3f9d7897c4c75acb1acf63db6dc88aef

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
<<<<<<< HEAD
      auth: '/api/v1/auth',
=======
      auth: {
        register: 'POST /api/auth/register',
        login: 'POST /api/auth/login',
        profile: 'GET /api/auth/profile',
      },
>>>>>>> b6b26b0f3f9d7897c4c75acb1acf63db6dc88aef
    },
  });
});

// Auth routes
router.use('/auth', authRoutes);

export default router;
