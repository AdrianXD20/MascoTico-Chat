
const db= require('../database/conexion');


class extraRepository{
    constructor(db){
        this.db=db;
    }

    obtenerExtra(limit, offset){
        return new Promise((resolve, rejects)=>{
            this.db.query('SELECT * FROM caracteristicas_extras LIMIT ? OFFSET ?', [limit, offset] ,(err, results)=>{
                if(err){
                    console.error('Error al obtener las caracteristicas Extra: ', err)
                    return rejects(err)
                }
                resolve(results)
                
            });
        });
    }

    obtenerExtraPorId(Id){
        return new Promise((resolve, rejects)=>{
            this.db.query('SELECT * FROM caracteristicas_extras WHERE id= ?',[Id] , (err, results)=>{
                if(err){
                    console.error('Error en la busqueda de la caracteritica Extra: ', err)
                    return rejects(err)
                }
                resolve(results)
            });
        });
    }

    crearExtra(nuevoExtra){
        return new Promise ((resolve, rejects)=>{
            this.db.query('INSERT INTO caracteristicas_extras SET ?', nuevoExtra, (err, results)=>{
                if(err){
                    console.error('Error al crear una caracteristica extra: ', err)
                    return rejects(err)
                }
                resolve(results)
            })
        })
    }

    actualizarExtra(Id, datosActualizados){
        return new Promise ((resolve, rejects) => {
            this.db.query('UPDATE caracteristicas_extras SET ? WHERE id= ?', [datosActualizados, Id], (err,results)=>{
                if(err){
                    console.error('Error al actualizar los datos: ', err);
                    return rejects(err)
                }
                resolve(results.affectedRows > 0 ? {Id, ...datosActualizados} : null)
            });
        });
    }

    eliminarExtra(Id){
        return new Promise((resolve, rejects)=>{
            this.db.query('DELETE FROM caracteristicas_extras WHERE id= ?', [Id], (err,results)=>{
                if(err){
                    console.error('Error al Eliminar los datos: ', err);
                    return rejects(err)
                }
                resolve(results.affectedRows > 0);
            })
        })
    }
}



module.exports= extraRepository;