-- Verificar la relación entre IdVisita y NUMEROVISITA

-- Consulta 1: Ver si IdVisita = NUMEROVISITA
SELECT 
    v.NUMEROVISITA,
    v.IDPACIENTE,
    (SELECT COUNT(*) FROM imHCEvolucion WHERE IdVisita = v.NUMEROVISITA) as EvolucionesConNumeroVisita,
    (SELECT COUNT(*) FROM imHCEpicrisis WHERE IdVisita = v.NUMEROVISITA) as EpicrisisConNumeroVisita
FROM imVisita v
WHERE v.NUMEROVISITA IN (43900, 44149, 44305, 28527, 7);

-- Consulta 2: Ver datos de ejemplo de imHCEvolucion
SELECT TOP 5 
    IdHCEvolucion,
    IdVisita,
    Fecha,
    Hora,
    LEFT(Evolucion, 100) as Evolucion_Preview
FROM imHCEvolucion
WHERE IdVisita IN (43900, 44149, 44305, 28527, 7)
ORDER BY Fecha DESC;

-- Consulta 3: Ver datos de ejemplo de imHCEpicrisis
SELECT TOP 5 
    IdHCEpicrisis,
    IdVisita,
    Fecha,
    LEFT(Epicrisis, 100) as Epicrisis_Preview,
    Diagnostico
FROM imHCEpicrisis
WHERE IdVisita IN (43900, 44149, 44305, 28527, 7);
