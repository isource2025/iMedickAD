-- Buscar visitas que tengan pedidos de estudios CON resultados
SELECT TOP 10
    pe.IdVisita,
    pe.IdPedido,
    pe.FechaPedido,
    LEFT(pe.NotasObservacion, 100) as PedidoResumen,
    pr.IdProtocolo,
    pr.FechaResultado,
    LEFT(pr.TextoProtocolo, 100) as ResultadoResumen,
    pr.NroProtocolo
FROM imPedidosEstudios pe
INNER JOIN imProtocolosResultados pr ON pe.IdProtocolo = pr.IdProtocolo
WHERE pe.IdVisita IS NOT NULL
  AND pr.TextoProtocolo IS NOT NULL
  AND pe.NotasObservacion IS NOT NULL
ORDER BY pe.FechaPedido DESC;
