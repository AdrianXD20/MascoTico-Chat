const { DataTypes } = require('sequelize');
const sequelize = require('../database/conexion');

const Ventas = sequelize.define('Ventas', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  id_usuario: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  total: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
  },
  estado: {
    type: DataTypes.ENUM('pendiente', 'completada', 'cancelada'),
    allowNull: false,
    defaultValue: 'pendiente',
  },
  fecha_creacion: {
    type: DataTypes.DATE,
    allowNull: true,
  }
}, {
  tableName: 'ventas',
  timestamps: false,
});

module.exports = Ventas;