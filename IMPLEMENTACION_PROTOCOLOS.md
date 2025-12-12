# Implementación de Tab "Protocolos"

## Resumen

Se ha implementado exitosamente una nueva tab "Protocolos" en el sistema iMedicAD que permite visualizar los protocolos médicos de cada visita junto con las prácticas asociadas a cada protocolo.

## Tablas de Base de Datos

### Tablas Principales

1. **`imHCProtocolosPtes`** - Protocolos de pacientes
   - `IdProtocolo` (PK): Identificador único del protocolo
   - `NroProtocolo`: Número de protocolo
   - `NumeroVisita` (FK): Relaciona con la visita
   - `IdPaciente` (FK): Relaciona con el paciente
   - `FechaProtocolo`: Fecha del protocolo
   - `HoraProtocolo`: Hora del protocolo
   - `IdProfesional` (FK): Profesional responsable

2. **`imFACPracticas`** - Prácticas médicas
   - `IdPractica` (PK): Identificador único de la práctica
   - `IdProtocolo` (FK): Relaciona con el protocolo
   - `Practica`: Código de la práctica
   - `TipoPractica`: Tipo de práctica
   - `CantidadPractica`: Cantidad realizada
   - `FechaPractica`: Fecha de realización
   - `HoraPracticaInicio`: Hora de inicio
   - `HoraPracticaFin`: Hora de fin
   - `Observaciones`: Notas adicionales

3. **`imFacProfesionales`** - Profesionales médicos
   - `IdProfesional` (PK): Identificador único
   - `Nombre`: Nombre del profesional
   - `Matricula`: Matrícula profesional

## Archivos Creados

### Scripts de Análisis (Backend)

1. **`backend/scripts/getProtocolosStructure.sql`**
   - Script SQL para analizar estructura de tablas
   - Obtiene columnas, tipos de datos, relaciones
   - Muestra ejemplos de datos y estadísticas

2. **`backend/scripts/getProtocolosStructure.js`**
   - Script Node.js para ejecutar consultas automáticamente
   - Genera archivos JSON y TXT con resultados
   - Útil para análisis programático

3. **`backend/scripts/probarRelacionesProtocolos.sql`**
   - Script SQL para probar relaciones entre tablas
   - Ejemplos de consultas complejas
   - Validación de integridad de datos

4. **`backend/scripts/README_PROTOCOLOS.md`**
   - Documentación completa de los scripts
   - Modelo de datos explicado
   - Ejemplos de uso

### Archivos Modificados

#### Backend

**`backend/services/visitDetail.service.js`**
- ✅ Agregado método `obtenerProtocolos(pool, numeroVisita)`
- ✅ Integrado en `obtenerDetalleCompleto()` para carga paralela
- ✅ Incluye JOIN con `imFacProfesionales` para datos del profesional
- ✅ Agrupa prácticas por protocolo eficientemente
- ✅ Manejo de errores robusto

**Características del método:**
```javascript
async obtenerProtocolos(pool, numeroVisita) {
  // 1. Obtiene protocolos de la visita con datos del profesional
  // 2. Obtiene todas las prácticas de los protocolos en una consulta
  // 3. Agrupa prácticas por protocolo
  // 4. Retorna array de protocolos con sus prácticas anidadas
}
```

#### Frontend

**`frontend/types/visitDetail.ts`**
- ✅ Agregada interface `PracticaProtocolo`
- ✅ Agregada interface `Protocolo`
- ✅ Actualizada interface `VisitDetail` para incluir `protocolos: Protocolo[]`

**`frontend/app/dashboard/visits/[id]/page.tsx`**
- ✅ Agregado botón de tab "Protocolos" con contador
- ✅ Implementada sección completa de visualización de protocolos
- ✅ Muestra información del protocolo (fecha, hora, número, profesional)
- ✅ Tabla de prácticas asociadas con todos los detalles
- ✅ Manejo de protocolos sin prácticas
- ✅ Estilos consistentes con el resto de la aplicación

## Estructura de Datos

### Respuesta del Backend

```json
{
  "protocolos": [
    {
      "idProtocolo": 12345,
      "nroProtocolo": "PROT-2024-001",
      "numeroVisita": 363192,
      "idPaciente": 1001,
      "fechaProtocolo": "2024-12-11",
      "horaProtocolo": "14:30:00",
      "idProfesional": 500,
      "nombreProfesional": "Dr. Juan Pérez",
      "matriculaProfesional": "MP12345",
      "practicas": [
        {
          "id": 67890,
          "codigoPractica": 420101,
          "nombrePractica": "Consulta médica",
          "tipoPractica": "C",
          "tipoNomenclador": "NBU",
          "cantidad": 1,
          "fecha": "2024-12-11",
          "horaInicio": "14:30:00",
          "horaFin": "15:00:00",
          "observaciones": "Control post-operatorio"
        }
      ]
    }
  ]
}
```

## Visualización en el Frontend

### Tab de Protocolos

La nueva tab muestra:

1. **Encabezado del Protocolo:**
   - Fecha y hora del protocolo
   - Número de protocolo (si existe)
   - Nombre y matrícula del profesional responsable

2. **Tabla de Prácticas:**
   - Fecha de realización
   - Código de la práctica
   - Nombre descriptivo de la práctica
   - Cantidad realizada
   - Hora de inicio y fin
   - Observaciones

3. **Estados:**
   - Mensaje cuando no hay protocolos registrados
   - Mensaje cuando un protocolo no tiene prácticas asociadas

## Flujo de Datos

```
1. Usuario accede a detalle de visita
   ↓
2. Frontend solicita detalle completo al backend
   ↓
3. Backend ejecuta consultas en paralelo:
   - obtenerVisitaBasica()
   - obtenerHCI()
   - obtenerMedicamentos()
   - obtenerEvoluciones()
   - obtenerPracticas()
   - obtenerEpicrisis()
   - obtenerEstudios()
   - obtenerProtocolos() ← NUEVO
   ↓
4. obtenerProtocolos():
   - Consulta imHCProtocolosPtes con JOIN a imFacProfesionales
   - Consulta imFACPracticas para todas las prácticas
   - Agrupa prácticas por protocolo
   ↓
5. Backend retorna objeto completo con protocolos
   ↓
6. Frontend renderiza tab "Protocolos" con los datos
```

## Consultas SQL Utilizadas

### Obtener Protocolos

```sql
SELECT 
  p.IdProtocolo,
  p.NroProtocolo,
  p.NumeroVisita,
  p.IdPaciente,
  p.FechaProtocolo,
  p.HoraProtocolo,
  p.IdProfesional,
  prof.Nombre as NombreProfesional,
  prof.Matricula as MatriculaProfesional
FROM imHCProtocolosPtes p
LEFT JOIN imFacProfesionales prof ON p.IdProfesional = prof.IdProfesional
WHERE p.NumeroVisita = @numeroVisita
ORDER BY p.FechaProtocolo DESC, p.HoraProtocolo DESC
```

### Obtener Prácticas de Protocolos

```sql
SELECT 
  pr.IdPractica,
  pr.IdProtocolo,
  pr.Practica as CodigoPractica,
  pr.TipoPractica,
  pr.CantidadPractica,
  pr.FechaPractica,
  pr.HoraPracticaInicio,
  pr.HoraPracticaFin,
  pr.Observaciones,
  n.Descripcion as NombrePractica,
  n.Tipo as TipoNomenclador
FROM imFACPracticas pr
LEFT JOIN VUnionModuladasNomenclador n ON pr.Practica = n.IDPractica
WHERE pr.IdProtocolo IN (...)
ORDER BY pr.FechaPractica DESC
```

## Pruebas Recomendadas

### 1. Ejecutar Scripts de Análisis

```bash
# Opción 1: SQL directo
# Abrir getProtocolosStructure.sql en SSMS y ejecutar

# Opción 2: Script Node.js
cd backend/scripts
node getProtocolosStructure.js
```

### 2. Verificar Relaciones

```bash
# Ejecutar probarRelacionesProtocolos.sql en SSMS
# Verificar que las relaciones entre tablas funcionan correctamente
```

### 3. Probar en el Frontend

1. Iniciar el backend: `cd backend && npm start`
2. Iniciar el frontend: `cd frontend && npm run dev`
3. Acceder a una visita que tenga protocolos
4. Verificar que la tab "Protocolos" muestra correctamente:
   - Contador de protocolos
   - Datos del protocolo
   - Prácticas asociadas
   - Información del profesional

## Notas Técnicas

### Optimizaciones Implementadas

1. **Carga Paralela:** Los protocolos se cargan en paralelo con otros datos usando `Promise.all()`
2. **Consultas Eficientes:** Se obtienen todas las prácticas en una sola consulta y se agrupan en memoria
3. **Manejo de Errores:** Si falla la consulta de protocolos, retorna array vacío sin romper la aplicación
4. **TypeScript:** Tipos bien definidos para autocompletado y validación

### Conversión de Fechas

El sistema utiliza el formato Clarion para fechas y horas:
- `clarionToDate()`: Convierte fechas Clarion a formato ISO (YYYY-MM-DD)
- `clarionToTime()`: Convierte horas Clarion a formato HH:MM:SS

### Estilos CSS

La tab de protocolos reutiliza los estilos existentes:
- `styles.card`: Contenedor de cada protocolo
- `styles.cardHeader`: Encabezado con fecha y profesional
- `styles.cardBody`: Cuerpo con tabla de prácticas
- `styles.table`: Tabla estándar del sistema
- `styles.noData`: Mensaje cuando no hay datos

## Mantenimiento Futuro

### Para agregar más campos al protocolo:

1. Actualizar la consulta SQL en `visitDetail.service.js`
2. Agregar campos a la interface `Protocolo` en `visitDetail.ts`
3. Actualizar la visualización en `page.tsx`

### Para modificar la visualización:

1. Editar la sección de protocolos en `page.tsx`
2. Agregar/modificar estilos en `styles.module.css`

## Conclusión

La implementación está completa y funcional. Los protocolos se integran perfectamente con el resto del sistema, manteniendo la consistencia en:
- Estructura de código
- Manejo de errores
- Tipos TypeScript
- Estilos visuales
- Experiencia de usuario

## Archivos de Referencia

- Backend Service: `backend/services/visitDetail.service.js`
- Frontend Page: `frontend/app/dashboard/visits/[id]/page.tsx`
- Types: `frontend/types/visitDetail.ts`
- Scripts: `backend/scripts/getProtocolosStructure.*`
- Documentación: `backend/scripts/README_PROTOCOLOS.md`
