# Scripts para Tablas de Control de Internación

Este directorio contiene scripts para obtener y trabajar con la estructura de las tablas de control de internación.

## Tablas Analizadas

- `imInterCtrlMedicamento` - Control de medicamentos en internación
- `imInterCtrlFrecuente` - Controles frecuentes (signos vitales, etc.)
- `imInterCtrlEvolucion` - Evolución de controles
- `imInterTipoControles` - Tipos de controles disponibles

## Scripts Disponibles

### 1. Script JavaScript (Recomendado)

**Archivo:** `getInterCtrlTableStructures.js`

**Uso:**
```bash
node scripts/getInterCtrlTableStructures.js
```

**Características:**
- ✅ Se conecta automáticamente a la base de datos usando la configuración de `.env`
- ✅ Genera 3 archivos de salida con timestamp:
  - **JSON** (`interCtrl_structures_YYYY-MM-DD.json`) - Estructura completa en formato JSON
  - **TypeScript** (`interCtrl_interfaces_YYYY-MM-DD.ts`) - Interfaces TypeScript listas para usar
  - **TXT** (`interCtrl_summary_YYYY-MM-DD.txt`) - Resumen legible en texto plano

**Información que extrae:**
- Nombre y tipo de cada columna (SQL y JavaScript/TypeScript)
- Longitud máxima de campos
- Precisión y escala de campos numéricos
- Si acepta valores NULL
- Valores por defecto
- Claves primarias
- Claves foráneas (relaciones con otras tablas)
- Conteo total de registros
- Ejemplos de datos (primeros 2 registros)

**Salida en consola:**
```
🔄 Conectando a la base de datos...

============================================================
📊 Tabla: imInterCtrlMedicamento
============================================================

📈 Total de registros: 1234

🔑 Claves primarias: ID

🔗 Claves foráneas:
   - NUMEROVISITA -> imVisita.NUMEROVISITA
   - CODIGOMEDICAMENTO -> imVademecum.CODIGO

📋 Columnas:
   1. ID                            int                  NOT NULL   -> number [PK]
   2. NUMEROVISITA                  int                  NOT NULL   -> number
   3. CODIGOMEDICAMENTO             varchar(50)          NULL       -> string
   ...
```

### 2. Script SQL

**Archivo:** `getInterCtrlTableStructures.sql`

**Uso:**
Ejecutar en SQL Server Management Studio o Azure Data Studio

**Características:**
- ✅ No requiere Node.js
- ✅ Muestra resultados directamente en el cliente SQL
- ✅ Incluye ejemplos de datos
- ✅ Muestra resumen general al final

**Secciones del reporte:**
1. Estructura de columnas de cada tabla
2. Claves primarias
3. Claves foráneas
4. Conteo de registros
5. Ejemplos de datos (primeros 3 registros)
6. Resumen general con todas las relaciones

## Archivos Generados

### JSON (`interCtrl_structures_*.json`)

Estructura completa en formato JSON, ideal para:
- Importar en otras aplicaciones
- Generar código automáticamente
- Documentación técnica

Ejemplo:
```json
{
  "imInterCtrlMedicamento": {
    "tableName": "imInterCtrlMedicamento",
    "recordCount": 1234,
    "columns": [
      {
        "name": "ID",
        "sqlType": "int",
        "jsType": "number",
        "isNullable": false,
        "position": 1
      }
    ],
    "primaryKeys": ["ID"],
    "foreignKeys": [
      {
        "columnName": "NUMEROVISITA",
        "referencedTable": "imVisita",
        "referencedColumn": "NUMEROVISITA"
      }
    ]
  }
}
```

### TypeScript (`interCtrl_interfaces_*.ts`)

Interfaces TypeScript listas para usar en tu código:

```typescript
export interface imInterCtrlMedicamento {
  ID: number; // PRIMARY KEY
  NUMEROVISITA: number;
  CODIGOMEDICAMENTO?: string;
  DOSIS?: string;
  FRECUENCIA?: string;
  FECHAINICIO?: Date;
  FECHAFIN?: Date;
}

export interface imInterCtrlFrecuente {
  ID: number; // PRIMARY KEY
  NUMEROVISITA: number;
  IDTIPOCONTROL?: number;
  VALOR?: string;
  FECHA?: Date;
}
```

### TXT (`interCtrl_summary_*.txt`)

Resumen en texto plano, fácil de leer y compartir:

```
RESUMEN DE ESTRUCTURAS DE TABLAS
Fecha: 27/11/2025 13:57:00
================================================================================

TABLA: imInterCtrlMedicamento
--------------------------------------------------------------------------------
Total de registros: 1234
Claves primarias: ID

COLUMNAS:
  - ID (int) -> number [PK]
  - NUMEROVISITA (int) -> number
  - CODIGOMEDICAMENTO (varchar) -> string [NULLABLE]
  ...
```

## Mapeo de Tipos de Datos

El script convierte automáticamente los tipos SQL a tipos JavaScript/TypeScript:

| Tipo SQL | Tipo JS/TS |
|----------|------------|
| int, bigint, smallint, tinyint | number |
| decimal, numeric, float, real | number |
| money, smallmoney | number |
| bit | boolean |
| varchar, nvarchar, char, nchar, text | string |
| datetime, datetime2, date, time | Date |
| uniqueidentifier | string |
| binary, varbinary, image | Buffer |

## Casos de Uso

### 1. Crear modelos para el backend

Usa las interfaces TypeScript generadas:

```typescript
// Importar interfaces
import { imInterCtrlMedicamento } from './scripts/interCtrl_interfaces_2025-11-27.ts';

// Usar en tus funciones
async function getMedicamentos(numeroVisita: number): Promise<imInterCtrlMedicamento[]> {
  // Tu código aquí
}
```

### 2. Validación de datos

Usa el JSON para crear validadores:

```javascript
const structures = require('./scripts/interCtrl_structures_2025-11-27.json');

function validateMedicamento(data) {
  const schema = structures.imInterCtrlMedicamento.columns;
  // Validar según el schema
}
```

### 3. Documentación

Usa el archivo TXT para documentar tu API o base de datos.

### 4. Generación de código

Usa el JSON para generar automáticamente:
- Formularios
- Validadores
- Queries SQL
- Endpoints REST

## Requisitos

### Para el script JavaScript:
- Node.js instalado
- Dependencias instaladas (`npm install`)
- Archivo `.env` configurado con las credenciales de la base de datos

### Para el script SQL:
- SQL Server Management Studio o Azure Data Studio
- Acceso a la base de datos

## Notas Importantes

- Los archivos generados incluyen un timestamp en el nombre para evitar sobrescribir versiones anteriores
- Los datos de ejemplo están limitados a 2-3 registros para mantener los archivos pequeños
- Las interfaces TypeScript marcan los campos nullable con `?`
- Las claves primarias están comentadas en las interfaces

## Próximos Pasos

Después de ejecutar estos scripts, puedes:

1. **Crear servicios** para cada tabla
2. **Implementar endpoints** REST para CRUD
3. **Generar validadores** basados en los tipos de datos
4. **Documentar la API** usando la información extraída
5. **Crear tests** unitarios para cada tabla

## Soporte

Si encuentras algún error o necesitas agregar más tablas, edita el array `TABLES` en el script JavaScript:

```javascript
const TABLES = [
  'imInterCtrlMedicamento',
  'imInterCtrlFrecuente',
  'imInterCtrlEvolucion',
  'imInterTipoControles',
  // Agrega más tablas aquí
];
```
