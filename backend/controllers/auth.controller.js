const authService = require('../services/auth.service');

class AuthController {
  async login(req, res) {
    try {
      const { usuario, password } = req.body;
      
      if (!usuario || !password) {
        return res.status(400).json({
          success: false,
          message: 'Usuario y contraseña son requeridos'
        });
      }
      
      const result = await authService.login(usuario, password);
      
      res.json({
        success: true,
        data: result
      });
    } catch (error) {
      console.error('Error en login:', error);
      res.status(401).json({
        success: false,
        message: error.message || 'Error en autenticación'
      });
    }
  }
  
  async verifyToken(req, res) {
    try {
      // El middleware ya verificó el token
      res.json({
        success: true,
        data: req.user
      });
    } catch (error) {
      res.status(401).json({
        success: false,
        message: 'Token inválido'
      });
    }
  }
}

module.exports = new AuthController();
