-- Script para buscar visitas con estudios que tengan archivos adjuntos

-- 1. Ver estructura de la tabla de adjuntos
SELECT TOP 5 * 
FROM imPedidosEstudiosAdjuntos;

-- 2. Contar adjuntos por visita
SELECT 
    v.NumeroVisita,
    v.IdPaciente,
    p.ApellidoNombre as NombrePaciente,
    COUNT(adj.IdAdjunto) as CantidadAdjuntos,
    MIN(adj.PatchServidor) as EjemploPath,
    MIN(adj.NombreArchivo) as EjemploArchivo
FROM imVisita v
INNER JOIN imPedidosEstudios pe ON v.NumeroVisita = pe.IdVisita
INNER JOIN imPedidosEstudiosAdjuntos adj ON pe.IdPedido = adj.IdPedido
LEFT JOIN imPacientes p ON v.IdPaciente = p.IdPaciente
GROUP BY v.NumeroVisita, v.IdPaciente, p.ApellidoNombre
ORDER BY CantidadAdjuntos DESC;

-- 3. Ver detalles de una visita específica con adjuntos
-- (Reemplazar @NumeroVisita con un valor del query anterior)
DECLARE @NumeroVisita INT = (
    SELECT TOP 1 v.NumeroVisita
    FROM imVisita v
    INNER JOIN imPedidosEstudios pe ON v.NumeroVisita = pe.IdVisita
    INNER JOIN imPedidosEstudiosAdjuntos adj ON pe.IdPedido = adj.IdPedido
    ORDER BY adj.FechaSubida DESC
);

SELECT 
    v.NumeroVisita,
    v.IdPaciente,
    p.ApellidoNombre as Paciente,
    v.FechaIngreso,
    pe.IdPedido,
    pe.NotasObservacion as PedidoEstudio,
    adj.IdAdjunto,
    adj.PatchServidor,
    adj.NombreArchivo,
    adj.FechaSubida
FROM imVisita v
INNER JOIN imPacientes p ON v.IdPaciente = p.IdPaciente
INNER JOIN imPedidosEstudios pe ON v.NumeroVisita = pe.IdVisita
INNER JOIN imPedidosEstudiosAdjuntos adj ON pe.IdPedido = adj.IdPedido
WHERE v.NumeroVisita = @NumeroVisita
ORDER BY adj.FechaSubida DESC;

-- 4. Buscar visitas recientes con adjuntos
SELECT TOP 10
    v.NumeroVisita,
    p.ApellidoNombre as Paciente,
    v.FechaIngreso,
    adj.NombreArchivo,
    adj.PatchServidor,
    adj.FechaSubida
FROM imVisita v
INNER JOIN imPacientes p ON v.IdPaciente = p.IdPaciente
INNER JOIN imPedidosEstudios pe ON v.NumeroVisita = pe.IdVisita
INNER JOIN imPedidosEstudiosAdjuntos adj ON pe.IdPedido = adj.IdPedido
WHERE adj.PatchServidor IS NOT NULL 
  AND adj.PatchServidor != ''
ORDER BY v.FechaIngreso DESC;

-- 5. Estadísticas de adjuntos
SELECT 
    COUNT(DISTINCT v.NumeroVisita) as VisitasConAdjuntos,
    COUNT(adj.IdAdjunto) as TotalAdjuntos,
    COUNT(DISTINCT pe.IdPedido) as EstudiosConAdjuntos
FROM imVisita v
INNER JOIN imPedidosEstudios pe ON v.NumeroVisita = pe.IdVisita
INNER JOIN imPedidosEstudiosAdjuntos adj ON pe.IdPedido = adj.IdPedido
WHERE adj.PatchServidor IS NOT NULL;
