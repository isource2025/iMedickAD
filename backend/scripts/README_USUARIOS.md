# 👥 Gestión de Usuarios - iMedicAD

## 📋 Scripts Disponibles

### 1. `createUsersRemote.js` - ⭐ RECOMENDADO - Crear Usuarios Remotamente
Crea usuarios directamente en SQL Server usando la configuración del `.env`.

**Uso:**
```bash
cd backend/scripts
node createUsersRemote.js
```

**Características:**
- ✅ Se conecta automáticamente a SQL Server
- ✅ Verifica si la tabla existe
- ✅ Crea usuarios con contraseñas hasheadas
- ✅ Evita duplicados
- ✅ Muestra credenciales al finalizar

**Usuarios que crea:**
- **admin** - Administrador General
- **auditor** - Auditor General  
- **demo** - Usuario Demo

### 2. `createTableRemote.js` - Crear Tabla Remotamente
Crea la tabla `imUsuariosAuditores` directamente en SQL Server.

**Uso:**
```bash
cd backend/scripts
node createTableRemote.js
```

### 3. `createDefaultUsers.js` - Generar SQL para Usuarios
Genera usuarios predefinidos y muestra el SQL para ejecutar manualmente.

**Uso:**
```bash
cd backend/scripts
node createDefaultUsers.js
```

### 4. `createUser.js` - Generar Hash de Contraseña
Genera el hash de una contraseña específica para insertar manualmente.

**Uso:**
```bash
cd backend/scripts
node createUser.js <tu_contraseña>
```

**Ejemplo:**
```bash
node createUser.js MiPassword123!
```

---

## 🚀 Guía Rápida: Crear Usuarios por Defecto (MÉTODO REMOTO)

### Opción A: Automático (Recomendado) ⭐

#### Paso 1: Verificar/Crear la Tabla (si es necesario)
```bash
cd c:\Users\iSource\Desktop\iMedicAD\backend\scripts
node createTableRemote.js
```

#### Paso 2: Crear los Usuarios
```bash
node createUsersRemote.js
```

¡Listo! El script:
- ✅ Se conecta automáticamente a SQL Server
- ✅ Verifica que la tabla existe
- ✅ Crea los usuarios con contraseñas hasheadas
- ✅ Muestra las credenciales al finalizar

### Opción B: Manual (SQL Server Management Studio)

#### Paso 1: Generar el SQL
```bash
cd c:\Users\iSource\Desktop\iMedicAD\backend\scripts
node createDefaultUsers.js
```

#### Paso 2: Copiar el SQL Generado
El script mostrará:
1. **Credenciales de acceso** (usuario/password)
2. **Script SQL completo** para ejecutar en SQL Server

#### Paso 3: Ejecutar en SQL Server
1. Abre **SQL Server Management Studio**
2. Conéctate al servidor configurado en `.env`
3. Selecciona la base de datos: `isource`
4. Copia y pega el SQL generado
5. Ejecuta el script (F5)

#### Paso 4: Verificar
```sql
SELECT 
    IdUsuario,
    Usuario,
    Nombre,
    Email,
    HospitalAsignado,
    Activo,
    FechaCreacion
FROM imUsuariosAuditores
ORDER BY IdUsuario;
```

---

## 🔐 Credenciales por Defecto

Una vez ejecutado `createDefaultUsers.js`, tendrás estas credenciales:

| Usuario | Password | Rol | Hospital |
|---------|----------|-----|----------|
| `admin` | `Admin2025!` | Administrador General | Administración Central |
| `auditor` | `Auditor2025!` | Auditor General | Hospital Central |
| `demo` | `Demo2025!` | Usuario Demo | Hospital Demo |

⚠️ **IMPORTANTE**: Cambia estas contraseñas en producción.

---

## 🛠️ Crear Usuario Personalizado

### Opción A: Usando el Script
```bash
# 1. Generar hash
node createUser.js TuPassword123!

# 2. Copiar el INSERT que muestra el script

# 3. Ejecutar en SQL Server
```

### Opción B: Manualmente
```sql
-- 1. Generar hash con el script
-- node createUser.js TuPassword123!

-- 2. Insertar usuario
INSERT INTO imUsuariosAuditores (Usuario, Password, Nombre, Email, HospitalAsignado)
VALUES (
    'nuevo_usuario',
    '$2a$10$HASH_GENERADO_POR_EL_SCRIPT',
    'Nombre Completo',
    'email@hospital.com',
    'Hospital Asignado'
);
```

---

## 📊 Estructura de la Tabla

```sql
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
```

---

## 🔍 Consultas Útiles

### Ver todos los usuarios
```sql
SELECT * FROM imUsuariosAuditores ORDER BY IdUsuario;
```

### Ver usuarios activos
```sql
SELECT * FROM imUsuariosAuditores WHERE Activo = 1;
```

### Desactivar un usuario
```sql
UPDATE imUsuariosAuditores 
SET Activo = 0 
WHERE Usuario = 'nombre_usuario';
```

### Activar un usuario
```sql
UPDATE imUsuariosAuditores 
SET Activo = 1 
WHERE Usuario = 'nombre_usuario';
```

### Cambiar contraseña
```bash
# 1. Generar nuevo hash
node createUser.js NuevaPassword123!

# 2. Actualizar en SQL Server
UPDATE imUsuariosAuditores 
SET Password = '$2a$10$NUEVO_HASH_AQUI' 
WHERE Usuario = 'nombre_usuario';
```

### Eliminar un usuario
```sql
DELETE FROM imUsuariosAuditores WHERE Usuario = 'nombre_usuario';
```

---

## 🔒 Seguridad

### Buenas Prácticas:

1. **Contraseñas Fuertes**: Mínimo 8 caracteres, mayúsculas, minúsculas, números y símbolos
2. **Cambiar Defaults**: Las credenciales por defecto son solo para desarrollo
3. **Revisar Accesos**: Monitorear el campo `UltimoAcceso` regularmente
4. **Desactivar vs Eliminar**: Preferir desactivar usuarios en lugar de eliminarlos

### Política de Contraseñas Recomendada:
- Mínimo 8 caracteres
- Al menos 1 mayúscula
- Al menos 1 minúscula
- Al menos 1 número
- Al menos 1 símbolo especial
- No usar contraseñas comunes

---

## 🐛 Troubleshooting

### Error: "bcryptjs not found"
```bash
cd backend
npm install bcryptjs
```

### Error: "Cannot find module 'dotenv'"
```bash
cd backend
npm install dotenv
```

### Error: "Violation of UNIQUE KEY constraint"
El usuario ya existe. Usa otro nombre de usuario o elimina el existente.

### Error: "Invalid column name"
Verifica que la tabla `imUsuariosAuditores` existe:
```sql
SELECT * FROM sys.tables WHERE name = 'imUsuariosAuditores';
```

Si no existe, ejecuta primero: `createTable.sql`

---

## 📞 Soporte

Para problemas o preguntas:
1. Revisa los logs del script
2. Verifica la conexión a la base de datos
3. Confirma que la tabla existe
4. Revisa los permisos del usuario de SQL Server
