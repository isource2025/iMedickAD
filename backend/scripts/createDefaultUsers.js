const bcrypt = require('bcryptjs');
require('dotenv').config({ path: '../.env' });

/**
 * Script para crear usuarios por defecto en iMedicAD
 * Genera hashes de contraseñas y muestra los INSERT statements
 * 
 * Uso: node createDefaultUsers.js
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
console.log('║  iMedicAD - Generador de Usuarios por Defecto            ║');
console.log('╚════════════════════════════════════════════════════════════╝\n');

async function generateUsers() {
  console.log('🔐 Generando hashes de contraseñas...\n');

  const sqlStatements = [];
  const credentialsList = [];

  for (const user of defaultUsers) {
    try {
      const hash = await bcrypt.hash(user.password, 10);
      
      const insertSQL = `INSERT INTO imUsuariosAuditores (Usuario, Password, Nombre, Email, HospitalAsignado)
VALUES ('${user.usuario}', '${hash}', '${user.nombre}', '${user.email}', '${user.hospital}');`;

      sqlStatements.push(insertSQL);
      credentialsList.push({
        usuario: user.usuario,
        password: user.password,
        nombre: user.nombre,
        hospital: user.hospital
      });

      console.log(`✅ Hash generado para: ${user.usuario}`);
    } catch (error) {
      console.error(`❌ Error generando hash para ${user.usuario}:`, error.message);
    }
  }

  // Mostrar credenciales
  console.log('\n╔════════════════════════════════════════════════════════════╗');
  console.log('║  CREDENCIALES DE ACCESO                                   ║');
  console.log('╚════════════════════════════════════════════════════════════╝\n');

  credentialsList.forEach((cred, index) => {
    console.log(`${index + 1}. ${cred.nombre}`);
    console.log(`   Usuario:  ${cred.usuario}`);
    console.log(`   Password: ${cred.password}`);
    console.log(`   Hospital: ${cred.hospital}`);
    console.log('');
  });

  // Mostrar SQL completo
  console.log('╔════════════════════════════════════════════════════════════╗');
  console.log('║  SQL PARA CREAR USUARIOS                                  ║');
  console.log('╚════════════════════════════════════════════════════════════╝\n');

  console.log('-- Script generado automáticamente');
  console.log('-- Fecha:', new Date().toISOString());
  console.log('-- Base de datos: isource\n');

  console.log('USE isource;');
  console.log('GO\n');

  console.log('-- Verificar si la tabla existe');
  console.log(`IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'imUsuariosAuditores')
BEGIN
    PRINT '❌ Error: La tabla imUsuariosAuditores no existe';
    PRINT 'Ejecutar primero: scripts/createTable.sql';
    RETURN;
END
GO\n`);

  console.log('-- Insertar usuarios por defecto');
  console.log('-- NOTA: Estos usuarios solo se crearán si no existen\n');

  sqlStatements.forEach((sql, index) => {
    const user = credentialsList[index];
    console.log(`-- ${user.nombre} (${user.usuario})`);
    console.log(`IF NOT EXISTS (SELECT 1 FROM imUsuariosAuditores WHERE Usuario = '${user.usuario}')`);
    console.log('BEGIN');
    console.log(`    ${sql}`);
    console.log(`    PRINT '✅ Usuario creado: ${user.usuario}';`);
    console.log('END');
    console.log('ELSE');
    console.log('BEGIN');
    console.log(`    PRINT '⚠️ Usuario ya existe: ${user.usuario}';`);
    console.log('END');
    console.log('GO\n');
  });

  console.log('-- Verificar usuarios creados');
  console.log(`SELECT 
    IdUsuario,
    Usuario,
    Nombre,
    Email,
    HospitalAsignado,
    Activo,
    FechaCreacion
FROM imUsuariosAuditores
ORDER BY IdUsuario;
GO\n`);

  console.log('╔════════════════════════════════════════════════════════════╗');
  console.log('║  INSTRUCCIONES                                            ║');
  console.log('╚════════════════════════════════════════════════════════════╝\n');

  console.log('1. Copia el SQL generado arriba');
  console.log('2. Conéctate a SQL Server Management Studio');
  console.log('3. Selecciona la base de datos: isource');
  console.log('4. Ejecuta el script SQL');
  console.log('5. Verifica que los usuarios se crearon correctamente\n');

  console.log('📝 NOTA: Las credenciales están listadas al inicio de este output\n');
}

// Ejecutar
generateUsers()
  .then(() => {
    console.log('✅ Proceso completado exitosamente\n');
    process.exit(0);
  })
  .catch(error => {
    console.error('\n❌ Error en el proceso:', error);
    process.exit(1);
  });
