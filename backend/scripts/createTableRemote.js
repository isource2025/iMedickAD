const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });
const { getConnection, closeConnection } = require('../config/db');

/**
 * Script para crear la tabla imUsuariosAuditores remotamente
 * Se conecta usando la configuración del .env
 * 
 * Uso: node createTableRemote.js
 */

console.log('\n╔════════════════════════════════════════════════════════════╗');
console.log('║  iMedicAD - Creador Remoto de Tabla de Usuarios          ║');
console.log('╚════════════════════════════════════════════════════════════╝\n');

async function createTableRemote() {
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

    // Verificar si la tabla ya existe
    console.log('🔍 Verificando si la tabla existe...');
    const checkTableQuery = `
      SELECT COUNT(*) as existe 
      FROM INFORMATION_SCHEMA.TABLES 
      WHERE TABLE_NAME = 'imUsuariosAuditores'
    `;
    const tableResult = await pool.request().query(checkTableQuery);
    
    if (tableResult.recordset[0].existe > 0) {
      console.log('⚠️  La tabla imUsuariosAuditores ya existe\n');
      
      // Mostrar estructura de la tabla
      console.log('📋 Estructura actual de la tabla:');
      const structureQuery = `
        SELECT 
          COLUMN_NAME,
          DATA_TYPE,
          CHARACTER_MAXIMUM_LENGTH,
          IS_NULLABLE
        FROM INFORMATION_SCHEMA.COLUMNS
        WHERE TABLE_NAME = 'imUsuariosAuditores'
        ORDER BY ORDINAL_POSITION
      `;
      const structure = await pool.request().query(structureQuery);
      
      console.log('─────────────────────────────────────────────────────────────');
      structure.recordset.forEach(col => {
        const length = col.CHARACTER_MAXIMUM_LENGTH ? `(${col.CHARACTER_MAXIMUM_LENGTH})` : '';
        const nullable = col.IS_NULLABLE === 'YES' ? 'NULL' : 'NOT NULL';
        console.log(`  ${col.COLUMN_NAME.padEnd(25)} ${col.DATA_TYPE}${length.padEnd(10)} ${nullable}`);
      });
      console.log('─────────────────────────────────────────────────────────────\n');

      // Contar usuarios existentes
      const countQuery = 'SELECT COUNT(*) as total FROM imUsuariosAuditores';
      const countResult = await pool.request().query(countQuery);
      console.log(`👥 Usuarios existentes: ${countResult.recordset[0].total}\n`);

      return;
    }

    // Crear la tabla
    console.log('📝 Creando tabla imUsuariosAuditores...\n');
    
    const createTableQuery = `
      CREATE TABLE imUsuariosAuditores (
        IdUsuario INT PRIMARY KEY IDENTITY(1,1),
        Usuario VARCHAR(50) NOT NULL UNIQUE,
        Password VARCHAR(255) NOT NULL,
        Nombre VARCHAR(100) NOT NULL,
        Email VARCHAR(100),
        HospitalAsignado VARCHAR(100) NOT NULL,
        Activo BIT DEFAULT 1,
        FechaCreacion DATETIME DEFAULT GETDATE(),
        UltimoAcceso DATETIME
      );
    `;

    await pool.request().query(createTableQuery);
    console.log('✅ Tabla creada exitosamente\n');

    // Crear índices
    console.log('📑 Creando índices...');
    
    const createIndexUsuario = `
      CREATE INDEX IDX_Usuario ON imUsuariosAuditores(Usuario);
    `;
    await pool.request().query(createIndexUsuario);
    console.log('✅ Índice IDX_Usuario creado');

    const createIndexHospital = `
      CREATE INDEX IDX_Hospital ON imUsuariosAuditores(HospitalAsignado);
    `;
    await pool.request().query(createIndexHospital);
    console.log('✅ Índice IDX_Hospital creado\n');

    // Verificar creación
    console.log('🔍 Verificando tabla creada...');
    const verifyQuery = `
      SELECT 
        COLUMN_NAME,
        DATA_TYPE,
        CHARACTER_MAXIMUM_LENGTH,
        IS_NULLABLE
      FROM INFORMATION_SCHEMA.COLUMNS
      WHERE TABLE_NAME = 'imUsuariosAuditores'
      ORDER BY ORDINAL_POSITION
    `;
    const verifyResult = await pool.request().query(verifyQuery);

    console.log('\n📋 Estructura de la tabla:');
    console.log('─────────────────────────────────────────────────────────────');
    verifyResult.recordset.forEach(col => {
      const length = col.CHARACTER_MAXIMUM_LENGTH ? `(${col.CHARACTER_MAXIMUM_LENGTH})` : '';
      const nullable = col.IS_NULLABLE === 'YES' ? 'NULL' : 'NOT NULL';
      console.log(`  ${col.COLUMN_NAME.padEnd(25)} ${col.DATA_TYPE}${length.padEnd(10)} ${nullable}`);
    });
    console.log('─────────────────────────────────────────────────────────────\n');

    console.log('╔════════════════════════════════════════════════════════════╗');
    console.log('║  SIGUIENTE PASO                                           ║');
    console.log('╚════════════════════════════════════════════════════════════╝\n');
    console.log('Ahora puedes crear usuarios ejecutando:');
    console.log('  node createUsersRemote.js\n');

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
createTableRemote()
  .then(() => {
    console.log('✅ Proceso completado exitosamente\n');
    process.exit(0);
  })
  .catch(error => {
    console.error('\n❌ Error fatal:', error);
    process.exit(1);
  });
