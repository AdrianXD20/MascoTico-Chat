const { DataTypes } = require('sequelize');
const sequelize = require('../database/conexion'); // Asegúrate de tener configurada la conexión

const categoria = sequelize.define('categoria_productos', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
    allowNull: false,
  },
  nombre: {
    type: DataTypes.STRING(50),
    allowNull: true,
  }
}, {
  tableName: 'categoria_productos', 
  timestamps: false,
});

module.exports = categoria;
