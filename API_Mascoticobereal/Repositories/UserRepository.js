const fs = require('fs-extra');
const User = require('../Models/UserModel.js');
const bcrypt = require('bcryptjs')

const db = require('../database/conexion.js');
const { errorMonitor } = require('events');


class UserRepository {

    constructor(db) {
        this.db = db;    
    }
    crearUsuario(nuevoUsuario){
        return  new Promise((resolve, reject)=>{
            bcrypt.hash(nuevoUsuario.contraseña, 6 , (err,hash) => {
                if(err){
                    console.log('Error al momento de hashear la contraseña: ', err);
                    return reject(err)
                }
                const contraseñaHash = { ...nuevoUsuario, contraseña: hash}
            this.db.query('INSERT INTO usuarios SET ?', contraseñaHash, (err,result)=>{
                if(err){
                console.error('Error en crear usuario: ', err);
                return reject(err);
                }
                resolve({id: result.insertedId, ...contraseñaHash});
            });
        });
    })
};



    login(email, contraseña){
        return new Promise ((resolve, reject)=>{
            this.db.query('SELECT * FROM usuarios Where email= ?' ,[email],(err, results) => {
                if(err){
                    console.log('Error en realizar Login: ', err)
                    return reject(err)
                }
                if(results.length === 0){
                    return reject(new Error('Usuario no Existe'))
                }
                const usuario = results[0];
                bcrypt.compare(contraseña, usuario.contraseña, (err,exito) =>{
                    if(err){
                        console.log('Tuvimos un problema comparando la contraseña: ', err);
                        return reject(err)
                    }
                    if(!exito){
                        return reject(new Error('La contraseña es incorrecta'))
                    }
                    resolve({id: usuario.id, email: usuario.email, nombre: usuario.nombre})
                })
            })
        })
    }
}
module.exports = UserRepository; // Exporta la clase UserRepository
