const { DataTypes } = require('sequelize');
const sequelize = require('../database/conexion');/*
const User = require('./UserModel'); // Importa User después de definirlo*/

const Mascota = sequelize.define('Mascota', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  nombre: {
    type: DataTypes.STRING(50),
    allowNull: false,
    validate: {
      notEmpty: true,
    },
  },
}, {
  tableName: 'mascotas',
  timestamps: false,
});

/*
Mascota.belongsTo(User, {
  foreignKey: 'id_usuario',
  onDelete: 'CASCADE',
  onUpdate: 'CASCADE',
});*/

module.exports = Mascota;
