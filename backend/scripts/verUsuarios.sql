-- Ver todos los usuarios en la tabla
SELECT 
    IdUsuario,
    Usuario,
    Nombre,
    Email,
    HospitalAsignado,
    Activo,
    UltimoAcceso
FROM imUsuariosAuditores
ORDER BY IdUsuario;

-- Contar usuarios activos e inactivos
SELECT 
    Activo,
    COUNT(*) as Total
FROM imUsuariosAuditores
GROUP BY Activo;
