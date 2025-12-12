/**
 * Script para obtener la estructura de las tablas relacionadas con Protocolos
 * Ejecuta consultas SQL para analizar imHCProtocolosPtes, imFACPracticas y imFacProfesionales
 */

const sql = require('mssql');
const fs = require('fs');
const path = require('path');

// Configuración de conexión a SQL Server
const config = {
  user: process.env.DB_USER || 'sa',
  password: process.env.DB_PASSWORD,
  server: process.env.DB_SERVER || 'localhost',
  database: process.env.DB_NAME || 'iMedic',
  options: {
    encrypt: false,
    trustServerCertificate: true,
    enableArithAbort: true,
  },
  pool: {
    max: 10,
    min: 0,
    idleTimeoutMillis: 30000,
  },
  requestTimeout: 60000,
};

async function ejecutarConsulta(pool, titulo, query) {
  console.log(`\n${'='.repeat(60)}`);
  console.log(titulo);
  console.log('='.repeat(60));
  
  try {
    const result = await pool.request().query(query);
    
    if (result.recordset && result.recordset.length > 0) {
      console.table(result.recordset);
      return result.recordset;
    } else {
      console.log('No se encontraron resultados');
      return [];
    }
  } catch (error) {
    console.error(`Error en consulta: ${error.message}`);
    return [];
  }
}

async function main() {
  let pool;
  const outputData = {
    timestamp: new Date().toISOString(),
    estructuras: {},
    relaciones: {},
    ejemplos: {}
  };

  try {
    console.log('Conectando a la base de datos...');
    pool = await sql.connect(config);
    console.log('✓ Conexión exitosa');

    // 1. Estructura de imHCProtocolosPtes
    const estructuraProtocolos = await ejecutarConsulta(
      pool,
      'ESTRUCTURA: imHCProtocolosPtes',
      `SELECT 
        COLUMN_NAME as Columna,
        DATA_TYPE as TipoDato,
        CHARACTER_MAXIMUM_LENGTH as Longitud,
        IS_NULLABLE as Nullable,
        COLUMN_DEFAULT as ValorPorDefecto
      FROM INFORMATION_SCHEMA.COLUMNS
      WHERE TABLE_NAME = 'imHCProtocolosPtes'
      ORDER BY ORDINAL_POSITION`
    );
    outputData.estructuras.imHCProtocolosPtes = estructuraProtocolos;

    // 2. Ejemplos de datos de imHCProtocolosPtes
    const ejemplosProtocolos = await ejecutarConsulta(
      pool,
      'EJEMPLOS: imHCProtocolosPtes (primeros 5 registros)',
      `SELECT TOP 5 * FROM imHCProtocolosPtes ORDER BY IdProtocolo DESC`
    );
    outputData.ejemplos.imHCProtocolosPtes = ejemplosProtocolos;

    // 3. Total de registros
    const totalProtocolos = await ejecutarConsulta(
      pool,
      'TOTAL REGISTROS: imHCProtocolosPtes',
      `SELECT COUNT(*) as TotalRegistros FROM imHCProtocolosPtes`
    );
    outputData.estructuras.imHCProtocolosPtes_total = totalProtocolos;

    // 4. Estructura de imFACPracticas
    const estructuraPracticas = await ejecutarConsulta(
      pool,
      'ESTRUCTURA: imFACPracticas',
      `SELECT 
        COLUMN_NAME as Columna,
        DATA_TYPE as TipoDato,
        CHARACTER_MAXIMUM_LENGTH as Longitud,
        IS_NULLABLE as Nullable,
        COLUMN_DEFAULT as ValorPorDefecto
      FROM INFORMATION_SCHEMA.COLUMNS
      WHERE TABLE_NAME = 'imFACPracticas'
      ORDER BY ORDINAL_POSITION`
    );
    outputData.estructuras.imFACPracticas = estructuraPracticas;

    // 5. Ejemplos de imFACPracticas
    const ejemplosPracticas = await ejecutarConsulta(
      pool,
      'EJEMPLOS: imFACPracticas (primeros 5 registros)',
      `SELECT TOP 5 * FROM imFACPracticas WHERE IdProtocolo IS NOT NULL ORDER BY IdPractica DESC`
    );
    outputData.ejemplos.imFACPracticas = ejemplosPracticas;

    // 6. Estructura de imFacProfesionales
    const estructuraProfesionales = await ejecutarConsulta(
      pool,
      'ESTRUCTURA: imFacProfesionales',
      `SELECT 
        COLUMN_NAME as Columna,
        DATA_TYPE as TipoDato,
        CHARACTER_MAXIMUM_LENGTH as Longitud,
        IS_NULLABLE as Nullable,
        COLUMN_DEFAULT as ValorPorDefecto
      FROM INFORMATION_SCHEMA.COLUMNS
      WHERE TABLE_NAME = 'imFacProfesionales'
      ORDER BY ORDINAL_POSITION`
    );
    outputData.estructuras.imFacProfesionales = estructuraProfesionales;

    // 7. Ejemplos de imFacProfesionales
    const ejemplosProfesionales = await ejecutarConsulta(
      pool,
      'EJEMPLOS: imFacProfesionales (primeros 5 registros)',
      `SELECT TOP 5 * FROM imFacProfesionales`
    );
    outputData.ejemplos.imFacProfesionales = ejemplosProfesionales;

    // 8. Columnas con IdProtocolo
    const columnasProtocolo = await ejecutarConsulta(
      pool,
      'COLUMNAS CON IdProtocolo',
      `SELECT 
        TABLE_NAME as Tabla,
        COLUMN_NAME as Columna,
        DATA_TYPE as TipoDato
      FROM INFORMATION_SCHEMA.COLUMNS
      WHERE COLUMN_NAME LIKE '%Protocolo%'
        AND TABLE_NAME IN ('imHCProtocolosPtes', 'imFACPracticas', 'imFacProfesionales')
      ORDER BY TABLE_NAME`
    );
    outputData.relaciones.columnasProtocolo = columnasProtocolo;

    // 9. Columnas con NumeroVisita
    const columnasVisita = await ejecutarConsulta(
      pool,
      'COLUMNAS CON NumeroVisita',
      `SELECT 
        TABLE_NAME as Tabla,
        COLUMN_NAME as Columna,
        DATA_TYPE as TipoDato
      FROM INFORMATION_SCHEMA.COLUMNS
      WHERE COLUMN_NAME LIKE '%NumeroVisita%'
        AND TABLE_NAME IN ('imHCProtocolosPtes', 'imFACPracticas')
      ORDER BY TABLE_NAME`
    );
    outputData.relaciones.columnasVisita = columnasVisita;

    // 10. Columnas con IdPaciente
    const columnasPaciente = await ejecutarConsulta(
      pool,
      'COLUMNAS CON IdPaciente',
      `SELECT 
        TABLE_NAME as Tabla,
        COLUMN_NAME as Columna,
        DATA_TYPE as TipoDato
      FROM INFORMATION_SCHEMA.COLUMNS
      WHERE COLUMN_NAME LIKE '%Paciente%'
        AND TABLE_NAME IN ('imHCProtocolosPtes', 'imFACPracticas')
      ORDER BY TABLE_NAME`
    );
    outputData.relaciones.columnasPaciente = columnasPaciente;

    // 11. Ejemplo de JOIN Protocolos -> Prácticas
    const joinProtocolosPracticas = await ejecutarConsulta(
      pool,
      'JOIN: Protocolos con Prácticas',
      `SELECT TOP 10
        p.IdProtocolo,
        p.NumeroVisita,
        p.IdPaciente,
        p.FechaProtocolo,
        p.NroProtocolo,
        pr.IdPractica,
        pr.Practica,
        pr.CantidadPractica,
        pr.FechaPractica
      FROM imHCProtocolosPtes p
      LEFT JOIN imFACPracticas pr ON p.IdProtocolo = pr.IdProtocolo
      WHERE p.NumeroVisita IS NOT NULL
      ORDER BY p.FechaProtocolo DESC`
    );
    outputData.ejemplos.joinProtocolosPracticas = joinProtocolosPracticas;

    // 12. Claves primarias
    const clavesPrimarias = await ejecutarConsulta(
      pool,
      'CLAVES PRIMARIAS',
      `SELECT 
        tc.TABLE_NAME as Tabla,
        kcu.COLUMN_NAME as ColumnaClavePrimaria
      FROM INFORMATION_SCHEMA.TABLE_CONSTRAINTS tc
      JOIN INFORMATION_SCHEMA.KEY_COLUMN_USAGE kcu 
        ON tc.CONSTRAINT_NAME = kcu.CONSTRAINT_NAME
      WHERE tc.CONSTRAINT_TYPE = 'PRIMARY KEY'
        AND tc.TABLE_NAME IN ('imHCProtocolosPtes', 'imFACPracticas', 'imFacProfesionales')
      ORDER BY tc.TABLE_NAME`
    );
    outputData.relaciones.clavesPrimarias = clavesPrimarias;

    // 13. Verificar protocolos por visita
    const protocolosPorVisita = await ejecutarConsulta(
      pool,
      'PROTOCOLOS POR VISITA (ejemplo)',
      `SELECT TOP 5
        NumeroVisita,
        COUNT(*) as CantidadProtocolos
      FROM imHCProtocolosPtes
      WHERE NumeroVisita IS NOT NULL
      GROUP BY NumeroVisita
      ORDER BY CantidadProtocolos DESC`
    );
    outputData.ejemplos.protocolosPorVisita = protocolosPorVisita;

    // Guardar resultados en archivo JSON
    const outputPath = path.join(__dirname, 'protocolos_structure_output.json');
    fs.writeFileSync(outputPath, JSON.stringify(outputData, null, 2), 'utf8');
    console.log(`\n✓ Resultados guardados en: ${outputPath}`);

    // Guardar resumen en archivo de texto
    const summaryPath = path.join(__dirname, 'protocolos_structure_summary.txt');
    let summary = `RESUMEN DE ESTRUCTURA DE PROTOCOLOS\n`;
    summary += `Generado: ${outputData.timestamp}\n`;
    summary += `${'='.repeat(60)}\n\n`;
    
    summary += `TABLAS ANALIZADAS:\n`;
    summary += `- imHCProtocolosPtes: ${estructuraProtocolos.length} columnas\n`;
    summary += `- imFACPracticas: ${estructuraPracticas.length} columnas\n`;
    summary += `- imFacProfesionales: ${estructuraProfesionales.length} columnas\n\n`;
    
    summary += `RELACIONES ENCONTRADAS:\n`;
    summary += `- Columnas con Protocolo: ${columnasProtocolo.length}\n`;
    summary += `- Columnas con NumeroVisita: ${columnasVisita.length}\n`;
    summary += `- Columnas con Paciente: ${columnasPaciente.length}\n\n`;
    
    summary += `EJEMPLOS DE DATOS:\n`;
    summary += `- Protocolos encontrados: ${ejemplosProtocolos.length}\n`;
    summary += `- Prácticas con protocolo: ${ejemplosPracticas.length}\n`;
    summary += `- Join Protocolos-Prácticas: ${joinProtocolosPracticas.length} registros\n`;
    
    fs.writeFileSync(summaryPath, summary, 'utf8');
    console.log(`✓ Resumen guardado en: ${summaryPath}`);

  } catch (error) {
    console.error('Error general:', error);
  } finally {
    if (pool) {
      await pool.close();
      console.log('\n✓ Conexión cerrada');
    }
  }
}

// Ejecutar script
main().catch(console.error);
