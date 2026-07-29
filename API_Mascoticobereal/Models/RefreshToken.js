const { DataTypes } = require('sequelize');
const sequelize = require('../database/conexion');

const RefreshToken = sequelize.define('RefreshToken', {
  token: {
    type: DataTypes.STRING(64),
    primaryKey: true,
  },
  userId: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  tipo: {
    type: DataTypes.STRING(20),
    allowNull: false,
  },
  expiry: {
    type: DataTypes.DATE,
    allowNull: false,
  },
}, {
  tableName: 'refresh_tokens',
  timestamps: false,
});

module.exports = RefreshToken;
