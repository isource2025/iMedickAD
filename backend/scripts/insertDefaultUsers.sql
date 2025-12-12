-- ============================================================================
-- Script para crear usuarios por defecto en iMedicAD
-- Generado automáticamente: 2025-11-26
-- Base de datos: isource
-- ============================================================================

USE isource;
GO

-- Verificar si la tabla existe
IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'imUsuariosAuditores')
BEGIN
    PRINT '❌ Error: La tabla imUsuariosAuditores no existe';
    PRINT 'Ejecutar primero: scripts/createTable.sql';
    RETURN;
END
GO

PRINT '🔐 Creando usuarios por defecto...';
PRINT '';
GO

-- ============================================================================
-- USUARIO 1: Administrador General
-- Usuario: admin
-- Password: admin123
-- ============================================================================
IF NOT EXISTS (SELECT 1 FROM imUsuariosAuditores WHERE Usuario = 'admin')
BEGIN
    INSERT INTO imUsuariosAuditores (Usuario, Password, Nombre, Email, HospitalAsignado)
    VALUES ('admin', '$2a$10$Rc3SfQIsVH3L/Lwmy1sx6eVjNnES4OjWk9NpYRp7Wzkp149iXFAw2', 'Administrador General', 'admin@imedic.com', 'Administración Central');
    PRINT '✅ Usuario creado: admin';
END
ELSE
BEGIN
    PRINT '⚠️ Usuario ya existe: admin';
END
GO

-- ============================================================================
-- USUARIO 2: Auditor General
-- Usuario: auditor
-- Password: Auditor2025!
-- ============================================================================
IF NOT EXISTS (SELECT 1 FROM imUsuariosAuditores WHERE Usuario = 'auditor')
BEGIN
    INSERT INTO imUsuariosAuditores (Usuario, Password, Nombre, Email, HospitalAsignado)
    VALUES ('auditor', '$2a$10$LtyW1mKQcG928pzPDUvbguUPJVoPchQeBxn9Gs5SsiBgyHea7uq3q', 'Auditor General', 'auditor@imedic.com', 'Hospital Central');
    PRINT '✅ Usuario creado: auditor';
END
ELSE
BEGIN
    PRINT '⚠️ Usuario ya existe: auditor';
END
GO

-- ============================================================================
-- USUARIO 3: Usuario Demo
-- Usuario: demo
-- Password: Demo2025!
-- ============================================================================
IF NOT EXISTS (SELECT 1 FROM imUsuariosAuditores WHERE Usuario = 'demo')
BEGIN
    INSERT INTO imUsuariosAuditores (Usuario, Password, Nombre, Email, HospitalAsignado)
    VALUES ('demo', '$2a$10$9ovwgU7Y3u8LUcYv6tZpT.IqBO3FvPWFn5mNspHI9Dge03k.4t/Ni', 'Usuario Demo', 'demo@imedic.com', 'Hospital Demo');
    PRINT '✅ Usuario creado: demo';
END
ELSE
BEGIN
    PRINT '⚠️ Usuario ya existe: demo';
END
GO

PRINT '';
PRINT '📊 Verificando usuarios creados...';
PRINT '';
GO

-- Verificar usuarios creados
SELECT 
    IdUsuario,
    Usuario,
    Nombre,
    Email,
    HospitalAsignado,
    Activo,
    FechaCreacion,
    UltimoAcceso
FROM imUsuariosAuditores
ORDER BY IdUsuario;
GO

-- Mostrar resumen
PRINT '';
PRINT '╔════════════════════════════════════════════════════════════╗';
PRINT '║  CREDENCIALES DE ACCESO                                   ║';
PRINT '╚════════════════════════════════════════════════════════════╝';
PRINT '';
PRINT '1. Administrador General';
PRINT '   Usuario:  admin';
PRINT '   Password: admin123';
PRINT '   Hospital: Administración Central';
PRINT '';
PRINT '2. Auditor General';
PRINT '   Usuario:  auditor';
PRINT '   Password: Auditor2025!';
PRINT '   Hospital: Hospital Central';
PRINT '';
PRINT '3. Usuario Demo';
PRINT '   Usuario:  demo';
PRINT '   Password: Demo2025!';
PRINT '   Hospital: Hospital Demo';
PRINT '';
PRINT '⚠️ IMPORTANTE: Cambia estas contraseñas en producción';
PRINT '';
GO
