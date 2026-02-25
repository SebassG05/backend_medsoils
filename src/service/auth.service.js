import User from '../models/User.js';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import { OAuth2Client } from 'google-auth-library';
import { AppError } from '../utils/errors.js';
import { sendPasswordResetEmail } from '../utils/emailService.js';

const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

class AuthService {
  /**
   * Registra un nuevo usuario en el sistema
   * @param {Object} userData - Datos del usuario (name, email, password)
   * @returns {Object} Usuario creado y token JWT
   */
  async register(userData) {
    const { name, email, password } = userData;

    console.log('📝 Registrando usuario:', { name, email });

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      throw new AppError('El email ya está registrado', 400);
    }

    const user = new User({
      name,
      email,
      password,
    });

    console.log('💾 Guardando usuario en MongoDB...');
    await user.save();
    console.log('✅ Usuario guardado exitosamente:', user._id);

    const token = this.generateToken(user._id, user.role);

    return {
      user: user.toPublicJSON(),
      token,
    };
  }

  /**
   * Inicia sesión de un usuario
   * @param {string} email
   * @param {string} password 
   * @returns {Object} 
   */
  async login(email, password) {

    const user = await User.findOne({ email }).select('+password');
    
    if (!user) {
      throw new AppError('Credenciales incorrectas', 401);
    }

    // Verificar si el usuario está activo
    if (!user.isActive) {
      throw new AppError('Usuario inactivo', 401);
    }

    // Comparar contraseña
    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      throw new AppError('Credenciales incorrectas', 401);
    }

    // Generar token JWT
    const token = this.generateToken(user._id, user.role);

    return {
      user: user.toPublicJSON(),
      accessToken: token,
      refreshToken: token,
    };
  }

  /**
   * Genera un token JWT
   * @param {string} userId - ID del usuario
   * @returns {string} Token JWT
   */
  generateToken(userId, role = 'user') {
    const secret = process.env.JWT_SECRET || 'your-secret-key-change-this';
    const expiresIn = process.env.JWT_EXPIRES_IN || '7d';

    return jwt.sign({ userId, role }, secret, { expiresIn });
  }

  /**
   * Verifica un token JWT
   * @param {string} token - Token JWT
   * @returns {Object} Payload del token
   */
  verifyToken(token) {
    try {
      const secret = process.env.JWT_SECRET || 'your-secret-key-change-this';
      return jwt.verify(token, secret);
    } catch (error) {
      throw new AppError('Token inválido o expirado', 401);
    }
  }

  /**
   * Login / register con Google OAuth
   * @param {string} idToken - Google ID token del frontend
   * @returns {Object} { user, accessToken, refreshToken }
   */
  async googleLogin(idToken) {
    const ticket = await googleClient.verifyIdToken({
      idToken,
      audience: process.env.GOOGLE_CLIENT_ID,
    });
    const payload = ticket.getPayload();
    const { sub: googleId, email, name, picture } = payload;

    let user = await User.findOne({ $or: [{ googleId }, { email }] });

    if (user) {
      user.googleId = googleId;
      user.googleName = name;
      user.googlePicture = picture;
      if (!user.name) user.name = name;
      await user.save();
    } else {
      user = new User({
        name,
        email,
        googleId,
        googleName: name,
        googlePicture: picture,
        isVerified: true,
        isActive: true,
      });
      await user.save();
    }

    const token = this.generateToken(user._id, user.role);
    return {
      user: user.toPublicJSON(),
      accessToken: token,
      refreshToken: token,
    };
  }

  async getUserById(userId) {
    const user = await User.findById(userId);
    
    if (!user) {
      throw new AppError('Usuario no encontrado', 404);
    }

    if (!user.isActive) {
      throw new AppError('Usuario inactivo', 401);
    }

    return user.toPublicJSON();
  }

  /**
   * Generates a reset token, saves it to the user and sends the email.
   * @param {string} email
   */
  async forgotPassword(email) {
    const user = await User.findOne({ email });
    // Always respond OK to avoid email enumeration
    if (!user) return;

    // Generate a secure random token
    const rawToken = crypto.randomBytes(32).toString('hex');
    const hashedToken = crypto.createHash('sha256').update(rawToken).digest('hex');

    user.passwordResetToken = hashedToken;
    user.passwordResetExpires = new Date(Date.now() + 60 * 60 * 1000); // 1 hour
    await user.save({ validateBeforeSave: false });

    await sendPasswordResetEmail(user.email, rawToken, user.name);
  }

  /**
   * Validates the reset token and updates the user's password.
   * @param {string} rawToken - Raw token from the URL
   * @param {string} newPassword
   */
  async resetPassword(rawToken, newPassword) {
    const hashedToken = crypto.createHash('sha256').update(rawToken).digest('hex');

    const user = await User.findOne({
      passwordResetToken: hashedToken,
      passwordResetExpires: { $gt: Date.now() },
    });

    if (!user) {
      throw new AppError('Invalid or expired reset token', 400);
    }

    user.password = newPassword;
    user.passwordResetToken = null;
    user.passwordResetExpires = null;
    await user.save();

    return user.toPublicJSON();
  }
}

export default new AuthService();
