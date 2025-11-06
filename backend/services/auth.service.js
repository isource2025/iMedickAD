const { getConnection, sql } = require('../config/db');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

class AuthService {
  /**
   * Autenticar usuario
   */
  async login(usuario, password) {
    try {
      const pool = await getConnection();
      
      const result = await pool.request()
        .input('usuario', sql.VarChar, usuario)
        .query(`
          SELECT 
            IdUsuario,
            Usuario,
            Password,
            Nombre,
            Email,
            HospitalAsignado,
            Activo
          FROM imUsuariosAuditores
          WHERE Usuario = @usuario AND Activo = 1
        `);
      
      if (result.recordset.length === 0) {
        throw new Error('Usuario no encontrado o inactivo');
      }
      
      const user = result.recordset[0];
      
      // Verificar password
      const isValidPassword = await bcrypt.compare(password, user.Password);
      
      if (!isValidPassword) {
        throw new Error('Contraseña incorrecta');
      }
      
      // Actualizar último acceso
      await pool.request()
        .input('idUsuario', sql.Int, user.IdUsuario)
        .query(`
          UPDATE imUsuariosAuditores
          SET UltimoAcceso = GETDATE()
          WHERE IdUsuario = @idUsuario
        `);
      
      // Generar token JWT
      const token = jwt.sign(
        {
          idUsuario: user.IdUsuario,
          usuario: user.Usuario,
          nombre: user.Nombre,
          hospitalAsignado: user.HospitalAsignado
        },
        process.env.JWT_SECRET,
        { expiresIn: process.env.JWT_EXPIRES_IN || '8h' }
      );
      
      return {
        token,
        user: {
          idUsuario: user.IdUsuario,
          usuario: user.Usuario,
          nombre: user.Nombre,
          email: user.Email,
          hospitalAsignado: user.HospitalAsignado
        }
      };
    } catch (error) {
      console.error('Error en login:', error);
      throw error;
    }
  }
  
  /**
   * Verificar token
   */
  async verifyToken(token) {
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      return decoded;
    } catch (error) {
      throw new Error('Token inválido o expirado');
    }
  }
}

module.exports = new AuthService();
