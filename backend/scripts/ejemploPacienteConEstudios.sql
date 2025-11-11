-- Buscar un paciente con visita que tenga estudios completos (pedido + resultado)
SELECT TOP 1
    p.NumeroDocumento,
    p.ApellidoyNombre,
    v.NUMEROVISITA,
    MAX(v.FECHAADMISIONS) as FechaAdmision,
    v.CLASEPACIENTE,
    COUNT(pe.IdPedido) as TotalEstudios,
    SUM(CASE WHEN pr.IdProtocolo IS NOT NULL THEN 1 ELSE 0 END) as EstudiosConResultado
FROM imPacientes p
INNER JOIN imVisita v ON p.IdPaciente = v.IDPACIENTE
INNER JOIN imPedidosEstudios pe ON v.NUMEROVISITA = pe.IdVisita
LEFT JOIN imProtocolosResultados pr ON pe.IdProtocolo = pr.IdProtocolo
WHERE v.CLASEPACIENTE = 'I'
GROUP BY p.NumeroDocumento, p.ApellidoyNombre, v.NUMEROVISITA, v.CLASEPACIENTE
HAVING COUNT(pe.IdPedido) > 0
ORDER BY MAX(v.FECHAADMISIONS) DESC;

-- Ver detalle completo del primer paciente encontrado
SELECT 
    pe.IdPedido,
    pe.FechaPedido,
    LEFT(pe.NotasObservacion, 150) as PedidoResumen,
    pe.IdProtocolo,
    pe.EstadoUrgencia,
    pr.FechaResultado,
    pr.NroProtocolo,
    CASE WHEN pr.IdProtocolo IS NOT NULL THEN 'SI' ELSE 'NO' END as TieneResultado
FROM imPedidosEstudios pe
LEFT JOIN imProtocolosResultados pr ON pe.IdProtocolo = pr.IdProtocolo
WHERE pe.IdVisita = (
    SELECT TOP 1 v.NUMEROVISITA
    FROM imVisita v
    INNER JOIN imPedidosEstudios pe2 ON v.NUMEROVISITA = pe2.IdVisita
    WHERE v.CLASEPACIENTE = 'I'
    GROUP BY v.NUMEROVISITA, v.FECHAADMISIONS
    HAVING COUNT(pe2.IdPedido) > 0
    ORDER BY v.FECHAADMISIONS DESC
)
ORDER BY pe.FechaPedido DESC;
