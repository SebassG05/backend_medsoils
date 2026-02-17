import { OAuth2Client } from 'google-auth-library';
import config from '../config/index.js';
import User from '../models/User.js';
import { generateAccessToken, generateRefreshToken } from './authService.js';

const googleClient = new OAuth2Client(config.google.clientId, config.google.clientSecret, config.google.redirectUrl);

export const verifyGoogleToken = async (token) => {
  try {
    const ticket = await googleClient.verifyIdToken({
      idToken: token,
      audience: config.google.clientId,
    });
    
    const payload = ticket.getPayload();
    return payload;
  } catch (error) {
    throw new Error('Invalid Google token: ' + error.message);
  }
};

export const handleGoogleOAuth = async (googleToken) => {
  try {
    // Verify the token with Google
    const payload = await verifyGoogleToken(googleToken);
    
    const { sub: googleId, email, name, picture } = payload;
    
    // Find or create user
    let user = await User.findOne({ 
      $or: [{ googleId }, { email }] 
    });
    
    if (!user) {
      // Create new user if doesn't exist
      user = new User({
        email,
        googleId,
        googleEmail: email,
        googleName: name,
        googlePicture: picture,
        isVerified: true, // Google emails are verified
        isActive: true,
      });
      
      await user.save();
    } else {
      // Update existing user with Google info if needed
      if (!user.googleId) {
        user.googleId = googleId;
        user.googleEmail = email;
        user.googleName = name;
        user.googlePicture = picture;
        await user.save();
      }
    }
    
    // Check if user has 2FA enabled
    const requiresTwoFactor = user.twoFactorEnabled;
    
    // Generate tokens
    const accessToken = generateAccessToken(user._id, requiresTwoFactor);
    const refreshToken = generateRefreshToken(user._id);
    
    return {
      user: user.toJSON(),
      accessToken,
      refreshToken,
      requiresTwoFactor,
    };
  } catch (error) {
    throw new Error('Google OAuth failed: ' + error.message);
  }
};

export const exchangeAuthCodeForToken = async (code) => {
  try {
    const { credentials } = await googleClient.getToken(code);
    return credentials.id_token;
  } catch (error) {
    throw new Error('Failed to exchange auth code: ' + error.message);
  }
};
