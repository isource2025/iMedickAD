# 🔐 Credenciales de Acceso - iMedicAD

## 📋 Usuarios por Defecto

### 1. Administrador General
```
Usuario:  admin
Password: admin123
Rol:      Administrador
Hospital: Administración Central
```

### 2. Auditor General
```
Usuario:  auditor
Password: Auditor2025!
Rol:      Auditor
Hospital: Hospital Central
```

### 3. Usuario Demo
```
Usuario:  demo
Password: Demo2025!
Rol:      Usuario de prueba
Hospital: Hospital Demo
```

---

## 🚀 Cómo Usar

### Para Desarrollo Local:
1. Asegúrate de que el backend esté corriendo: `npm run dev`
2. Abre el frontend: http://localhost:3000
3. Usa cualquiera de las credenciales de arriba

### Para Producción (Vercel):
1. Accede a: https://i-medick-ad-g5cg.vercel.app/login
2. Usa cualquiera de las credenciales de arriba

---

## 📊 Crear los Usuarios en la Base de Datos

### ✅ USUARIOS YA CREADOS

Los usuarios ya fueron creados exitosamente en la base de datos `isource` en el servidor `201.235.17.254`.

**Fecha de creación**: 26 de noviembre de 2025  
**Última actualización**: 26 de noviembre de 2025 - Contraseña de admin actualizada a `admin123`

### Si necesitas recrearlos o crear en otro servidor:

#### Opción 1: Script Remoto Automático (Recomendado) ⭐
```bash
cd backend/scripts
node createUsersRemote.js
```

Este script:
- Se conecta automáticamente usando la configuración del `.env`
- Verifica si los usuarios ya existen
- Crea solo los usuarios faltantes
- Muestra las credenciales al finalizar

#### Opción 2: SQL Server Management Studio
1. Abre SQL Server Management Studio
2. Conéctate al servidor configurado en `.env`
3. Abre el archivo: `backend/scripts/insertDefaultUsers.sql`
4. Ejecuta el script (F5)

#### Opción 3: Generar SQL Manualmente
```bash
cd backend/scripts
node createDefaultUsers.js
```
Luego copia el SQL generado y ejecútalo en SQL Server.

---

## ⚠️ Seguridad

### Para Desarrollo:
✅ Estas credenciales son seguras para usar

### Para Producción:
❌ **DEBES CAMBIAR ESTAS CONTRASEÑAS**

Pasos recomendados:
1. Crear usuarios con contraseñas únicas y complejas
2. Usar un gestor de contraseñas
3. Implementar autenticación de dos factores (futuro)
4. Rotar contraseñas periódicamente

---

## 🔄 Cambiar Contraseña

### Paso 1: Generar nuevo hash
```bash
cd backend/scripts
node createUser.js TuNuevaPassword123!
```

### Paso 2: Actualizar en la base de datos
```sql
UPDATE imUsuariosAuditores 
SET Password = '$2a$10$HASH_GENERADO_AQUI' 
WHERE Usuario = 'nombre_usuario';
```

---

## 📞 Soporte

Si tienes problemas para acceder:
1. Verifica que el backend esté corriendo
2. Confirma que los usuarios existen en la base de datos:
   ```sql
   SELECT * FROM imUsuariosAuditores;
   ```
3. Revisa los logs del backend para errores de autenticación
4. Verifica la configuración de CORS en el backend

---

## 🗂️ Archivos Relacionados

- **Script SQL**: `backend/scripts/insertDefaultUsers.sql`
- **Generador Node.js**: `backend/scripts/createDefaultUsers.js`
- **Documentación**: `backend/scripts/README_USUARIOS.md`
- **Tabla SQL**: `backend/scripts/createTable.sql`

---

**Última actualización**: 26 de noviembre de 2025
