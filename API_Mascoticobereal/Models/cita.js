const { DataTypes } = require('sequelize');
const sequelize = require('../config/database'); // Ajusta la ruta a tu config de DB
const User = require('./User'); // Ajusta la ruta a tu modelo de Usuario

const Cita = sequelize.define('Cita', {
  id_cita: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  id_usuario: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: User,
      key: 'id'
    }
  },
  veterinario: {
    type: DataTypes.STRING,
    allowNull: false,
    defaultValue: 'Especialista MascoTico'
  },
  fecha: {
    type: DataTypes.DATEONLY,
    allowNull: false
  },
  hora: {
    type: DataTypes.STRING,
    allowNull: false
  },
  motivo: {
    type: DataTypes.STRING,
    allowNull: true,
    defaultValue: 'Consulta General'
  }
}, {
  tableName: 'citas',
  timestamps: false
});

// Definir la relación: Un usuario tiene muchas citas
User.hasMany(Cita, { foreignKey: 'id_usuario' });
Cita.belongsTo(User, { foreignKey: 'id_usuario' });

module.exports = Cita;