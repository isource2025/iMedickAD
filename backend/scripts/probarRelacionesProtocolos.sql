-- Script para probar las relaciones entre Protocolos, Prácticas y Profesionales
-- Ejecutar en SQL Server Management Studio o Azure Data Studio

-- ============================================
-- 1. Verificar protocolos con prácticas
-- ============================================
PRINT '========================================';
PRINT '1. Protocolos con sus prácticas asociadas';
PRINT '========================================';

SELECT TOP 10
    p.IdProtocolo,
    p.NroProtocolo,
    p.NumeroVisita,
    p.IdPaciente,
    p.FechaProtocolo,
    p.HoraProtocolo,
    COUNT(pr.IdPractica) as CantidadPracticas
FROM imHCProtocolosPtes p
LEFT JOIN imFACPracticas pr ON p.IdProtocolo = pr.IdProtocolo
WHERE p.NumeroVisita IS NOT NULL
GROUP BY p.IdProtocolo, p.NroProtocolo, p.NumeroVisita, p.IdPaciente, p.FechaProtocolo, p.HoraProtocolo
ORDER BY p.FechaProtocolo DESC;

PRINT '';
PRINT '';

-- ============================================
-- 2. Detalle de prácticas por protocolo
-- ============================================
PRINT '========================================';
PRINT '2. Detalle de prácticas de un protocolo específico';
PRINT '========================================';

-- Obtener un protocolo de ejemplo
DECLARE @IdProtocoloEjemplo INT;
SELECT TOP 1 @IdProtocoloEjemplo = IdProtocolo 
FROM imHCProtocolosPtes 
WHERE NumeroVisita IS NOT NULL 
ORDER BY FechaProtocolo DESC;

PRINT 'Protocolo ejemplo: ' + CAST(@IdProtocoloEjemplo AS VARCHAR);
PRINT '';

SELECT 
    pr.IdPractica,
    pr.Practica as CodigoPractica,
    pr.TipoPractica,
    pr.CantidadPractica,
    pr.FechaPractica,
    pr.HoraPracticaInicio,
    pr.HoraPracticaFin,
    pr.Observaciones
FROM imFACPracticas pr
WHERE pr.IdProtocolo = @IdProtocoloEjemplo;

PRINT '';
PRINT '';

-- ============================================
-- 3. Protocolos con información del profesional
-- ============================================
PRINT '========================================';
PRINT '3. Protocolos con información del profesional';
PRINT '========================================';

SELECT TOP 10
    p.IdProtocolo,
    p.NroProtocolo,
    p.NumeroVisita,
    p.FechaProtocolo,
    p.IdProfesional,
    prof.Nombre as NombreProfesional,
    prof.Matricula as MatriculaProfesional
FROM imHCProtocolosPtes p
LEFT JOIN imFacProfesionales prof ON p.IdProfesional = prof.IdProfesional
WHERE p.NumeroVisita IS NOT NULL
ORDER BY p.FechaProtocolo DESC;

PRINT '';
PRINT '';

-- ============================================
-- 4. Protocolos por visita específica
-- ============================================
PRINT '========================================';
PRINT '4. Protocolos de una visita específica';
PRINT '========================================';

-- Obtener una visita de ejemplo que tenga protocolos
DECLARE @NumeroVisitaEjemplo INT;
SELECT TOP 1 @NumeroVisitaEjemplo = NumeroVisita 
FROM imHCProtocolosPtes 
WHERE NumeroVisita IS NOT NULL 
GROUP BY NumeroVisita
HAVING COUNT(*) > 0
ORDER BY NumeroVisita DESC;

PRINT 'Visita ejemplo: ' + CAST(@NumeroVisitaEjemplo AS VARCHAR);
PRINT '';

SELECT 
    p.IdProtocolo,
    p.NroProtocolo,
    p.FechaProtocolo,
    p.HoraProtocolo,
    p.IdProfesional,
    prof.Nombre as NombreProfesional,
    COUNT(pr.IdPractica) as CantidadPracticas
FROM imHCProtocolosPtes p
LEFT JOIN imFacProfesionales prof ON p.IdProfesional = prof.IdProfesional
LEFT JOIN imFACPracticas pr ON p.IdProtocolo = pr.IdProtocolo
WHERE p.NumeroVisita = @NumeroVisitaEjemplo
GROUP BY p.IdProtocolo, p.NroProtocolo, p.FechaProtocolo, p.HoraProtocolo, p.IdProfesional, prof.Nombre
ORDER BY p.FechaProtocolo DESC;

PRINT '';
PRINT '';

-- ============================================
-- 5. Estadísticas generales
-- ============================================
PRINT '========================================';
PRINT '5. Estadísticas generales de protocolos';
PRINT '========================================';

SELECT 
    'Total Protocolos' as Metrica,
    COUNT(*) as Valor
FROM imHCProtocolosPtes
UNION ALL
SELECT 
    'Protocolos con NumeroVisita',
    COUNT(*)
FROM imHCProtocolosPtes
WHERE NumeroVisita IS NOT NULL
UNION ALL
SELECT 
    'Protocolos con Prácticas',
    COUNT(DISTINCT pr.IdProtocolo)
FROM imFACPracticas pr
WHERE pr.IdProtocolo IS NOT NULL
UNION ALL
SELECT 
    'Total Prácticas en Protocolos',
    COUNT(*)
FROM imFACPracticas
WHERE IdProtocolo IS NOT NULL;

PRINT '';
PRINT '';

-- ============================================
-- 6. Ejemplo completo: Protocolo con todas sus relaciones
-- ============================================
PRINT '========================================';
PRINT '6. Ejemplo completo de un protocolo';
PRINT '========================================';

-- Obtener un protocolo que tenga prácticas
DECLARE @IdProtocoloCompleto INT;
SELECT TOP 1 @IdProtocoloCompleto = p.IdProtocolo
FROM imHCProtocolosPtes p
INNER JOIN imFACPracticas pr ON p.IdProtocolo = pr.IdProtocolo
WHERE p.NumeroVisita IS NOT NULL
ORDER BY p.FechaProtocolo DESC;

PRINT 'Protocolo completo ID: ' + CAST(@IdProtocoloCompleto AS VARCHAR);
PRINT '';

-- Datos del protocolo
PRINT 'Datos del Protocolo:';
SELECT 
    p.*,
    prof.Nombre as NombreProfesional,
    prof.Matricula as MatriculaProfesional
FROM imHCProtocolosPtes p
LEFT JOIN imFacProfesionales prof ON p.IdProfesional = prof.IdProfesional
WHERE p.IdProtocolo = @IdProtocoloCompleto;

PRINT '';
PRINT 'Prácticas del Protocolo:';
SELECT 
    pr.IdPractica,
    pr.Practica,
    pr.TipoPractica,
    pr.CantidadPractica,
    pr.FechaPractica,
    pr.HoraPracticaInicio,
    pr.HoraPracticaFin,
    pr.Observaciones
FROM imFACPracticas pr
WHERE pr.IdProtocolo = @IdProtocoloCompleto;
