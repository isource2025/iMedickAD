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
  },
  pool: {
    max: 10,
    min: 0,
    idleTimeoutMillis: 30000
  }
};

async function buscarEjemplosConAdjuntos() {
  let pool;
  
  try {
    console.log('🔍 Conectando a la base de datos...\n');
    pool = await sql.connect(config);
    
    // 1. Ver algunos ejemplos de adjuntos
    console.log('📎 EJEMPLOS DE ADJUNTOS EN LA BASE DE DATOS:');
    console.log('='.repeat(80));
    const ejemplos = await pool.request().query(`
      SELECT TOP 5 
        IdAdjunto,
        IdPedido,
        PatchServidor,
        NombreArchivo,
        FechaSubida
      FROM imPedidosEstudiosAdjuntos
      WHERE PatchServidor IS NOT NULL
      ORDER BY FechaSubida DESC
    `);
    
    if (ejemplos.recordset.length > 0) {
      ejemplos.recordset.forEach((adj, idx) => {
        console.log(`\n${idx + 1}. Adjunto ID: ${adj.IdAdjunto}`);
        console.log(`   Pedido ID: ${adj.IdPedido}`);
        console.log(`   Path: ${adj.PatchServidor}`);
        console.log(`   Archivo: ${adj.NombreArchivo || 'Sin nombre'}`);
        console.log(`   Fecha: ${adj.FechaSubida || 'Sin fecha'}`);
      });
    } else {
      console.log('❌ No se encontraron adjuntos en la base de datos');
    }
    
    // 2. Buscar visitas con adjuntos
    console.log('\n\n🏥 VISITAS CON ARCHIVOS ADJUNTOS:');
    console.log('='.repeat(80));
    const visitas = await pool.request().query(`
      SELECT TOP 10
        v.NumeroVisita,
        p.ApellidoNombre as Paciente,
        v.FechaIngreso,
        COUNT(adj.IdAdjunto) as CantidadAdjuntos,
        MIN(adj.PatchServidor) as EjemploPath
      FROM imVisita v
      INNER JOIN imPacientes p ON v.IdPaciente = p.IdPaciente
      INNER JOIN imPedidosEstudios pe ON v.NumeroVisita = pe.IdVisita
      INNER JOIN imPedidosEstudiosAdjuntos adj ON pe.IdPedido = adj.IdPedido
      WHERE adj.PatchServidor IS NOT NULL 
        AND adj.PatchServidor != ''
      GROUP BY v.NumeroVisita, p.ApellidoNombre, v.FechaIngreso
      ORDER BY v.FechaIngreso DESC
    `);
    
    if (visitas.recordset.length > 0) {
      visitas.recordset.forEach((v, idx) => {
        console.log(`\n${idx + 1}. Visita #${v.NumeroVisita}`);
        console.log(`   Paciente: ${v.Paciente}`);
        console.log(`   Fecha Ingreso: ${v.FechaIngreso}`);
        console.log(`   Adjuntos: ${v.CantidadAdjuntos}`);
        console.log(`   Ejemplo Path: ${v.EjemploPath}`);
      });
      
      // 3. Mostrar detalles de la primera visita
      const primeraVisita = visitas.recordset[0].NumeroVisita;
      console.log('\n\n📋 DETALLES DE LA VISITA #' + primeraVisita + ':');
      console.log('='.repeat(80));
      
      const detalles = await pool.request()
        .input('numeroVisita', sql.Int, primeraVisita)
        .query(`
          SELECT 
            pe.IdPedido,
            pe.NotasObservacion as PedidoEstudio,
            adj.IdAdjunto,
            adj.PatchServidor,
            adj.NombreArchivo,
            adj.FechaSubida
          FROM imPedidosEstudios pe
          INNER JOIN imPedidosEstudiosAdjuntos adj ON pe.IdPedido = adj.IdPedido
          WHERE pe.IdVisita = @numeroVisita
          ORDER BY adj.FechaSubida DESC
        `);
      
      detalles.recordset.forEach((det, idx) => {
        console.log(`\n   Estudio ${idx + 1}:`);
        console.log(`   - Pedido ID: ${det.IdPedido}`);
        console.log(`   - Descripción: ${det.PedidoEstudio || 'Sin descripción'}`);
        console.log(`   - Adjunto ID: ${det.IdAdjunto}`);
        console.log(`   - Archivo: ${det.NombreArchivo || 'Sin nombre'}`);
        console.log(`   - Path: ${det.PatchServidor}`);
        console.log(`   - Fecha: ${det.FechaSubida || 'Sin fecha'}`);
      });
      
      // 4. Mostrar URL para testing
      console.log('\n\n🧪 PARA TESTING:');
      console.log('='.repeat(80));
      console.log(`\n1. Frontend URL:`);
      console.log(`   http://localhost:3000/dashboard/visits/${primeraVisita}`);
      console.log(`\n2. API URL para ver detalles:`);
      console.log(`   http://localhost:3001/api/visits/${primeraVisita}`);
      console.log(`\n3. API URL para descargar archivo (ejemplo):`);
      if (detalles.recordset.length > 0) {
        const primerPath = detalles.recordset[0].PatchServidor;
        console.log(`   http://localhost:3001/api/archivos/descargar?path=${encodeURIComponent(primerPath)}`);
      }
      
    } else {
      console.log('❌ No se encontraron visitas con adjuntos');
    }
    
    // 5. Estadísticas generales
    console.log('\n\n📊 ESTADÍSTICAS:');
    console.log('='.repeat(80));
    const stats = await pool.request().query(`
      SELECT 
        COUNT(DISTINCT v.NumeroVisita) as VisitasConAdjuntos,
        COUNT(adj.IdAdjunto) as TotalAdjuntos,
        COUNT(DISTINCT pe.IdPedido) as EstudiosConAdjuntos
      FROM imVisita v
      INNER JOIN imPedidosEstudios pe ON v.NumeroVisita = pe.IdVisita
      INNER JOIN imPedidosEstudiosAdjuntos adj ON pe.IdPedido = adj.IdPedido
      WHERE adj.PatchServidor IS NOT NULL
    `);
    
    if (stats.recordset.length > 0) {
      const s = stats.recordset[0];
      console.log(`\n   Visitas con adjuntos: ${s.VisitasConAdjuntos}`);
      console.log(`   Total de adjuntos: ${s.TotalAdjuntos}`);
      console.log(`   Estudios con adjuntos: ${s.EstudiosConAdjuntos}`);
    }
    
    console.log('\n' + '='.repeat(80));
    console.log('✅ Búsqueda completada\n');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error(error);
  } finally {
    if (pool) {
      await pool.close();
    }
  }
}

// Ejecutar
buscarEjemplosConAdjuntos();
