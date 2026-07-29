const sequelize = require('../database/conexion');
const db = require('../database/conexion');
const DataTypes = require('sequelize')

const pets = sequelize.define('Pets',{

    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true
    },
    mascota :{
        type: DataTypes.INTEGER,

    },
    nombre :{
        type: DataTypes.STRING
    },
    raza :{
        type: DataTypes.STRING
    },
    usuario: {
        type: DataTypes.INTEGER
    }
},{
    tablename: 'pets',
    timestamps: false
}
);