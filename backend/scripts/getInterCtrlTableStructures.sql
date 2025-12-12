-- ============================================
-- Script para obtener la estructura de las tablas de control de internación
-- Tablas: imInterCtrlMedicamento, imInterCtrlFrecuente, imInterCtrlEvolucion, imInterTipoControles
-- Fecha: 2025-11-27
-- ============================================

SET NOCOUNT ON;

-- ============================================
-- Tabla: imInterCtrlMedicamento
-- ============================================
PRINT '========================================';
PRINT 'Tabla: imInterCtrlMedicamento';
PRINT '========================================';
PRINT '';

-- Estructura de la tabla
PRINT 'ESTRUCTURA DE COLUMNAS:';
SELECT 
    ORDINAL_POSITION as '#',
    COLUMN_NAME as 'Columna',
    DATA_TYPE as 'TipoDato',
    CASE 
        WHEN CHARACTER_MAXIMUM_LENGTH IS NOT NULL THEN DATA_TYPE + '(' + CAST(CHARACTER_MAXIMUM_LENGTH AS VARCHAR) + ')'
        WHEN NUMERIC_PRECISION IS NOT NULL THEN DATA_TYPE + '(' + CAST(NUMERIC_PRECISION AS VARCHAR) + ',' + CAST(ISNULL(NUMERIC_SCALE, 0) AS VARCHAR) + ')'
        ELSE DATA_TYPE
    END as 'TipoCompleto',
    IS_NULLABLE as 'Nullable',
    COLUMN_DEFAULT as 'ValorPorDefecto'
FROM INFORMATION_SCHEMA.COLUMNS
WHERE TABLE_NAME = 'imInterCtrlMedicamento'
ORDER BY ORDINAL_POSITION;

PRINT '';
PRINT 'CLAVES PRIMARIAS:';
SELECT 
    COLUMN_NAME as 'Columna'
FROM INFORMATION_SCHEMA.KEY_COLUMN_USAGE
WHERE OBJECTPROPERTY(OBJECT_ID(CONSTRAINT_SCHEMA + '.' + CONSTRAINT_NAME), 'IsPrimaryKey') = 1
    AND TABLE_NAME = 'imInterCtrlMedicamento'
ORDER BY ORDINAL_POSITION;

PRINT '';
PRINT 'CLAVES FORÁNEAS:';
SELECT 
    COL_NAME(fc.parent_object_id, fc.parent_column_id) AS 'Columna',
    OBJECT_NAME(f.referenced_object_id) AS 'TablaReferenciada',
    COL_NAME(fc.referenced_object_id, fc.referenced_column_id) AS 'ColumnaReferenciada'
FROM sys.foreign_keys AS f
INNER JOIN sys.foreign_key_columns AS fc 
    ON f.object_id = fc.constraint_object_id
WHERE OBJECT_NAME(f.parent_object_id) = 'imInterCtrlMedicamento';

PRINT '';
PRINT 'CONTEO DE REGISTROS:';
SELECT COUNT(*) as 'TotalRegistros' FROM imInterCtrlMedicamento;

PRINT '';
PRINT 'EJEMPLO DE DATOS (primeros 3 registros):';
SELECT TOP 3 * FROM imInterCtrlMedicamento;

PRINT '';
PRINT '';

-- ============================================
-- Tabla: imInterCtrlFrecuente
-- ============================================
PRINT '========================================';
PRINT 'Tabla: imInterCtrlFrecuente';
PRINT '========================================';
PRINT '';

-- Estructura de la tabla
PRINT 'ESTRUCTURA DE COLUMNAS:';
SELECT 
    ORDINAL_POSITION as '#',
    COLUMN_NAME as 'Columna',
    DATA_TYPE as 'TipoDato',
    CASE 
        WHEN CHARACTER_MAXIMUM_LENGTH IS NOT NULL THEN DATA_TYPE + '(' + CAST(CHARACTER_MAXIMUM_LENGTH AS VARCHAR) + ')'
        WHEN NUMERIC_PRECISION IS NOT NULL THEN DATA_TYPE + '(' + CAST(NUMERIC_PRECISION AS VARCHAR) + ',' + CAST(ISNULL(NUMERIC_SCALE, 0) AS VARCHAR) + ')'
        ELSE DATA_TYPE
    END as 'TipoCompleto',
    IS_NULLABLE as 'Nullable',
    COLUMN_DEFAULT as 'ValorPorDefecto'
FROM INFORMATION_SCHEMA.COLUMNS
WHERE TABLE_NAME = 'imInterCtrlFrecuente'
ORDER BY ORDINAL_POSITION;

PRINT '';
PRINT 'CLAVES PRIMARIAS:';
SELECT 
    COLUMN_NAME as 'Columna'
FROM INFORMATION_SCHEMA.KEY_COLUMN_USAGE
WHERE OBJECTPROPERTY(OBJECT_ID(CONSTRAINT_SCHEMA + '.' + CONSTRAINT_NAME), 'IsPrimaryKey') = 1
    AND TABLE_NAME = 'imInterCtrlFrecuente'
ORDER BY ORDINAL_POSITION;

PRINT '';
PRINT 'CLAVES FORÁNEAS:';
SELECT 
    COL_NAME(fc.parent_object_id, fc.parent_column_id) AS 'Columna',
    OBJECT_NAME(f.referenced_object_id) AS 'TablaReferenciada',
    COL_NAME(fc.referenced_object_id, fc.referenced_column_id) AS 'ColumnaReferenciada'
FROM sys.foreign_keys AS f
INNER JOIN sys.foreign_key_columns AS fc 
    ON f.object_id = fc.constraint_object_id
WHERE OBJECT_NAME(f.parent_object_id) = 'imInterCtrlFrecuente';

PRINT '';
PRINT 'CONTEO DE REGISTROS:';
SELECT COUNT(*) as 'TotalRegistros' FROM imInterCtrlFrecuente;

PRINT '';
PRINT 'EJEMPLO DE DATOS (primeros 3 registros):';
SELECT TOP 3 * FROM imInterCtrlFrecuente;

PRINT '';
PRINT '';

-- ============================================
-- Tabla: imInterCtrlEvolucion
-- ============================================
PRINT '========================================';
PRINT 'Tabla: imInterCtrlEvolucion';
PRINT '========================================';
PRINT '';

-- Estructura de la tabla
PRINT 'ESTRUCTURA DE COLUMNAS:';
SELECT 
    ORDINAL_POSITION as '#',
    COLUMN_NAME as 'Columna',
    DATA_TYPE as 'TipoDato',
    CASE 
        WHEN CHARACTER_MAXIMUM_LENGTH IS NOT NULL THEN DATA_TYPE + '(' + CAST(CHARACTER_MAXIMUM_LENGTH AS VARCHAR) + ')'
        WHEN NUMERIC_PRECISION IS NOT NULL THEN DATA_TYPE + '(' + CAST(NUMERIC_PRECISION AS VARCHAR) + ',' + CAST(ISNULL(NUMERIC_SCALE, 0) AS VARCHAR) + ')'
        ELSE DATA_TYPE
    END as 'TipoCompleto',
    IS_NULLABLE as 'Nullable',
    COLUMN_DEFAULT as 'ValorPorDefecto'
FROM INFORMATION_SCHEMA.COLUMNS
WHERE TABLE_NAME = 'imInterCtrlEvolucion'
ORDER BY ORDINAL_POSITION;

PRINT '';
PRINT 'CLAVES PRIMARIAS:';
SELECT 
    COLUMN_NAME as 'Columna'
FROM INFORMATION_SCHEMA.KEY_COLUMN_USAGE
WHERE OBJECTPROPERTY(OBJECT_ID(CONSTRAINT_SCHEMA + '.' + CONSTRAINT_NAME), 'IsPrimaryKey') = 1
    AND TABLE_NAME = 'imInterCtrlEvolucion'
ORDER BY ORDINAL_POSITION;

PRINT '';
PRINT 'CLAVES FORÁNEAS:';
SELECT 
    COL_NAME(fc.parent_object_id, fc.parent_column_id) AS 'Columna',
    OBJECT_NAME(f.referenced_object_id) AS 'TablaReferenciada',
    COL_NAME(fc.referenced_object_id, fc.referenced_column_id) AS 'ColumnaReferenciada'
FROM sys.foreign_keys AS f
INNER JOIN sys.foreign_key_columns AS fc 
    ON f.object_id = fc.constraint_object_id
WHERE OBJECT_NAME(f.parent_object_id) = 'imInterCtrlEvolucion';

PRINT '';
PRINT 'CONTEO DE REGISTROS:';
SELECT COUNT(*) as 'TotalRegistros' FROM imInterCtrlEvolucion;

PRINT '';
PRINT 'EJEMPLO DE DATOS (primeros 3 registros):';
SELECT TOP 3 * FROM imInterCtrlEvolucion;

PRINT '';
PRINT '';

-- ============================================
-- Tabla: imInterTipoControles
-- ============================================
PRINT '========================================';
PRINT 'Tabla: imInterTipoControles';
PRINT '========================================';
PRINT '';

-- Estructura de la tabla
PRINT 'ESTRUCTURA DE COLUMNAS:';
SELECT 
    ORDINAL_POSITION as '#',
    COLUMN_NAME as 'Columna',
    DATA_TYPE as 'TipoDato',
    CASE 
        WHEN CHARACTER_MAXIMUM_LENGTH IS NOT NULL THEN DATA_TYPE + '(' + CAST(CHARACTER_MAXIMUM_LENGTH AS VARCHAR) + ')'
        WHEN NUMERIC_PRECISION IS NOT NULL THEN DATA_TYPE + '(' + CAST(NUMERIC_PRECISION AS VARCHAR) + ',' + CAST(ISNULL(NUMERIC_SCALE, 0) AS VARCHAR) + ')'
        ELSE DATA_TYPE
    END as 'TipoCompleto',
    IS_NULLABLE as 'Nullable',
    COLUMN_DEFAULT as 'ValorPorDefecto'
FROM INFORMATION_SCHEMA.COLUMNS
WHERE TABLE_NAME = 'imInterTipoControles'
ORDER BY ORDINAL_POSITION;

PRINT '';
PRINT 'CLAVES PRIMARIAS:';
SELECT 
    COLUMN_NAME as 'Columna'
FROM INFORMATION_SCHEMA.KEY_COLUMN_USAGE
WHERE OBJECTPROPERTY(OBJECT_ID(CONSTRAINT_SCHEMA + '.' + CONSTRAINT_NAME), 'IsPrimaryKey') = 1
    AND TABLE_NAME = 'imInterTipoControles'
ORDER BY ORDINAL_POSITION;

PRINT '';
PRINT 'CLAVES FORÁNEAS:';
SELECT 
    COL_NAME(fc.parent_object_id, fc.parent_column_id) AS 'Columna',
    OBJECT_NAME(f.referenced_object_id) AS 'TablaReferenciada',
    COL_NAME(fc.referenced_object_id, fc.referenced_column_id) AS 'ColumnaReferenciada'
FROM sys.foreign_keys AS f
INNER JOIN sys.foreign_key_columns AS fc 
    ON f.object_id = fc.constraint_object_id
WHERE OBJECT_NAME(f.parent_object_id) = 'imInterTipoControles';

PRINT '';
PRINT 'CONTEO DE REGISTROS:';
SELECT COUNT(*) as 'TotalRegistros' FROM imInterTipoControles;

PRINT '';
PRINT 'EJEMPLO DE DATOS (primeros 3 registros):';
SELECT TOP 3 * FROM imInterTipoControles;

PRINT '';
PRINT '';

-- ============================================
-- RESUMEN GENERAL
-- ============================================
PRINT '========================================';
PRINT 'RESUMEN GENERAL';
PRINT '========================================';
PRINT '';

-- Conteo de registros por tabla
PRINT 'CONTEO DE REGISTROS POR TABLA:';
SELECT 'imInterCtrlMedicamento' as Tabla, COUNT(*) as TotalRegistros FROM imInterCtrlMedicamento
UNION ALL
SELECT 'imInterCtrlFrecuente', COUNT(*) FROM imInterCtrlFrecuente
UNION ALL
SELECT 'imInterCtrlEvolucion', COUNT(*) FROM imInterCtrlEvolucion
UNION ALL
SELECT 'imInterTipoControles', COUNT(*) FROM imInterTipoControles
ORDER BY Tabla;

PRINT '';
PRINT '';

-- Buscar relaciones entre las tablas
PRINT 'RELACIONES ENTRE TABLAS:';
SELECT 
    OBJECT_NAME(f.parent_object_id) AS 'TablaOrigen',
    COL_NAME(fc.parent_object_id, fc.parent_column_id) AS 'ColumnaOrigen',
    OBJECT_NAME(f.referenced_object_id) AS 'TablaDestino',
    COL_NAME(fc.referenced_object_id, fc.referenced_column_id) AS 'ColumnaDestino'
FROM sys.foreign_keys AS f
INNER JOIN sys.foreign_key_columns AS fc 
    ON f.object_id = fc.constraint_object_id
WHERE OBJECT_NAME(f.parent_object_id) IN ('imInterCtrlMedicamento', 'imInterCtrlFrecuente', 'imInterCtrlEvolucion', 'imInterTipoControles')
    OR OBJECT_NAME(f.referenced_object_id) IN ('imInterCtrlMedicamento', 'imInterCtrlFrecuente', 'imInterCtrlEvolucion', 'imInterTipoControles')
ORDER BY TablaOrigen, ColumnaOrigen;

PRINT '';
PRINT '========================================';
PRINT 'FIN DEL REPORTE';
PRINT '========================================';

SET NOCOUNT OFF;
