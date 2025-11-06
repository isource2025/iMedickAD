# iMedicAD - Sistema de Auditorías Médicas
## Documentación Técnica Completa - Parte 2: Servicios Backend y Rutas

---

## 5.5 Servicio de Pacientes (services/patients.service.js)

```javascript
const { getConnection, sql } = require('../config/db');
const { clarionToDate } = require('../utils/dateConverter');

class PatientsService {
  /**
   * Buscar pacientes por hospital
   */
  async buscarPacientes(hospitalAsignado, searchTerm = '', page = 1, limit = 30) {
    try {
      const pool = await getConnection();
      const offset = (page - 1) * limit;
      
      // Query de búsqueda
      let whereClause = '1=1';
      const params = [];
      
      if (searchTerm && searchTerm.length >= 3) {
        whereClause += ` AND (
          p.ApellidoyNombre LIKE @searchTerm
          OR p.NumeroDocumento LIKE @searchTerm
        )`;
        params.push({ name: 'searchTerm', type: sql.VarChar, value: `%${searchTerm}%` });
      }
      
      // Contar total
      const countRequest = pool.request();
      params.forEach(param => {
        countRequest.input(param.name, param.type, param.value);
      });
      
      const countResult = await countRequest.query(`
        SELECT COUNT(DISTINCT p.NumeroDocumento) as total
        FROM imPaciente p
        INNER JOIN imVisita v ON p.NumeroDocumento = v.NumeroDocumento
        WHERE v.Hospital = '${hospitalAsignado}' AND ${whereClause}
      `);
      
      const totalCount = countResult.recordset[0].total;
      
      // Obtener datos paginados
      const dataRequest = pool.request();
      params.forEach(param => {
        dataRequest.input(param.name, param.type, param.value);
      });
      
      const dataResult = await dataRequest.query(`
        SELECT DISTINCT
          p.NumeroDocumento,
          p.ApellidoyNombre,
          p.FechaNacimiento,
          p.Sexo,
          p.Telefono,
          p.Domicilio,
          p.Email,
          (SELECT COUNT(*) 
           FROM imVisita v2 
           WHERE v2.NumeroDocumento = p.NumeroDocumento 
           AND v2.Hospital = '${hospitalAsignado}') as TotalVisitas
        FROM imPaciente p
        INNER JOIN imVisita v ON p.NumeroDocumento = v.NumeroDocumento
        WHERE v.Hospital = '${hospitalAsignado}' AND ${whereClause}
        ORDER BY p.ApellidoyNombre
        OFFSET ${offset} ROWS
        FETCH NEXT ${limit} ROWS ONLY
      `);
      
      // Procesar datos
      const pacientes = dataResult.recordset.map(p => ({
        numeroDocumento: p.NumeroDocumento,
        apellidoNombre: p.ApellidoyNombre,
        fechaNacimiento: clarionToDate(p.FechaNacimiento),
        sexo: p.Sexo,
        telefono: p.Telefono,
        domicilio: p.Domicilio,
        email: p.Email,
        totalVisitas: p.TotalVisitas
      }));
      
      return {
        data: pacientes,
        pagination: {
          currentPage: page,
          totalPages: Math.ceil(totalCount / limit),
          totalCount,
          limit
        }
      };
    } catch (error) {
      console.error('Error al buscar pacientes:', error);
      throw error;
    }
  }
  
  /**
   * Obtener paciente por documento
   */
  async obtenerPacientePorDocumento(numeroDocumento, hospitalAsignado) {
    try {
      const pool = await getConnection();
      
      const result = await pool.request()
        .input('numeroDocumento', sql.VarChar, numeroDocumento)
        .query(`
          SELECT 
            p.NumeroDocumento,
            p.ApellidoyNombre,
            p.FechaNacimiento,
            p.Sexo,
            p.Telefono,
            p.Domicilio,
            p.Localidad,
            p.Email,
            (SELECT COUNT(*) 
             FROM imVisita v 
             WHERE v.NumeroDocumento = p.NumeroDocumento 
             AND v.Hospital = '${hospitalAsignado}') as TotalVisitas
          FROM imPaciente p
          WHERE p.NumeroDocumento = @numeroDocumento
        `);
      
      if (result.recordset.length === 0) {
        return null;
      }
      
      const p = result.recordset[0];
      
      return {
        numeroDocumento: p.NumeroDocumento,
        apellidoNombre: p.ApellidoyNombre,
        fechaNacimiento: clarionToDate(p.FechaNacimiento),
        sexo: p.Sexo,
        telefono: p.Telefono,
        domicilio: p.Domicilio,
        localidad: p.Localidad,
        email: p.Email,
        totalVisitas: p.TotalVisitas
      };
    } catch (error) {
      console.error('Error al obtener paciente:', error);
      throw error;
    }
  }
}

module.exports = new PatientsService();
```

### 5.6 Servicio de Visitas (services/visits.service.js)

```javascript
const { getConnection, sql } = require('../config/db');
const { clarionToDate, clarionToTime } = require('../utils/dateConverter');

class VisitsService {
  /**
   * Obtener visitas de un paciente por hospital
   */
  async obtenerVisitasPorPaciente(numeroDocumento, hospitalAsignado, page = 1, limit = 50) {
    try {
      const pool = await getConnection();
      const offset = (page - 1) * limit;
      
      // Contar total
      const countResult = await pool.request()
        .input('numeroDocumento', sql.VarChar, numeroDocumento)
        .input('hospital', sql.VarChar, hospitalAsignado)
        .query(`
          SELECT COUNT(*) as total
          FROM imVisita
          WHERE NumeroDocumento = @numeroDocumento
          AND Hospital = @hospital
        `);
      
      const totalCount = countResult.recordset[0].total;
      
      // Obtener datos
      const dataResult = await pool.request()
        .input('numeroDocumento', sql.VarChar, numeroDocumento)
        .input('hospital', sql.VarChar, hospitalAsignado)
        .query(`
          SELECT 
            v.NumeroVisita,
            v.NumeroDocumento,
            v.FechaAdmision,
            v.HoraAdmision,
            v.FechaEgreso,
            v.HoraEgreso,
            v.Hospital,
            v.Sector,
            v.ClasePaciente,
            v.TipoIngreso,
            v.Estado,
            v.Observaciones,
            d.Diagnostico,
            d.TipoDiagnostico
          FROM imVisita v
          LEFT JOIN imDiagnosticos d ON v.NumeroVisita = d.NumeroVisita
          WHERE v.NumeroDocumento = @numeroDocumento
          AND v.Hospital = @hospital
          ORDER BY v.FechaAdmision DESC, v.HoraAdmision DESC
          OFFSET ${offset} ROWS
          FETCH NEXT ${limit} ROWS ONLY
        `);
      
      // Procesar datos
      const visitas = dataResult.recordset.map(v => ({
        numeroVisita: v.NumeroVisita,
        numeroDocumento: v.NumeroDocumento,
        fechaAdmision: clarionToDate(v.FechaAdmision),
        horaAdmision: clarionToTime(v.HoraAdmision),
        fechaEgreso: clarionToDate(v.FechaEgreso),
        horaEgreso: clarionToTime(v.HoraEgreso),
        hospital: v.Hospital,
        sector: v.Sector,
        clasePaciente: v.ClasePaciente,
        tipoIngreso: v.TipoIngreso,
        estado: v.Estado,
        observaciones: v.Observaciones,
        diagnostico: v.Diagnostico,
        tipoDiagnostico: v.TipoDiagnostico
      }));
      
      return {
        data: visitas,
        pagination: {
          currentPage: page,
          totalPages: Math.ceil(totalCount / limit),
          totalCount,
          limit
        }
      };
    } catch (error) {
      console.error('Error al obtener visitas:', error);
      throw error;
    }
  }
  
  /**
   * Obtener detalle de una visita específica
   */
  async obtenerVisitaPorId(numeroVisita, hospitalAsignado) {
    try {
      const pool = await getConnection();
      
      const result = await pool.request()
        .input('numeroVisita', sql.VarChar, numeroVisita)
        .input('hospital', sql.VarChar, hospitalAsignado)
        .query(`
          SELECT 
            v.NumeroVisita,
            v.NumeroDocumento,
            v.FechaAdmision,
            v.HoraAdmision,
            v.FechaEgreso,
            v.HoraEgreso,
            v.Hospital,
            v.Sector,
            v.ClasePaciente,
            v.TipoIngreso,
            v.Estado,
            v.Observaciones,
            p.ApellidoyNombre,
            p.FechaNacimiento,
            p.Sexo,
            d.Diagnostico,
            d.TipoDiagnostico
          FROM imVisita v
          INNER JOIN imPaciente p ON v.NumeroDocumento = p.NumeroDocumento
          LEFT JOIN imDiagnosticos d ON v.NumeroVisita = d.NumeroVisita
          WHERE v.NumeroVisita = @numeroVisita
          AND v.Hospital = @hospital
        `);
      
      if (result.recordset.length === 0) {
        return null;
      }
      
      const v = result.recordset[0];
      
      return {
        numeroVisita: v.NumeroVisita,
        numeroDocumento: v.NumeroDocumento,
        paciente: {
          apellidoNombre: v.ApellidoyNombre,
          fechaNacimiento: clarionToDate(v.FechaNacimiento),
          sexo: v.Sexo
        },
        fechaAdmision: clarionToDate(v.FechaAdmision),
        horaAdmision: clarionToTime(v.HoraAdmision),
        fechaEgreso: clarionToDate(v.FechaEgreso),
        horaEgreso: clarionToTime(v.HoraEgreso),
        hospital: v.Hospital,
        sector: v.Sector,
        clasePaciente: v.ClasePaciente,
        tipoIngreso: v.TipoIngreso,
        estado: v.Estado,
        observaciones: v.Observaciones,
        diagnostico: v.Diagnostico,
        tipoDiagnostico: v.TipoDiagnostico
      };
    } catch (error) {
      console.error('Error al obtener visita:', error);
      throw error;
    }
  }
}

module.exports = new VisitsService();
```

### 5.7 Controlador de Pacientes (controllers/patients.controller.js)

```javascript
const patientsService = require('../services/patients.service');

class PatientsController {
  async buscarPacientes(req, res) {
    try {
      const { hospitalAsignado } = req.user;
      const { search = '', page = 1, limit = 30 } = req.query;
      
      const result = await patientsService.buscarPacientes(
        hospitalAsignado,
        search,
        parseInt(page),
        parseInt(limit)
      );
      
      res.json({
        success: true,
        data: result.data,
        pagination: result.pagination
      });
    } catch (error) {
      console.error('Error al buscar pacientes:', error);
      res.status(500).json({
        success: false,
        message: 'Error al buscar pacientes'
      });
    }
  }
  
  async obtenerPaciente(req, res) {
    try {
      const { numeroDocumento } = req.params;
      const { hospitalAsignado } = req.user;
      
      const paciente = await patientsService.obtenerPacientePorDocumento(
        numeroDocumento,
        hospitalAsignado
      );
      
      if (!paciente) {
        return res.status(404).json({
          success: false,
          message: 'Paciente no encontrado'
        });
      }
      
      res.json({
        success: true,
        data: paciente
      });
    } catch (error) {
      console.error('Error al obtener paciente:', error);
      res.status(500).json({
        success: false,
        message: 'Error al obtener paciente'
      });
    }
  }
}

module.exports = new PatientsController();
```

### 5.8 Controlador de Visitas (controllers/visits.controller.js)

```javascript
const visitsService = require('../services/visits.service');

class VisitsController {
  async obtenerVisitasPorPaciente(req, res) {
    try {
      const { numeroDocumento } = req.params;
      const { hospitalAsignado } = req.user;
      const { page = 1, limit = 50 } = req.query;
      
      const result = await visitsService.obtenerVisitasPorPaciente(
        numeroDocumento,
        hospitalAsignado,
        parseInt(page),
        parseInt(limit)
      );
      
      res.json({
        success: true,
        data: result.data,
        pagination: result.pagination
      });
    } catch (error) {
      console.error('Error al obtener visitas:', error);
      res.status(500).json({
        success: false,
        message: 'Error al obtener visitas'
      });
    }
  }
  
  async obtenerVisita(req, res) {
    try {
      const { numeroVisita } = req.params;
      const { hospitalAsignado } = req.user;
      
      const visita = await visitsService.obtenerVisitaPorId(
        numeroVisita,
        hospitalAsignado
      );
      
      if (!visita) {
        return res.status(404).json({
          success: false,
          message: 'Visita no encontrada'
        });
      }
      
      res.json({
        success: true,
        data: visita
      });
    } catch (error) {
      console.error('Error al obtener visita:', error);
      res.status(500).json({
        success: false,
        message: 'Error al obtener visita'
      });
    }
  }
}

module.exports = new VisitsController();
```

### 5.9 Rutas de Autenticación (routes/auth.routes.js)

```javascript
const express = require('express');
const router = express.Router();
const authController = require('../controllers/auth.controller');
const authMiddleware = require('../middleware/auth');

// POST /api/auth/login
router.post('/login', authController.login);

// GET /api/auth/verify (requiere autenticación)
router.get('/verify', authMiddleware, authController.verifyToken);

module.exports = router;
```

### 5.10 Rutas de Pacientes (routes/patients.routes.js)

```javascript
const express = require('express');
const router = express.Router();
const patientsController = require('../controllers/patients.controller');
const authMiddleware = require('../middleware/auth');

// Todas las rutas requieren autenticación
router.use(authMiddleware);

// GET /api/patients?search=&page=1&limit=30
router.get('/', patientsController.buscarPacientes);

// GET /api/patients/:numeroDocumento
router.get('/:numeroDocumento', patientsController.obtenerPaciente);

module.exports = router;
```

### 5.11 Rutas de Visitas (routes/visits.routes.js)

```javascript
const express = require('express');
const router = express.Router();
const visitsController = require('../controllers/visits.controller');
const authMiddleware = require('../middleware/auth');

// Todas las rutas requieren autenticación
router.use(authMiddleware);

// GET /api/visits/patient/:numeroDocumento?page=1&limit=50
router.get('/patient/:numeroDocumento', visitsController.obtenerVisitasPorPaciente);

// GET /api/visits/:numeroVisita
router.get('/:numeroVisita', visitsController.obtenerVisita);

module.exports = router;
```

### 5.12 Servidor Principal (server.js)

```javascript
const express = require('express');
const cors = require('cors');
require('dotenv').config();

const { getConnection, closeConnection } = require('./config/db');
const authRoutes = require('./routes/auth.routes');
const patientsRoutes = require('./routes/patients.routes');
const visitsRoutes = require('./routes/visits.routes');

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors({
  origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Logging middleware
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});

// Rutas
app.use('/api/auth', authRoutes);
app.use('/api/patients', patientsRoutes);
app.use('/api/visits', visitsRoutes);

// Ruta de health check
app.get('/api/health', (req, res) => {
  res.json({
    success: true,
    message: 'iMedicAD API funcionando correctamente',
    timestamp: new Date().toISOString()
  });
});

// Manejo de errores 404
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'Ruta no encontrada'
  });
});

// Manejo de errores global
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(500).json({
    success: false,
    message: 'Error interno del servidor'
  });
});

// Iniciar servidor
async function startServer() {
  try {
    // Verificar conexión a base de datos
    await getConnection();
    
    app.listen(PORT, () => {
      console.log(`
╔════════════════════════════════════════╗
║   iMedicAD Backend Server              ║
║   Puerto: ${PORT}                       ║
║   Entorno: ${process.env.NODE_ENV}     ║
║   Estado: ✅ Funcionando               ║
╚════════════════════════════════════════╝
      `);
    });
  } catch (error) {
    console.error('❌ Error al iniciar servidor:', error);
    process.exit(1);
  }
}

// Manejo de cierre graceful
process.on('SIGINT', async () => {
  console.log('\n🛑 Cerrando servidor...');
  await closeConnection();
  process.exit(0);
});

process.on('SIGTERM', async () => {
  console.log('\n🛑 Cerrando servidor...');
  await closeConnection();
  process.exit(0);
});

startServer();
```

---

## 6. Resumen de Endpoints API

### 6.1 Autenticación

| Método | Endpoint | Auth | Descripción |
|--------|----------|------|-------------|
| POST | `/api/auth/login` | No | Login de usuario |
| GET | `/api/auth/verify` | Sí | Verificar token |

**Ejemplo Login:**
```bash
POST http://localhost:3001/api/auth/login
Content-Type: application/json

{
  "usuario": "auditor1",
  "password": "admin123"
}

# Respuesta:
{
  "success": true,
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIs...",
    "user": {
      "idUsuario": 1,
      "usuario": "auditor1",
      "nombre": "Juan Pérez",
      "email": "juan.perez@hospital.com",
      "hospitalAsignado": "Hospital Central"
    }
  }
}
```

### 6.2 Pacientes

| Método | Endpoint | Auth | Descripción |
|--------|----------|------|-------------|
| GET | `/api/patients?search=&page=1&limit=30` | Sí | Buscar pacientes |
| GET | `/api/patients/:numeroDocumento` | Sí | Obtener paciente |

**Ejemplo Búsqueda:**
```bash
GET http://localhost:3001/api/patients?search=garcia&page=1&limit=30
Authorization: Bearer eyJhbGciOiJIUzI1NiIs...

# Respuesta:
{
  "success": true,
  "data": [
    {
      "numeroDocumento": "12345678",
      "apellidoNombre": "GARCIA, JUAN",
      "fechaNacimiento": "1980-05-15T00:00:00.000Z",
      "sexo": "M",
      "telefono": "1234567890",
      "domicilio": "Calle Falsa 123",
      "email": "juan@email.com",
      "totalVisitas": 5
    }
  ],
  "pagination": {
    "currentPage": 1,
    "totalPages": 1,
    "totalCount": 1,
    "limit": 30
  }
}
```

### 6.3 Visitas

| Método | Endpoint | Auth | Descripción |
|--------|----------|------|-------------|
| GET | `/api/visits/patient/:numeroDocumento?page=1&limit=50` | Sí | Visitas de paciente |
| GET | `/api/visits/:numeroVisita` | Sí | Detalle de visita |

**Ejemplo Visitas:**
```bash
GET http://localhost:3001/api/visits/patient/12345678?page=1&limit=50
Authorization: Bearer eyJhbGciOiJIUzI1NiIs...

# Respuesta:
{
  "success": true,
  "data": [
    {
      "numeroVisita": "V-2025-001",
      "numeroDocumento": "12345678",
      "fechaAdmision": "2025-01-15T00:00:00.000Z",
      "horaAdmision": "14:30:00",
      "fechaEgreso": "2025-01-20T00:00:00.000Z",
      "horaEgreso": "10:00:00",
      "hospital": "Hospital Central",
      "sector": "Clínica Médica",
      "clasePaciente": "Particular",
      "tipoIngreso": "Urgencia",
      "estado": "Egresado",
      "observaciones": "Evolución favorable",
      "diagnostico": "Neumonía",
      "tipoDiagnostico": "Principal"
    }
  ],
  "pagination": {
    "currentPage": 1,
    "totalPages": 1,
    "totalCount": 5,
    "limit": 50
  }
}
```

---

**Continúa en DOCS_iMedicAD_PARTE3.md**
