-- Ver información completa del paciente y visita
SELECT 
    p.NumeroDocumento,
    p.ApellidoyNombre,
    p.FechaNacimiento,
    p.Sexo,
    v.NUMEROVISITA,
    v.FECHAADMISIONS as FechaAdmision,
    v.FECHAEGRESO as FechaEgreso,
    v.SERVICIOHOSPITAL,
    v.VALORSECTOR,
    v.CLASEPACIENTE,
    v.ESTADO
FROM imPacientes p
INNER JOIN imVisita v ON p.IdPaciente = v.IDPACIENTE
WHERE v.NUMEROVISITA = 363192;

-- Ver estudios de esta visita
SELECT 
    pe.IdPedido,
    pe.FechaPedido,
    pe.NotasObservacion as PedidoEstudio,
    pe.IdProtocolo,
    pe.EstadoUrgencia,
    pr.FechaResultado,
    pr.NroProtocolo,
    LEFT(pr.TextoProtocolo, 200) as ResultadoResumen,
    CASE WHEN pr.IdProtocolo IS NOT NULL THEN 'SI' ELSE 'NO' END as TieneResultado
FROM imPedidosEstudios pe
LEFT JOIN imProtocolosResultados pr ON pe.IdProtocolo = pr.IdProtocolo
WHERE pe.IdVisita = 363192
ORDER BY pe.FechaPedido DESC;
