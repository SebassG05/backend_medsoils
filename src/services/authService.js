import User from '../models/User.js';
import jwt from 'jsonwebtoken';
import config from '../config/index.js';
import speakeasy from 'speakeasy';
import QRCode from 'qrcode';
import crypto from 'crypto';

export const generateBackupCodes = () => {
  const codes = [];
  for (let i = 0; i < 10; i++) {
    codes.push({
      code: crypto.randomBytes(4).toString('hex').toUpperCase(),
      used: false,
    });
  }
  return codes;
};

export const generateTwoFactorSecret = async (email) => {
  const secret = speakeasy.generateSecret({
    name: `Medsoils (${email})`,
    issuer: 'Medsoils',
    length: 32,
  });
  
  const qrCode = await QRCode.toDataURL(secret.otpauth_url);
  
  return {
    secret: secret.base32,
    qrCode,
    manualEntryKey: secret.base32,
  };
};

export const verifyTwoFactorToken = (secret, token) => {
  return speakeasy.totp.verify({
    secret: secret,
    encoding: 'base32',
    token: token,
    window: 2,
  });
};

export const generateAccessToken = (userId, requiresTwoFactor = false) => {
  return jwt.sign(
    { 
      userId,
      requiresTwoFactor,
    },
    config.jwt.secret,
    { expiresIn: config.jwt.expiry }
  );
};

export const generateRefreshToken = (userId) => {
  return jwt.sign(
    { userId },
    config.jwt.refreshSecret,
    { expiresIn: '7d' }
  );
};

export const verifyAccessToken = (token) => {
  try {
    return jwt.verify(token, config.jwt.secret);
  } catch (error) {
    return null;
  }
};

export const verifyRefreshToken = (token) => {
  try {
    return jwt.verify(token, config.jwt.refreshSecret);
  } catch (error) {
    return null;
  }
};
