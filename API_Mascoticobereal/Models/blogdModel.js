const { DataTypes } = require('sequelize');
const sequelize = require('../database/conexion'); // Ajusta el path según tu configuración
const veterinarios = require('./veterinarioModel')
const Blog = sequelize.define('Blog', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  titulo: {
    type: DataTypes.STRING(255),
    allowNull: false,
    validate: {
      notEmpty: true, 
    },
  },
  imagen: {
    type: DataTypes.STRING(255),
    allowNull: true, 
  },
  categoria: {
    type: DataTypes.STRING(255),
    allowNull: true, 
  },
  id_veterinario: {
    type: DataTypes.INTEGER,
    allowNull: true, 
    references: {
      model: 'veterinarios', 
      key: 'id', 
    },
  },
  fecha_publicacion: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW, 
  },
  contenido: {
    type: DataTypes.TEXT,
    allowNull: false,
    validate: {
      notEmpty: true, 
    },
  },
}, {
  tableName: 'blogs', 
  timestamps: false, 
});


Blog.belongsTo(veterinarios, { foreignKey: 'id_veterinario', as: 'veterinario' });



module.exports = Blog;
