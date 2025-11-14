const axios = require('axios');
const fs = require('fs');
const path = require('path');

// Configuración
const API_URL = 'http://localhost:5000';
const VISITA_EJEMPLO = 379267;

async function testearSistemaArchivos() {
  console.log('🧪 TESTEANDO SISTEMA DE ARCHIVOS');
  console.log('='.repeat(100));
  
  try {
    // 1. Obtener detalles de la visita
    console.log(`\n1️⃣ Obteniendo detalles de la visita #${VISITA_EJEMPLO}...`);
    const visitaResponse = await axios.get(`${API_URL}/api/visits/${VISITA_EJEMPLO}`);
    const visita = visitaResponse.data;
    
    console.log(`✅ Visita obtenida: ${visita.paciente.nombre}`);
    console.log(`   Estudios encontrados: ${visita.estudios.length}`);
    
    // 2. Buscar estudios con adjuntos
    const estudiosConAdjuntos = visita.estudios.filter(e => e.adjuntos && e.adjuntos.length > 0);
    console.log(`   Estudios con adjuntos: ${estudiosConAdjuntos.length}`);
    
    if (estudiosConAdjuntos.length === 0) {
      console.log('❌ No hay estudios con adjuntos en esta visita');
      return;
    }
    
    // 3. Mostrar adjuntos encontrados
    console.log('\n2️⃣ Adjuntos encontrados:');
    console.log('='.repeat(100));
    
    let totalAdjuntos = 0;
    estudiosConAdjuntos.forEach((estudio, idx) => {
      console.log(`\n   Estudio ${idx + 1}:`);
      console.log(`   - Pedido: ${estudio.pedidoEstudio || 'Sin descripción'}`);
      console.log(`   - Adjuntos: ${estudio.adjuntos.length}`);
      
      estudio.adjuntos.forEach((adj, adjIdx) => {
        totalAdjuntos++;
        console.log(`\n      ${adjIdx + 1}. ${adj.nombreArchivo || 'Sin nombre'}`);
        console.log(`         Path: ${adj.pathServidor}`);
        console.log(`         ID: ${adj.id}`);
      });
    });
    
    console.log(`\n   Total de adjuntos: ${totalAdjuntos}`);
    
    // 4. Probar descarga del primer archivo
    if (totalAdjuntos > 0) {
      const primerAdjunto = estudiosConAdjuntos[0].adjuntos[0];
      
      console.log('\n3️⃣ Probando descarga del primer archivo...');
      console.log('='.repeat(100));
      console.log(`   Archivo: ${primerAdjunto.nombreArchivo || 'Sin nombre'}`);
      console.log(`   Path: ${primerAdjunto.pathServidor}`);
      
      const downloadUrl = `${API_URL}/api/archivos/descargar?path=${encodeURIComponent(primerAdjunto.pathServidor)}`;
      console.log(`   URL: ${downloadUrl}`);
      
      try {
        const downloadResponse = await axios.get(downloadUrl, {
          responseType: 'arraybuffer',
          timeout: 30000 // 30 segundos
        });
        
        console.log(`\n✅ Descarga exitosa!`);
        console.log(`   Tamaño: ${(downloadResponse.data.length / 1024).toFixed(2)} KB`);
        console.log(`   Content-Type: ${downloadResponse.headers['content-type']}`);
        
        // Guardar archivo de prueba
        const testFilePath = path.join(__dirname, 'test_download.pdf');
        fs.writeFileSync(testFilePath, downloadResponse.data);
        console.log(`   Archivo guardado en: ${testFilePath}`);
        
      } catch (downloadError) {
        console.error(`\n❌ Error al descargar archivo:`);
        if (downloadError.response) {
          console.error(`   Status: ${downloadError.response.status}`);
          console.error(`   Error: ${downloadError.response.data.error || downloadError.response.statusText}`);
        } else {
          console.error(`   ${downloadError.message}`);
        }
      }
    }
    
    // 5. Generar URLs para testing manual
    console.log('\n4️⃣ URLs para testing manual en el navegador:');
    console.log('='.repeat(100));
    console.log(`\n   Frontend (ver visita completa):`);
    console.log(`   http://localhost:3000/dashboard/visits/${VISITA_EJEMPLO}`);
    
    if (totalAdjuntos > 0) {
      const primerAdjunto = estudiosConAdjuntos[0].adjuntos[0];
      console.log(`\n   Descargar primer archivo:`);
      console.log(`   ${API_URL}/api/archivos/descargar?path=${encodeURIComponent(primerAdjunto.pathServidor)}`);
      
      console.log(`\n   Streaming del primer archivo:`);
      console.log(`   ${API_URL}/api/archivos/stream?path=${encodeURIComponent(primerAdjunto.pathServidor)}`);
    }
    
    console.log('\n' + '='.repeat(100));
    console.log('✅ Test completado\n');
    
  } catch (error) {
    console.error('\n❌ Error durante el test:');
    if (error.response) {
      console.error(`   Status: ${error.response.status}`);
      console.error(`   Error: ${error.response.data.message || error.response.statusText}`);
    } else {
      console.error(`   ${error.message}`);
    }
    console.log('\n💡 Asegúrate de que:');
    console.log('   1. El backend esté corriendo en el puerto 5000');
    console.log('   2. La visita #379267 exista en la base de datos');
    console.log('   3. El servidor tenga acceso a la red donde están los archivos');
  }
}

// Ejecutar test
testearSistemaArchivos();
