const { clarionToDate } = require('../utils/dateConverter');
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

async function verificarCorreccion() {
  let pool;
  
  try {
    console.log('✅ VERIFICANDO CORRECCIÓN DE FECHAS');
    console.log('='.repeat(100));
    
    pool = await sql.connect(config);
    
    // Obtener ejemplos de visitas
    const result = await pool.request().query(`
      SELECT TOP 10
        NumeroVisita,
        FECHAADMISIONS as FechaAdmision,
        FECHAEGRESO as FechaEgresoInt,
        HORAEGRESO
      FROM imVisita
      WHERE FECHAADMISIONS IS NOT NULL
        AND FECHAEGRESO IS NOT NULL
        AND FECHAEGRESO > 0
      ORDER BY NumeroVisita DESC
    `);
    
    console.log('\n📊 COMPARACIÓN DE FECHAS (10 visitas recientes):\n');
    console.log('Visita | Admisión   | Egreso(Int) | Egreso(Convertido) | Diferencia | Estado');
    console.log('-'.repeat(100));
    
    let correctas = 0;
    let incorrectas = 0;
    
    result.recordset.forEach(v => {
      const admision = new Date(v.FechaAdmision);
      const admisionStr = admision.toISOString().split('T')[0];
      const egresoStr = clarionToDate(v.FechaEgresoInt);
      const egreso = new Date(egresoStr);
      
      const diffDias = Math.floor((egreso - admision) / (1000 * 60 * 60 * 24));
      const estado = diffDias >= 0 ? '✅ OK' : '❌ ERROR';
      
      if (diffDias >= 0) correctas++;
      else incorrectas++;
      
      console.log(
        `${String(v.NumeroVisita).padEnd(7)} | ${admisionStr} | ${String(v.FechaEgresoInt).padEnd(11)} | ${egresoStr}       | ${String(diffDias).padStart(10)} | ${estado}`
      );
    });
    
    console.log('\n' + '='.repeat(100));
    console.log('\n📈 RESULTADOS:');
    console.log(`   ✅ Fechas correctas: ${correctas}`);
    console.log(`   ❌ Fechas incorrectas: ${incorrectas}`);
    
    if (incorrectas === 0) {
      console.log('\n🎉 ¡CORRECCIÓN EXITOSA! Todas las fechas son correctas.\n');
    } else {
      console.log('\n⚠️  Aún hay fechas incorrectas. Revisar la conversión.\n');
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    if (pool) {
      await pool.close();
    }
  }
}

verificarCorreccion();
