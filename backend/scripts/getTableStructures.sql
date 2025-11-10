-- Script para obtener la estructura de las tablas relacionadas con visitas
-- Ejecutar en SQL Server Management Studio o Azure Data Studio

-- ============================================
-- Tabla: imHCI (Historia Clínica de Ingreso)
-- ============================================
PRINT '========================================';
PRINT 'Tabla: imHCI';
PRINT '========================================';
SELECT 
    COLUMN_NAME as 'Columna',
    DATA_TYPE as 'TipoDato',
    CHARACTER_MAXIMUM_LENGTH as 'Longitud',
    IS_NULLABLE as 'Nullable',
    COLUMN_DEFAULT as 'ValorPorDefecto'
FROM INFORMATION_SCHEMA.COLUMNS
WHERE TABLE_NAME = 'imHCI'
ORDER BY ORDINAL_POSITION;

PRINT '';
PRINT 'Ejemplo de datos:';
SELECT TOP 3 * FROM imHCI;

PRINT '';
PRINT '';

-- ============================================
-- Tabla: imInterCtrlMedicamento (Control de Medicamentos)
-- ============================================
PRINT '========================================';
PRINT 'Tabla: imInterCtrlMedicamento';
PRINT '========================================';
SELECT 
    COLUMN_NAME as 'Columna',
    DATA_TYPE as 'TipoDato',
    CHARACTER_MAXIMUM_LENGTH as 'Longitud',
    IS_NULLABLE as 'Nullable',
    COLUMN_DEFAULT as 'ValorPorDefecto'
FROM INFORMATION_SCHEMA.COLUMNS
WHERE TABLE_NAME = 'imInterCtrlMedicamento'
ORDER BY ORDINAL_POSITION;

PRINT '';
PRINT 'Ejemplo de datos:';
SELECT TOP 3 * FROM imInterCtrlMedicamento;

PRINT '';
PRINT '';

-- ============================================
-- Tabla: imHCEvolucion (Evolución de Historia Clínica)
-- ============================================
PRINT '========================================';
PRINT 'Tabla: imHCEvolucion';
PRINT '========================================';
SELECT 
    COLUMN_NAME as 'Columna',
    DATA_TYPE as 'TipoDato',
    CHARACTER_MAXIMUM_LENGTH as 'Longitud',
    IS_NULLABLE as 'Nullable',
    COLUMN_DEFAULT as 'ValorPorDefecto'
FROM INFORMATION_SCHEMA.COLUMNS
WHERE TABLE_NAME = 'imHCEvolucion'
ORDER BY ORDINAL_POSITION;

PRINT '';
PRINT 'Ejemplo de datos:';
SELECT TOP 3 * FROM imHCEvolucion;

PRINT '';
PRINT '';

-- ============================================
-- Tabla: imFacPracticas (Prácticas Facturadas)
-- ============================================
PRINT '========================================';
PRINT 'Tabla: imFacPracticas';
PRINT '========================================';
SELECT 
    COLUMN_NAME as 'Columna',
    DATA_TYPE as 'TipoDato',
    CHARACTER_MAXIMUM_LENGTH as 'Longitud',
    IS_NULLABLE as 'Nullable',
    COLUMN_DEFAULT as 'ValorPorDefecto'
FROM INFORMATION_SCHEMA.COLUMNS
WHERE TABLE_NAME = 'imFacPracticas'
ORDER BY ORDINAL_POSITION;

PRINT '';
PRINT 'Ejemplo de datos:';
SELECT TOP 3 * FROM imFacPracticas;

PRINT '';
PRINT '';

-- ============================================
-- Tabla: imHCEpicrisis (Epicrisis de Historia Clínica)
-- ============================================
PRINT '========================================';
PRINT 'Tabla: imHCEpicrisis';
PRINT '========================================';
SELECT 
    COLUMN_NAME as 'Columna',
    DATA_TYPE as 'TipoDato',
    CHARACTER_MAXIMUM_LENGTH as 'Longitud',
    IS_NULLABLE as 'Nullable',
    COLUMN_DEFAULT as 'ValorPorDefecto'
FROM INFORMATION_SCHEMA.COLUMNS
WHERE TABLE_NAME = 'imHCEpicrisis'
ORDER BY ORDINAL_POSITION;

PRINT '';
PRINT 'Ejemplo de datos:';
SELECT TOP 3 * FROM imHCEpicrisis;

PRINT '';
PRINT '';

-- ============================================
-- Relaciones con imVisita
-- ============================================
PRINT '========================================';
PRINT 'Buscando relaciones con NUMEROVISITA';
PRINT '========================================';

-- Verificar qué tablas tienen NUMEROVISITA
PRINT 'Tablas que contienen NUMEROVISITA:';
SELECT 
    TABLE_NAME as 'Tabla',
    COLUMN_NAME as 'Columna',
    DATA_TYPE as 'TipoDato'
FROM INFORMATION_SCHEMA.COLUMNS
WHERE COLUMN_NAME LIKE '%NUMEROVISITA%'
    AND TABLE_NAME IN ('imHCI', 'imInterCtrlMedicamento', 'imHCEvolucion', 'imFacPracticas', 'imHCEpicrisis')
ORDER BY TABLE_NAME;

PRINT '';
PRINT '';

-- ============================================
-- Contar registros por tabla
-- ============================================
PRINT '========================================';
PRINT 'Conteo de registros por tabla';
PRINT '========================================';

DECLARE @TableName NVARCHAR(128);
DECLARE @SQL NVARCHAR(MAX);

DECLARE table_cursor CURSOR FOR
SELECT TABLE_NAME
FROM INFORMATION_SCHEMA.TABLES
WHERE TABLE_NAME IN ('imHCI', 'imInterCtrlMedicamento', 'imHCEvolucion', 'imFacPracticas', 'imHCEpicrisis');

OPEN table_cursor;
FETCH NEXT FROM table_cursor INTO @TableName;

WHILE @@FETCH_STATUS = 0
BEGIN
    SET @SQL = 'SELECT ''' + @TableName + ''' as Tabla, COUNT(*) as TotalRegistros FROM ' + @TableName;
    EXEC sp_executesql @SQL;
    FETCH NEXT FROM table_cursor INTO @TableName;
END;

CLOSE table_cursor;
DEALLOCATE table_cursor;
