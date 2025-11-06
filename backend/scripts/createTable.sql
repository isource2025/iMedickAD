-- Script para crear tabla de usuarios auditores
-- Ejecutar en SQL Server Management Studio

USE iMedic;
GO

-- Verificar si la tabla ya existe
IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'imUsuariosAuditores')
BEGIN
    -- Crear tabla de usuarios auditores
    CREATE TABLE imUsuariosAuditores (
        IdUsuario INT PRIMARY KEY IDENTITY(1,1),
        Usuario VARCHAR(50) NOT NULL UNIQUE,
        Password VARCHAR(255) NOT NULL,
        Nombre VARCHAR(100) NOT NULL,
        Email VARCHAR(100),
        HospitalAsignado VARCHAR(100) NOT NULL,
        Activo BIT DEFAULT 1,
        FechaCreacion DATETIME DEFAULT GETDATE(),
        UltimoAcceso DATETIME
    );

    -- Crear índices
    CREATE INDEX IDX_Usuario ON imUsuariosAuditores(Usuario);
    CREATE INDEX IDX_Hospital ON imUsuariosAuditores(HospitalAsignado);

    PRINT '✅ Tabla imUsuariosAuditores creada exitosamente';
END
ELSE
BEGIN
    PRINT '⚠️ La tabla imUsuariosAuditores ya existe';
END
GO

-- Ejemplo de inserción de usuario (reemplazar el hash con uno generado)
-- Password de ejemplo: "admin123"
-- Generar hash con: node scripts/createUser.js admin123

/*
INSERT INTO imUsuariosAuditores (Usuario, Password, Nombre, Email, HospitalAsignado)
VALUES (
    'auditor1',
    '$2a$10$HASH_GENERADO_AQUI',
    'Juan Pérez',
    'juan.perez@hospital.com',
    'Hospital Central'
);
*/

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
FROM imUsuariosAuditores;
GO
