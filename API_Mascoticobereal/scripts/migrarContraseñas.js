const bcrypt = require('bcryptjs');
const sequelize = require('../database/conexion');
require('dotenv').config();

async function migrarContraseñas() {
  const [users] = await sequelize.query('SELECT id, contraseña FROM usuarios');
  let migrados = 0;

  for (const user of users) {
    const pw = user.contraseña;
    if (pw && !pw.startsWith('$2a$') && !pw.startsWith('$2b$') && !pw.startsWith('$2y$')) {
      const hashed = await bcrypt.hash(pw, 10);
      await sequelize.query('UPDATE usuarios SET contraseña = ? WHERE id = ?', {
        replacements: [hashed, user.id],
      });
      console.log(`Migrado usuario ID ${user.id}: contraseña hasheada`);
      migrados++;
    }
  }

  const [vets] = await sequelize.query('SELECT id, contraseña FROM veterinarios');
  for (const vet of vets) {
    const pw = vet.contraseña;
    if (pw && !pw.startsWith('$2a$') && !pw.startsWith('$2b$') && !pw.startsWith('$2y$')) {
      const hashed = await bcrypt.hash(pw, 10);
      await sequelize.query('UPDATE veterinarios SET contraseña = ? WHERE id = ?', {
        replacements: [hashed, vet.id],
      });
      console.log(`Migrado veterinario ID ${vet.id}: contraseña hasheada`);
      migrados++;
    }
  }

  console.log(`Migración completa. ${migrados} contraseñas actualizadas.`);
  process.exit(0);
}

migrarContraseñas().catch(err => {
  console.error('Error en migración:', err);
  process.exit(1);
});
