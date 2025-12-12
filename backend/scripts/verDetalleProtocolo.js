/**
 * Ver detalle completo de un protocolo específico
 */

const { getConnection, closeConnection } = require('../config/db');

async function verDetalle() {
  let pool = null;
  try {
    pool = await getConnection();
    
    // Buscar un protocolo de ejemplo
    console.log('\n=== PROTOCOLO COMPLETO ===\n');
    
    const protocolo = await pool.request().query(`
      SELECT TOP 1 * FROM HCProtocolosPtes 
      WHERE NumeroVisita = 359483
    `);
    
    if (protocolo.recordset.length > 0) {
      const p = protocolo.recordset[0];
      console.log('DATOS DEL PROTOCOLO:\n');
      Object.keys(p).forEach(key => {
        console.log(`  ${key.padEnd(30)} = ${p[key]}`);
      });
      
      // Buscar profesionales relacionados
      console.log('\n=== PROFESIONALES (imFacProfesionales) ===\n');
      const profesionales = await pool.request()
        .input('idProtocolo', p.IdProtocolo)
        .query(`
          SELECT * FROM imFacProfesionales 
          WHERE IDFacProfesional IN (
            SELECT DISTINCT CodOperador 
            FROM imFACPracticas 
            WHERE IdProtocolo = @idProtocolo
          )
        `);
      
      if (profesionales.recordset.length > 0) {
        profesionales.recordset.forEach(prof => {
          console.log(`  Matricula: ${prof.Matricula}, CodOperador: ${prof.CodOperador}`);
        });
      } else {
        console.log('  No hay profesionales en imFacProfesionales');
      }
      
      // Buscar en imPersonal
      console.log('\n=== PROFESIONALES (imPersonal) ===\n');
      const personal = await pool.request()
        .input('idProtocolo', p.IdProtocolo)
        .query(`
          SELECT DISTINCT 
            pers.IdPersonal,
            pers.Nombre,
            pers.Apellido,
            pers.Matricula,
            pr.CodOperador
          FROM imFACPracticas pr
          LEFT JOIN imPersonal pers ON pr.CodOperador = pers.IdPersonal
          WHERE pr.IdProtocolo = @idProtocolo
        `);
      
      if (personal.recordset.length > 0) {
        personal.recordset.forEach(p => {
          console.log(`  ${p.Apellido} ${p.Nombre} - Mat: ${p.Matricula} - Cod: ${p.CodOperador}`);
        });
      }
      
      // Prácticas
      console.log('\n=== PRACTICAS ===\n');
      const practicas = await pool.request()
        .input('idProtocolo', p.IdProtocolo)
        .query(`
          SELECT 
            pr.*,
            n.Descripcion as NombrePractica
          FROM imFACPracticas pr
          LEFT JOIN VUnionModuladasNomenclador n ON pr.Practica = n.IDPractica
          WHERE pr.IdProtocolo = @idProtocolo
        `);
      
      practicas.recordset.forEach(pr => {
        console.log(`  ${pr.Practica} - ${pr.NombrePractica || 'Sin nombre'}`);
        console.log(`    Operador: ${pr.CodOperador}`);
        console.log(`    Cantidad: ${pr.CantidadPractica}`);
        console.log('');
      });
    }
    
  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    if (pool) await closeConnection();
  }
}

verDetalle();
