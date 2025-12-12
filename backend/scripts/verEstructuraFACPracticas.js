const { getConnection, closeConnection } = require('../config/db');

async function ver() {
  let pool = null;
  try {
    pool = await getConnection();
    
    console.log('\n=== ESTRUCTURA imFACPracticas ===\n');
    const estructura = await pool.request().query(`
      SELECT COLUMN_NAME, DATA_TYPE
      FROM INFORMATION_SCHEMA.COLUMNS
      WHERE TABLE_NAME = 'imFACPracticas'
      ORDER BY ORDINAL_POSITION
    `);
    
    estructura.recordset.forEach(c => {
      console.log(`  ${c.COLUMN_NAME.padEnd(30)} ${c.DATA_TYPE}`);
    });
    
    console.log('\n=== EJEMPLO ===\n');
    const ejemplo = await pool.request().query(`
      SELECT TOP 1 * FROM imFACPracticas WHERE IdProtocolo IS NOT NULL
    `);
    
    if (ejemplo.recordset.length > 0) {
      Object.keys(ejemplo.recordset[0]).forEach(key => {
        console.log(`  ${key.padEnd(30)} = ${ejemplo.recordset[0][key]}`);
      });
    }
    
  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    if (pool) await closeConnection();
  }
}

ver();
