# Scripts para Protocolos

Este documento describe los scripts creados para analizar y trabajar con las tablas relacionadas con protocolos médicos.

## Tablas Involucradas

### 1. `imHCProtocolosPtes`
Tabla principal que almacena los protocolos de pacientes.

**Relaciones:**
- `IdProtocolo` (PK): Identificador único del protocolo
- `NumeroVisita` (FK): Relaciona con la visita del paciente
- `IdPaciente` (FK): Relaciona con el paciente
- `IdProfesional` (FK): Relaciona con el profesional que creó el protocolo

### 2. `imFACPracticas`
Tabla que almacena las prácticas médicas realizadas.

**Relaciones:**
- `IdPractica` (PK): Identificador único de la práctica
- `IdProtocolo` (FK): Relaciona con el protocolo al que pertenece
- `NumeroVisita` (FK): Relaciona con la visita
- `Practica`: Código de la práctica realizada

### 3. `imFacProfesionales`
Tabla que almacena información de los profesionales médicos.

**Relaciones:**
- `IdProfesional` (PK): Identificador único del profesional
- `Nombre`: Nombre del profesional
- `Matricula`: Matrícula profesional

## Scripts Disponibles

### 1. `getProtocolosStructure.sql`
Script SQL para obtener la estructura completa de las tablas.

**Uso:**
```bash
# Ejecutar en SQL Server Management Studio o Azure Data Studio
# Abre el archivo y ejecuta todo el script
```

**Información que obtiene:**
- Estructura de columnas de cada tabla
- Ejemplos de datos
- Total de registros
- Relaciones entre tablas
- Claves primarias
- Ejemplo de JOIN entre tablas

### 2. `getProtocolosStructure.js`
Script Node.js que ejecuta las consultas y guarda los resultados en archivos JSON y TXT.

**Uso:**
```bash
cd backend/scripts
node getProtocolosStructure.js
```

**Requisitos:**
- Variables de entorno configuradas (DB_USER, DB_PASSWORD, DB_SERVER, DB_NAME)
- Paquete `mssql` instalado

**Archivos generados:**
- `protocolos_structure_output.json`: Resultados completos en formato JSON
- `protocolos_structure_summary.txt`: Resumen legible de la estructura

### 3. `probarRelacionesProtocolos.sql`
Script SQL para probar y verificar las relaciones entre las tablas.

**Uso:**
```bash
# Ejecutar en SQL Server Management Studio o Azure Data Studio
# Abre el archivo y ejecuta todo el script
```

**Pruebas que realiza:**
1. Protocolos con sus prácticas asociadas
2. Detalle de prácticas por protocolo
3. Protocolos con información del profesional
4. Protocolos por visita específica
5. Estadísticas generales
6. Ejemplo completo de un protocolo con todas sus relaciones

## Modelo de Datos

```
imHCProtocolosPtes (Protocolo)
├── IdProtocolo (PK)
├── NroProtocolo
├── NumeroVisita (FK) → imVisita
├── IdPaciente (FK) → imPaciente
├── IdProfesional (FK) → imFacProfesionales
├── FechaProtocolo
└── HoraProtocolo

imFACPracticas (Prácticas del Protocolo)
├── IdPractica (PK)
├── IdProtocolo (FK) → imHCProtocolosPtes
├── NumeroVisita (FK) → imVisita
├── Practica (código)
├── TipoPractica
├── CantidadPractica
├── FechaPractica
├── HoraPracticaInicio
├── HoraPracticaFin
└── Observaciones

imFacProfesionales (Profesional)
├── IdProfesional (PK)
├── Nombre
├── Matricula
└── ... (otros campos)
```

## Consulta de Ejemplo

Para obtener todos los protocolos de una visita con sus prácticas:

```sql
SELECT 
    p.IdProtocolo,
    p.NroProtocolo,
    p.FechaProtocolo,
    p.HoraProtocolo,
    prof.Nombre as NombreProfesional,
    prof.Matricula as MatriculaProfesional,
    pr.IdPractica,
    pr.Practica as CodigoPractica,
    pr.CantidadPractica,
    pr.FechaPractica,
    pr.Observaciones
FROM imHCProtocolosPtes p
LEFT JOIN imFacProfesionales prof ON p.IdProfesional = prof.IdProfesional
LEFT JOIN imFACPracticas pr ON p.IdProtocolo = pr.IdProtocolo
WHERE p.NumeroVisita = @NumeroVisita
ORDER BY p.FechaProtocolo DESC, pr.FechaPractica DESC;
```

## Próximos Pasos

1. ✅ Crear scripts de análisis de estructura
2. ✅ Documentar relaciones entre tablas
3. ⏳ Crear servicio backend para obtener protocolos
4. ⏳ Agregar tab "Protocolos" en el frontend
5. ⏳ Integrar visualización de protocolos en detalle de visita

## Notas Importantes

- Un protocolo puede tener múltiples prácticas asociadas
- Las prácticas están relacionadas tanto con el protocolo (`IdProtocolo`) como con la visita (`NumeroVisita`)
- Cada protocolo tiene un profesional responsable
- Los protocolos están asociados a una visita específica del paciente
