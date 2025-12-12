# 🔧 Solución: Acceso a Archivos

## 🔍 Problema Identificado

El servidor backend **NO tiene acceso** a la red `\\192.168.25.1\Imagenes`

```
❌ No se puede hacer ping a 192.168.25.1
❌ No se puede acceder al share \\192.168.25.1\Imagenes
```

## 💡 Soluciones Disponibles

### Opción 1: Conectar vía VPN (RECOMENDADO para desarrollo)

Si tienes acceso VPN a la red del hospital:

1. **Conectar a la VPN** del hospital/clínica
2. **Verificar acceso**:
   ```cmd
   ping 192.168.25.1
   dir \\192.168.25.1\Imagenes
   ```
3. **Reiniciar el backend** y probar

### Opción 2: Mapear Share con Credenciales

Si tienes credenciales de red:

```cmd
# Mapear el share a drive Z:
net use Z: \\192.168.25.1\Imagenes /user:DOMINIO\USUARIO PASSWORD

# Verificar
dir Z:\Vidal
```

Luego actualizar `backend/routes/archivos.routes.js`:
```javascript
// Línea ~26, cambiar:
localPath = filePath.replace(/^\\\\[\d\.]+\\Imagenes/, 'Z:');
```

### Opción 3: Túnel SSH (Para desarrollo remoto)

Si el servidor 181.4.72.60 tiene acceso:

```bash
# Crear túnel SSH
ssh -L 445:192.168.25.1:445 usuario@181.4.72.60

# Luego acceder vía localhost
\\localhost\Imagenes
```

### Opción 4: Servidor Proxy de Archivos (PRODUCCIÓN)

Crear un servicio en el servidor 181.4.72.60 que:
1. Tenga acceso a `\\192.168.25.1`
2. Exponga un endpoint HTTP para descargar archivos
3. El backend se conecta a este servicio

```
Frontend → Backend (tu PC) → Servidor Proxy (181.4.72.60) → Archivos (192.168.25.1)
```

### Opción 5: Copiar Archivos Localmente (SOLO TESTING)

Para testing temporal:

1. Crear carpeta local: `C:\SharedFiles\Imagenes\Vidal`
2. Copiar algunos archivos de ejemplo
3. Actualizar `archivos.routes.js`:
   ```javascript
   localPath = filePath.replace(/^\\\\[\d\.]+\\Imagenes/, 'C:/SharedFiles/Imagenes');
   ```

## 🎯 Solución Recomendada para TU CASO

Basándome en tu configuración:

### Para Desarrollo (Ahora):
**Opción 1: VPN** - Si tienes acceso VPN, conéctate y listo

### Para Producción (Después):
**Opción 4: Servidor Proxy** - El backend en producción estará en 181.4.72.60 que SÍ tiene acceso

## 📝 Configuración para Producción

Cuando despliegues el backend en el servidor 181.4.72.60:

1. **Verificar acceso** desde el servidor:
   ```cmd
   # Desde 181.4.72.60
   ping 192.168.25.1
   dir \\192.168.25.1\Imagenes
   ```

2. **Si tiene acceso directo**: No cambiar nada, debería funcionar

3. **Si necesita credenciales**: Configurar en el servidor:
   ```cmd
   net use \\192.168.25.1\Imagenes /user:USUARIO PASSWORD /persistent:yes
   ```

## 🧪 Testing Temporal

Para probar AHORA sin acceso a la red:

1. **Crear estructura local**:
   ```cmd
   mkdir C:\SharedFiles\Imagenes\Vidal\379267_SCHERMAN_JUAN_PABLO
   ```

2. **Copiar un PDF de prueba**:
   ```cmd
   copy cualquier.pdf "C:\SharedFiles\Imagenes\Vidal\379267 SCHERMAN JUAN PABLO\54463 SHERMAN.pdf"
   ```

3. **Actualizar archivos.routes.js**:
   ```javascript
   // Línea ~26
   if (filePath.startsWith('\\\\')) {
     // Para testing local
     localPath = filePath
       .replace(/^\\\\server\\/i, 'C:\\SharedFiles\\')
       .replace(/^\\\\192\.168\.25\.1\\/i, 'C:\\SharedFiles\\')
       .replace(/^\\\\192\.168\.25\.158\\/i, 'C:\\SharedFiles\\');
     
     console.log('📂 Path local (TESTING):', localPath);
   }
   ```

4. **Reiniciar backend** y probar

## ✅ Verificar Solución

Después de aplicar cualquier solución:

```bash
node scripts/verificarAccesoRed.js
```

Deberías ver:
```
✅ Ping exitoso
✅ Share accesible
✅ Archivo encontrado
```

## 🚀 Próximos Pasos

1. **Elegir una solución** según tu situación
2. **Aplicar la configuración**
3. **Reiniciar el backend**
4. **Probar** con Postman/navegador
5. **Verificar** que los adjuntos aparecen en el frontend
