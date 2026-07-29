const { DataTypes } = require('sequelize');
const sequelize = require('../database/conexion');

const Veterinario = sequelize.define('Veterinario', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  nombre: {
    type: DataTypes.STRING(230),
    allowNull: false,
  },
  cedula: {
    type: DataTypes.STRING(20),
    allowNull: false,
    unique: true,
  },
  imagen_perfil: {
    type: DataTypes.STRING(230),
    allowNull: true,
  },
  email: {
    type: DataTypes.STRING(100),
    allowNull: false,
    unique: true,
  },
  contraseña: {
    type: DataTypes.STRING(100),
    allowNull: false,
  },
  celular: {
    type: DataTypes.STRING(20),
    allowNull: true,
  },
  mascota: {
    type: DataTypes.INTEGER,
    allowNull: true,
  },
  direccion: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  calificacion: {
    type: DataTypes.DECIMAL(2, 1),
    allowNull: true,
  },
  rol: {
    type: DataTypes.STRING(20),
    defaultValue: 'admin',
  },
  hora_apertura: {
    type: DataTypes.TIME,
    defaultValue: '09:00:00',
  },
  hora_cierre: {
    type: DataTypes.TIME,
    defaultValue: '18:00:00',
  },
}, {
  tableName: 'veterinarios',
  timestamps: false,
});

module.exports = Veterinario;
