/**
 * Script de DEBUG para buscar protocolos en la base de datos
 * Ayuda a encontrar pacientes y visitas con protocolos para probar en el frontend
 */

const { getConnection, closeConnection } = require('../config/db');

console.log('\n╔════════════════════════════════════════════════════════════╗');
console.log('║  🔍 DEBUG - Buscar Protocolos en Base de Datos            ║');
console.log('╚════════════════════════════════════════════════════════════╝\n');

async function buscarProtocolos() {
  let pool = null;

  try {
    console.log('📡 Conectando a la base de datos...');
    pool = await getConnection();
    console.log('✅ Conexión establecida\n');

    // 1. Verificar si la tabla existe
    console.log('═══════════════════════════════════════════════════════════');
    console.log('1️⃣  VERIFICANDO TABLA HCProtocolosPtes');
    console.log('═══════════════════════════════════════════════════════════\n');

    const checkTable = await pool.request().query(`
      SELECT COUNT(*) as existe 
      FROM INFORMATION_SCHEMA.TABLES 
      WHERE TABLE_NAME = 'HCProtocolosPtes'
    `);

    if (checkTable.recordset[0].existe === 0) {
      console.log('❌ La tabla HCProtocolosPtes NO EXISTE en la base de datos');
      console.log('\n⚠️  PROBLEMA: No se puede implementar protocolos sin esta tabla\n');
      return;
    }

    console.log('✅ La tabla HCProtocolosPtes existe\n');

    // 2. Contar total de protocolos
    console.log('═══════════════════════════════════════════════════════════');
    console.log('2️⃣  ESTADÍSTICAS DE PROTOCOLOS');
    console.log('═══════════════════════════════════════════════════════════\n');

    const stats = await pool.request().query(`
      SELECT 
        COUNT(*) as TotalProtocolos,
        COUNT(DISTINCT NumeroVisita) as VisitasConProtocolos,
        COUNT(DISTINCT IdPaciente) as PacientesConProtocolos
      FROM HCProtocolosPtes
      WHERE NumeroVisita IS NOT NULL
    `);

    const s = stats.recordset[0];
    console.log(`📊 Total de protocolos: ${s.TotalProtocolos}`);
    console.log(`📊 Visitas con protocolos: ${s.VisitasConProtocolos}`);
    console.log(`📊 Pacientes con protocolos: ${s.PacientesConProtocolos}\n`);

    if (s.TotalProtocolos === 0) {
      console.log('⚠️  NO HAY PROTOCOLOS en la base de datos');
      console.log('   La tabla existe pero está vacía\n');
      return;
    }

    // 3. Buscar visitas con protocolos
    console.log('═══════════════════════════════════════════════════════════');
    console.log('3️⃣  VISITAS CON PROTOCOLOS (Top 10)');
    console.log('═══════════════════════════════════════════════════════════\n');

    const visitas = await pool.request().query(`
      SELECT TOP 10
        p.NumeroVisita,
        COUNT(p.IdProtocolo) as CantidadProtocolos,
        MIN(p.FechaProtocolo) as PrimeraFecha,
        MAX(p.FechaProtocolo) as UltimaFecha
      FROM HCProtocolosPtes p
      WHERE p.NumeroVisita IS NOT NULL
      GROUP BY p.NumeroVisita
      ORDER BY COUNT(p.IdProtocolo) DESC
    `);

    console.log('┌──────────────┬───────────┬──────────────┬──────────────┐');
    console.log('│ NumeroVisita │ Protocolos│ Primera Fecha│ Última Fecha │');
    console.log('├──────────────┼───────────┼──────────────┼──────────────┤');
    visitas.recordset.forEach(v => {
      const primera = v.PrimeraFecha ? new Date(v.PrimeraFecha).toLocaleDateString('es-AR') : 'N/A';
      const ultima = v.UltimaFecha ? new Date(v.UltimaFecha).toLocaleDateString('es-AR') : 'N/A';
      console.log(`│ ${String(v.NumeroVisita).padEnd(12)} │ ${String(v.CantidadProtocolos).padEnd(9)} │ ${primera.padEnd(12)} │ ${ultima.padEnd(12)} │`);
    });
    console.log('└──────────────┴───────────┴──────────────┴──────────────┘\n');

    // 4. Buscar pacientes con protocolos
    console.log('═══════════════════════════════════════════════════════════');
    console.log('4️⃣  PACIENTES CON PROTOCOLOS (Top 10)');
    console.log('═══════════════════════════════════════════════════════════\n');

    const pacientes = await pool.request().query(`
      SELECT TOP 10
        pac.IdPaciente,
        pac.NumeroDocumento,
        pac.ApellidoyNombre,
        COUNT(DISTINCT p.NumeroVisita) as VisitasConProtocolos,
        COUNT(p.IdProtocolo) as TotalProtocolos
      FROM HCProtocolosPtes p
      INNER JOIN imPacientes pac ON p.IdPaciente = pac.IdPaciente
      WHERE p.NumeroVisita IS NOT NULL
      GROUP BY pac.IdPaciente, pac.NumeroDocumento, pac.ApellidoyNombre
      ORDER BY COUNT(p.IdProtocolo) DESC
    `);

    console.log('Pacientes con más protocolos:\n');
    pacientes.recordset.forEach((pac, idx) => {
      console.log(`${idx + 1}. ${pac.ApellidoyNombre}`);
      console.log(`   📄 DNI: ${pac.NumeroDocumento}`);
      console.log(`   🏥 Visitas: ${pac.VisitasConProtocolos}`);
      console.log(`   📑 Protocolos: ${pac.TotalProtocolos}\n`);
    });

    // 5. Ejemplo detallado de un protocolo
    console.log('═══════════════════════════════════════════════════════════');
    console.log('5️⃣  EJEMPLO DETALLADO DE PROTOCOLO');
    console.log('═══════════════════════════════════════════════════════════\n');

    const ejemplo = await pool.request().query(`
      SELECT TOP 1
        p.IdProtocolo,
        p.NroProtocolo,
        p.NumeroVisita,
        p.IdPaciente,
        p.FechaProtocolo,
        p.HoraProtocolo,
        p.IdProfesional,
        prof.Nombre as NombreProfesional,
        prof.Matricula as MatriculaProfesional,
        pac.NumeroDocumento,
        pac.ApellidoyNombre,
        v.FECHAADMISIONS as FechaAdmision
      FROM HCProtocolosPtes p
      LEFT JOIN imFacProfesionales prof ON p.IdProfesional = prof.IdProfesional
      LEFT JOIN imPacientes pac ON p.IdPaciente = pac.IdPaciente
      LEFT JOIN imVisita v ON p.NumeroVisita = v.NUMEROVISITA
      WHERE p.NumeroVisita IS NOT NULL
      ORDER BY p.FechaProtocolo DESC
    `);

    if (ejemplo.recordset.length > 0) {
      const e = ejemplo.recordset[0];
      console.log('📋 PROTOCOLO:');
      console.log(`   ID Protocolo: ${e.IdProtocolo}`);
      console.log(`   Nro Protocolo: ${e.NroProtocolo || 'N/A'}`);
      console.log(`   Fecha: ${e.FechaProtocolo ? new Date(e.FechaProtocolo).toLocaleDateString('es-AR') : 'N/A'}`);
      console.log(`   Hora: ${e.HoraProtocolo || 'N/A'}\n`);

      console.log('👤 PACIENTE:');
      console.log(`   Nombre: ${e.ApellidoyNombre}`);
      console.log(`   DNI: ${e.NumeroDocumento}\n`);

      console.log('🏥 VISITA:');
      console.log(`   Número: ${e.NumeroVisita}`);
      console.log(`   Fecha Admisión: ${e.FechaAdmision ? new Date(e.FechaAdmision).toLocaleDateString('es-AR') : 'N/A'}\n`);

      if (e.NombreProfesional) {
        console.log('👨‍⚕️ PROFESIONAL:');
        console.log(`   Nombre: ${e.NombreProfesional}`);
        console.log(`   Matrícula: ${e.MatriculaProfesional || 'N/A'}\n`);
      }

      // Buscar prácticas de este protocolo
      const practicas = await pool.request()
        .input('idProtocolo', e.IdProtocolo)
        .query(`
          SELECT 
            pr.IdPractica,
            pr.Practica as CodigoPractica,
            pr.TipoPractica,
            pr.CantidadPractica,
            pr.FechaPractica,
            pr.Observaciones,
            n.Descripcion as NombrePractica
          FROM imFACPracticas pr
          LEFT JOIN VUnionModuladasNomenclador n ON pr.Practica = n.IDPractica
          WHERE pr.IdProtocolo = @idProtocolo
        `);

      if (practicas.recordset.length > 0) {
        console.log('💉 PRÁCTICAS ASOCIADAS:');
        practicas.recordset.forEach((pr, idx) => {
          console.log(`   ${idx + 1}. ${pr.NombrePractica || 'Sin nombre'}`);
          console.log(`      Código: ${pr.CodigoPractica}`);
          console.log(`      Cantidad: ${pr.CantidadPractica || 0}`);
          if (pr.Observaciones) {
            console.log(`      Obs: ${pr.Observaciones}`);
          }
        });
        console.log('');
      } else {
        console.log('⚠️  Este protocolo no tiene prácticas asociadas\n');
      }

      // 6. INSTRUCCIONES PARA PROBAR EN EL FRONTEND
      console.log('═══════════════════════════════════════════════════════════');
      console.log('6️⃣  INSTRUCCIONES PARA PROBAR EN EL FRONTEND');
      console.log('═══════════════════════════════════════════════════════════\n');

      console.log('✅ PASOS PARA VER PROTOCOLOS:\n');
      console.log('1. Iniciar sesión en: http://localhost:3000/login');
      console.log('   Usuario: admin');
      console.log('   Password: admin123\n');

      console.log(`2. Buscar paciente con DNI: ${e.NumeroDocumento}\n`);

      console.log('3. En la tabla de visitas, hacer clic en la visita:');
      console.log(`   Número de Visita: ${e.NumeroVisita}\n`);

      console.log('4. En el detalle de la visita, hacer clic en la tab:');
      console.log('   📑 Protocolos\n');

      console.log('5. Deberías ver:');
      console.log(`   - ${stats.recordset[0].TotalProtocolos} protocolo(s)`);
      if (practicas.recordset.length > 0) {
        console.log(`   - ${practicas.recordset.length} práctica(s) asociada(s)`);
      }
      console.log('');

    } else {
      console.log('⚠️  No se encontró ningún protocolo de ejemplo\n');
    }

    // 7. Verificar tabla de prácticas
    console.log('═══════════════════════════════════════════════════════════');
    console.log('7️⃣  VERIFICAR RELACIÓN CON PRÁCTICAS');
    console.log('═══════════════════════════════════════════════════════════\n');

    const practicasStats = await pool.request().query(`
      SELECT 
        COUNT(*) as TotalPracticas,
        COUNT(DISTINCT IdProtocolo) as ProtocolosConPracticas
      FROM imFACPracticas
      WHERE IdProtocolo IS NOT NULL AND IdProtocolo > 0
    `);

    const ps = practicasStats.recordset[0];
    console.log(`📊 Total de prácticas con protocolo: ${ps.TotalPracticas}`);
    console.log(`📊 Protocolos que tienen prácticas: ${ps.ProtocolosConPracticas}\n`);

  } catch (error) {
    console.error('\n❌ Error:', error.message);
    console.error('\n📋 Detalles del error:');
    console.error(error);
  } finally {
    if (pool) {
      await closeConnection();
    }
  }
}

// Ejecutar
buscarProtocolos()
  .then(() => {
    console.log('═══════════════════════════════════════════════════════════');
    console.log('✅ DEBUG COMPLETADO');
    console.log('═══════════════════════════════════════════════════════════\n');
    process.exit(0);
  })
  .catch(error => {
    console.error('❌ Error fatal:', error);
    process.exit(1);
  });
