# Script PowerShell para obtener la estructura de las tablas de visitas
# Ejecutar: .\GetTableStructures.ps1

$ServerName = "WEBDEV"
$DatabaseName = "vidal"
$OutputFile = ".\table_structures_output.txt"

# Limpiar archivo de salida si existe
if (Test-Path $OutputFile) {
    Remove-Item $OutputFile
}

Write-Host "Conectando a SQL Server: $ServerName" -ForegroundColor Green
Write-Host "Base de datos: $DatabaseName" -ForegroundColor Green
Write-Host ""

# Función para ejecutar consulta y guardar resultado
function Execute-SqlQuery {
    param (
        [string]$Query,
        [string]$Description
    )
    
    Write-Host "Ejecutando: $Description" -ForegroundColor Yellow
    
    try {
        $result = sqlcmd -S $ServerName -d $DatabaseName -E -Q $Query -W -s"," -w 1000
        
        # Agregar al archivo
        Add-Content -Path $OutputFile -Value "========================================="
        Add-Content -Path $OutputFile -Value $Description
        Add-Content -Path $OutputFile -Value "========================================="
        Add-Content -Path $OutputFile -Value $result
        Add-Content -Path $OutputFile -Value ""
        Add-Content -Path $OutputFile -Value ""
        
        Write-Host "Completado" -ForegroundColor Green
    }
    catch {
        Write-Host "Error: $_" -ForegroundColor Red
        Add-Content -Path $OutputFile -Value "ERROR: $_"
    }
}

# Array de tablas a analizar
$tables = @(
    "imHCI",
    "imInterCtrlMedicamento",
    "imHCEvolucion",
    "imFacPracticas",
    "imHCEpicrisis"
)

Write-Host ""
Write-Host "Analizando tablas..." -ForegroundColor Cyan
Write-Host ""

# Para cada tabla, obtener estructura y datos de ejemplo
foreach ($table in $tables) {
    Write-Host "Procesando tabla: $table" -ForegroundColor Magenta
    
    # Estructura de la tabla
    $structureQuery = "SELECT COLUMN_NAME as Columna, DATA_TYPE as TipoDato, CHARACTER_MAXIMUM_LENGTH as Longitud, IS_NULLABLE as Nullable, COLUMN_DEFAULT as ValorPorDefecto FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = '$table' ORDER BY ORDINAL_POSITION"
    
    Execute-SqlQuery -Query $structureQuery -Description "ESTRUCTURA DE TABLA: $table"
    
    # Datos de ejemplo
    $dataQuery = "SELECT TOP 3 * FROM $table"
    Execute-SqlQuery -Query $dataQuery -Description "DATOS DE EJEMPLO: $table"
    
    # Contar registros
    $countQuery = "SELECT COUNT(*) as TotalRegistros FROM $table"
    Execute-SqlQuery -Query $countQuery -Description "TOTAL DE REGISTROS: $table"
    
    Write-Host ""
}

# Buscar columnas que contengan NUMEROVISITA
Write-Host "Buscando relaciones con NUMEROVISITA..." -ForegroundColor Cyan
$relationQuery = "SELECT TABLE_NAME as Tabla, COLUMN_NAME as Columna, DATA_TYPE as TipoDato FROM INFORMATION_SCHEMA.COLUMNS WHERE COLUMN_NAME LIKE '%NUMEROVISITA%' AND TABLE_NAME IN ('imHCI', 'imInterCtrlMedicamento', 'imHCEvolucion', 'imFacPracticas', 'imHCEpicrisis') ORDER BY TABLE_NAME"

Execute-SqlQuery -Query $relationQuery -Description "COLUMNAS CON NUMEROVISITA"

# Buscar otras posibles columnas de relación
Write-Host "Buscando otras columnas de relacion..." -ForegroundColor Cyan
$otherRelationsQuery = "SELECT TABLE_NAME as Tabla, COLUMN_NAME as Columna, DATA_TYPE as TipoDato FROM INFORMATION_SCHEMA.COLUMNS WHERE (COLUMN_NAME LIKE '%VISITA%' OR COLUMN_NAME LIKE '%IDPACIENTE%' OR COLUMN_NAME LIKE '%PACIENTE%') AND TABLE_NAME IN ('imHCI', 'imInterCtrlMedicamento', 'imHCEvolucion', 'imFacPracticas', 'imHCEpicrisis') ORDER BY TABLE_NAME, COLUMN_NAME"

Execute-SqlQuery -Query $otherRelationsQuery -Description "OTRAS COLUMNAS DE RELACION"

# Buscar claves primarias
Write-Host "Identificando claves primarias..." -ForegroundColor Cyan
$pkQuery = "SELECT tc.TABLE_NAME as Tabla, kcu.COLUMN_NAME as ColumnaClavePrimaria FROM INFORMATION_SCHEMA.TABLE_CONSTRAINTS tc JOIN INFORMATION_SCHEMA.KEY_COLUMN_USAGE kcu ON tc.CONSTRAINT_NAME = kcu.CONSTRAINT_NAME WHERE tc.CONSTRAINT_TYPE = 'PRIMARY KEY' AND tc.TABLE_NAME IN ('imHCI', 'imInterCtrlMedicamento', 'imHCEvolucion', 'imFacPracticas', 'imHCEpicrisis') ORDER BY tc.TABLE_NAME"

Execute-SqlQuery -Query $pkQuery -Description "CLAVES PRIMARIAS"

Write-Host ""
Write-Host "=========================================" -ForegroundColor Green
Write-Host "Proceso completado exitosamente" -ForegroundColor Green
Write-Host "=========================================" -ForegroundColor Green
Write-Host ""
Write-Host "Archivo generado: $OutputFile" -ForegroundColor Cyan
Write-Host ""
Write-Host "Para ver el archivo, ejecuta: notepad $OutputFile" -ForegroundColor Yellow
Write-Host ""
