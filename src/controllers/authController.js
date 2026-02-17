import User from '../models/User.js';
import {
  generateAccessToken,
  generateRefreshToken,
  generateTwoFactorSecret,
  verifyTwoFactorToken,
  generateBackupCodes,
} from '../services/authService.js';
import { handleGoogleOAuth } from '../services/googleOAuthService.js';

// Google OAuth login/signup
export const googleLogin = async (req, res) => {
  try {
    const { token } = req.body;
    
    if (!token) {
      return res.status(400).json({
        success: false,
        message: 'Google token is required',
      });
    }
    
    const result = await handleGoogleOAuth(token);
    
    res.status(200).json({
      success: true,
      message: result.requiresTwoFactor ? '2FA required' : 'Login successful',
      data: {
        user: result.user,
        accessToken: result.accessToken,
        refreshToken: result.refreshToken,
        requiresTwoFactor: result.requiresTwoFactor,
      },
    });
  } catch (error) {
    console.error('Google login error:', error);
    res.status(401).json({
      success: false,
      message: error.message,
    });
  }
};

// Setup 2FA
export const setupTwoFactor = async (req, res) => {
  try {
    const userId = req.user.userId; // From JWT middleware
    
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }
    
    // Generate new 2FA secret
    const { secret, qrCode, manualEntryKey } = await generateTwoFactorSecret(user.email);
    
    // Generate backup codes
    const backupCodes = generateBackupCodes();
    
    // Store in session (not saved yet, only after verification)
    req.session = req.session || {};
    req.session.tempTwoFactorSecret = secret;
    req.session.tempBackupCodes = backupCodes;
    
    res.status(200).json({
      success: true,
      message: '2FA setup initiated',
      data: {
        qrCode,
        manualEntryKey,
        backupCodes: backupCodes.map(b => b.code),
      },
    });
  } catch (error) {
    console.error('Setup 2FA error:', error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Verify 2FA setup
export const verifyTwoFactorSetup = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { token } = req.body;
    
    if (!token) {
      return res.status(400).json({
        success: false,
        message: 'Verification token is required',
      });
    }
    
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }
    
    // Get temp secret from session
    const tempSecret = req.session?.tempTwoFactorSecret;
    if (!tempSecret) {
      return res.status(400).json({
        success: false,
        message: 'No pending 2FA setup',
      });
    }
    
    // Verify the token
    const isValid = verifyTwoFactorToken(tempSecret, token);
    if (!isValid) {
      return res.status(400).json({
        success: false,
        message: 'Invalid verification token',
      });
    }
    
    // Save 2FA settings
    user.twoFactorEnabled = true;
    user.twoFactorSecret = tempSecret;
    user.twoFactorBackupCodes = req.session.tempBackupCodes;
    
    await user.save();
    
    // Clear temp data
    delete req.session.tempTwoFactorSecret;
    delete req.session.tempBackupCodes;
    
    res.status(200).json({
      success: true,
      message: '2FA enabled successfully',
      data: {
        twoFactorEnabled: true,
      },
    });
  } catch (error) {
    console.error('Verify 2FA error:', error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Verify 2FA token during login
export const verifyTwoFactorLogin = async (req, res) => {
  try {
    const userId = req.user.userId; // This should come from partial JWT with 2FA flag
    const { token } = req.body;
    
    if (!token) {
      return res.status(400).json({
        success: false,
        message: 'Verification token is required',
      });
    }
    
    const user = await User.findById(userId);
    if (!user || !user.twoFactorEnabled) {
      return res.status(403).json({
        success: false,
        message: 'Invalid request',
      });
    }
    
    // Verify token
    const isValid = verifyTwoFactorToken(user.twoFactorSecret, token);
    
    if (isValid) {
      // Generate full access token
      const accessToken = generateAccessToken(user._id, false);
      const refreshToken = generateRefreshToken(user._id);
      
      return res.status(200).json({
        success: true,
        message: '2FA verification successful',
        data: {
          accessToken,
          refreshToken,
        },
      });
    }
    
    // Check backup codes
    const backupCode = user.twoFactorBackupCodes.find(
      bc => bc.code === token.toUpperCase() && !bc.used
    );
    
    if (backupCode) {
      backupCode.used = true;
      await user.save();
      
      const accessToken = generateAccessToken(user._id, false);
      const refreshToken = generateRefreshToken(user._id);
      
      return res.status(200).json({
        success: true,
        message: '2FA verification successful (backup code)',
        data: {
          accessToken,
          refreshToken,
        },
      });
    }
    
    res.status(401).json({
      success: false,
      message: 'Invalid verification token',
    });
  } catch (error) {
    console.error('Verify 2FA login error:', error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Disable 2FA
export const disableTwoFactor = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { password } = req.body; // Require password to disable 2FA
    
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }
    
    user.twoFactorEnabled = false;
    user.twoFactorSecret = undefined;
    user.twoFactorBackupCodes = [];
    
    await user.save();
    
    res.status(200).json({
      success: true,
      message: '2FA disabled successfully',
    });
  } catch (error) {
    console.error('Disable 2FA error:', error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
