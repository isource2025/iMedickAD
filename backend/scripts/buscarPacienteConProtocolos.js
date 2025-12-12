/**
 * Script simplificado para encontrar UN paciente con protocolos para probar
 */

const { getConnection, closeConnection } = require('../config/db');

async function buscar() {
  let pool = null;

  try {
    pool = await getConnection();
    
    console.log('\n╔════════════════════════════════════════════════════════════╗');
    console.log('║  🔍 BUSCAR PACIENTE CON PROTOCOLOS PARA PROBAR            ║');
    console.log('╚════════════════════════════════════════════════════════════╝\n');

    const resultado = await pool.request().query(`
      SELECT TOP 1
        pac.NumeroDocumento,
        pac.ApellidoyNombre,
        p.NumeroVisita,
        p.IdProtocolo,
        p.NumeroProtocolo,
        p.Fecha,
        v.FECHAADMISIONS as FechaAdmision,
        COUNT(pr.Valor) as CantidadPracticas
      FROM HCProtocolosPtes p
      INNER JOIN imPacientes pac ON p.IDPaciente = pac.IdPaciente
      INNER JOIN imVisita v ON p.NumeroVisita = v.NUMEROVISITA
      LEFT JOIN imFACPracticas pr ON p.IdProtocolo = pr.IdProtocolo
      WHERE p.NumeroVisita IS NOT NULL
      GROUP BY 
        pac.NumeroDocumento,
        pac.ApellidoyNombre,
        p.NumeroVisita,
        p.IdProtocolo,
        p.NumeroProtocolo,
        p.Fecha,
        v.FECHAADMISIONS
      ORDER BY p.Fecha DESC
    `);

    if (resultado.recordset.length > 0) {
      const r = resultado.recordset[0];
      
      console.log('✅ PACIENTE ENCONTRADO:\n');
      console.log('═══════════════════════════════════════════════════════════\n');
      console.log(`👤 Nombre: ${r.ApellidoyNombre}`);
      console.log(`📄 DNI: ${r.NumeroDocumento}`);
      console.log(`🏥 Número de Visita: ${r.NumeroVisita}`);
      console.log(`📑 ID Protocolo: ${r.IdProtocolo}`);
      console.log(`📋 Número Protocolo: ${r.NumeroProtocolo || 'N/A'}`);
      console.log(`📅 Fecha Protocolo: ${r.Fecha ? new Date(r.Fecha).toLocaleDateString('es-AR') : 'N/A'}`);
      console.log(`💉 Prácticas: ${r.CantidadPracticas}`);
      
      console.log('\n═══════════════════════════════════════════════════════════');
      console.log('🚀 PASOS PARA PROBAR:');
      console.log('═══════════════════════════════════════════════════════════\n');
      
      console.log('1. Abrir: http://localhost:3000/login');
      console.log('   Usuario: admin');
      console.log('   Password: admin123\n');
      
      console.log(`2. Buscar paciente con DNI: ${r.NumeroDocumento}\n`);
      
      console.log(`3. Click en la visita: ${r.NumeroVisita}\n`);
      
      console.log('4. Click en la tab: "Protocolos"\n');
      
      console.log('5. Deberías ver:');
      console.log(`   - 1 protocolo (Nro: ${r.NumeroProtocolo || 'N/A'})`);
      console.log(`   - ${r.CantidadPracticas} práctica(s) asociada(s)\n`);
      
      console.log('═══════════════════════════════════════════════════════════\n');
      
    } else {
      console.log('❌ No se encontraron protocolos en la base de datos\n');
    }

  } catch (error) {
    console.error('\n❌ Error:', error.message);
  } finally {
    if (pool) {
      await closeConnection();
    }
  }
}

buscar();
