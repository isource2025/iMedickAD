-- Ver estructura completa de imProtocolosResultados
SELECT COLUMN_NAME, DATA_TYPE, CHARACTER_MAXIMUM_LENGTH, IS_NULLABLE
FROM INFORMATION_SCHEMA.COLUMNS
WHERE TABLE_NAME = 'imProtocolosResultados'
ORDER BY ORDINAL_POSITION;

-- Ver estructura completa de imPedidosEstudios
SELECT COLUMN_NAME, DATA_TYPE, CHARACTER_MAXIMUM_LENGTH, IS_NULLABLE
FROM INFORMATION_SCHEMA.COLUMNS
WHERE TABLE_NAME = 'imPedidosEstudios'
ORDER BY ORDINAL_POSITION;

-- Probar JOIN entre ambas tablas para una visita específica
SELECT TOP 5
    pe.IdPedido,
    pe.FechaPedido,
    pe.NotasObservacion as PedidoEstudio,
    pe.IdProtocolo,
    pr.IdProtocolo as ProtocoloId,
    pr.FechaResultado,
    pr.TextoProtocolo as ResultadoEstudio,
    pr.NroProtocolo
FROM imPedidosEstudios pe
LEFT JOIN imProtocolosResultados pr ON pe.IdProtocolo = pr.IdProtocolo
WHERE pe.IdVisita IS NOT NULL
ORDER BY pe.IdPedido DESC;

-- Ver ejemplo con visita específica (43900)
SELECT 
    pe.IdPedido,
    pe.FechaPedido,
    pe.NotasObservacion as PedidoEstudio,
    pe.IdProtocolo,
    pr.FechaResultado,
    pr.TextoProtocolo as ResultadoEstudio,
    pr.NroProtocolo
FROM imPedidosEstudios pe
LEFT JOIN imProtocolosResultados pr ON pe.IdProtocolo = pr.IdProtocolo
WHERE pe.IdVisita = 43900;
