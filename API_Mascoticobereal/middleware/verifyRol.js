const User = require('../Models/UserModel');
const Veterinario = require('../Models/veterinarioModel');

function verifyRol(req, res, next) {
  const userId = req.user.id;
  const model = req.user.tipo === 'veterinario' ? Veterinario : User;
  model.findByPk(userId, { attributes: ['rol'] }).then(record => {
    if (record && record.rol !== req.user.rol) {
      req.user.rol = record.rol;
    }
    next();
  }).catch(() => next());
}

module.exports = { verifyRol };
