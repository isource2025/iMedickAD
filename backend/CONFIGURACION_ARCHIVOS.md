# Configuración de Acceso a Archivos

## Escenario

- **Path en BD**: `\\192.168.25.1\iSource\Imagenes\Vidal\48445 BARROS SANTIAGO ALBERTO\963.pdf`
- **IP Interna**: `192.168.25.1` (servidor de archivos en red local)
- **IP Pública**: `181.4.72.60` (gateway/proxy que redirige a la red interna)

## Solución Implementada

### Backend: Proxy de Archivos

Se creó un endpoint en el backend (`/api/archivos/descargar`) que:
1. Recibe el path UNC del archivo
2. Accede al servidor de archivos
3. Lee el archivo
4. Lo sirve al frontend como stream

### Opciones de Configuración

Editar `backend/routes/archivos.routes.js` según tu infraestructura:

#### Opción 1: Servidor Backend en Windows con acceso directo a UNC

```javascript
// Mantener el path UNC tal cual
localPath = filePath; // \\192.168.25.1\iSource\...
```

**Requisitos:**
- El servidor backend debe estar en Windows
- Debe tener acceso de red al share `\\192.168.25.1\iSource`
- Credenciales de red configuradas

#### Opción 2: Share montado en Linux

```javascript
// Convertir UNC a path montado
localPath = filePath.replace(/^\\\\[\d\.]+\\/, '');
localPath = localPath.replace(/\\/g, '/');
localPath = `/mnt/iSource/${localPath}`;
```

**Requisitos:**
```bash
# Montar el share en /mnt/iSource
sudo mount -t cifs //192.168.25.1/iSource /mnt/iSource -o username=USER,password=PASS
```

#### Opción 3: Share montado en Windows

```javascript
// Convertir a drive mapeado
localPath = filePath.replace(/^\\\\[\d\.]+\\iSource/, 'Z:');
```

**Requisitos:**
```cmd
# Mapear el share a drive Z:
net use Z: \\192.168.25.1\iSource /user:DOMAIN\USER PASSWORD
```

## Configuración de Red

### Firewall

Asegurarse de que el servidor backend (181.4.72.60) pueda acceder a:
- Puerto 445 (SMB/CIFS) en 192.168.25.1
- Puerto 139 (NetBIOS) en 192.168.25.1

### VPN/Túnel

Si el backend está en la nube, considerar:
1. **VPN Site-to-Site**: Conectar la red del backend con la red interna
2. **Túnel SSH**: `ssh -L 445:192.168.25.1:445 user@181.4.72.60`
3. **Proxy Inverso**: Configurar nginx/apache en 181.4.72.60

## Seguridad

### Credenciales

Agregar al `.env`:
```env
FILE_SERVER_USER=DOMAIN\username
FILE_SERVER_PASSWORD=password
FILE_SERVER_DOMAIN=WORKGROUP
```

### Validación de Paths

El endpoint ya incluye:
- ✅ Verificación de existencia del archivo
- ✅ Validación de extensión
- ✅ Headers de seguridad
- ⚠️ **TODO**: Agregar validación de que el path esté dentro de directorios permitidos

### Mejoras Recomendadas

```javascript
// Validar que el path no salga del directorio base
const allowedBasePaths = [
  '\\\\192.168.25.1\\iSource\\Imagenes',
  '\\\\192.168.25.1\\iSource\\Documentos'
];

const isPathAllowed = allowedBasePaths.some(basePath => 
  filePath.startsWith(basePath)
);

if (!isPathAllowed) {
  return res.status(403).json({ error: 'Acceso denegado' });
}
```

## Testing

### Probar endpoint localmente

```bash
# Descargar archivo
curl "http://localhost:3001/api/archivos/descargar?path=\\\\192.168.25.1\\iSource\\Imagenes\\test.pdf" -o test.pdf

# Streaming
curl "http://localhost:3001/api/archivos/stream?path=\\\\192.168.25.1\\iSource\\Imagenes\\test.pdf" -o test.pdf
```

### Probar desde frontend

```javascript
const url = `${process.env.NEXT_PUBLIC_API_URL}/archivos/descargar?path=${encodeURIComponent(pathServidor)}`;
window.open(url, '_blank');
```

## Troubleshooting

### Error: "Archivo no encontrado"
- Verificar que el path en BD sea correcto
- Verificar permisos de red
- Verificar que el share esté montado/accesible

### Error: "Access Denied"
- Verificar credenciales de red
- Verificar permisos del usuario en el share
- En Windows: `net use` para ver conexiones activas

### Error: "Connection timeout"
- Verificar firewall
- Verificar que 192.168.25.1 sea accesible desde el backend
- Usar `ping` y `telnet` para diagnosticar

## Performance

### Cache
Considerar agregar cache de archivos frecuentes:
```javascript
const NodeCache = require('node-cache');
const fileCache = new NodeCache({ stdTTL: 3600 }); // 1 hora
```

### CDN
Para producción, considerar:
1. Sincronizar archivos a S3/Azure Blob
2. Servir desde CDN
3. Actualizar paths en BD gradualmente
