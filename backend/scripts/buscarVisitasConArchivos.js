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

async function buscarVisitasConArchivos() {
  let pool;
  
  try {
    console.log('🔍 Conectando a la base de datos...\n');
    pool = await sql.connect(config);
    
    // Buscar visitas con archivos
    console.log('🏥 VISITAS CON ARCHIVOS ADJUNTOS:');
    console.log('='.repeat(100));
    const visitas = await pool.request().query(`
      SELECT TOP 20
        v.NumeroVisita,
        p.ApellidoNombre as Paciente,
        v.FechaIngreso,
        COUNT(adj.IdAdjunto) as CantidadArchivos,
        MIN(adj.Patch) as EjemploPath,
        MIN(adj.Descripcion) as EjemploDescripcion
      FROM imVisita v
      INNER JOIN imPacientes p ON v.IdPaciente = p.IdPaciente
      INNER JOIN imPedidosEstudiosAdjuntos adj ON v.NumeroVisita = adj.NumeroVisita
      WHERE adj.Patch IS NOT NULL 
        AND adj.Patch != ''
        AND adj.Patch LIKE '\\\\192.168.25.1%'
      GROUP BY v.NumeroVisita, p.ApellidoNombre, v.FechaIngreso
      ORDER BY v.FechaIngreso DESC
    `);
    
    if (visitas.recordset.length > 0) {
      console.log(`\n✅ Encontradas ${visitas.recordset.length} visitas con archivos\n`);
      
      visitas.recordset.forEach((v, idx) => {
        console.log(`${idx + 1}. Visita #${v.NumeroVisita}`);
        console.log(`   Paciente: ${v.Paciente}`);
        console.log(`   Fecha: ${v.FechaIngreso}`);
        console.log(`   Archivos: ${v.CantidadArchivos}`);
        console.log(`   Path ejemplo: ${v.EjemploPath}`);
        console.log(`   Descripción: ${v.EjemploDescripcion || 'Sin descripción'}`);
        console.log('');
      });
      
      // Mostrar detalles de la primera visita
      const visitaEjemplo = visitas.recordset[0].NumeroVisita;
      console.log('\n' + '='.repeat(100));
      console.log(`📋 DETALLES DE LA VISITA #${visitaEjemplo}:`);
      console.log('='.repeat(100));
      
      const detalles = await pool.request()
        .input('numeroVisita', sql.Int, visitaEjemplo)
        .query(`
          SELECT 
            adj.IdAdjunto,
            adj.NumeroVisita,
            adj.IdProtocolo,
            adj.Patch,
            adj.PatchServidor,
            adj.Descripcion,
            adj.Fecha,
            adj.IdTipoImagen
          FROM imPedidosEstudiosAdjuntos adj
          WHERE adj.NumeroVisita = @numeroVisita
          ORDER BY adj.IdAdjunto
        `);
      
      console.log(`\n✅ ${detalles.recordset.length} archivo(s) encontrado(s):\n`);
      
      detalles.recordset.forEach((det, idx) => {
        console.log(`${idx + 1}. Adjunto ID: ${det.IdAdjunto}`);
        console.log(`   Tipo: ${det.IdTipoImagen ? det.IdTipoImagen.trim() : 'Sin tipo'}`);
        console.log(`   Descripción: ${det.Descripcion || 'Sin descripción'}`);
        console.log(`   Path: ${det.Patch}`);
        console.log(`   PatchServidor: ${det.PatchServidor || 'NULL'}`);
        console.log(`   IdProtocolo: ${det.IdProtocolo}`);
        console.log(`   Fecha: ${det.Fecha || 'Sin fecha'}`);
        console.log('');
      });
      
      // URLs para testing
      console.log('='.repeat(100));
      console.log('🧪 URLS PARA TESTING:');
      console.log('='.repeat(100));
      console.log(`\n1. Ver visita en el frontend:`);
      console.log(`   http://localhost:3000/dashboard/visits/${visitaEjemplo}`);
      console.log(`\n2. Ver detalles en la API:`);
      console.log(`   http://localhost:3001/api/visits/${visitaEjemplo}`);
      
      if (detalles.recordset.length > 0) {
        const primerArchivo = detalles.recordset[0];
        const pathParaUrl = primerArchivo.PatchServidor || primerArchivo.Patch;
        console.log(`\n3. Descargar archivo directamente:`);
        console.log(`   http://localhost:3001/api/archivos/descargar?path=${encodeURIComponent(pathParaUrl)}`);
        console.log(`\n4. Ver archivo en streaming:`);
        console.log(`   http://localhost:3001/api/archivos/stream?path=${encodeURIComponent(pathParaUrl)}`);
      }
      
      // Estadísticas
      console.log('\n' + '='.repeat(100));
      console.log('📊 ESTADÍSTICAS GENERALES:');
      console.log('='.repeat(100));
      
      const stats = await pool.request().query(`
        SELECT 
          COUNT(DISTINCT NumeroVisita) as VisitasConArchivos,
          COUNT(IdAdjunto) as TotalArchivos,
          COUNT(DISTINCT IdProtocolo) as ProtocolosConArchivos
        FROM imPedidosEstudiosAdjuntos
        WHERE Patch IS NOT NULL AND Patch != ''
      `);
      
      if (stats.recordset.length > 0) {
        const s = stats.recordset[0];
        console.log(`\n   Total de visitas con archivos: ${s.VisitasConArchivos}`);
        console.log(`   Total de archivos: ${s.TotalArchivos}`);
        console.log(`   Protocolos con archivos: ${s.ProtocolosConArchivos}`);
      }
      
      // Tipos de archivos
      const tipos = await pool.request().query(`
        SELECT 
          RTRIM(IdTipoImagen) as TipoImagen,
          COUNT(*) as Cantidad
        FROM imPedidosEstudiosAdjuntos
        WHERE Patch IS NOT NULL AND Patch != ''
        GROUP BY IdTipoImagen
        ORDER BY Cantidad DESC
      `);
      
      console.log(`\n   Tipos de archivos:`);
      tipos.recordset.forEach(t => {
        console.log(`      ${(t.TipoImagen || 'Sin tipo').padEnd(30)} ${t.Cantidad} archivo(s)`);
      });
      
    } else {
      console.log('❌ No se encontraron visitas con archivos adjuntos');
    }
    
    console.log('\n' + '='.repeat(100));
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

buscarVisitasConArchivos();
