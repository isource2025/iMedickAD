-- Script para verificar cómo se relacionan imVisita con imHCEvolucion

-- 1. Ver datos de la visita 43900
PRINT '========================================';
PRINT '1. Datos de la visita 43900 en imVisita';
PRINT '========================================';
SELECT 
    NUMEROVISITA,
    IDPACIENTE,
    FECHAADMISIONS
FROM imVisita 
WHERE NUMEROVISITA = 43900;

PRINT '';
PRINT '';

-- 2. Buscar evoluciones con IdVisita = 43900
PRINT '========================================';
PRINT '2. Evoluciones con IdVisita = 43900';
PRINT '========================================';
SELECT 
    IdHCEvolucion,
    IdVisita,
    NroHC,
    FechaEv,
    LEFT(Evolucion, 50) as Evolucion_Preview
FROM imHCEvolucion
WHERE IdVisita = 43900;

PRINT '';
PRINT '';

-- 3. Ver si NroHC se relaciona con algo
PRINT '========================================';
PRINT '3. Verificar relación con NroHC';
PRINT '========================================';
SELECT TOP 5
    e.IdHCEvolucion,
    e.IdVisita,
    e.NroHC,
    v.NUMEROVISITA,
    v.IDPACIENTE,
    p.NumeroDocumento,
    CASE 
        WHEN e.IdVisita = v.NUMEROVISITA THEN 'IdVisita = NUMEROVISITA'
        WHEN e.NroHC = v.NUMEROVISITA THEN 'NroHC = NUMEROVISITA'
        WHEN e.NroHC = v.IDPACIENTE THEN 'NroHC = IDPACIENTE'
        ELSE 'Sin relación'
    END as TipoRelacion
FROM imHCEvolucion e
CROSS JOIN imVisita v
LEFT JOIN imPacientes p ON v.IDPACIENTE = p.IdPaciente
WHERE v.NUMEROVISITA = 43900
    AND (e.IdVisita = 43900 OR e.NroHC = 43900 OR e.IdVisita = v.IDPACIENTE OR e.NroHC = v.IDPACIENTE)
ORDER BY e.FechaEv DESC;

PRINT '';
PRINT '';

-- 4. Buscar evoluciones del paciente 94106858
PRINT '========================================';
PRINT '4. Evoluciones del paciente 94106858';
PRINT '========================================';
SELECT TOP 10
    e.IdHCEvolucion,
    e.IdVisita,
    e.NroHC,
    e.FechaEv,
    e.NumeroDocumento,
    LEFT(e.Evolucion, 50) as Evolucion_Preview
FROM imHCEvolucion e
WHERE e.NumeroDocumento = 94106858
ORDER BY e.FechaEv DESC;

PRINT '';
PRINT '';

-- 5. Intentar relacionar por NumeroDocumento
PRINT '========================================';
PRINT '5. Relación visita-evolución por documento';
PRINT '========================================';
SELECT 
    v.NUMEROVISITA,
    v.FECHAADMISIONS,
    e.IdHCEvolucion,
    e.IdVisita,
    e.NroHC,
    e.FechaEv,
    e.NumeroDocumento
FROM imVisita v
INNER JOIN imPacientes p ON v.IDPACIENTE = p.IdPaciente
LEFT JOIN imHCEvolucion e ON e.NumeroDocumento = p.NumeroDocumento
WHERE v.NUMEROVISITA = 43900
ORDER BY e.FechaEv DESC;
