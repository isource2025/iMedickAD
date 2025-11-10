-- Verificar si existe HC de Ingreso para la visita 43900
SELECT 
    COUNT(*) as TotalRegistros
FROM imHCI
WHERE NumeroVisita = 43900;

-- Ver el registro completo si existe
SELECT TOP 1 *
FROM imHCI
WHERE NumeroVisita = 43900;

-- Ver todas las visitas que SÍ tienen HC de Ingreso del paciente 94106858
SELECT 
    hci.NumeroVisita,
    v.FECHAADMISIONS as FechaAdmision,
    v.CLASEPACIENTE,
    v.TIPOADMISION,
    hci.MotivoConsulta,
    hci.IMPRESIONDIAGNOSTICA
FROM imHCI hci
INNER JOIN imVisita v ON hci.NumeroVisita = v.NUMEROVISITA
WHERE v.IDPACIENTE = (SELECT IdPaciente FROM imPacientes WHERE NumeroDocumento = 94106858)
ORDER BY v.FECHAADMISIONS DESC;

-- Contar cuántas visitas del paciente tienen HC de Ingreso
SELECT 
    COUNT(*) as VisitasConHCI
FROM imHCI hci
INNER JOIN imVisita v ON hci.NumeroVisita = v.NUMEROVISITA
WHERE v.IDPACIENTE = (SELECT IdPaciente FROM imPacientes WHERE NumeroDocumento = 94106858);
