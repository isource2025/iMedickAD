const { getConnection, closeConnection } = require('../config/db');

async function verificar() {
  let pool = null;
  try {
    pool = await getConnection();
    
    console.log('\n=== VERIFICAR RELACIÓN PROFESIONAL ===\n');
    
    // Buscar en imPersonal por Matricula = 1252
    console.log('Buscando en imPersonal por Matricula = 1252:');
    const porMatricula = await pool.request().query(`
      SELECT TOP 1 * FROM imPersonal WHERE Matricula = 1252
    `);
    
    if (porMatricula.recordset.length > 0) {
      console.log('Encontrado:');
      console.log(`  Valor: ${porMatricula.recordset[0].Valor}`);
      console.log(`  Matricula: ${porMatricula.recordset[0].Matricula}`);
      console.log(`  Nombre: ${porMatricula.recordset[0].ApellidoNombre}`);
    }
    
    console.log('\nBuscando en imPersonal por Valor = 1252:');
    const porValor = await pool.request().query(`
      SELECT TOP 1 * FROM imPersonal WHERE Valor = 1252
    `);
    
    if (porValor.recordset.length > 0) {
      console.log('Encontrado:');
      console.log(`  Valor: ${porValor.recordset[0].Valor}`);
      console.log(`  Matricula: ${porValor.recordset[0].Matricula}`);
      console.log(`  Nombre: ${porValor.recordset[0].ApellidoNombre}`);
    } else {
      console.log('  No encontrado');
    }
    
    console.log('\n=== VERIFICAR IdOperador del Protocolo ===\n');
    
    const protocolo = await pool.request().query(`
      SELECT IdOperador FROM HCProtocolosPtes WHERE IdProtocolo = 4274
    `);
    
    console.log(`IdOperador del protocolo 4274: ${protocolo.recordset[0].IdOperador}`);
    
    console.log('\nBuscando ese IdOperador en imPersonal:');
    const operador = await pool.request().query(`
      SELECT * FROM imPersonal WHERE Valor = ${protocolo.recordset[0].IdOperador}
    `);
    
    if (operador.recordset.length > 0) {
      console.log('Encontrado:');
      console.log(`  Valor: ${operador.recordset[0].Valor}`);
      console.log(`  Matricula: ${operador.recordset[0].Matricula}`);
      console.log(`  Nombre: ${operador.recordset[0].ApellidoNombre}`);
    }
    
    console.log('\nBuscando por Matricula = IdOperador:');
    const porMat = await pool.request().query(`
      SELECT * FROM imPersonal WHERE Matricula = ${protocolo.recordset[0].IdOperador}
    `);
    
    if (porMat.recordset.length > 0) {
      console.log('Encontrado:');
      console.log(`  Valor: ${porMat.recordset[0].Valor}`);
      console.log(`  Matricula: ${porMat.recordset[0].Matricula}`);
      console.log(`  Nombre: ${porMat.recordset[0].ApellidoNombre}`);
    }
    
  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    if (pool) await closeConnection();
  }
}

verificar();
