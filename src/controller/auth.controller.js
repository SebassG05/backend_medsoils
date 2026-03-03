import authService from '../service/auth.service.js';

class AuthController {
  /**
   * Registra un nuevo usuario
   * POST /api/auth/register
   */
  async register(req, res, next) {
    try {
      const { name, email, password, confirmPassword } = req.body;

      // Validar que las contraseñas coincidan
      if (password !== confirmPassword) {
        return res.status(400).json({
          success: false,
          message: 'Las contraseñas no coinciden',
        });
      }

      // Registrar usuario
      const result = await authService.register({ name, email, password });

      res.status(201).json({
        success: true,
        message: 'Usuario registrado exitosamente',
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Inicia sesión de un usuario
   * POST /api/auth/login
   */
  async login(req, res, next) {
    try {
      const { email, password } = req.body;

      const result = await authService.login(email, password);

      res.status(200).json({
        success: true,
        message: 'Login exitoso',
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Obtiene el perfil del usuario autenticado
   * GET /api/auth/profile
   */
  async getProfile(req, res, next) {
    try {
      const userId = req.user.userId;
      const user = await authService.getUserById(userId);

      res.status(200).json({
        success: true,
        data: user,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Cierra sesión del usuario (lado cliente principalmente)
   * POST /api/auth/logout
   */
  async logout(req, res, next) {
    try {
      // En un sistema basado en JWT, el logout se maneja principalmente en el cliente
      // eliminando el token. Aquí solo confirmamos la acción.
      res.status(200).json({
        success: true,
        message: 'Logout exitoso',
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Login / register con Google OAuth
   * POST /api/auth/google/login
   */
  async googleLogin(req, res, next) {
    try {
      const { token } = req.body;
      if (!token) {
        return res.status(400).json({ success: false, message: 'Google token is required' });
      }
      const result = await authService.googleLogin(token);
      res.status(200).json({
        success: true,
        message: 'Google login successful',
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Sends a password reset email
   * POST /api/auth/forgot-password
   */
  async forgotPassword(req, res, next) {
    try {
      const { email } = req.body;
      if (!email) {
        return res.status(400).json({ success: false, message: 'Email is required' });
      }
      await authService.forgotPassword(email);
      // Always respond with 200 to avoid email enumeration
      res.status(200).json({
        success: true,
        message: 'If that email is registered, a reset link has been sent.',
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Resets the user password using the token from the email
   * POST /api/auth/reset-password
   */
  async resetPassword(req, res, next) {
    try {
      const { token, newPassword } = req.body;
      if (!token || !newPassword) {
        return res.status(400).json({ success: false, message: 'Token and new password are required' });
      }
      await authService.resetPassword(token, newPassword);
      res.status(200).json({
        success: true,
        message: 'Password updated successfully. You can now log in.',
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Forced password change for authenticated users who must reset their password
   * POST /api/auth/force-change-password
   */
  async forceChangePassword(req, res, next) {
    try {
      const { newPassword } = req.body;
      if (!newPassword) {
        return res.status(400).json({ success: false, message: 'newPassword is required' });
      }
      const user = await authService.forceChangePassword(req.user.userId, newPassword);
      res.status(200).json({
        success: true,
        message: 'Password changed successfully.',
        data: { user },
      });
    } catch (error) {
      next(error);
    }
  }
}

export default new AuthController();
