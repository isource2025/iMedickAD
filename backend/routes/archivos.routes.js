const express = require('express');
const router = express.Router();
const fs = require('fs').promises;
const path = require('path');

/**
 * Endpoint para descargar archivos desde el servidor de archivos
 * Convierte paths UNC (\\192.168.25.1\...) a paths accesibles
 */
router.get('/descargar', async (req, res) => {
  try {
    const { path: filePath } = req.query;
    
    if (!filePath) {
      return res.status(400).json({ error: 'Path del archivo es requerido' });
    }

    console.log('📄 Solicitud de descarga de archivo:', filePath);

    // Convertir path UNC a path local
    let localPath = filePath;
    
    // Si es un path UNC (\\servidor\...)
    if (filePath.startsWith('\\\\')) {
      // MODO TESTING LOCAL: Descomentar para testing sin acceso a la red
      // localPath = filePath
      //   .replace(/^\\\\server\\/i, 'C:\\SharedFiles\\')
      //   .replace(/^\\\\192\.168\.25\.1\\/i, 'C:\\SharedFiles\\')
      //   .replace(/^\\\\192\.168\.25\.158\\/i, 'C:\\SharedFiles\\');
      // console.log('📂 Path local (TESTING):', localPath);
      
      // MODO PRODUCCIÓN: Normalizar paths UNC
      localPath = filePath.replace(/^\\\\server\\/i, '\\\\192.168.25.1\\');
      localPath = localPath.replace(/^\\\\192\.168\.25\.158\\/i, '\\\\192.168.25.1\\');
      
      console.log('📂 Path UNC normalizado:', localPath);
    }

    console.log('📂 Path local resuelto:', localPath);

    // Verificar que el archivo existe
    try {
      await fs.access(localPath);
    } catch (error) {
      console.error('❌ Archivo no encontrado:', localPath);
      return res.status(404).json({ 
        error: 'Archivo no encontrado',
        path: filePath 
      });
    }

    // Obtener información del archivo
    const stats = await fs.stat(localPath);
    const fileName = path.basename(localPath);
    
    // Determinar el tipo MIME
    const ext = path.extname(fileName).toLowerCase();
    const mimeTypes = {
      '.pdf': 'application/pdf',
      '.jpg': 'image/jpeg',
      '.jpeg': 'image/jpeg',
      '.png': 'image/png',
      '.gif': 'image/gif',
      '.doc': 'application/msword',
      '.docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      '.xls': 'application/vnd.ms-excel',
      '.xlsx': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    };
    
    const contentType = mimeTypes[ext] || 'application/octet-stream';

    // Configurar headers para la descarga
    res.setHeader('Content-Type', contentType);
    res.setHeader('Content-Length', stats.size);
    res.setHeader('Content-Disposition', `inline; filename="${encodeURIComponent(fileName)}"`);
    res.setHeader('Cache-Control', 'public, max-age=3600'); // Cache por 1 hora

    // Leer y enviar el archivo
    const fileBuffer = await fs.readFile(localPath);
    res.send(fileBuffer);

    console.log('✅ Archivo enviado exitosamente:', fileName);

  } catch (error) {
    console.error('❌ Error al descargar archivo:', error);
    res.status(500).json({ 
      error: 'Error al descargar el archivo',
      message: error.message 
    });
  }
});

/**
 * Endpoint alternativo usando streaming para archivos grandes
 */
router.get('/stream', async (req, res) => {
  try {
    const { path: filePath } = req.query;
    
    if (!filePath) {
      return res.status(400).json({ error: 'Path del archivo es requerido' });
    }

    console.log('📺 Solicitud de streaming de archivo:', filePath);

    // Convertir path UNC a path local (mismo proceso que arriba)
    let localPath = filePath;
    if (filePath.startsWith('\\\\')) {
      // Normalizar "\\server" a la IP real si es necesario
      localPath = filePath.replace(/^\\\\server\\/i, '\\\\192.168.25.1\\');
      
      // También normalizar otras IPs comunes
      localPath = localPath.replace(/^\\\\192\.168\.25\.158\\/i, '\\\\192.168.25.1\\');
      
      console.log('📂 Path UNC normalizado:', localPath);
    }

    console.log('📂 Path local resuelto:', localPath);

    // Verificar que el archivo existe
    try {
      await fs.access(localPath);
    } catch (error) {
      console.error('❌ Archivo no encontrado:', localPath);
      return res.status(404).json({ 
        error: 'Archivo no encontrado',
        path: filePath 
      });
    }

    const stats = await fs.stat(localPath);
    const fileName = path.basename(localPath);
    const ext = path.extname(fileName).toLowerCase();
    
    const mimeTypes = {
      '.pdf': 'application/pdf',
      '.jpg': 'image/jpeg',
      '.jpeg': 'image/jpeg',
      '.png': 'image/png',
      '.gif': 'image/gif'
    };
    
    const contentType = mimeTypes[ext] || 'application/octet-stream';

    // Configurar headers
    res.setHeader('Content-Type', contentType);
    res.setHeader('Content-Length', stats.size);
    res.setHeader('Content-Disposition', `inline; filename="${encodeURIComponent(fileName)}"`);
    res.setHeader('Accept-Ranges', 'bytes');

    // Crear stream de lectura y pipe a la respuesta
    const readStream = require('fs').createReadStream(localPath);
    
    readStream.on('error', (error) => {
      console.error('❌ Error al leer archivo:', error);
      if (!res.headersSent) {
        res.status(500).json({ error: 'Error al leer el archivo' });
      }
    });

    readStream.pipe(res);

    console.log('✅ Streaming iniciado:', fileName);

  } catch (error) {
    console.error('❌ Error al hacer streaming del archivo:', error);
    if (!res.headersSent) {
      res.status(500).json({ 
        error: 'Error al hacer streaming del archivo',
        message: error.message 
      });
    }
  }
});

module.exports = router;
