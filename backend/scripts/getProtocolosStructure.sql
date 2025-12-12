-- Script para obtener la estructura de las tablas relacionadas con Protocolos
-- Ejecutar en SQL Server Management Studio o Azure Data Studio

-- ============================================
-- Tabla: imHCProtocolosPtes (Protocolos de Pacientes)
-- ============================================
PRINT '========================================';
PRINT 'Tabla: imHCProtocolosPtes';
PRINT '========================================';
SELECT 
    COLUMN_NAME as 'Columna',
    DATA_TYPE as 'TipoDato',
    CHARACTER_MAXIMUM_LENGTH as 'Longitud',
    IS_NULLABLE as 'Nullable',
    COLUMN_DEFAULT as 'ValorPorDefecto'
FROM INFORMATION_SCHEMA.COLUMNS
WHERE TABLE_NAME = 'imHCProtocolosPtes'
ORDER BY ORDINAL_POSITION;

PRINT '';
PRINT 'Ejemplo de datos:';
SELECT TOP 5 * FROM imHCProtocolosPtes;

PRINT '';
PRINT 'Total de registros:';
SELECT COUNT(*) as TotalRegistros FROM imHCProtocolosPtes;

PRINT '';
PRINT '';

-- ============================================
-- Tabla: imFACPracticas (Prácticas relacionadas)
-- ============================================
PRINT '========================================';
PRINT 'Tabla: imFACPracticas';
PRINT '========================================';
SELECT 
    COLUMN_NAME as 'Columna',
    DATA_TYPE as 'TipoDato',
    CHARACTER_MAXIMUM_LENGTH as 'Longitud',
    IS_NULLABLE as 'Nullable',
    COLUMN_DEFAULT as 'ValorPorDefecto'
FROM INFORMATION_SCHEMA.COLUMNS
WHERE TABLE_NAME = 'imFACPracticas'
ORDER BY ORDINAL_POSITION;

PRINT '';
PRINT 'Ejemplo de datos:';
SELECT TOP 5 * FROM imFACPracticas;

PRINT '';
PRINT 'Total de registros:';
SELECT COUNT(*) as TotalRegistros FROM imFACPracticas;

PRINT '';
PRINT '';

-- ============================================
-- Tabla: imFacProfesionales (Profesionales)
-- ============================================
PRINT '========================================';
PRINT 'Tabla: imFacProfesionales';
PRINT '========================================';
SELECT 
    COLUMN_NAME as 'Columna',
    DATA_TYPE as 'TipoDato',
    CHARACTER_MAXIMUM_LENGTH as 'Longitud',
    IS_NULLABLE as 'Nullable',
    COLUMN_DEFAULT as 'ValorPorDefecto'
FROM INFORMATION_SCHEMA.COLUMNS
WHERE TABLE_NAME = 'imFacProfesionales'
ORDER BY ORDINAL_POSITION;

PRINT '';
PRINT 'Ejemplo de datos:';
SELECT TOP 5 * FROM imFacProfesionales;

PRINT '';
PRINT 'Total de registros:';
SELECT COUNT(*) as TotalRegistros FROM imFacProfesionales;

PRINT '';
PRINT '';

-- ============================================
-- Relaciones entre tablas
-- ============================================
PRINT '========================================';
PRINT 'Buscando relaciones entre tablas';
PRINT '========================================';

-- Verificar columnas comunes entre imHCProtocolosPtes y imFACPracticas
PRINT 'Columnas que contienen IdProtocolo:';
SELECT 
    TABLE_NAME as 'Tabla',
    COLUMN_NAME as 'Columna',
    DATA_TYPE as 'TipoDato'
FROM INFORMATION_SCHEMA.COLUMNS
WHERE COLUMN_NAME LIKE '%Protocolo%'
    AND TABLE_NAME IN ('imHCProtocolosPtes', 'imFACPracticas', 'imFacProfesionales')
ORDER BY TABLE_NAME;

PRINT '';
PRINT '';

-- Verificar columnas que relacionan con NumeroVisita
PRINT 'Columnas que contienen NumeroVisita:';
SELECT 
    TABLE_NAME as 'Tabla',
    COLUMN_NAME as 'Columna',
    DATA_TYPE as 'TipoDato'
FROM INFORMATION_SCHEMA.COLUMNS
WHERE COLUMN_NAME LIKE '%NumeroVisita%'
    AND TABLE_NAME IN ('imHCProtocolosPtes', 'imFACPracticas')
ORDER BY TABLE_NAME;

PRINT '';
PRINT '';

-- Verificar columnas que relacionan con IdPaciente
PRINT 'Columnas que contienen IdPaciente:';
SELECT 
    TABLE_NAME as 'Tabla',
    COLUMN_NAME as 'Columna',
    DATA_TYPE as 'TipoDato'
FROM INFORMATION_SCHEMA.COLUMNS
WHERE COLUMN_NAME LIKE '%Paciente%'
    AND TABLE_NAME IN ('imHCProtocolosPtes', 'imFACPracticas')
ORDER BY TABLE_NAME;

PRINT '';
PRINT '';

-- ============================================
-- Ejemplo de JOIN entre tablas
-- ============================================
PRINT '========================================';
PRINT 'Ejemplo de relación Protocolos -> Prácticas';
PRINT '========================================';

-- Obtener protocolos con sus prácticas asociadas
SELECT TOP 5
    p.IdProtocolo,
    p.NumeroVisita,
    p.IdPaciente,
    p.FechaProtocolo,
    pr.IdPractica,
    pr.Practica,
    pr.CantidadPractica,
    pr.FechaPractica
FROM imHCProtocolosPtes p
LEFT JOIN imFACPracticas pr ON p.IdProtocolo = pr.IdProtocolo
WHERE p.NumeroVisita IS NOT NULL
ORDER BY p.FechaProtocolo DESC;

PRINT '';
PRINT '';

-- ============================================
-- Verificar claves primarias
-- ============================================
PRINT '========================================';
PRINT 'Claves primarias de las tablas';
PRINT '========================================';

SELECT 
    tc.TABLE_NAME as 'Tabla',
    kcu.COLUMN_NAME as 'ColumnaClavePrimaria'
FROM INFORMATION_SCHEMA.TABLE_CONSTRAINTS tc
JOIN INFORMATION_SCHEMA.KEY_COLUMN_USAGE kcu 
    ON tc.CONSTRAINT_NAME = kcu.CONSTRAINT_NAME
WHERE tc.CONSTRAINT_TYPE = 'PRIMARY KEY'
    AND tc.TABLE_NAME IN ('imHCProtocolosPtes', 'imFACPracticas', 'imFacProfesionales')
ORDER BY tc.TABLE_NAME;
