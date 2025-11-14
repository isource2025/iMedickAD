const { clarionToDate, clarionToTime } = require('../utils/dateConverter');
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

async function verificarHoras() {
  let pool;
  
  try {
    console.log('🕐 VERIFICANDO FECHAS Y HORAS COMPLETAS');
    console.log('='.repeat(120));
    
    pool = await sql.connect(config);
    
    const result = await pool.request().query(`
      SELECT TOP 10
        NumeroVisita,
        FECHAADMISIONS as FechaAdmision,
        FECHAEGRESO as FechaEgresoInt,
        HORAEGRESO as HoraEgresoInt
      FROM imVisita
      WHERE FECHAADMISIONS IS NOT NULL
        AND FECHAEGRESO IS NOT NULL
        AND FECHAEGRESO > 0
      ORDER BY NumeroVisita DESC
    `);
    
    console.log('\n📊 FECHAS Y HORAS COMPLETAS:\n');
    console.log('Visita | Admisión (datetime)      | Egreso (fecha)  | Egreso (hora) | Diferencia | Estado');
    console.log('-'.repeat(120));
    
    let correctas = 0;
    let incorrectas = 0;
    
    result.recordset.forEach(v => {
      const admisionDate = new Date(v.FechaAdmision);
      const admisionStr = admisionDate.toISOString().replace('T', ' ').substring(0, 19);
      
      const egresoFecha = clarionToDate(v.FechaEgresoInt);
      const egresoHora = clarionToTime(v.HoraEgresoInt);
      const egresoDateTime = new Date(`${egresoFecha}T${egresoHora}`);
      
      const diffMs = egresoDateTime - admisionDate;
      const diffHoras = Math.floor(diffMs / (1000 * 60 * 60));
      const diffDias = Math.floor(diffMs / (1000 * 60 * 60 * 24));
      
      const estado = diffMs >= 0 ? '✅ OK' : '❌ ERROR';
      
      if (diffMs >= 0) correctas++;
      else incorrectas++;
      
      console.log(
        `${String(v.NumeroVisita).padEnd(7)} | ${admisionStr} | ${egresoFecha}      | ${egresoHora}     | ${String(diffHoras).padStart(6)}h (${diffDias}d) | ${estado}`
      );
    });
    
    console.log('\n' + '='.repeat(120));
    console.log('\n📈 RESULTADOS:');
    console.log(`   ✅ Fechas/horas correctas: ${correctas}`);
    console.log(`   ❌ Fechas/horas incorrectas: ${incorrectas}`);
    
    if (incorrectas === 0) {
      console.log('\n🎉 ¡CORRECCIÓN EXITOSA! Todas las fechas y horas son correctas.\n');
    } else {
      console.log('\n⚠️  Aún hay fechas/horas incorrectas.\n');
      console.log('💡 Posibles causas:');
      console.log('   - Pacientes que egresan el mismo día que ingresan (estancia corta)');
      console.log('   - Hora de egreso antes que hora de admisión en el mismo día');
      console.log('   - Datos incorrectos en la base de datos\n');
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error(error);
  } finally {
    if (pool) {
      await pool.close();
    }
  }
}

verificarHoras();
