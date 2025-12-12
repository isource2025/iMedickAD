/**
 * Debug completo del protocolo 4277
 */

const { getConnection, closeConnection } = require('../config/db');

async function debug() {
  let pool = null;
  try {
    pool = await getConnection();
    
    console.log('\n=== PROTOCOLO 4277 ===\n');
    
    const protocolo = await pool.request().query(`
      SELECT * FROM HCProtocolosPtes WHERE IdProtocolo = 4277
    `);
    
    console.log('PROTOCOLO:');
    console.log(JSON.stringify(protocolo.recordset[0], null, 2));
    
    console.log('\n=== PRACTICAS DEL PROTOCOLO ===\n');
    
    const practicas = await pool.request().query(`
      SELECT 
        pr.Valor as IdPractica,
        pr.IdProtocolo,
        pr.Practica as CodigoPractica,
        pr.TipoPractica,
        pr.CantidadPractica,
        pr.FechaPractica,
        pr.HoraPracticaInicio,
        pr.HoraPracticaFin,
        pr.Observaciones,
        pr.CodOperador,
        n.Descripcion as NombrePractica,
        n.Tipo as TipoNomenclador,
        pers.ApellidoNombre as NombreProfesional,
        pers.Matricula as MatriculaProfesional
      FROM imFACPracticas pr
      LEFT JOIN VUnionModuladasNomenclador n ON pr.Practica = n.IDPractica
      LEFT JOIN imPersonal pers ON pr.CodOperador = pers.Valor
      WHERE pr.IdProtocolo = 4277
    `);
    
    console.log('PRACTICAS:');
    console.log(JSON.stringify(practicas.recordset, null, 2));
    
    console.log('\n=== VERIFICAR imPersonal ===\n');
    
    if (practicas.recordset.length > 0) {
      const codOp = practicas.recordset[0].CodOperador;
      console.log(`CodOperador de la práctica: ${codOp}`);
      
      const personal = await pool.request().query(`
        SELECT * FROM imPersonal WHERE Valor = ${codOp}
      `);
      
      console.log('\nPersonal encontrado:');
      console.log(JSON.stringify(personal.recordset, null, 2));
    }
    
  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    if (pool) await closeConnection();
  }
}

debug();
