# 🧪 Guía de Testing - Sistema de Archivos Adjuntos

## ✅ Estado Actual

- ✅ Backend configurado y corriendo en puerto 5000
- ✅ Endpoint `/api/archivos/descargar` implementado
- ✅ Endpoint `/api/archivos/stream` implementado
- ✅ Normalización de paths UNC configurada
- ✅ Frontend actualizado para mostrar adjuntos
- ✅ Visita de ejemplo identificada: **#379267**

## 📋 Visita de Prueba: #379267

**Paciente**: SCHERMAN JUAN PABLO

**Archivos disponibles**:
1. `54463 SHERMAN.pdf` (Laboratorio)
2. `28 Scherman Juan Pablo.pdf` (Ecografía)
3. `8299 SCHERMAN JUAN.pdf` (Laboratorio)

**Path ejemplo**: `\\server\Imagenes\Vidal\379267 SCHERMAN JUAN PABLO\54463 SHERMAN.pdf`

## 🧪 Pasos para Probar

### 1. Verificar Backend (✅ Ya está corriendo)

El backend debe estar corriendo en `http://localhost:5000`

Si no está corriendo:
```bash
cd C:\Users\iSource\Desktop\iMedicAD\backend
npm start
```

### 2. Iniciar Frontend

```bash
cd C:\Users\iSource\Desktop\iMedicAD\frontend
npm run dev
```

### 3. Probar en el Navegador

#### A. Ver la visita completa
```
http://localhost:3000/dashboard/visits/379267
```

**Qué esperar**:
- Ver información del paciente
- Ver tabs: HCI, Medicamentos, Evoluciones, Prácticas, **Estudios**, Epicrisis
- En la tab "Estudios" deberías ver los estudios con sus adjuntos
- Cada adjunto debe aparecer como un link con icono 📄 o 📁

#### B. Probar API directamente
```
http://localhost:5000/api/visits/379267
```

**Qué esperar**:
- JSON con todos los datos de la visita
- En `estudios[].adjuntos[]` deberías ver los archivos

#### C. Probar descarga de archivo
```
http://localhost:5000/api/archivos/descargar?path=%5C%5Cserver%5CImagenes%5CVidal%5C379267%20SCHERMAN%20JUAN%20PABLO%5C54463%20SHERMAN.pdf
```

**Qué esperar**:
- Si el archivo existe y es accesible: Se descarga el PDF
- Si no es accesible: Error 404 con mensaje descriptivo

## 🔍 Troubleshooting

### Error: "Archivo no encontrado"

**Causas posibles**:
1. El servidor backend no tiene acceso a la red `\\192.168.25.1`
2. El path en la BD está incorrecto
3. El archivo fue movido o eliminado

**Soluciones**:

#### Verificar acceso a la red desde el servidor
```cmd
# Desde el servidor donde corre el backend
ping 192.168.25.1
```

#### Verificar acceso al share
```cmd
# Listar archivos del share
dir \\192.168.25.1\Imagenes\Vidal
```

#### Si no tienes acceso directo, montar el share
```cmd
# Mapear a drive Z:
net use Z: \\192.168.25.1\Imagenes /user:DOMAIN\USER PASSWORD

# Luego actualizar archivos.routes.js para usar Z:
localPath = filePath.replace(/^\\\\[\d\.]+\\Imagenes/, 'Z:');
```

### Error: "CORS"

Si ves errores de CORS en la consola del navegador:

1. Verificar que el frontend esté en `http://localhost:3000`
2. Verificar configuración CORS en `backend/server.js`

### Los adjuntos no aparecen en el frontend

**Verificar**:
1. Que la visita tenga adjuntos en la BD (usar script `buscarArchivosSimple.js`)
2. Que el query en `visitDetail.service.js` esté trayendo los adjuntos
3. Ver la consola del navegador para errores

## 📊 Scripts de Ayuda

### Buscar más visitas con archivos
```bash
cd C:\Users\iSource\Desktop\iMedicAD\backend
node scripts/buscarArchivosSimple.js
```

### Ver estructura de la tabla
```bash
node scripts/verEstructuraAdjuntos.js
```

## 🎯 Checklist de Testing

- [ ] Backend corriendo en puerto 5000
- [ ] Frontend corriendo en puerto 3000
- [ ] Abrir visita #379267 en el navegador
- [ ] Ver tab "Estudios"
- [ ] Verificar que aparecen los adjuntos
- [ ] Hacer click en un adjunto
- [ ] Verificar que se abre/descarga el PDF
- [ ] Probar con diferentes archivos
- [ ] Verificar logs del backend para ver paths

## 📝 Logs Importantes

En la consola del backend deberías ver:
```
📄 Solicitud de descarga de archivo: \\server\Imagenes\Vidal\...
📂 Path UNC normalizado: \\192.168.25.1\Imagenes\Vidal\...
📂 Path local resuelto: \\192.168.25.1\Imagenes\Vidal\...
✅ Archivo enviado exitosamente: 54463 SHERMAN.pdf
```

## 🚀 Próximos Pasos (Después del Testing)

1. **Seguridad**: Agregar validación de paths permitidos
2. **Cache**: Implementar cache para archivos frecuentes
3. **Thumbnails**: Generar previsualizaciones de PDFs
4. **Búsqueda**: Permitir buscar archivos por nombre
5. **Upload**: Permitir subir nuevos archivos desde el frontend

## 💡 Notas Importantes

- Los paths en la BD usan `\\server` que se normaliza a `\\192.168.25.1`
- También hay paths con `\\192.168.25.158` que se normalizan a `\\192.168.25.1`
- El backend debe estar en Windows o tener acceso al share montado
- Los archivos se sirven directamente sin copiarlos (streaming)
- El frontend abre los archivos en una nueva pestaña

## 🆘 Soporte

Si algo no funciona:
1. Revisar logs del backend
2. Revisar consola del navegador (F12)
3. Verificar que el servidor tenga acceso a la red
4. Probar con curl o Postman primero
5. Verificar que los paths en la BD sean correctos
