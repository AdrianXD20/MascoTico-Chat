const { DataTypes } = require('sequelize');
const sequelize = require('../database/conexion'); 
const User = require('./UserModel'); 

const Cita = sequelize.define('Cita', {
  id: {
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
  id_veterinario: {
    type: DataTypes.INTEGER, // Cambiado a INTEGER porque en tu BD es int(11)
    allowNull: false
  },
  fecha_cita: {
    type: DataTypes.DATEONLY,
    allowNull: false
  },
  hora: {
    type: DataTypes.STRING,
    allowNull: false
  },
  razon: {
    type: DataTypes.TEXT, // Cambiado a TEXT porque en tu BD es text
    allowNull: true,
    defaultValue: 'Consulta General'
  },
  mascota: {
    type: DataTypes.INTEGER, // Cambiado a INTEGER porque en tu BD es int(11)
    allowNull: false
  }
}, {
  tableName: 'citas',
  timestamps: false
});

// Relaciones usando la llave id_usuario que existe en tu BD
User.hasMany(Cita, { foreignKey: 'id_usuario' });
Cita.belongsTo(User, { foreignKey: 'id_usuario' });

module.exports = Cita;  