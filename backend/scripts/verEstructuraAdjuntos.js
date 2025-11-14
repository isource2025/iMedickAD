const sql = require('mssql');
require('dotenv').config();

const config = {
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  server: process.env.DB_SERVER,
  database: process.env.DB_DATABASE,
  options: {
    encrypt: false,
    trustServerCertificate: true,
    enableArithAbort: true
  }
};

async function verEstructura() {
  let pool;
  
  try {
    console.log('🔍 Conectando a la base de datos...\n');
    pool = await sql.connect(config);
    
    // Ver columnas de la tabla
    console.log('📋 COLUMNAS DE imPedidosEstudiosAdjuntos:');
    console.log('='.repeat(80));
    const columnas = await pool.request().query(`
      SELECT 
        COLUMN_NAME,
        DATA_TYPE,
        CHARACTER_MAXIMUM_LENGTH,
        IS_NULLABLE
      FROM INFORMATION_SCHEMA.COLUMNS
      WHERE TABLE_NAME = 'imPedidosEstudiosAdjuntos'
      ORDER BY ORDINAL_POSITION
    `);
    
    columnas.recordset.forEach(col => {
      console.log(`${col.COLUMN_NAME.padEnd(30)} ${col.DATA_TYPE.padEnd(15)} ${col.IS_NULLABLE}`);
    });
    
    // Ver algunos registros
    console.log('\n\n📎 PRIMEROS 5 REGISTROS:');
    console.log('='.repeat(80));
    const registros = await pool.request().query(`
      SELECT TOP 5 * 
      FROM imPedidosEstudiosAdjuntos
    `);
    
    if (registros.recordset.length > 0) {
      console.log('\nColumnas encontradas:', Object.keys(registros.recordset[0]).join(', '));
      console.log('\nRegistros:');
      registros.recordset.forEach((reg, idx) => {
        console.log(`\n${idx + 1}.`, JSON.stringify(reg, null, 2));
      });
    } else {
      console.log('❌ No hay registros en la tabla');
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    if (pool) {
      await pool.close();
    }
  }
}

verEstructura();
