/**
 * Buscar protocolos que SÍ tengan datos completos
 */

const { getConnection, closeConnection } = require('../config/db');

async function buscar() {
  let pool = null;
  try {
    pool = await getConnection();
    
    console.log('\n=== BUSCANDO PROTOCOLOS CON DATOS COMPLETOS ===\n');
    
    // Buscar protocolos con texto, técnica o diagnósticos
    const protocolos = await pool.request().query(`
      SELECT TOP 5
        p.IdProtocolo,
        p.NumeroProtocolo,
        p.NumeroVisita,
        p.Fecha,
        p.TipoProtocolo,
        p.Tecnica,
        p.DiagnosticoPreProcedimiento,
        p.DiagnosticoPosProcedimiento,
        p.IdOperador,
        LEN(p.Texto) as LenTexto,
        pac.NumeroDocumento,
        pac.ApellidoyNombre
      FROM HCProtocolosPtes p
      INNER JOIN imPacientes pac ON p.IDPaciente = pac.IdPaciente
      WHERE 
        (p.Texto IS NOT NULL AND LEN(p.Texto) > 10)
        OR (p.Tecnica IS NOT NULL AND LEN(p.Tecnica) > 5)
        OR (p.DiagnosticoPreProcedimiento IS NOT NULL AND LEN(p.DiagnosticoPreProcedimiento) > 2)
      ORDER BY p.Fecha DESC
    `);
    
    console.log(`Protocolos encontrados: ${protocolos.recordset.length}\n`);
    
    for (const p of protocolos.recordset) {
      console.log('─────────────────────────────────────────');
      console.log(`ID: ${p.IdProtocolo} | Nro: ${p.NumeroProtocolo} | Visita: ${p.NumeroVisita}`);
      console.log(`Paciente: ${p.ApellidoyNombre} (DNI: ${p.NumeroDocumento})`);
      console.log(`Fecha: ${new Date(p.Fecha).toLocaleDateString('es-AR')}`);
      console.log(`Tipo: ${p.TipoProtocolo || 'N/A'}`);
      console.log(`Técnica: ${p.Tecnica ? p.Tecnica.substring(0, 50) + '...' : 'N/A'}`);
      console.log(`Diag Pre: ${p.DiagnosticoPreProcedimiento || 'N/A'}`);
      console.log(`Texto: ${p.LenTexto ? `${p.LenTexto} caracteres` : 'N/A'}`);
      console.log(`IdOperador: ${p.IdOperador}`);
      
      // Ver prácticas
      const practicas = await pool.request().query(`
        SELECT 
          pr.CodOperador,
          pers.ApellidoNombre,
          pers.Matricula
        FROM imFACPracticas pr
        LEFT JOIN imPersonal pers ON pr.CodOperador = pers.Valor
        WHERE pr.IdProtocolo = ${p.IdProtocolo}
      `);
      
      if (practicas.recordset.length > 0) {
        console.log(`Prácticas: ${practicas.recordset.length}`);
        practicas.recordset.forEach(pr => {
          if (pr.ApellidoNombre) {
            console.log(`  - Profesional: ${pr.ApellidoNombre} (Mat: ${pr.Matricula})`);
          } else {
            console.log(`  - CodOperador: ${pr.CodOperador} (sin datos en imPersonal)`);
          }
        });
      }
      console.log('');
    }
    
    console.log('\n═══════════════════════════════════════════');
    console.log('RECOMENDACIÓN PARA PROBAR:');
    console.log('═══════════════════════════════════════════');
    if (protocolos.recordset.length > 0) {
      const mejor = protocolos.recordset[0];
      console.log(`\n1. Buscar paciente DNI: ${mejor.NumeroDocumento}`);
      console.log(`2. Abrir visita: ${mejor.NumeroVisita}`);
      console.log(`3. Ver tab Protocolos`);
      console.log(`4. Click en protocolo Nro: ${mejor.NumeroProtocolo}\n`);
    }
    
  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    if (pool) await closeConnection();
  }
}

buscar();
