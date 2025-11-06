# iMedicAD - Sistema de Auditorías Médicas
## Documentación Técnica Completa - Parte 5: Páginas, Deployment y Guía de Desarrollo

---

## 12. Páginas Next.js

### 12.1 Página de Login (app/login/page.tsx)

```typescript
import LoginForm from '@/components/LoginForm';

export const metadata = {
  title: 'Login - iMedicAD',
  description: 'Sistema de Auditorías Médicas',
};

export default function LoginPage() {
  return <LoginForm />;
}
```

### 12.2 Layout Principal (app/layout.tsx)

```typescript
import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'iMedicAD',
  description: 'Sistema de Auditorías Médicas',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es">
      <body>{children}</body>
    </html>
  );
}
```

### 12.3 Estilos Globales (app/globals.css)

```css
* {
  box-sizing: border-box;
  padding: 0;
  margin: 0;
}

html,
body {
  max-width: 100vw;
  overflow-x: hidden;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
}

body {
  color: #333;
  background: #f5f5f5;
}

a {
  color: inherit;
  text-decoration: none;
}
```

### 12.4 Página del Dashboard (app/dashboard/page.tsx)

```typescript
'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import PatientSearch from '@/components/PatientSearch';
import styles from './styles.module.css';

export default function DashboardPage() {
  const { user, isAuthenticated, isLoading, logout } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/login');
    }
  }, [isAuthenticated, isLoading, router]);

  if (isLoading) {
    return (
      <div className={styles.loading}>
        <div className={styles.spinner}></div>
        <p>Cargando...</p>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className={styles.dashboard}>
      <header className={styles.header}>
        <div className={styles.headerContent}>
          <div>
            <h1>iMedicAD</h1>
            <p className={styles.subtitle}>Sistema de Auditorías Médicas</p>
          </div>
          <div className={styles.userInfo}>
            <div className={styles.userDetails}>
              <p className={styles.userName}>{user?.nombre}</p>
              <p className={styles.userHospital}>{user?.hospitalAsignado}</p>
            </div>
            <button onClick={logout} className={styles.logoutButton}>
              Cerrar Sesión
            </button>
          </div>
        </div>
      </header>

      <main className={styles.main}>
        <PatientSearch />
      </main>
    </div>
  );
}
```

### 12.5 Estilos del Dashboard (app/dashboard/styles.module.css)

```css
.dashboard {
  min-height: 100vh;
  background: #f5f5f5;
}

.header {
  background: linear-gradient(135deg, #00B5E2 0%, #0083A9 100%);
  color: white;
  padding: 24px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.headerContent {
  max-width: 1400px;
  margin: 0 auto;
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 20px;
}

.headerContent h1 {
  font-size: 28px;
  font-weight: 700;
  margin: 0 0 4px 0;
}

.subtitle {
  font-size: 14px;
  opacity: 0.9;
  margin: 0;
}

.userInfo {
  display: flex;
  align-items: center;
  gap: 20px;
}

.userDetails {
  text-align: right;
}

.userName {
  font-size: 16px;
  font-weight: 600;
  margin: 0 0 4px 0;
}

.userHospital {
  font-size: 13px;
  opacity: 0.9;
  margin: 0;
}

.logoutButton {
  padding: 10px 20px;
  background: rgba(255, 255, 255, 0.2);
  color: white;
  border: 2px solid white;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}

.logoutButton:hover {
  background: white;
  color: #0083A9;
}

.main {
  max-width: 1400px;
  margin: 0 auto;
  padding: 24px;
}

.loading {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
  color: #666;
}

.spinner {
  width: 40px;
  height: 40px;
  border: 4px solid #f0f0f0;
  border-top-color: #00B5E2;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
  margin-bottom: 16px;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

@media (max-width: 768px) {
  .headerContent {
    flex-direction: column;
    align-items: flex-start;
  }

  .userInfo {
    width: 100%;
    justify-content: space-between;
  }

  .userDetails {
    text-align: left;
  }
}
```

### 12.6 Página de Detalle de Paciente (app/dashboard/patients/[id]/page.tsx)

```typescript
'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import VisitsTable from '@/components/VisitsTable';
import patientService from '@/services/patientService';
import { Patient } from '@/types/patient';
import styles from './styles.module.css';

export default function PatientDetailPage({ params }: { params: { id: string } }) {
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const router = useRouter();
  const [patient, setPatient] = useState<Patient | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push('/login');
    }
  }, [isAuthenticated, authLoading, router]);

  useEffect(() => {
    const fetchPatient = async () => {
      try {
        setIsLoading(true);
        const data = await patientService.obtenerPaciente(params.id);
        setPatient(data);
      } catch (err: any) {
        setError(err.message || 'Error al cargar paciente');
      } finally {
        setIsLoading(false);
      }
    };

    if (isAuthenticated) {
      fetchPatient();
    }
  }, [params.id, isAuthenticated]);

  if (authLoading || isLoading) {
    return (
      <div className={styles.loading}>
        <div className={styles.spinner}></div>
        <p>Cargando...</p>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  if (error) {
    return (
      <div className={styles.error}>
        <p>{error}</p>
        <button onClick={() => router.back()} className={styles.backButton}>
          Volver
        </button>
      </div>
    );
  }

  if (!patient) {
    return (
      <div className={styles.error}>
        <p>Paciente no encontrado</p>
        <button onClick={() => router.back()} className={styles.backButton}>
          Volver
        </button>
      </div>
    );
  }

  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return '-';
    const date = new Date(dateStr);
    return date.toLocaleDateString('es-AR');
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <button onClick={() => router.back()} className={styles.backButton}>
          ← Volver
        </button>
      </div>

      <div className={styles.patientCard}>
        <h1>{patient.apellidoNombre}</h1>
        <div className={styles.patientGrid}>
          <div className={styles.infoItem}>
            <span className={styles.label}>DNI:</span>
            <span className={styles.value}>{patient.numeroDocumento}</span>
          </div>
          <div className={styles.infoItem}>
            <span className={styles.label}>Fecha Nacimiento:</span>
            <span className={styles.value}>{formatDate(patient.fechaNacimiento)}</span>
          </div>
          <div className={styles.infoItem}>
            <span className={styles.label}>Sexo:</span>
            <span className={styles.value}>
              {patient.sexo === 'M' ? 'Masculino' : 'Femenino'}
            </span>
          </div>
          {patient.telefono && (
            <div className={styles.infoItem}>
              <span className={styles.label}>Teléfono:</span>
              <span className={styles.value}>{patient.telefono}</span>
            </div>
          )}
          {patient.domicilio && (
            <div className={styles.infoItem}>
              <span className={styles.label}>Domicilio:</span>
              <span className={styles.value}>{patient.domicilio}</span>
            </div>
          )}
          {patient.email && (
            <div className={styles.infoItem}>
              <span className={styles.label}>Email:</span>
              <span className={styles.value}>{patient.email}</span>
            </div>
          )}
        </div>
      </div>

      <VisitsTable
        numeroDocumento={patient.numeroDocumento}
        patientName={patient.apellidoNombre}
      />
    </div>
  );
}
```

### 12.7 Estilos de Detalle (app/dashboard/patients/[id]/styles.module.css)

```css
.container {
  min-height: 100vh;
  background: #f5f5f5;
  padding: 24px;
}

.header {
  max-width: 1400px;
  margin: 0 auto 24px;
}

.backButton {
  padding: 10px 20px;
  background: #00B5E2;
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}

.backButton:hover {
  background: #0083A9;
  transform: translateY(-2px);
}

.patientCard {
  max-width: 1400px;
  margin: 0 auto 24px;
  background: white;
  border-radius: 12px;
  padding: 32px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.patientCard h1 {
  font-size: 28px;
  font-weight: 700;
  color: #0083A9;
  margin: 0 0 24px 0;
}

.patientGrid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 20px;
}

.infoItem {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.label {
  font-size: 13px;
  font-weight: 600;
  color: #666;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.value {
  font-size: 16px;
  color: #333;
}

.loading {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
  color: #666;
}

.spinner {
  width: 40px;
  height: 40px;
  border: 4px solid #f0f0f0;
  border-top-color: #00B5E2;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
  margin-bottom: 16px;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

.error {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
  gap: 20px;
  color: #c33;
}
```

---

## 13. Deployment y Testing

### 13.1 Script para Crear Usuario Auditor

```sql
-- Script para crear usuario auditor
-- Ejecutar en SQL Server Management Studio

USE iMedic;
GO

-- Crear usuario (password: "admin123")
INSERT INTO imUsuariosAuditores (Usuario, Password, Nombre, Email, HospitalAsignado)
VALUES (
    'auditor1',
    '$2a$10$YourBcryptHashHere', -- Generar con bcrypt
    'Juan Pérez',
    'juan.perez@hospital.com',
    'Hospital Central'
);

-- Verificar creación
SELECT * FROM imUsuariosAuditores;
GO
```

### 13.2 Script para Generar Hash de Password (Node.js)

```javascript
// hashPassword.js
const bcrypt = require('bcryptjs');

async function hashPassword(password) {
  const salt = await bcrypt.genSalt(10);
  const hash = await bcrypt.hash(password, salt);
  console.log('Password:', password);
  console.log('Hash:', hash);
}

// Uso: node hashPassword.js
hashPassword('admin123');
```

### 13.3 Testing Manual con cURL

```bash
# 1. Login
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"usuario":"auditor1","password":"admin123"}'

# Respuesta: { "success": true, "data": { "token": "...", "user": {...} } }

# 2. Buscar pacientes (reemplazar TOKEN)
curl -X GET "http://localhost:3001/api/patients?search=garcia&page=1&limit=30" \
  -H "Authorization: Bearer TOKEN"

# 3. Obtener visitas de paciente
curl -X GET "http://localhost:3001/api/visits/patient/12345678?page=1&limit=50" \
  -H "Authorization: Bearer TOKEN"

# 4. Health check
curl http://localhost:3001/api/health
```

### 13.4 Comandos de Ejecución

```bash
# Backend
cd backend
npm install
npm run dev  # Desarrollo
npm start    # Producción

# Frontend
cd frontend
npm install
npm run dev   # Desarrollo en http://localhost:3000
npm run build # Build para producción
npm start     # Producción
```

---

## 14. Guía de Desarrollo

### 14.1 Flujo de Trabajo

1. **Configurar Base de Datos**
   - Crear tabla `imUsuariosAuditores`
   - Insertar usuario de prueba
   - Verificar conexión

2. **Configurar Backend**
   - Clonar estructura de carpetas
   - Configurar `.env`
   - Instalar dependencias
   - Iniciar servidor

3. **Configurar Frontend**
   - Crear proyecto Next.js
   - Configurar `.env.local`
   - Implementar componentes
   - Iniciar desarrollo

4. **Testing**
   - Probar login
   - Probar búsqueda de pacientes
   - Probar visualización de visitas
   - Verificar paginación

### 14.2 Checklist de Implementación

**Backend:**
- [ ] Configurar base de datos SQL Server
- [ ] Crear tabla imUsuariosAuditores
- [ ] Configurar variables de entorno
- [ ] Implementar servicios de autenticación
- [ ] Implementar servicios de pacientes
- [ ] Implementar servicios de visitas
- [ ] Configurar middleware de autenticación
- [ ] Probar endpoints con cURL/Postman

**Frontend:**
- [ ] Crear proyecto Next.js
- [ ] Configurar variables de entorno
- [ ] Implementar tipos TypeScript
- [ ] Implementar servicios (auth, patients, visits)
- [ ] Implementar hooks personalizados
- [ ] Crear componente de login
- [ ] Crear componente de búsqueda
- [ ] Crear componente de tabla de visitas
- [ ] Implementar páginas (login, dashboard, detalle)
- [ ] Probar flujo completo

**Seguridad:**
- [ ] Validar tokens JWT
- [ ] Implementar timeout de sesión
- [ ] Sanitizar inputs
- [ ] Validar permisos por hospital
- [ ] Implementar HTTPS en producción

### 14.3 Mejoras Futuras

1. **Funcionalidades:**
   - Exportar visitas a Excel/PDF
   - Filtros avanzados (por fecha, sector, etc.)
   - Estadísticas y gráficos
   - Búsqueda por múltiples criterios
   - Historial de auditorías

2. **Seguridad:**
   - Autenticación de dos factores (2FA)
   - Registro de actividad de usuarios
   - Encriptación de datos sensibles
   - Rate limiting en API

3. **UX/UI:**
   - Modo oscuro
   - Responsive mejorado
   - Notificaciones en tiempo real
   - Shortcuts de teclado

4. **Performance:**
   - Caché de consultas frecuentes
   - Lazy loading de componentes
   - Optimización de queries SQL
   - CDN para assets estáticos

---

## 15. Troubleshooting

### 15.1 Problemas Comunes

**Error: "Cannot connect to SQL Server"**
```
Solución:
1. Verificar que SQL Server esté corriendo
2. Verificar credenciales en .env
3. Verificar firewall/puertos
4. Verificar que TCP/IP esté habilitado en SQL Server
```

**Error: "Token inválido"**
```
Solución:
1. Verificar JWT_SECRET en .env
2. Verificar que el token no haya expirado
3. Limpiar localStorage del navegador
4. Hacer login nuevamente
```

**Error: "No se encontraron pacientes"**
```
Solución:
1. Verificar que el hospital asignado coincida con datos en BD
2. Verificar que existan visitas para ese hospital
3. Revisar logs del backend para errores SQL
```

**Error: "CORS policy"**
```
Solución:
1. Verificar CORS_ORIGIN en .env del backend
2. Verificar que frontend esté en el puerto correcto
3. Reiniciar servidor backend
```

### 15.2 Logs y Debugging

```javascript
// Habilitar logs detallados en backend
// Agregar en server.js:
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`);
  console.log('Headers:', req.headers);
  console.log('Body:', req.body);
  next();
});

// Logs en servicios
console.log('Query SQL:', query);
console.log('Resultados:', result.recordset);
```

---

## 16. Recursos Adicionales

### 16.1 Documentación de Referencia

- **Next.js:** https://nextjs.org/docs
- **React:** https://react.dev
- **TypeScript:** https://www.typescriptlang.org/docs
- **Express:** https://expressjs.com
- **node-mssql:** https://www.npmjs.com/package/mssql
- **JWT:** https://jwt.io

### 16.2 Herramientas Recomendadas

- **VS Code:** Editor de código
- **Postman:** Testing de API
- **SQL Server Management Studio:** Gestión de BD
- **Git:** Control de versiones
- **Docker:** Containerización (opcional)

---

## Conclusión

Esta documentación proporciona una guía completa para crear **iMedicAD**, un sistema de auditorías médicas basado en la arquitectura de **iMedicWs**. El sistema permite a auditores médicos buscar pacientes por hospital y visualizar todo su historial de visitas/ingresos de manera eficiente y segura.

**Características principales:**
- ✅ Autenticación JWT segura
- ✅ Búsqueda optimizada de pacientes
- ✅ Visualización completa de visitas
- ✅ Paginación eficiente
- ✅ Diseño responsive con colores Pantone
- ✅ Arquitectura modular y escalable

**Próximos pasos:**
1. Implementar el backend siguiendo la Parte 1 y 2
2. Implementar el frontend siguiendo la Parte 3 y 4
3. Realizar testing completo
4. Desplegar en producción
5. Implementar mejoras futuras según necesidades

---

**Versión:** 1.0.0  
**Fecha:** Noviembre 2025  
**Autor:** Documentación técnica basada en iMedicWs
