/**
 * Script para obtener la estructura de las tablas de control de internación
 * Tablas: imInterCtrlMedicamento, imInterCtrlFrecuente, imInterCtrlEvolucion, imInterTipoControles
 * 
 * Uso: node scripts/getInterCtrlTableStructures.js
 */

const { getConnection, closeConnection } = require('../config/db');
const fs = require('fs');
const path = require('path');

// Tablas a analizar
const TABLES = [
  'imInterCtrlMedicamento',
  'imInterCtrlFrecuente',
  'imInterCtrlEvolucion',
  'imInterTipoControles'
];

/**
 * Obtiene la estructura de una tabla
 */
async function getTableStructure(pool, tableName) {
  try {
    const query = `
      SELECT 
        COLUMN_NAME as columnName,
        DATA_TYPE as dataType,
        CHARACTER_MAXIMUM_LENGTH as maxLength,
        NUMERIC_PRECISION as numericPrecision,
        NUMERIC_SCALE as numericScale,
        IS_NULLABLE as isNullable,
        COLUMN_DEFAULT as defaultValue,
        ORDINAL_POSITION as position
      FROM INFORMATION_SCHEMA.COLUMNS
      WHERE TABLE_NAME = @tableName
      ORDER BY ORDINAL_POSITION;
    `;

    const result = await pool.request()
      .input('tableName', tableName)
      .query(query);

    return result.recordset;
  } catch (error) {
    console.error(`❌ Error obteniendo estructura de ${tableName}:`, error.message);
    return [];
  }
}

/**
 * Obtiene las claves primarias de una tabla
 */
async function getPrimaryKeys(pool, tableName) {
  try {
    const query = `
      SELECT 
        COLUMN_NAME as columnName
      FROM INFORMATION_SCHEMA.KEY_COLUMN_USAGE
      WHERE OBJECTPROPERTY(OBJECT_ID(CONSTRAINT_SCHEMA + '.' + CONSTRAINT_NAME), 'IsPrimaryKey') = 1
        AND TABLE_NAME = @tableName
      ORDER BY ORDINAL_POSITION;
    `;

    const result = await pool.request()
      .input('tableName', tableName)
      .query(query);

    return result.recordset.map(row => row.columnName);
  } catch (error) {
    console.error(`❌ Error obteniendo claves primarias de ${tableName}:`, error.message);
    return [];
  }
}

/**
 * Obtiene las claves foráneas de una tabla
 */
async function getForeignKeys(pool, tableName) {
  try {
    const query = `
      SELECT 
        COL_NAME(fc.parent_object_id, fc.parent_column_id) AS columnName,
        OBJECT_NAME(f.referenced_object_id) AS referencedTable,
        COL_NAME(fc.referenced_object_id, fc.referenced_column_id) AS referencedColumn
      FROM sys.foreign_keys AS f
      INNER JOIN sys.foreign_key_columns AS fc 
        ON f.object_id = fc.constraint_object_id
      WHERE OBJECT_NAME(f.parent_object_id) = @tableName;
    `;

    const result = await pool.request()
      .input('tableName', tableName)
      .query(query);

    return result.recordset;
  } catch (error) {
    console.error(`❌ Error obteniendo claves foráneas de ${tableName}:`, error.message);
    return [];
  }
}

/**
 * Obtiene ejemplos de datos de una tabla
 */
async function getSampleData(pool, tableName) {
  try {
    const query = `SELECT TOP 3 * FROM ${tableName}`;
    const result = await pool.request().query(query);
    return result.recordset;
  } catch (error) {
    console.error(`❌ Error obteniendo datos de ejemplo de ${tableName}:`, error.message);
    return [];
  }
}

/**
 * Obtiene el conteo de registros de una tabla
 */
async function getRecordCount(pool, tableName) {
  try {
    const query = `SELECT COUNT(*) as total FROM ${tableName}`;
    const result = await pool.request().query(query);
    return result.recordset[0].total;
  } catch (error) {
    console.error(`❌ Error obteniendo conteo de ${tableName}:`, error.message);
    return 0;
  }
}

/**
 * Convierte el tipo de dato SQL a tipo TypeScript/JavaScript
 */
function sqlToJsType(sqlType, maxLength) {
  const typeMap = {
    'int': 'number',
    'bigint': 'number',
    'smallint': 'number',
    'tinyint': 'number',
    'decimal': 'number',
    'numeric': 'number',
    'float': 'number',
    'real': 'number',
    'money': 'number',
    'smallmoney': 'number',
    'bit': 'boolean',
    'varchar': 'string',
    'nvarchar': 'string',
    'char': 'string',
    'nchar': 'string',
    'text': 'string',
    'ntext': 'string',
    'datetime': 'Date',
    'datetime2': 'Date',
    'smalldatetime': 'Date',
    'date': 'Date',
    'time': 'Date',
    'timestamp': 'Date',
    'uniqueidentifier': 'string',
    'binary': 'Buffer',
    'varbinary': 'Buffer',
    'image': 'Buffer'
  };

  return typeMap[sqlType.toLowerCase()] || 'any';
}

/**
 * Genera una interfaz TypeScript para una tabla
 */
function generateTypeScriptInterface(tableName, columns, primaryKeys) {
  let interfaceDef = `export interface ${tableName} {\n`;
  
  columns.forEach(col => {
    const jsType = sqlToJsType(col.dataType, col.maxLength);
    const optional = col.isNullable === 'YES' ? '?' : '';
    const isPK = primaryKeys.includes(col.columnName) ? ' // PRIMARY KEY' : '';
    
    interfaceDef += `  ${col.columnName}${optional}: ${jsType};${isPK}\n`;
  });
  
  interfaceDef += '}\n';
  return interfaceDef;
}

/**
 * Función principal
 */
async function main() {
  let pool;
  
  try {
    console.log('🔄 Conectando a la base de datos...\n');
    pool = await getConnection();

    const allStructures = {};
    const typeScriptInterfaces = [];

    // Procesar cada tabla
    for (const tableName of TABLES) {
      console.log(`\n${'='.repeat(60)}`);
      console.log(`📊 Tabla: ${tableName}`);
      console.log('='.repeat(60));

      // Obtener estructura
      const columns = await getTableStructure(pool, tableName);
      const primaryKeys = await getPrimaryKeys(pool, tableName);
      const foreignKeys = await getForeignKeys(pool, tableName);
      const recordCount = await getRecordCount(pool, tableName);
      const sampleData = await getSampleData(pool, tableName);

      // Mostrar información en consola
      console.log(`\n📈 Total de registros: ${recordCount}`);
      console.log(`\n🔑 Claves primarias: ${primaryKeys.length > 0 ? primaryKeys.join(', ') : 'Ninguna'}`);
      
      if (foreignKeys.length > 0) {
        console.log('\n🔗 Claves foráneas:');
        foreignKeys.forEach(fk => {
          console.log(`   - ${fk.columnName} -> ${fk.referencedTable}.${fk.referencedColumn}`);
        });
      }

      console.log('\n📋 Columnas:');
      columns.forEach(col => {
        const typeInfo = col.maxLength 
          ? `${col.dataType}(${col.maxLength})`
          : col.numericPrecision 
            ? `${col.dataType}(${col.numericPrecision},${col.numericScale || 0})`
            : col.dataType;
        
        const nullable = col.isNullable === 'YES' ? 'NULL' : 'NOT NULL';
        const pk = primaryKeys.includes(col.columnName) ? ' [PK]' : '';
        const jsType = sqlToJsType(col.dataType, col.maxLength);
        
        console.log(`   ${col.position}. ${col.columnName.padEnd(30)} ${typeInfo.padEnd(20)} ${nullable.padEnd(10)} -> ${jsType}${pk}`);
      });

      // Guardar estructura
      allStructures[tableName] = {
        tableName,
        recordCount,
        columns: columns.map(col => ({
          name: col.columnName,
          sqlType: col.dataType,
          jsType: sqlToJsType(col.dataType, col.maxLength),
          maxLength: col.maxLength,
          numericPrecision: col.numericPrecision,
          numericScale: col.numericScale,
          isNullable: col.isNullable === 'YES',
          defaultValue: col.defaultValue,
          position: col.position
        })),
        primaryKeys,
        foreignKeys,
        sampleData: sampleData.slice(0, 2) // Solo 2 ejemplos para el JSON
      };

      // Generar interfaz TypeScript
      typeScriptInterfaces.push(generateTypeScriptInterface(tableName, columns, primaryKeys));
    }

    // Guardar resultados en archivos
    const outputDir = path.join(__dirname);
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, -5);

    // 1. Guardar JSON con toda la información
    const jsonFile = path.join(outputDir, `interCtrl_structures_${timestamp}.json`);
    fs.writeFileSync(jsonFile, JSON.stringify(allStructures, null, 2), 'utf8');
    console.log(`\n\n✅ Estructura JSON guardada en: ${jsonFile}`);

    // 2. Guardar interfaces TypeScript
    const tsFile = path.join(outputDir, `interCtrl_interfaces_${timestamp}.ts`);
    const tsContent = `/**
 * Interfaces TypeScript generadas automáticamente
 * Fecha: ${new Date().toLocaleString()}
 * Tablas: ${TABLES.join(', ')}
 */

${typeScriptInterfaces.join('\n')}`;
    fs.writeFileSync(tsFile, tsContent, 'utf8');
    console.log(`✅ Interfaces TypeScript guardadas en: ${tsFile}`);

    // 3. Guardar resumen en texto plano
    const txtFile = path.join(outputDir, `interCtrl_summary_${timestamp}.txt`);
    let txtContent = `RESUMEN DE ESTRUCTURAS DE TABLAS\n`;
    txtContent += `Fecha: ${new Date().toLocaleString()}\n`;
    txtContent += `${'='.repeat(80)}\n\n`;

    TABLES.forEach(tableName => {
      const structure = allStructures[tableName];
      txtContent += `TABLA: ${tableName}\n`;
      txtContent += `-`.repeat(80) + '\n';
      txtContent += `Total de registros: ${structure.recordCount}\n`;
      txtContent += `Claves primarias: ${structure.primaryKeys.join(', ') || 'Ninguna'}\n\n`;
      
      txtContent += `COLUMNAS:\n`;
      structure.columns.forEach(col => {
        txtContent += `  - ${col.name} (${col.sqlType}) -> ${col.jsType}`;
        if (col.isNullable) txtContent += ' [NULLABLE]';
        if (structure.primaryKeys.includes(col.name)) txtContent += ' [PK]';
        txtContent += '\n';
      });
      
      if (structure.foreignKeys.length > 0) {
        txtContent += `\nCLAVES FORÁNEAS:\n`;
        structure.foreignKeys.forEach(fk => {
          txtContent += `  - ${fk.columnName} -> ${fk.referencedTable}.${fk.referencedColumn}\n`;
        });
      }
      
      txtContent += '\n\n';
    });

    fs.writeFileSync(txtFile, txtContent, 'utf8');
    console.log(`✅ Resumen de texto guardado en: ${txtFile}`);

    console.log('\n✨ Proceso completado exitosamente\n');

  } catch (error) {
    console.error('\n❌ Error en el proceso:', error);
    process.exit(1);
  } finally {
    if (pool) {
      await closeConnection();
    }
  }
}

// Ejecutar script
if (require.main === module) {
  main();
}

module.exports = { getTableStructure, getPrimaryKeys, getForeignKeys };
