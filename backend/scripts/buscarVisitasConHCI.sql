-- Buscar visitas de internación que SÍ tengan HC de Ingreso
SELECT TOP 10
    v.NUMEROVISITA,
    p.NumeroDocumento,
    p.ApellidoyNombre,
    v.FECHAADMISIONS as FechaAdmision,
    v.CLASEPACIENTE,
    v.TIPOADMISION,
    v.SERVICIOHOSPITAL,
    hci.MotivoConsulta,
    LEFT(hci.IMPRESIONDIAGNOSTICA, 100) as ImpresionDiagnostica
FROM imHCI hci
INNER JOIN imVisita v ON hci.NumeroVisita = v.NUMEROVISITA
INNER JOIN imPacientes p ON v.IDPACIENTE = p.IdPaciente
WHERE v.CLASEPACIENTE = 'I' -- Solo internaciones
  AND v.TIPOADMISION = 'I'
  AND hci.MotivoConsulta IS NOT NULL
ORDER BY v.FECHAADMISIONS DESC;
