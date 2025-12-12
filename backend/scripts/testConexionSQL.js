/**
 * Script de diagnóstico para probar conexión a SQL Server
 * Ayuda a identificar problemas de conectividad
 */

const sql = require('mssql');
require('dotenv').config();

console.log('═══════════════════════════════════════════════════════');
console.log('🔍 DIAGNÓSTICO DE CONEXIÓN SQL SERVER');
console.log('═══════════════════════════════════════════════════════\n');

// Mostrar configuración (sin password)
console.log('📋 Configuración actual:');
console.log('   Server:', process.env.DB_SERVER);
console.log('   Port:', process.env.DB_PORT || '1433');
console.log('   Database:', process.env.DB_DATABASE);
console.log('   User:', process.env.DB_USER);
console.log('   Password:', process.env.DB_PASSWORD ? '***' + process.env.DB_PASSWORD.slice(-3) : 'NO CONFIGURADO');
console.log('   Encrypt:', process.env.DB_ENCRYPT);
console.log('   Trust Certificate:', process.env.DB_TRUST_SERVER_CERTIFICATE);
console.log('');

// Configuración con timeout más largo para diagnóstico
const config = {
  server: process.env.DB_SERVER,
  port: parseInt(process.env.DB_PORT || '1433'),
  database: process.env.DB_DATABASE,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  options: {
    encrypt: process.env.DB_ENCRYPT === 'true',
    trustServerCertificate: process.env.DB_TRUST_SERVER_CERTIFICATE === 'true',
    enableArithAbort: true,
    connectionTimeout: 60000, // 60 segundos para diagnóstico
    requestTimeout: 60000
  },
  pool: {
    max: 1,
    min: 0,
    idleTimeoutMillis: 30000
  }
};

async function testConnection() {
  console.log('🔌 Intentando conectar a SQL Server...');
  console.log('   (Timeout: 60 segundos)\n');
  
  const startTime = Date.now();
  
  try {
    const pool = await sql.connect(config);
    const elapsed = ((Date.now() - startTime) / 1000).toFixed(2);
    
    console.log(`✅ CONEXIÓN EXITOSA (${elapsed}s)`);
    console.log('');
    
    // Probar una consulta simple
    console.log('🔍 Probando consulta simple...');
    const result = await pool.request().query('SELECT @@VERSION as Version, DB_NAME() as Database');
    
    console.log('✅ CONSULTA EXITOSA');
    console.log('');
    console.log('📊 Información del servidor:');
    console.log('   Database:', result.recordset[0].Database);
    console.log('   Version:', result.recordset[0].Version.split('\n')[0]);
    console.log('');
    
    // Probar acceso a tablas
    console.log('🔍 Verificando acceso a tablas...');
    const tables = await pool.request().query(`
      SELECT TOP 5 TABLE_NAME 
      FROM INFORMATION_SCHEMA.TABLES 
      WHERE TABLE_TYPE = 'BASE TABLE'
      ORDER BY TABLE_NAME
    `);
    
    console.log('✅ ACCESO A TABLAS EXITOSO');
    console.log('   Primeras 5 tablas:');
    tables.recordset.forEach(t => console.log('   -', t.TABLE_NAME));
    console.log('');
    
    await pool.close();
    
    console.log('═══════════════════════════════════════════════════════');
    console.log('✅ DIAGNÓSTICO COMPLETADO - TODO FUNCIONA CORRECTAMENTE');
    console.log('═══════════════════════════════════════════════════════');
    
  } catch (error) {
    const elapsed = ((Date.now() - startTime) / 1000).toFixed(2);
    
    console.log(`❌ ERROR DE CONEXIÓN (${elapsed}s)`);
    console.log('');
    console.log('═══════════════════════════════════════════════════════');
    console.log('❌ DIAGNÓSTICO - PROBLEMAS DETECTADOS');
    console.log('═══════════════════════════════════════════════════════');
    console.log('');
    console.log('Error:', error.message);
    console.log('Código:', error.code);
    console.log('');
    
    // Diagnóstico según el tipo de error
    if (error.code === 'ETIMEOUT') {
      console.log('🔍 POSIBLES CAUSAS:');
      console.log('');
      console.log('1. ❌ Firewall bloqueando el puerto 1433');
      console.log('   Solución: Verificar firewall de Windows y del servidor');
      console.log('');
      console.log('2. ❌ SQL Server no está escuchando en el puerto 1433');
      console.log('   Solución: Verificar SQL Server Configuration Manager');
      console.log('');
      console.log('3. ❌ Problema de red/VPN');
      console.log('   Solución: Verificar conectividad de red');
      console.log('');
      console.log('4. ❌ IP o puerto incorrectos');
      console.log('   Solución: Verificar configuración del servidor');
      console.log('');
      console.log('📝 PASOS RECOMENDADOS:');
      console.log('');
      console.log('1. Verificar que puedes hacer ping al servidor:');
      console.log(`   ping ${process.env.DB_SERVER}`);
      console.log('');
      console.log('2. Verificar que el puerto 1433 está abierto:');
      console.log(`   Test-NetConnection -ComputerName ${process.env.DB_SERVER} -Port 1433`);
      console.log('');
      console.log('3. Verificar SQL Server Configuration Manager:');
      console.log('   - TCP/IP debe estar habilitado');
      console.log('   - Puerto debe ser 1433');
      console.log('   - SQL Server Browser debe estar corriendo');
      console.log('');
      console.log('4. Verificar firewall:');
      console.log('   - Permitir puerto 1433 TCP entrante y saliente');
      console.log('   - Permitir programa sqlservr.exe');
      console.log('');
    } else if (error.code === 'ELOGIN') {
      console.log('🔍 PROBLEMA DE AUTENTICACIÓN:');
      console.log('');
      console.log('❌ Usuario o contraseña incorrectos');
      console.log('   Verificar credenciales en el archivo .env');
      console.log('');
    } else if (error.code === 'ENOTFOUND') {
      console.log('🔍 PROBLEMA DE DNS/RED:');
      console.log('');
      console.log('❌ No se puede resolver el nombre del servidor');
      console.log('   Verificar que la IP/hostname es correcta');
      console.log('');
    }
    
    console.log('═══════════════════════════════════════════════════════');
    
    process.exit(1);
  }
}

// Ejecutar test
testConnection();
