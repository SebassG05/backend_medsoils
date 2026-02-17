import express from 'express';
import * as authController from '../controllers/authController.js';
import { authMiddleware, requireTwoFactor } from '../middleware/authMiddleware.js';

const router = express.Router();

// Google OAuth login
router.post('/google/login', authController.googleLogin);

// 2FA Setup
router.post('/2fa/setup', authMiddleware, authController.setupTwoFactor);
router.post('/2fa/verify-setup', authMiddleware, authController.verifyTwoFactorSetup);
router.post('/2fa/verify-login', authMiddleware, requireTwoFactor, authController.verifyTwoFactorLogin);
router.post('/2fa/disable', authMiddleware, authController.disableTwoFactor);

export default router;
