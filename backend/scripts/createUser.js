const bcrypt = require('bcryptjs');

/**
 * Script para generar hash de contraseña
 * Uso: node createUser.js <contraseña>
 */

const password = process.argv[2];

if (!password) {
  console.error('❌ Error: Debe proporcionar una contraseña');
  console.log('Uso: node createUser.js <contraseña>');
  process.exit(1);
}

bcrypt.hash(password, 10)
  .then(hash => {
    console.log('\n✅ Hash generado exitosamente:');
    console.log('\n' + hash + '\n');
    console.log('Usar este hash en el INSERT de SQL Server:');
    console.log(`
INSERT INTO imUsuariosAuditores (Usuario, Password, Nombre, Email, HospitalAsignado)
VALUES (
    'usuario_ejemplo',
    '${hash}',
    'Nombre Completo',
    'email@hospital.com',
    'Hospital Asignado'
);
    `);
  })
  .catch(err => {
    console.error('❌ Error al generar hash:', err);
    process.exit(1);
  });
