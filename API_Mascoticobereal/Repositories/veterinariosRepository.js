const { rejects } = require('assert');
const db = require('../database/conexion');
const { resolve } = require('path');

class veterinarioRepository{
    constructor(db){
        this.db = db;
    }

    obtenerVeterinarios(limit,offset){
        return new Promise ((resolve,reject)=>{

            this.db.query('SELECT * FROM veterinarios LIMIT ? OFFSET ?', [limit,offset],(err, result) => {
                if(err){
                    console.error('Error al obtener los Veterianrios: ', err)
                    return reject(err)
                }
                resolve(result)
            })  
        })
    }

    obtenerVeterinarioPorId(Id){
        return new Promise ((resolve, reject)=> {
            this.db.query('SELECT * FROM veterinarios WHERE id = ?', [Id], (err,result)=>{
                if(err){
                    console.error('Error al obtener ese Veterinario: ', err);
                    return reject(err)
                }
                resolve(result[0]);
            })
        })
    }

    crearVeterinarios(nuevoVeterinario){
        return new Promise ((resolve,rejects)=>{
            this.db.query('INSERT INTO veterinarios SET ?', nuevoVeterinario,(err,result)=>{
                if(err){
                    console.error('Error al crear un nuevo Veterinario: ', err);
                    return rejects(err)
                }
                resolve ({id:result.insertId, ...nuevoVeterinario})
            })
        })
    }

    actualizarVeterinario(Id, datosActualizados){
        return new Promise ((resolve, rejects)=>{
            this.db.query('UPDATE veterinarios SET ? WHERE id= ?', [datosActualizados,Id], (err,result)=>{
                if(err){
                    console.error('Erros al moemnto de Actualizar Datos: ', err)
                    return rejects(err)
                }
                resolve (result.affectedRows > 0 ? {Id, ...datosActualizados} : null)
            })
        })
    }

    eliminarVeterinario(Id){
        return new Promise ((resolve,rejects)=>{
            this.db.query('DELETE FROM veterinarios WHERE id = ?', [Id], (err, result)=>{
                if(err){
                    console.error('Error al eliminar al Veterianrio: ', err);
                    return rejects(err)
                }
                resolve(result.affectedRows > 0);
            })
        })
    }

}


module.exports= veterinarioRepository;