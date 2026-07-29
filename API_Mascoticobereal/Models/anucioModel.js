const sequelize = require ('../database/conexion')
const DataTypes = require('sequelize')

const anuncios = sequelize.define('Anucios',{
    id:{
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    imagen:{
        type: DataTypes.STRING,
        allowNull: false,
    },
    descripcion:{
        type: DataTypes.STRING,
        allowNull: false
    }
},{
    tableName: 'anuncios',
    timestamps: false
});

module.exports = anuncios;