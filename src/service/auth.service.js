import User from '../models/User.js';
import jwt from 'jsonwebtoken';
import { AppError } from '../utils/errors.js';

class AuthService {
  /**
   * Registra un nuevo usuario en el sistema
   * @param {Object} userData - Datos del usuario (name, email, password)
   * @returns {Object} Usuario creado y token JWT
   */
  async register(userData) {
    const { name, email, password } = userData;

    // Verificar si el usuario ya existe
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      throw new AppError('El email ya está registrado', 400);
    }

    // Crear nuevo usuario
    const user = new User({
      name,
      email,
      password,
    });

    // Guardar usuario (el password se hasheará automáticamente por el middleware)
    await user.save();

    // Generar token JWT
    const token = this.generateToken(user._id);

    return {
      user: user.toPublicJSON(),
      token,
    };
  }

  /**
   * Inicia sesión de un usuario
   * @param {string} email - Email del usuario
   * @param {string} password - Contraseña del usuario
   * @returns {Object} Usuario y token JWT
   */
  async login(email, password) {
    // Buscar usuario por email e incluir el password
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
    const token = this.generateToken(user._id);

    return {
      user: user.toPublicJSON(),
      token,
    };
  }

  /**
   * Genera un token JWT
   * @param {string} userId - ID del usuario
   * @returns {string} Token JWT
   */
  generateToken(userId) {
    const secret = process.env.JWT_SECRET || 'your-secret-key-change-this';
    const expiresIn = process.env.JWT_EXPIRES_IN || '7d';

    return jwt.sign({ userId }, secret, { expiresIn });
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
   * Obtiene un usuario por ID
   * @param {string} userId - ID del usuario
   * @returns {Object} Usuario
   */
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
}

export default new AuthService();
