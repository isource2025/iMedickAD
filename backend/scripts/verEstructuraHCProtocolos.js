/**
 * Ver estructura real de la tabla HCProtocolosPtes
 */

const { getConnection, closeConnection } = require('../config/db');

async function verEstructura() {
  let pool = null;

  try {
    pool = await getConnection();
    
    console.log('\n═══════════════════════════════════════════════════════════');
    console.log('ESTRUCTURA DE HCProtocolosPtes');
    console.log('═══════════════════════════════════════════════════════════\n');

    const estructura = await pool.request().query(`
      SELECT 
        COLUMN_NAME,
        DATA_TYPE,
        CHARACTER_MAXIMUM_LENGTH,
        IS_NULLABLE
      FROM INFORMATION_SCHEMA.COLUMNS
      WHERE TABLE_NAME = 'HCProtocolosPtes'
      ORDER BY ORDINAL_POSITION
    `);

    console.log('Columnas:\n');
    estructura.recordset.forEach(c => {
      const len = c.CHARACTER_MAXIMUM_LENGTH ? `(${c.CHARACTER_MAXIMUM_LENGTH})` : '';
      console.log(`  ${c.COLUMN_NAME.padEnd(30)} ${c.DATA_TYPE}${len}`);
    });

    console.log('\n═══════════════════════════════════════════════════════════');
    console.log('DATOS DE EJEMPLO (TOP 1)');
    console.log('═══════════════════════════════════════════════════════════\n');

    const ejemplo = await pool.request().query(`SELECT TOP 1 * FROM HCProtocolosPtes WHERE NumeroVisita IS NOT NULL`);
    
    if (ejemplo.recordset.length > 0) {
      const row = ejemplo.recordset[0];
      Object.keys(row).forEach(key => {
        console.log(`  ${key.padEnd(30)} = ${row[key]}`);
      });
    }

    console.log('\n');

  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    if (pool) {
      await closeConnection();
    }
  }
}

verEstructura();
