/**
 * Script para verificar qué tablas de protocolos existen
 * y mostrar alternativas si no están disponibles
 */

const { getConnection, closeConnection } = require('../config/db');

console.log('\n╔════════════════════════════════════════════════════════════╗');
console.log('║  🔍 Verificar Tablas de Protocolos                        ║');
console.log('╚════════════════════════════════════════════════════════════╝\n');

async function verificarTablas() {
  let pool = null;

  try {
    console.log('📡 Conectando a la base de datos...');
    pool = await getConnection();
    console.log('✅ Conexión establecida\n');

    // Listar todas las tablas que contienen "protocolo" en el nombre
    console.log('═══════════════════════════════════════════════════════════');
    console.log('1️⃣  BUSCANDO TABLAS CON "PROTOCOLO" EN EL NOMBRE');
    console.log('═══════════════════════════════════════════════════════════\n');

    const tablasProtocolo = await pool.request().query(`
      SELECT TABLE_NAME
      FROM INFORMATION_SCHEMA.TABLES
      WHERE TABLE_NAME LIKE '%protocolo%'
      ORDER BY TABLE_NAME
    `);

    if (tablasProtocolo.recordset.length > 0) {
      console.log('✅ Tablas encontradas:\n');
      tablasProtocolo.recordset.forEach((t, idx) => {
        console.log(`   ${idx + 1}. ${t.TABLE_NAME}`);
      });
      console.log('');
    } else {
      console.log('❌ No se encontraron tablas con "protocolo" en el nombre\n');
    }

    // Buscar tablas relacionadas con prácticas
    console.log('═══════════════════════════════════════════════════════════');
    console.log('2️⃣  BUSCANDO TABLAS CON "PRACTICA" O "FAC" EN EL NOMBRE');
    console.log('═══════════════════════════════════════════════════════════\n');

    const tablasPracticas = await pool.request().query(`
      SELECT TABLE_NAME
      FROM INFORMATION_SCHEMA.TABLES
      WHERE TABLE_NAME LIKE '%practica%' OR TABLE_NAME LIKE '%fac%'
      ORDER BY TABLE_NAME
    `);

    if (tablasPracticas.recordset.length > 0) {
      console.log('✅ Tablas encontradas:\n');
      tablasPracticas.recordset.forEach((t, idx) => {
        console.log(`   ${idx + 1}. ${t.TABLE_NAME}`);
      });
      console.log('');
    } else {
      console.log('❌ No se encontraron tablas relacionadas\n');
    }

    // Buscar tablas con "im" al inicio (patrón del sistema)
    console.log('═══════════════════════════════════════════════════════════');
    console.log('3️⃣  TODAS LAS TABLAS DEL SISTEMA (im*)');
    console.log('═══════════════════════════════════════════════════════════\n');

    const tablasIM = await pool.request().query(`
      SELECT TABLE_NAME
      FROM INFORMATION_SCHEMA.TABLES
      WHERE TABLE_NAME LIKE 'im%'
      ORDER BY TABLE_NAME
    `);

    console.log(`📊 Total de tablas "im*": ${tablasIM.recordset.length}\n`);
    console.log('Primeras 20 tablas:\n');
    tablasIM.recordset.slice(0, 20).forEach((t, idx) => {
      console.log(`   ${(idx + 1).toString().padStart(2)}. ${t.TABLE_NAME}`);
    });
    
    if (tablasIM.recordset.length > 20) {
      console.log(`   ... y ${tablasIM.recordset.length - 20} más\n`);
    }

    // Verificar tablas específicas que necesitamos
    console.log('\n═══════════════════════════════════════════════════════════');
    console.log('4️⃣  VERIFICAR TABLAS NECESARIAS PARA PROTOCOLOS');
    console.log('═══════════════════════════════════════════════════════════\n');

    const tablasNecesarias = [
      'imHCProtocolosPtes',
      'imFACPracticas',
      'imFacPracticas',
      'imFacProfesionales',
      'imProtocolosResultados',
      'imPedidosEstudios'
    ];

    for (const tabla of tablasNecesarias) {
      const existe = await pool.request().query(`
        SELECT COUNT(*) as existe
        FROM INFORMATION_SCHEMA.TABLES
        WHERE TABLE_NAME = '${tabla}'
      `);

      const status = existe.recordset[0].existe > 0 ? '✅' : '❌';
      console.log(`${status} ${tabla}`);
    }

    // Buscar columnas IdProtocolo en todas las tablas
    console.log('\n═══════════════════════════════════════════════════════════');
    console.log('5️⃣  TABLAS CON COLUMNA "IdProtocolo"');
    console.log('═══════════════════════════════════════════════════════════\n');

    const columnasProtocolo = await pool.request().query(`
      SELECT 
        TABLE_NAME,
        COLUMN_NAME,
        DATA_TYPE
      FROM INFORMATION_SCHEMA.COLUMNS
      WHERE COLUMN_NAME LIKE '%Protocolo%'
      ORDER BY TABLE_NAME
    `);

    if (columnasProtocolo.recordset.length > 0) {
      console.log('✅ Columnas encontradas:\n');
      columnasProtocolo.recordset.forEach((c) => {
        console.log(`   📋 ${c.TABLE_NAME}.${c.COLUMN_NAME} (${c.DATA_TYPE})`);
      });
      console.log('');
    } else {
      console.log('❌ No se encontraron columnas con "Protocolo"\n');
    }

    // Resumen y recomendaciones
    console.log('═══════════════════════════════════════════════════════════');
    console.log('6️⃣  RESUMEN Y RECOMENDACIONES');
    console.log('═══════════════════════════════════════════════════════════\n');

    const tieneProtocolosPtes = tablasProtocolo.recordset.some(t => 
      t.TABLE_NAME.toLowerCase().includes('protocolosptes') || 
      t.TABLE_NAME.toLowerCase().includes('hcprotocolo')
    );

    const tienePracticas = tablasPracticas.recordset.some(t => 
      t.TABLE_NAME.toLowerCase().includes('practica')
    );

    if (!tieneProtocolosPtes) {
      console.log('❌ PROBLEMA: No existe tabla de protocolos de pacientes\n');
      console.log('📝 OPCIONES:\n');
      console.log('1. La base de datos local no tiene esta funcionalidad');
      console.log('   → Necesitas conectarte a la base de datos de producción\n');
      
      console.log('2. La tabla tiene otro nombre');
      console.log('   → Revisa la lista de tablas arriba para encontrar alternativas\n');
      
      console.log('3. Crear tabla de prueba (solo para desarrollo)');
      console.log('   → Ejecutar script de creación de tablas\n');
    } else {
      console.log('✅ Tabla de protocolos encontrada\n');
    }

    if (!tienePracticas) {
      console.log('⚠️  ADVERTENCIA: No se encontró tabla de prácticas\n');
    } else {
      console.log('✅ Tabla de prácticas encontrada\n');
    }

    // Mostrar configuración actual
    console.log('═══════════════════════════════════════════════════════════');
    console.log('7️⃣  CONFIGURACIÓN ACTUAL DE BASE DE DATOS');
    console.log('═══════════════════════════════════════════════════════════\n');

    console.log(`📡 Servidor: ${process.env.DB_SERVER}`);
    console.log(`💾 Base de datos: ${process.env.DB_DATABASE}`);
    console.log(`👤 Usuario: ${process.env.DB_USER}\n`);

    console.log('💡 TIP: Si necesitas protocolos, considera:');
    console.log('   - Conectarte a la BD de producción (201.235.17.254)');
    console.log('   - Usar VPN si es necesario');
    console.log('   - Verificar que tienes los permisos correctos\n');

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
verificarTablas()
  .then(() => {
    console.log('═══════════════════════════════════════════════════════════');
    console.log('✅ VERIFICACIÓN COMPLETADA');
    console.log('═══════════════════════════════════════════════════════════\n');
    process.exit(0);
  })
  .catch(error => {
    console.error('❌ Error fatal:', error);
    process.exit(1);
  });
