const bcrypt = require('bcryptjs');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });
const { getConnection, closeConnection } = require('../config/db');

/**
 * Script para actualizar la contraseña del usuario admin
 * Nueva contraseña: admin123
 * 
 * Uso: node updateAdminPassword.js
 */

console.log('\n╔════════════════════════════════════════════════════════════╗');
console.log('║  iMedicAD - Actualizar Contraseña de Admin                ║');
console.log('╚════════════════════════════════════════════════════════════╝\n');

async function updateAdminPassword() {
  let pool = null;

  try {
    // Configuración
    const newPassword = 'admin123';
    const usuario = 'admin';

    console.log('📡 Configuración de conexión:');
    console.log(`   Servidor: ${process.env.DB_SERVER}`);
    console.log(`   Base de datos: ${process.env.DB_DATABASE}\n`);

    // Conectar a SQL Server
    console.log('🔌 Conectando a SQL Server...');
    pool = await getConnection();
    console.log('✅ Conexión establecida\n');

    // Verificar si el usuario existe
    console.log(`🔍 Buscando usuario: ${usuario}...`);
    const checkUserQuery = `
      SELECT IdUsuario, Usuario, Nombre 
      FROM imUsuariosAuditores 
      WHERE Usuario = @usuario
    `;
    const userResult = await pool.request()
      .input('usuario', usuario)
      .query(checkUserQuery);

    if (userResult.recordset.length === 0) {
      console.error(`❌ Error: El usuario '${usuario}' no existe`);
      console.log('\n💡 Ejecuta primero: node createUsersRemote.js\n');
      process.exit(1);
    }

    const user = userResult.recordset[0];
    console.log(`✅ Usuario encontrado: ${user.Nombre} (ID: ${user.IdUsuario})\n`);

    // Generar nuevo hash
    console.log('🔐 Generando nuevo hash de contraseña...');
    const hash = await bcrypt.hash(newPassword, 10);
    console.log('✅ Hash generado\n');

    // Actualizar contraseña
    console.log('💾 Actualizando contraseña en la base de datos...');
    const updateQuery = `
      UPDATE imUsuariosAuditores 
      SET Password = @password 
      WHERE Usuario = @usuario
    `;

    await pool.request()
      .input('usuario', usuario)
      .input('password', hash)
      .query(updateQuery);

    console.log('✅ Contraseña actualizada exitosamente\n');

    // Mostrar credenciales
    console.log('╔════════════════════════════════════════════════════════════╗');
    console.log('║  NUEVAS CREDENCIALES                                      ║');
    console.log('╚════════════════════════════════════════════════════════════╝\n');
    console.log(`   Usuario:  ${usuario}`);
    console.log(`   Password: ${newPassword}\n`);

    console.log('✅ Ahora puedes iniciar sesión con estas credenciales\n');

  } catch (error) {
    console.error('\n❌ Error en el proceso:', error.message);
    console.error('\nDetalles:', error);
    process.exit(1);
  } finally {
    if (pool) {
      await closeConnection();
      console.log('🔌 Conexión cerrada\n');
    }
  }
}

// Ejecutar
console.log('🚀 Iniciando actualización...\n');
updateAdminPassword()
  .then(() => {
    console.log('✅ Proceso completado exitosamente\n');
    process.exit(0);
  })
  .catch(error => {
    console.error('\n❌ Error fatal:', error);
    process.exit(1);
  });
