/**
 * Script para verificar y crear usuarios de acceso
 */

const bcrypt = require('bcryptjs');
const { getConnection, closeConnection } = require('../config/db');

console.log('\n╔════════════════════════════════════════════════════════════╗');
console.log('║  iMedicAD - Verificar y Crear Usuarios                    ║');
console.log('╚════════════════════════════════════════════════════════════╝\n');

async function verificarYCrearUsuarios() {
  let pool = null;

  try {
    console.log('📡 Conectando a la base de datos...');
    pool = await getConnection();
    console.log('✅ Conexión establecida\n');

    // Verificar si la tabla existe
    console.log('🔍 Verificando tabla imUsuariosAuditores...');
    const checkTableQuery = `
      SELECT COUNT(*) as existe 
      FROM INFORMATION_SCHEMA.TABLES 
      WHERE TABLE_NAME = 'imUsuariosAuditores'
    `;
    const tableResult = await pool.request().query(checkTableQuery);
    
    if (tableResult.recordset[0].existe === 0) {
      console.log('❌ La tabla imUsuariosAuditores NO existe');
      console.log('\n📝 Creando tabla...\n');
      
      const createTableQuery = `
        CREATE TABLE imUsuariosAuditores (
          IdUsuario INT PRIMARY KEY IDENTITY(1,1),
          Usuario VARCHAR(50) NOT NULL UNIQUE,
          Password VARCHAR(255) NOT NULL,
          Nombre VARCHAR(100) NOT NULL,
          Email VARCHAR(100),
          HospitalAsignado VARCHAR(100) NOT NULL,
          Activo BIT DEFAULT 1,
          FechaCreacion DATETIME DEFAULT GETDATE(),
          UltimoAcceso DATETIME NULL
        )
      `;
      
      await pool.request().query(createTableQuery);
      console.log('✅ Tabla creada exitosamente\n');
    } else {
      console.log('✅ La tabla existe\n');
    }

    // Verificar usuarios existentes
    console.log('🔍 Verificando usuarios existentes...');
    const checkUsersQuery = 'SELECT Usuario, Nombre FROM imUsuariosAuditores';
    const usersResult = await pool.request().query(checkUsersQuery);
    
    console.log(`📊 Usuarios encontrados: ${usersResult.recordset.length}\n`);
    
    if (usersResult.recordset.length > 0) {
      console.log('👥 Usuarios existentes:');
      usersResult.recordset.forEach(u => {
        console.log(`   - ${u.Usuario} (${u.Nombre})`);
      });
      console.log('');
    }

    // Definir usuarios a crear
    const usuarios = [
      {
        usuario: 'admin',
        password: 'admin123',
        nombre: 'Administrador General',
        email: 'admin@imedic.com',
        hospital: 'Administración Central'
      },
      {
        usuario: 'auditor',
        password: 'Auditor2025!',
        nombre: 'Auditor General',
        email: 'auditor@imedic.com',
        hospital: 'Hospital Central'
      },
      {
        usuario: 'demo',
        password: 'Demo2025!',
        nombre: 'Usuario Demo',
        email: 'demo@imedic.com',
        hospital: 'Hospital Demo'
      }
    ];

    console.log('🔐 Creando/Actualizando usuarios...\n');

    for (const user of usuarios) {
      // Verificar si el usuario ya existe
      const checkUserQuery = `
        SELECT IdUsuario FROM imUsuariosAuditores WHERE Usuario = @usuario
      `;
      const userExists = await pool.request()
        .input('usuario', user.usuario)
        .query(checkUserQuery);

      const hash = await bcrypt.hash(user.password, 10);

      if (userExists.recordset.length === 0) {
        // Crear nuevo usuario
        const insertQuery = `
          INSERT INTO imUsuariosAuditores (Usuario, Password, Nombre, Email, HospitalAsignado)
          VALUES (@usuario, @password, @nombre, @email, @hospital)
        `;
        
        await pool.request()
          .input('usuario', user.usuario)
          .input('password', hash)
          .input('nombre', user.nombre)
          .input('email', user.email)
          .input('hospital', user.hospital)
          .query(insertQuery);
        
        console.log(`✅ Usuario creado: ${user.usuario}`);
      } else {
        // Actualizar contraseña del usuario existente
        const updateQuery = `
          UPDATE imUsuariosAuditores 
          SET Password = @password, Activo = 1
          WHERE Usuario = @usuario
        `;
        
        await pool.request()
          .input('usuario', user.usuario)
          .input('password', hash)
          .query(updateQuery);
        
        console.log(`🔄 Usuario actualizado: ${user.usuario}`);
      }
    }

    console.log('\n╔════════════════════════════════════════════════════════════╗');
    console.log('║  ✅ CREDENCIALES DE ACCESO                                ║');
    console.log('╚════════════════════════════════════════════════════════════╝\n');

    console.log('┌─────────────┬──────────────────┬─────────────────────────────┐');
    console.log('│   Usuario   │    Contraseña    │            Rol              │');
    console.log('├─────────────┼──────────────────┼─────────────────────────────┤');
    console.log('│   admin     │   admin123       │  Administrador General      │');
    console.log('│   auditor   │   Auditor2025!   │  Auditor General            │');
    console.log('│   demo      │   Demo2025!      │  Usuario Demo               │');
    console.log('└─────────────┴──────────────────┴─────────────────────────────┘\n');

    console.log('🌐 URL de acceso: http://localhost:3000/login\n');
    console.log('✅ Todos los usuarios están listos para usar\n');

  } catch (error) {
    console.error('\n❌ Error:', error.message);
    console.error('\n📋 Detalles del error:');
    console.error(error);
  } finally {
    if (pool) {
      await closeConnection();
    }
  }
}

// Ejecutar
verificarYCrearUsuarios()
  .then(() => {
    console.log('✅ Proceso completado\n');
    process.exit(0);
  })
  .catch(error => {
    console.error('❌ Error fatal:', error);
    process.exit(1);
  });
