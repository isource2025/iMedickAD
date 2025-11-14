const fs = require('fs').promises;
const { exec } = require('child_process');
const util = require('util');
const execPromise = util.promisify(exec);

async function verificarAccesoRed() {
  console.log('🔍 VERIFICANDO ACCESO A LA RED DE ARCHIVOS');
  console.log('='.repeat(80));
  
  // 1. Verificar conectividad con ping
  console.log('\n1️⃣ Verificando conectividad con 192.168.25.1...');
  try {
    const { stdout } = await execPromise('ping -n 2 192.168.25.1');
    console.log('✅ Ping exitoso');
    console.log(stdout.split('\n').slice(2, 5).join('\n'));
  } catch (error) {
    console.log('❌ No se puede hacer ping a 192.168.25.1');
    console.log('   El servidor no tiene conectividad con la red de archivos');
  }
  
  // 2. Verificar acceso al share
  console.log('\n2️⃣ Verificando acceso al share \\\\192.168.25.1\\Imagenes...');
  try {
    const { stdout } = await execPromise('dir \\\\192.168.25.1\\Imagenes');
    console.log('✅ Share accesible');
    console.log('   Primeras carpetas:');
    const lines = stdout.split('\n').filter(l => l.includes('<DIR>')).slice(0, 5);
    lines.forEach(l => console.log('   ' + l.trim()));
  } catch (error) {
    console.log('❌ No se puede acceder al share \\\\192.168.25.1\\Imagenes');
    console.log('   Error:', error.message);
    console.log('\n💡 Posibles soluciones:');
    console.log('   1. Mapear el share a un drive:');
    console.log('      net use Z: \\\\192.168.25.1\\Imagenes /user:USUARIO PASSWORD');
    console.log('   2. Verificar credenciales de red');
    console.log('   3. Verificar firewall');
  }
  
  // 3. Verificar archivo específico
  console.log('\n3️⃣ Verificando archivo específico...');
  const testPath = '\\\\192.168.25.1\\Imagenes\\Vidal\\379267 SCHERMAN JUAN PABLO\\54463 SHERMAN.pdf';
  console.log(`   Path: ${testPath}`);
  
  try {
    await fs.access(testPath);
    const stats = await fs.stat(testPath);
    console.log('✅ Archivo encontrado');
    console.log(`   Tamaño: ${(stats.size / 1024).toFixed(2)} KB`);
    console.log(`   Modificado: ${stats.mtime}`);
  } catch (error) {
    console.log('❌ Archivo no encontrado');
    console.log('   Error:', error.code);
    
    // Intentar con el path alternativo usando "server"
    const testPath2 = '\\\\server\\Imagenes\\Vidal\\379267 SCHERMAN JUAN PABLO\\54463 SHERMAN.pdf';
    console.log(`\n   Intentando con: ${testPath2}`);
    try {
      await fs.access(testPath2);
      const stats = await fs.stat(testPath2);
      console.log('✅ Archivo encontrado con alias "server"');
      console.log(`   Tamaño: ${(stats.size / 1024).toFixed(2)} KB`);
      console.log('\n💡 Solución: El servidor usa "\\\\server" en lugar de "\\\\192.168.25.1"');
      console.log('   No es necesario cambiar nada, la normalización ya está configurada');
    } catch (error2) {
      console.log('❌ Tampoco funciona con "\\\\server"');
    }
  }
  
  // 4. Verificar shares disponibles
  console.log('\n4️⃣ Verificando shares disponibles en 192.168.25.1...');
  try {
    const { stdout } = await execPromise('net view \\\\192.168.25.1');
    console.log('✅ Shares disponibles:');
    console.log(stdout);
  } catch (error) {
    console.log('❌ No se pueden listar los shares');
    console.log('   Esto indica un problema de permisos o conectividad');
  }
  
  console.log('\n' + '='.repeat(80));
  console.log('✅ Verificación completada\n');
}

verificarAccesoRed();
