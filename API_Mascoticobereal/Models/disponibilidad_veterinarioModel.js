const { DataTypes } = require('sequelize');
const sequelize = require('../database/conexion');
const veterinarios = require('../Models/veterinarioModel');
const { timeStamp } = require('console');


const DisponibilidadVeterinario = sequelize.define('disponibilidad_veterinario', {
    id: { 
        type: DataTypes.INTEGER, 
        autoIncrement: true, 
        primaryKey: true 
    },
    id_veterinario: { 
        type: DataTypes.INTEGER,
         allowNull: false 
        },
    fecha: { 
        type: DataTypes.DATEONLY, 
        allowNull: false 
    },
    hora_inicio: {
         type: DataTypes.TIME,
          allowNull: false 
        },
    hora_fin: {
         type: DataTypes.TIME, 
         allowNull: false
         },
        },
         {
            tableName:'disponibilidad_veterinario',
            timestamps: false
});

DisponibilidadVeterinario.belongsTo(veterinarios, { foreignKey: 'id_veterinario' });

module.exports = DisponibilidadVeterinario;

