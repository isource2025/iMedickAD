# 🎯 Plan: Acceso Dinámico a Archivos Remotos

## 📋 Requisitos

- ✅ Backend corre LOCAL
- ✅ BD está en servidor REMOTO (181.4.72.60)
- ❌ Archivos en red interna (\\192.168.25.1) NO accesible desde local
- ⚠️ NO podemos instalar proxy HTTP en cada servidor
- ⚠️ Debe ser dinámico para múltiples bases de datos

## 🔍 Soluciones Viables

### Opción 1: SMB sobre SSH Tunnel (RECOMENDADO) ⭐

**Concepto**: Crear túnel SSH para acceder al share SMB a través del servidor

```
Tu PC → SSH Tunnel (181.4.72.60) → SMB (192.168.25.1)
```

**Ventajas**:
- ✅ No requiere instalar nada en el servidor (solo SSH)
- ✅ Dinámico: funciona con cualquier servidor que tenga SSH
- ✅ Seguro: todo va por SSH
- ✅ Transparente: el backend ve el share como local

**Implementación**:

1. **Configurar túnel SSH** (una sola vez por sesión):
   ```bash
   # Túnel para SMB (puerto 445)
   ssh -L 445:192.168.25.1:445 usuario@181.4.72.60 -N
   ```

2. **Acceder al share vía localhost**:
   ```
   \\localhost\Imagenes → (túnel SSH) → \\192.168.25.1\Imagenes
   ```

3. **Backend usa localhost**:
   ```javascript
   localPath = filePath.replace(/^\\\\[\d\.]+\\/, '\\\\localhost\\');
   ```

**Configuración dinámica por servidor**:
```javascript
// .env
DB_SERVER=181.4.72.60
SSH_HOST=181.4.72.60
SSH_USER=usuario
FILE_SERVER_IP=192.168.25.1

// Backend detecta automáticamente y usa localhost
```

---

### Opción 2: VPN al Servidor (Más Simple)

**Concepto**: Conectar VPN al servidor para acceder a su red interna

```
Tu PC → VPN (181.4.72.60) → Red Interna → 192.168.25.1
```

**Ventajas**:
- ✅ Muy simple de configurar
- ✅ No requiere código especial
- ✅ Funciona con cualquier servidor que tenga VPN

**Desventajas**:
- ⚠️ Requiere que el servidor tenga VPN configurada
- ⚠️ Debes conectarte manualmente cada vez

**Implementación**:
1. Conectar VPN a 181.4.72.60
2. Backend usa paths normales (\\192.168.25.1\\...)
3. Funciona transparentemente

---

### Opción 3: Mapeo de Red con Credenciales SSH

**Concepto**: Usar SSHFS para montar el share remoto localmente

```
Tu PC (Z:) → SSHFS → 181.4.72.60 → \\192.168.25.1\Imagenes
```

**Ventajas**:
- ✅ El share aparece como drive local (Z:)
- ✅ Transparente para el backend
- ✅ Funciona con cualquier servidor SSH

**Desventajas**:
- ⚠️ Requiere instalar WinFsp + SSHFS-Win en tu PC

**Implementación**:
1. Instalar WinFsp y SSHFS-Win
2. Montar: `sshfs usuario@181.4.72.60:/mnt/shares/imagenes Z:`
3. Backend usa: `Z:\Vidal\...`

---

### Opción 4: SQL Server OPENROWSET (Creativo pero limitado)

**Concepto**: Usar SQL Server para leer archivos y devolverlos como BLOB

```sql
SELECT BulkColumn 
FROM OPENROWSET(BULK '\\192.168.25.1\Imagenes\...', SINGLE_BLOB) as archivo
```

**Ventajas**:
- ✅ No requiere acceso directo al share
- ✅ SQL Server SÍ tiene acceso a la red interna

**Desventajas**:
- ⚠️ Requiere permisos especiales en SQL Server
- ⚠️ No es eficiente para archivos grandes
- ⚠️ Requiere configurar xp_cmdshell o OPENROWSET

---

## 🎯 Solución Recomendada: SSH Tunnel Automático

### Arquitectura Final

```
┌─────────────────┐
│   Tu PC Local   │
│                 │
│  Backend Node   │
│  Puerto: 5000   │
└────────┬────────┘
         │
         ├─ SQL ──────────────────────┐
         │                            │
         └─ SSH Tunnel ────────┐      │
                               ↓      ↓
                    ┌──────────────────────┐
                    │  181.4.72.60         │
                    │  (Servidor Remoto)   │
                    │                      │
                    │  - SQL Server :1433  │
                    │  - SSH :22           │
                    └──────────┬───────────┘
                               │
                               │ Red Interna
                               ↓
                    ┌──────────────────────┐
                    │  192.168.25.1        │
                    │  (Servidor Archivos) │
                    │                      │
                    │  SMB Share: Imagenes │
                    └──────────────────────┘
```

### Implementación Paso a Paso

#### 1. Configuración del Túnel SSH (Automático)

**Crear script de túnel**: `backend/utils/sshTunnel.js`

```javascript
const { spawn } = require('child_process');
const net = require('net');

class SSHTunnel {
  constructor(config) {
    this.config = config;
    this.process = null;
    this.isConnected = false;
  }

  async start() {
    if (this.isConnected) return;

    console.log('🔐 Iniciando túnel SSH...');
    
    // ssh -L 445:192.168.25.1:445 usuario@181.4.72.60 -N
    this.process = spawn('ssh', [
      '-L', `445:${this.config.fileServerIp}:445`,
      `${this.config.sshUser}@${this.config.sshHost}`,
      '-N', // No ejecutar comando remoto
      '-o', 'StrictHostKeyChecking=no',
      '-o', 'ServerAliveInterval=60'
    ]);

    this.process.on('error', (err) => {
      console.error('❌ Error en túnel SSH:', err);
    });

    // Esperar a que el túnel esté listo
    await this.waitForConnection();
    this.isConnected = true;
    console.log('✅ Túnel SSH establecido');
  }

  async waitForConnection(timeout = 10000) {
    const start = Date.now();
    while (Date.now() - start < timeout) {
      if (await this.testConnection()) {
        return true;
      }
      await new Promise(resolve => setTimeout(resolve, 500));
    }
    throw new Error('Timeout esperando túnel SSH');
  }

  async testConnection() {
    return new Promise((resolve) => {
      const socket = net.connect(445, 'localhost', () => {
        socket.end();
        resolve(true);
      });
      socket.on('error', () => resolve(false));
    });
  }

  stop() {
    if (this.process) {
      this.process.kill();
      this.isConnected = false;
      console.log('🔒 Túnel SSH cerrado');
    }
  }
}

module.exports = SSHTunnel;
```

#### 2. Configuración Dinámica por Servidor

**Actualizar `.env`**:

```env
# Base de Datos
DB_SERVER=181.4.72.60
DB_PORT=1433
DB_DATABASE=isource
DB_USER=sa
DB_PASSWORD=isource

# SSH Tunnel para archivos
SSH_ENABLED=true
SSH_HOST=181.4.72.60
SSH_USER=usuario
SSH_KEY_PATH=~/.ssh/id_rsa
FILE_SERVER_IP=192.168.25.1

# Modo de acceso a archivos
# - "direct": Acceso directo (producción en el servidor)
# - "tunnel": Via SSH tunnel (desarrollo local)
# - "local": Testing local (C:\SharedFiles)
FILE_ACCESS_MODE=tunnel
```

#### 3. Lógica Dinámica en Backend

**Actualizar `archivos.routes.js`**:

```javascript
const SSHTunnel = require('../utils/sshTunnel');

// Inicializar túnel si es necesario
let sshTunnel = null;
if (process.env.FILE_ACCESS_MODE === 'tunnel' && process.env.SSH_ENABLED === 'true') {
  sshTunnel = new SSHTunnel({
    sshHost: process.env.SSH_HOST,
    sshUser: process.env.SSH_USER,
    fileServerIp: process.env.FILE_SERVER_IP
  });
}

// Función para resolver path según modo
function resolveFilePath(uncPath) {
  const mode = process.env.FILE_ACCESS_MODE || 'direct';
  
  switch (mode) {
    case 'tunnel':
      // Via SSH tunnel: usar localhost
      return uncPath.replace(/^\\\\[\d\.]+\\/, '\\\\localhost\\');
    
    case 'local':
      // Testing local
      return uncPath
        .replace(/^\\\\server\\/i, 'C:\\SharedFiles\\')
        .replace(/^\\\\[\d\.]+\\/, 'C:\\SharedFiles\\');
    
    case 'direct':
    default:
      // Acceso directo (producción)
      return uncPath.replace(/^\\\\server\\/i, `\\\\${process.env.FILE_SERVER_IP}\\`);
  }
}

// En el endpoint de descarga
router.get('/descargar', async (req, res) => {
  try {
    // Asegurar que el túnel esté activo
    if (sshTunnel && !sshTunnel.isConnected) {
      await sshTunnel.start();
    }
    
    const { path: filePath } = req.query;
    const localPath = resolveFilePath(filePath);
    
    console.log('📂 Path original:', filePath);
    console.log('📂 Path resuelto:', localPath);
    console.log('🔧 Modo:', process.env.FILE_ACCESS_MODE);
    
    // ... resto del código
  } catch (error) {
    // ...
  }
});
```

#### 4. Inicialización en Server.js

```javascript
// Al iniciar el servidor
async function startServer() {
  try {
    // Conectar a BD
    await connectDB();
    
    // Iniciar túnel SSH si es necesario
    if (process.env.FILE_ACCESS_MODE === 'tunnel') {
      const SSHTunnel = require('./utils/sshTunnel');
      global.sshTunnel = new SSHTunnel({
        sshHost: process.env.SSH_HOST,
        sshUser: process.env.SSH_USER,
        fileServerIp: process.env.FILE_SERVER_IP
      });
      await global.sshTunnel.start();
    }
    
    // Iniciar servidor HTTP
    app.listen(PORT, () => {
      console.log(`✅ Servidor corriendo en puerto ${PORT}`);
      console.log(`🔧 Modo de archivos: ${process.env.FILE_ACCESS_MODE}`);
    });
  } catch (error) {
    console.error('❌ Error al iniciar servidor:', error);
  }
}

// Cleanup al cerrar
process.on('SIGINT', () => {
  if (global.sshTunnel) {
    global.sshTunnel.stop();
  }
  process.exit();
});
```

---

## 📊 Comparación de Soluciones

| Solución | Complejidad | Requiere en Servidor | Dinámico | Seguro |
|----------|-------------|---------------------|----------|--------|
| SSH Tunnel | Media | Solo SSH | ✅ | ✅ |
| VPN | Baja | VPN Server | ✅ | ✅ |
| SSHFS | Media | SSH | ✅ | ✅ |
| SQL OPENROWSET | Alta | Permisos SQL | ❌ | ⚠️ |

## 🎯 Decisión Final

**Recomiendo: SSH Tunnel Automático**

**Razones**:
1. ✅ No requiere instalar nada en servidores remotos (solo SSH que ya existe)
2. ✅ Completamente dinámico: funciona con cualquier servidor
3. ✅ Configuración por .env: cambias servidor y funciona
4. ✅ Seguro: todo va cifrado por SSH
5. ✅ Transparente: el backend no sabe que hay un túnel

**Configuraciones por Entorno**:

```env
# Desarrollo Local
FILE_ACCESS_MODE=tunnel
SSH_ENABLED=true

# Producción (Backend en 181.4.72.60)
FILE_ACCESS_MODE=direct
SSH_ENABLED=false

# Testing
FILE_ACCESS_MODE=local
SSH_ENABLED=false
```

## 🚀 Implementación Inmediata

¿Quieres que implemente la solución de SSH Tunnel automático?

Necesitaré:
1. Usuario SSH para 181.4.72.60
2. Confirmar que tienes SSH habilitado en el servidor
3. Confirmar que el servidor puede acceder a \\192.168.25.1
