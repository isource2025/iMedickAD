const bcrypt = require('bcryptjs');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });
const { getConnection, closeConnection } = require('../config/db');

/**
 * Script para crear usuarios por defecto directamente en SQL Server
 * Se conecta usando la configuración del .env
 * 
 * Uso: node createUsersRemote.js
 */

// Usuarios predefinidos
const defaultUsers = [
  {
    usuario: 'admin',
    password: 'admin123',
    nombre: 'Administrador General',
    email: 'admin@imedic.com',
    hospital: 'Administración Central'
  },
  {
    usuario: 'auditor',
    password: 'Auditor2025!',
    nombre: 'Auditor General',
    email: 'auditor@imedic.com',
    hospital: 'Hospital Central'
  },
  {
    usuario: 'demo',
    password: 'Demo2025!',
    nombre: 'Usuario Demo',
    email: 'demo@imedic.com',
    hospital: 'Hospital Demo'
  }
];

console.log('\n╔════════════════════════════════════════════════════════════╗');
console.log('║  iMedicAD - Creador Remoto de Usuarios                   ║');
console.log('╚════════════════════════════════════════════════════════════╝\n');

async function createUsersRemote() {
  let pool = null;

  try {
    // Mostrar configuración de conexión
    console.log('📡 Configuración de conexión:');
    console.log(`   Servidor: ${process.env.DB_SERVER}`);
    console.log(`   Puerto:   ${process.env.DB_PORT}`);
    console.log(`   Base de datos: ${process.env.DB_DATABASE}`);
    console.log(`   Usuario:  ${process.env.DB_USER}\n`);

    // Conectar a SQL Server
    console.log('🔌 Conectando a SQL Server...');
    pool = await getConnection();
    console.log('✅ Conexión establecida\n');

    // Verificar si la tabla existe
    console.log('🔍 Verificando tabla imUsuariosAuditores...');
    const checkTableQuery = `
      SELECT COUNT(*) as existe 
      FROM INFORMATION_SCHEMA.TABLES 
      WHERE TABLE_NAME = 'imUsuariosAuditores'
    `;
    const tableResult = await pool.request().query(checkTableQuery);
    
    if (tableResult.recordset[0].existe === 0) {
      console.error('❌ Error: La tabla imUsuariosAuditores no existe');
      console.log('\n💡 Solución: Ejecuta primero el script createTable.sql');
      process.exit(1);
    }
    console.log('✅ Tabla encontrada\n');

    // Crear usuarios
    console.log('👥 Creando usuarios...\n');
    const results = [];

    for (const user of defaultUsers) {
      try {
        // Verificar si el usuario ya existe
        const checkUserQuery = `
          SELECT COUNT(*) as existe 
          FROM imUsuariosAuditores 
          WHERE Usuario = @usuario
        `;
        const checkResult = await pool.request()
          .input('usuario', user.usuario)
          .query(checkUserQuery);

        if (checkResult.recordset[0].existe > 0) {
          console.log(`⚠️  Usuario ya existe: ${user.usuario}`);
          results.push({
            usuario: user.usuario,
            status: 'existe',
            password: user.password
          });
          continue;
        }

        // Generar hash de contraseña
        const hash = await bcrypt.hash(user.password, 10);

        // Insertar usuario
        const insertQuery = `
          INSERT INTO imUsuariosAuditores 
          (Usuario, Password, Nombre, Email, HospitalAsignado, Activo)
          VALUES 
          (@usuario, @password, @nombre, @email, @hospital, 1)
        `;

        await pool.request()
          .input('usuario', user.usuario)
          .input('password', hash)
          .input('nombre', user.nombre)
          .input('email', user.email)
          .input('hospital', user.hospital)
          .query(insertQuery);

        console.log(`✅ Usuario creado: ${user.usuario}`);
        results.push({
          usuario: user.usuario,
          status: 'creado',
          password: user.password
        });

      } catch (error) {
        console.error(`❌ Error creando usuario ${user.usuario}:`, error.message);
        results.push({
          usuario: user.usuario,
          status: 'error',
          error: error.message
        });
      }
    }

    // Verificar usuarios creados
    console.log('\n📊 Verificando usuarios en la base de datos...\n');
    const verifyQuery = `
      SELECT 
        IdUsuario,
        Usuario,
        Nombre,
        Email,
        HospitalAsignado,
        Activo,
        FechaCreacion
      FROM imUsuariosAuditores
      ORDER BY IdUsuario
    `;
    const verifyResult = await pool.request().query(verifyQuery);

    console.log('Usuarios en la base de datos:');
    console.log('─────────────────────────────────────────────────────────────');
    verifyResult.recordset.forEach(user => {
      console.log(`ID: ${user.IdUsuario} | Usuario: ${user.Usuario.padEnd(10)} | Nombre: ${user.Nombre}`);
    });
    console.log('─────────────────────────────────────────────────────────────\n');

    // Mostrar resumen
    console.log('╔════════════════════════════════════════════════════════════╗');
    console.log('║  RESUMEN DE OPERACIÓN                                     ║');
    console.log('╚════════════════════════════════════════════════════════════╝\n');

    const creados = results.filter(r => r.status === 'creado').length;
    const existentes = results.filter(r => r.status === 'existe').length;
    const errores = results.filter(r => r.status === 'error').length;

    console.log(`✅ Usuarios creados:    ${creados}`);
    console.log(`⚠️  Usuarios existentes: ${existentes}`);
    console.log(`❌ Errores:             ${errores}\n`);

    // Mostrar credenciales
    console.log('╔════════════════════════════════════════════════════════════╗');
    console.log('║  CREDENCIALES DE ACCESO                                   ║');
    console.log('╚════════════════════════════════════════════════════════════╝\n');

    defaultUsers.forEach((user, index) => {
      const result = results.find(r => r.usuario === user.usuario);
      const statusIcon = result.status === 'creado' ? '✅' : 
                        result.status === 'existe' ? '⚠️' : '❌';
      
      console.log(`${statusIcon} ${index + 1}. ${user.nombre}`);
      console.log(`   Usuario:  ${user.usuario}`);
      console.log(`   Password: ${user.password}`);
      console.log(`   Hospital: ${user.hospital}`);
      console.log('');
    });

    console.log('⚠️  IMPORTANTE: Cambia estas contraseñas en producción\n');

  } catch (error) {
    console.error('\n❌ Error en el proceso:', error.message);
    console.error('\nDetalles:', error);
    process.exit(1);
  } finally {
    // Cerrar conexión
    if (pool) {
      await closeConnection();
      console.log('🔌 Conexión cerrada\n');
    }
  }
}

// Ejecutar
console.log('🚀 Iniciando proceso...\n');
createUsersRemote()
  .then(() => {
    console.log('✅ Proceso completado exitosamente\n');
    process.exit(0);
  })
  .catch(error => {
    console.error('\n❌ Error fatal:', error);
    process.exit(1);
  });
