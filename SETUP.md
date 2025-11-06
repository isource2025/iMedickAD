# Guía de Instalación - iMedicAD

## Paso 1: Preparar Base de Datos

### 1.1 Crear Tabla de Usuarios Auditores

Abrir SQL Server Management Studio y ejecutar:

```bash
# Ubicación del script
backend/scripts/createTable.sql
```

O ejecutar directamente:

```sql
USE iMedic;
GO

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

CREATE INDEX IDX_Usuario ON imUsuariosAuditores(Usuario);
CREATE INDEX IDX_Hospital ON imUsuariosAuditores(HospitalAsignado);
```

### 1.2 Crear Usuario de Prueba

**Generar hash de contraseña:**

```bash
cd backend
npm install
node scripts/createUser.js admin123
```

Copiar el hash generado y ejecutar en SQL Server:

```sql
INSERT INTO imUsuariosAuditores (Usuario, Password, Nombre, Email, HospitalAsignado)
VALUES (
    'auditor1',
    'HASH_COPIADO_AQUI',
    'Juan Pérez',
    'juan.perez@hospital.com',
    'Hospital Central'
);
```

## Paso 2: Configurar Backend

### 2.1 Instalar Dependencias

```bash
cd backend
npm install
```

### 2.2 Configurar Variables de Entorno

```bash
# Copiar archivo de ejemplo
copy .env.example .env
```

Editar `.env` con tus datos:

```env
PORT=3001
NODE_ENV=development

# Base de datos SQL Server
DB_SERVER=localhost
DB_PORT=1433
DB_DATABASE=iMedic
DB_USER=sa
DB_PASSWORD=TU_PASSWORD_AQUI
DB_ENCRYPT=false
DB_TRUST_SERVER_CERTIFICATE=true

# JWT
JWT_SECRET=clave_secreta_muy_segura_cambiar_en_produccion
JWT_EXPIRES_IN=8h

# CORS
CORS_ORIGIN=http://localhost:3000
```

### 2.3 Probar Conexión

```bash
npm run dev
```

Deberías ver:
```
✅ Conexión a SQL Server establecida
╔════════════════════════════════════════╗
║   iMedicAD Backend Server              ║
║   Puerto: 3001                         ║
║   Entorno: development                 ║
║   Estado: ✅ Funcionando               ║
╚════════════════════════════════════════╝
```

## Paso 3: Configurar Frontend

### 3.1 Instalar Dependencias

```bash
cd frontend
npm install
```

### 3.2 Configurar Variables de Entorno

```bash
# Copiar archivo de ejemplo
copy .env.local.example .env.local
```

Editar `.env.local`:

```env
NEXT_PUBLIC_API_URL=http://localhost:3001/api
```

### 3.3 Iniciar Aplicación

```bash
npm run dev
```

Acceder a: http://localhost:3000

## Paso 4: Verificar Instalación

### 4.1 Test de Backend

Abrir navegador o Postman:

```
GET http://localhost:3001/api/health
```

Respuesta esperada:
```json
{
  "success": true,
  "message": "iMedicAD API funcionando correctamente",
  "timestamp": "2025-11-06T..."
}
```

### 4.2 Test de Login

```
POST http://localhost:3001/api/auth/login
Content-Type: application/json

{
  "usuario": "auditor1",
  "password": "admin123"
}
```

Respuesta esperada:
```json
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

### 4.3 Test de Frontend

1. Abrir http://localhost:3000
2. Debería redirigir a /login
3. Ingresar credenciales:
   - Usuario: `auditor1`
   - Contraseña: `admin123`
4. Debería redirigir a /dashboard
5. Buscar pacientes (mínimo 3 caracteres)

## Paso 5: Configuración de Producción

### 5.1 Backend

```bash
cd backend

# Actualizar .env
NODE_ENV=production
PORT=3001

# Iniciar
npm start
```

### 5.2 Frontend

```bash
cd frontend

# Build
npm run build

# Iniciar
npm start
```

## Problemas Comunes

### Error: Cannot connect to SQL Server

**Solución:**
1. Verificar que SQL Server esté corriendo
2. Verificar credenciales en `.env`
3. Habilitar TCP/IP en SQL Server Configuration Manager
4. Verificar firewall

### Error: Token inválido

**Solución:**
1. Verificar JWT_SECRET en `.env`
2. Limpiar localStorage del navegador (F12 > Application > Local Storage > Clear)
3. Hacer login nuevamente

### Error: No se encuentran pacientes

**Solución:**
1. Verificar que el hospital asignado al usuario coincida con datos en BD
2. Ejecutar query de prueba:
```sql
SELECT DISTINCT v.Hospital 
FROM imVisita v
```
3. Actualizar HospitalAsignado del usuario con un hospital existente

### Puerto 3000 o 3001 en uso

**Solución:**
```bash
# Windows
netstat -ano | findstr :3000
taskkill /PID <PID> /F

# Cambiar puerto en .env (backend) o package.json (frontend)
```

## Siguiente Paso

Consultar `README.md` para uso general y `DOCS_iMedicAD_PARTE*.md` para documentación técnica completa.
