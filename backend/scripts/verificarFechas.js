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

async function verificarFechas() {
  let pool;
  
  try {
    console.log('🔍 VERIFICANDO FECHAS DE ADMISIÓN Y EGRESO');
    console.log('='.repeat(100));
    
    pool = await sql.connect(config);
    
    // 1. Ver estructura de las columnas
    console.log('\n1️⃣ ESTRUCTURA DE COLUMNAS:');
    console.log('='.repeat(100));
    const columnas = await pool.request().query(`
      SELECT 
        COLUMN_NAME,
        DATA_TYPE,
        CHARACTER_MAXIMUM_LENGTH
      FROM INFORMATION_SCHEMA.COLUMNS
      WHERE TABLE_NAME = 'imVisita'
        AND COLUMN_NAME IN ('FECHAADMISIONS', 'FECHAEGRESO', 'HORAEGRESO')
      ORDER BY ORDINAL_POSITION
    `);
    
    columnas.recordset.forEach(col => {
      console.log(`${col.COLUMN_NAME.padEnd(20)} ${col.DATA_TYPE.padEnd(15)} ${col.CHARACTER_MAXIMUM_LENGTH || ''}`);
    });
    
    // 2. Ver ejemplos de datos reales
    console.log('\n\n2️⃣ EJEMPLOS DE DATOS (10 visitas recientes):');
    console.log('='.repeat(100));
    const ejemplos = await pool.request().query(`
      SELECT TOP 10
        NumeroVisita,
        FECHAADMISIONS,
        FECHAEGRESO,
        HORAEGRESO,
        CASE 
          WHEN FECHAEGRESO IS NOT NULL AND FECHAADMISIONS IS NOT NULL 
          THEN DATEDIFF(day, FECHAADMISIONS, DATEADD(day, FECHAEGRESO - 1, '1800-12-28'))
          ELSE NULL
        END as DiferenciaDias
      FROM imVisita
      WHERE FECHAADMISIONS IS NOT NULL
      ORDER BY NumeroVisita DESC
    `);
    
    console.log('\nVisita | FechaAdmision (datetime) | FechaEgreso (int) | HoraEgreso | Dif.Días');
    console.log('-'.repeat(100));
    ejemplos.recordset.forEach(v => {
      const admision = v.FECHAADMISIONS ? new Date(v.FECHAADMISIONS).toISOString().split('T')[0] : 'NULL';
      const egreso = v.FECHAEGRESO || 'NULL';
      const hora = v.HORAEGRESO || 'NULL';
      const diff = v.DiferenciaDias !== null ? v.DiferenciaDias : 'N/A';
      console.log(`${String(v.NumeroVisita).padEnd(7)} | ${admision.padEnd(24)} | ${String(egreso).padEnd(17)} | ${String(hora).padEnd(10)} | ${diff}`);
    });
    
    // 3. Detectar fechas de egreso ANTES de admisión
    console.log('\n\n3️⃣ VISITAS CON FECHAS INCORRECTAS (Egreso antes de Admisión):');
    console.log('='.repeat(100));
    const incorrectas = await pool.request().query(`
      SELECT TOP 20
        v.NumeroVisita,
        p.ApellidoNombre,
        v.FECHAADMISIONS as FechaAdmision,
        v.FECHAEGRESO as FechaEgresoInt,
        DATEADD(day, v.FECHAEGRESO - 1, '1800-12-28') as FechaEgresoCalculada,
        DATEDIFF(day, v.FECHAADMISIONS, DATEADD(day, v.FECHAEGRESO - 1, '1800-12-28')) as DiferenciaDias
      FROM imVisita v
      LEFT JOIN imPacientes p ON v.IdPaciente = p.IdPaciente
      WHERE v.FECHAADMISIONS IS NOT NULL
        AND v.FECHAEGRESO IS NOT NULL
        AND v.FECHAEGRESO > 0
        AND DATEADD(day, v.FECHAEGRESO - 1, '1800-12-28') < v.FECHAADMISIONS
      ORDER BY v.NumeroVisita DESC
    `);
    
    if (incorrectas.recordset.length > 0) {
      console.log(`\n❌ ENCONTRADAS ${incorrectas.recordset.length} VISITAS CON FECHAS INCORRECTAS:\n`);
      incorrectas.recordset.forEach((v, idx) => {
        console.log(`${idx + 1}. Visita #${v.NumeroVisita} - ${v.ApellidoNombre}`);
        console.log(`   Admisión: ${new Date(v.FechaAdmision).toISOString().split('T')[0]}`);
        console.log(`   Egreso (Clarion): ${v.FechaEgresoInt}`);
        console.log(`   Egreso (Calculado): ${new Date(v.FechaEgresoCalculada).toISOString().split('T')[0]}`);
        console.log(`   Diferencia: ${v.DiferenciaDias} días (NEGATIVO = ERROR)`);
        console.log('');
      });
    } else {
      console.log('\n✅ No se encontraron fechas incorrectas');
    }
    
    // 4. Estadísticas generales
    console.log('\n4️⃣ ESTADÍSTICAS:');
    console.log('='.repeat(100));
    const stats = await pool.request().query(`
      SELECT 
        COUNT(*) as TotalVisitas,
        COUNT(FECHAADMISIONS) as ConAdmision,
        COUNT(FECHAEGRESO) as ConEgreso,
        COUNT(CASE 
          WHEN FECHAEGRESO IS NOT NULL 
            AND FECHAADMISIONS IS NOT NULL 
            AND DATEADD(day, FECHAEGRESO - 1, '1800-12-28') < FECHAADMISIONS 
          THEN 1 
        END) as FechasIncorrectas
      FROM imVisita
    `);
    
    const s = stats.recordset[0];
    console.log(`\n   Total de visitas: ${s.TotalVisitas}`);
    console.log(`   Con fecha de admisión: ${s.ConAdmision}`);
    console.log(`   Con fecha de egreso: ${s.ConEgreso}`);
    console.log(`   Con fechas incorrectas: ${s.FechasIncorrectas}`);
    
    if (s.FechasIncorrectas > 0) {
      const porcentaje = ((s.FechasIncorrectas / s.ConEgreso) * 100).toFixed(2);
      console.log(`   ⚠️  ${porcentaje}% de las visitas con egreso tienen fechas incorrectas`);
    }
    
    console.log('\n' + '='.repeat(100));
    console.log('✅ Verificación completada\n');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error(error);
  } finally {
    if (pool) {
      await pool.close();
    }
  }
}

verificarFechas();
