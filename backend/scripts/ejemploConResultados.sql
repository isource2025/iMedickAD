-- Buscar paciente con estudios que TENGAN resultados
SELECT TOP 1
    p.NumeroDocumento,
    p.ApellidoyNombre,
    v.NUMEROVISITA,
    MAX(v.FECHAADMISIONS) as FechaAdmision,
    COUNT(pe.IdPedido) as TotalEstudios,
    SUM(CASE WHEN pr.IdProtocolo IS NOT NULL THEN 1 ELSE 0 END) as EstudiosConResultado
FROM imPacientes p
INNER JOIN imVisita v ON p.IdPaciente = v.IDPACIENTE
INNER JOIN imPedidosEstudios pe ON v.NUMEROVISITA = pe.IdVisita
INNER JOIN imProtocolosResultados pr ON pe.IdProtocolo = pr.IdProtocolo
WHERE v.CLASEPACIENTE = 'I'
  AND pr.TextoProtocolo IS NOT NULL
GROUP BY p.NumeroDocumento, p.ApellidoyNombre, v.NUMEROVISITA
HAVING SUM(CASE WHEN pr.IdProtocolo IS NOT NULL THEN 1 ELSE 0 END) > 0
ORDER BY MAX(v.FECHAADMISIONS) DESC;
