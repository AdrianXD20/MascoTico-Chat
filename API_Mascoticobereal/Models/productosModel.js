const { DataTypes } = require('sequelize');
const sequelize = require('../database/conexion'); 
const caracteristicas = require('./caracteristicasExtraModel');
const { deepStrictEqual } = require('assert');


const Productos = sequelize.define('Productos', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  nombre: {
    type: DataTypes.STRING(255),
    allowNull: false,
  },
  marca: {
    type: DataTypes.STRING(255),
    allowNull: true,
  },
  mascota: {
    type: DataTypes.INTEGER,
    allowNull: true,
  },
  precio: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: true,
  },
  stock: {
    type: DataTypes.INTEGER,
    allowNull: true,
  },
  edad: {
    type: DataTypes.STRING(50),
    allowNull: true,
  },
  tamaño_mascota: {
    type: DataTypes.STRING(50),
    allowNull: true
  },
  imagen_producto:{
    type: DataTypes.STRING,
    allowNull: true,
  },
  categoria: {
    type: DataTypes.INTEGER,
    allowNull: true,
  },
  peso:{
    type: DataTypes.DECIMAL(10, 2),
    allowNull: true,
  },
  id_veterinario: {
    type: DataTypes.INTEGER,
    allowNull: true,
  }
}, {
  tableName: 'productos', 
  timestamps: false, 
});
/*
Productos.belongsTo(caracteristicas,{
    foreignKey: 'id',
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE'
});
*/
module.exports = Productos;

/*/
type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: 'categoria_productos', 
      key: 'id',
    },
*/