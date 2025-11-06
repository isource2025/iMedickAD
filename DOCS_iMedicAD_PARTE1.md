# iMedicAD - Sistema de Auditorías Médicas
## Documentación Técnica Completa - Parte 1: Arquitectura y Backend

---

## 📋 Índice General

### Parte 1: Arquitectura y Backend
1. Visión General del Sistema
2. Arquitectura Técnica
3. Configuración del Proyecto
4. Backend - Base de Datos
5. Backend - API REST

### Parte 2: Frontend y Deployment
6. Frontend - React/Next.js
7. Autenticación y Seguridad
8. Testing y Deployment
9. Guía de Desarrollo

---

## 1. Visión General del Sistema

### 1.1 Propósito
**iMedicAD** es un sistema especializado para auditorías médicas que permite:
- Autenticación de usuarios auditores
- Búsqueda de pacientes por hospital específico
- Visualización de todos los ingresos/visitas de un paciente
- Análisis de datos de internación para auditoría

### 1.2 Diferencias con iMedicWs
| Aspecto | iMedicWs | iMedicAD |
|---------|----------|----------|
| **Propósito** | Gestión hospitalaria completa | Auditorías médicas |
| **Usuarios** | Personal médico/administrativo | Auditores médicos |
| **Alcance** | Multi-módulo (camas, turnos, etc.) | Enfocado en visitas/ingresos |
| **Acceso** | Por sector/rol hospitalario | Por hospital asignado |
| **Funcionalidad** | CRUD completo | Solo lectura/consulta |

---

## 2. Arquitectura Técnica

### 2.1 Stack Tecnológico

```
Frontend:
├── Next.js 14+ (App Router)
├── React 18+
├── TypeScript
├── CSS Modules
└── Fetch API

Backend:
├── Node.js 18+
├── Express.js
├── SQL Server (base existente)
└── JWT para autenticación

Base de Datos:
└── SQL Server (tablas existentes de iMedicWs)
```

### 2.2 Estructura de Directorios

```
iMedicAD/
├── backend/
│   ├── config/
│   │   └── db.js                    # Configuración SQL Server
│   ├── middleware/
│   │   ├── auth.js                  # Middleware JWT
│   │   └── errorHandler.js          # Manejo de errores
│   ├── routes/
│   │   ├── auth.routes.js           # Rutas de autenticación
│   │   ├── patients.routes.js       # Rutas de pacientes
│   │   └── visits.routes.js         # Rutas de visitas
│   ├── controllers/
│   │   ├── auth.controller.js       # Lógica de autenticación
│   │   ├── patients.controller.js   # Lógica de pacientes
│   │   └── visits.controller.js     # Lógica de visitas
│   ├── services/
│   │   ├── auth.service.js          # Servicios de autenticación
│   │   ├── patients.service.js      # Servicios de pacientes
│   │   └── visits.service.js        # Servicios de visitas
│   ├── utils/
│   │   ├── dateConverter.js         # Conversión fechas Clarion
│   │   └── validators.js            # Validaciones
│   └── server.js                    # Punto de entrada
├── frontend/
│   ├── src/
│   │   ├── app/
│   │   │   ├── login/
│   │   │   │   ├── page.tsx
│   │   │   │   └── styles.module.css
│   │   │   ├── dashboard/
│   │   │   │   ├── page.tsx
│   │   │   │   ├── styles.module.css
│   │   │   │   └── patients/
│   │   │   │       ├── page.tsx
│   │   │   │       └── [id]/
│   │   │   │           └── page.tsx
│   │   │   └── layout.tsx
│   │   ├── components/
│   │   │   ├── LoginForm/
│   │   │   ├── PatientSearch/
│   │   │   ├── VisitsTable/
│   │   │   └── Layout/
│   │   ├── services/
│   │   │   ├── authService.ts
│   │   │   ├── patientService.ts
│   │   │   └── visitService.ts
│   │   ├── hooks/
│   │   │   ├── useAuth.ts
│   │   │   ├── usePatients.ts
│   │   │   └── useVisits.ts
│   │   ├── types/
│   │   │   ├── auth.ts
│   │   │   ├── patient.ts
│   │   │   └── visit.ts
│   │   └── utils/
│   │       ├── dateFormatter.ts
│   │       └── validators.ts
│   └── public/
└── package.json
```

---

## 3. Configuración del Proyecto

### 3.1 Inicialización del Backend

```bash
# Crear directorio del proyecto
mkdir iMedicAD
cd iMedicAD

# Inicializar backend
mkdir backend
cd backend
npm init -y

# Instalar dependencias
npm install express cors dotenv mssql bcryptjs jsonwebtoken
npm install -D nodemon

# Crear estructura de carpetas
mkdir config middleware routes controllers services utils
```

### 3.2 Configuración package.json (Backend)

```json
{
  "name": "imedicad-backend",
  "version": "1.0.0",
  "description": "Backend para sistema de auditorías médicas",
  "main": "server.js",
  "scripts": {
    "start": "node server.js",
    "dev": "nodemon server.js"
  },
  "dependencies": {
    "express": "^4.18.2",
    "cors": "^2.8.5",
    "dotenv": "^16.3.1",
    "mssql": "^10.0.1",
    "bcryptjs": "^2.4.3",
    "jsonwebtoken": "^9.0.2"
  },
  "devDependencies": {
    "nodemon": "^3.0.1"
  }
}
```

### 3.3 Variables de Entorno (.env)

```env
# Servidor
PORT=3001
NODE_ENV=development

# Base de datos SQL Server
DB_SERVER=localhost
DB_PORT=1433
DB_DATABASE=iMedic
DB_USER=sa
DB_PASSWORD=tu_password_seguro
DB_ENCRYPT=false
DB_TRUST_SERVER_CERTIFICATE=true

# JWT
JWT_SECRET=tu_clave_secreta_muy_segura_aqui
JWT_EXPIRES_IN=8h

# CORS
CORS_ORIGIN=http://localhost:3000
```

---

## 4. Backend - Base de Datos

### 4.1 Tablas Utilizadas (Existentes en iMedicWs)

```sql
-- Tabla de pacientes
imPaciente (
    NumeroDocumento,
    ApellidoyNombre,
    FechaNacimiento,
    Sexo,
    Telefono,
    Domicilio,
    Localidad,
    Email
)

-- Tabla de visitas/ingresos
imVisita (
    NumeroVisita,
    NumeroDocumento,
    FechaAdmision,
    HoraAdmision,
    FechaEgreso,
    HoraEgreso,
    Hospital,
    Sector,
    ClasePaciente,
    TipoIngreso,
    Estado
)

-- Tabla de diagnósticos
imDiagnosticos (
    NumeroVisita,
    Diagnostico,
    TipoDiagnostico
)

-- Tabla de usuarios auditores (NUEVA)
imUsuariosAuditores (
    IdUsuario INT PRIMARY KEY IDENTITY,
    Usuario VARCHAR(50) UNIQUE,
    Password VARCHAR(255),
    Nombre VARCHAR(100),
    Email VARCHAR(100),
    HospitalAsignado VARCHAR(100),
    Activo BIT DEFAULT 1,
    FechaCreacion DATETIME DEFAULT GETDATE()
)
```

### 4.2 Script de Creación de Tabla de Usuarios

```sql
-- Crear tabla de usuarios auditores
CREATE TABLE imUsuariosAuditores (
    IdUsuario INT PRIMARY KEY IDENTITY(1,1),
    Usuario VARCHAR(50) NOT NULL UNIQUE,
    Password VARCHAR(255) NOT NULL,
    Nombre VARCHAR(100) NOT NULL,
    Email VARCHAR(100),
    HospitalAsignado VARCHAR(100) NOT NULL,
    Activo BIT DEFAULT 1,
    FechaCreacion DATETIME DEFAULT GETDATE(),
    UltimoAcceso DATETIME
);

-- Índices
CREATE INDEX IDX_Usuario ON imUsuariosAuditores(Usuario);
CREATE INDEX IDX_Hospital ON imUsuariosAuditores(HospitalAsignado);

-- Insertar usuario de prueba (password: "admin123")
INSERT INTO imUsuariosAuditores (Usuario, Password, Nombre, Email, HospitalAsignado)
VALUES (
    'auditor1',
    '$2a$10$xYzAbC123...', -- Hash bcrypt de "admin123"
    'Juan Pérez',
    'juan.perez@hospital.com',
    'Hospital Central'
);
```

### 4.3 Configuración de Conexión (config/db.js)

```javascript
const sql = require('mssql');
require('dotenv').config();

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
    connectionTimeout: 30000,
    requestTimeout: 30000
  },
  pool: {
    max: 10,
    min: 0,
    idleTimeoutMillis: 30000
  }
};

let pool = null;

async function getConnection() {
  try {
    if (!pool) {
      pool = await sql.connect(config);
      console.log('✅ Conexión a SQL Server establecida');
    }
    return pool;
  } catch (error) {
    console.error('❌ Error al conectar a SQL Server:', error);
    throw error;
  }
}

async function closeConnection() {
  try {
    if (pool) {
      await pool.close();
      pool = null;
      console.log('Conexión a SQL Server cerrada');
    }
  } catch (error) {
    console.error('Error al cerrar conexión:', error);
  }
}

module.exports = {
  sql,
  getConnection,
  closeConnection
};
```

---

## 5. Backend - API REST

### 5.1 Utilidades - Conversión de Fechas (utils/dateConverter.js)

```javascript
/**
 * Convierte fecha Clarion a JavaScript Date
 * Formato Clarion: días desde 28/12/1800
 */
function clarionToDate(clarionDate) {
  if (!clarionDate || clarionDate <= 0 || clarionDate > 2958465) {
    return null;
  }
  
  const baseDate = new Date('1800-12-28');
  const resultDate = new Date(baseDate);
  resultDate.setDate(baseDate.getDate() + clarionDate - 1);
  
  return resultDate;
}

/**
 * Convierte hora Clarion a formato HH:MM:SS
 * Formato Clarion: centésimas de segundo desde medianoche
 */
function clarionToTime(clarionTime) {
  if (!clarionTime || clarionTime < 0) {
    return '00:00:00';
  }
  
  const totalSeconds = Math.floor(clarionTime / 100);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  
  return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
}

/**
 * Formatea fecha para SQL Server
 */
function formatDateForSQL(date) {
  if (!date) return null;
  
  const d = new Date(date);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  
  return `${year}-${month}-${day}`;
}

module.exports = {
  clarionToDate,
  clarionToTime,
  formatDateForSQL
};
```

### 5.2 Middleware de Autenticación (middleware/auth.js)

```javascript
const jwt = require('jsonwebtoken');

function authMiddleware(req, res, next) {
  try {
    // Obtener token del header
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        message: 'Token no proporcionado'
      });
    }
    
    const token = authHeader.substring(7);
    
    // Verificar token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Agregar datos del usuario al request
    req.user = {
      idUsuario: decoded.idUsuario,
      usuario: decoded.usuario,
      nombre: decoded.nombre,
      hospitalAsignado: decoded.hospitalAsignado
    };
    
    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        message: 'Token expirado'
      });
    }
    
    return res.status(401).json({
      success: false,
      message: 'Token inválido'
    });
  }
}

module.exports = authMiddleware;
```

### 5.3 Servicio de Autenticación (services/auth.service.js)

```javascript
const { getConnection, sql } = require('../config/db');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

class AuthService {
  /**
   * Autenticar usuario
   */
  async login(usuario, password) {
    try {
      const pool = await getConnection();
      
      const result = await pool.request()
        .input('usuario', sql.VarChar, usuario)
        .query(`
          SELECT 
            IdUsuario,
            Usuario,
            Password,
            Nombre,
            Email,
            HospitalAsignado,
            Activo
          FROM imUsuariosAuditores
          WHERE Usuario = @usuario AND Activo = 1
        `);
      
      if (result.recordset.length === 0) {
        throw new Error('Usuario no encontrado o inactivo');
      }
      
      const user = result.recordset[0];
      
      // Verificar password
      const isValidPassword = await bcrypt.compare(password, user.Password);
      
      if (!isValidPassword) {
        throw new Error('Contraseña incorrecta');
      }
      
      // Actualizar último acceso
      await pool.request()
        .input('idUsuario', sql.Int, user.IdUsuario)
        .query(`
          UPDATE imUsuariosAuditores
          SET UltimoAcceso = GETDATE()
          WHERE IdUsuario = @idUsuario
        `);
      
      // Generar token JWT
      const token = jwt.sign(
        {
          idUsuario: user.IdUsuario,
          usuario: user.Usuario,
          nombre: user.Nombre,
          hospitalAsignado: user.HospitalAsignado
        },
        process.env.JWT_SECRET,
        { expiresIn: process.env.JWT_EXPIRES_IN || '8h' }
      );
      
      return {
        token,
        user: {
          idUsuario: user.IdUsuario,
          usuario: user.Usuario,
          nombre: user.Nombre,
          email: user.Email,
          hospitalAsignado: user.HospitalAsignado
        }
      };
    } catch (error) {
      console.error('Error en login:', error);
      throw error;
    }
  }
  
  /**
   * Verificar token
   */
  async verifyToken(token) {
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      return decoded;
    } catch (error) {
      throw new Error('Token inválido o expirado');
    }
  }
}

module.exports = new AuthService();
```

### 5.4 Controlador de Autenticación (controllers/auth.controller.js)

```javascript
const authService = require('../services/auth.service');

class AuthController {
  async login(req, res) {
    try {
      const { usuario, password } = req.body;
      
      if (!usuario || !password) {
        return res.status(400).json({
          success: false,
          message: 'Usuario y contraseña son requeridos'
        });
      }
      
      const result = await authService.login(usuario, password);
      
      res.json({
        success: true,
        data: result
      });
    } catch (error) {
      console.error('Error en login:', error);
      res.status(401).json({
        success: false,
        message: error.message || 'Error en autenticación'
      });
    }
  }
  
  async verifyToken(req, res) {
    try {
      // El middleware ya verificó el token
      res.json({
        success: true,
        data: req.user
      });
    } catch (error) {
      res.status(401).json({
        success: false,
        message: 'Token inválido'
      });
    }
  }
}

module.exports = new AuthController();
```

---

**Continúa en DOCS_iMedicAD_PARTE2.md**
