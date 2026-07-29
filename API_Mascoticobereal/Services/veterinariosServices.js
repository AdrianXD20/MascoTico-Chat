const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const crypto = require('crypto');
const secretKey = process.env.secretKey;
const Veterinario = require('../Models/veterinarioModel');
const RefreshToken = require('../Models/RefreshToken');

class VeterinarioService{
   

    async obtenerVeterinarios(page,limit){
        const offset = (page-1) * limit;
        const vets = await Veterinario.findAll({limit, offset});
        return vets.map(v => this._sanitizeVet(v));
    }

    async obtenerVeterinarioPorId(Id){
        const vet = await Veterinario.findByPk(Id);
        return vet ? this._sanitizeVet(vet) : null;
    }

    _sanitizeVet(v) {
        return {
            id: v.id,
            nombre: v.nombre,
            cedula: v.cedula,
            email: v.email,
            imagen_perfil: v.imagen_perfil,
            celular: v.celular,
            direccion: v.direccion,
            calificacion: v.calificacion,
            rol: v.rol,
            hora_apertura: v.hora_apertura,
            hora_cierre: v.hora_cierre,
        };
    }

    async crearVeterinario(nuevoVeterinario){
        try{
            const hashedPassword = await bcrypt.hash(nuevoVeterinario.contraseña,10);
            nuevoVeterinario.contraseña = hashedPassword;

            const veterinarioCreado = await Veterinario.create(nuevoVeterinario)
            return this._sanitizeVet(veterinarioCreado);
        }catch(error){
            throw new Error ('Error al registrarse: '+ error.message)
        }
    }


    async loginVeterinario(email,contraseña){
        try {

            const veterinario = await Veterinario.findOne({where:{email}});

            if(!veterinario){
                throw new Error('Veterinario no encontrado')
            }

            const isPasswordValid = await bcrypt.compare(contraseña,veterinario.contraseña);
            if(!isPasswordValid){
                throw new Error ('Contraseña incorrecta')
            }

            const jti = crypto.randomUUID();
            const JWT = jwt.sign(
                {id: veterinario.id, rol: veterinario.rol, jti},
                secretKey,{expiresIn: '15m'}
            );

            const refreshToken = crypto.randomBytes(32).toString('hex');
            await RefreshToken.create({
                token: refreshToken,
                userId: veterinario.id,
                tipo: 'veterinario',
                expiry: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
            });

            const veterinarioSeguro = {
                id: veterinario.id,
                nombre: veterinario.nombre,
                cedula: veterinario.cedula,
                email: veterinario.email,
                imagen_perfil: veterinario.imagen_perfil,
                celular: veterinario.celular,
                direccion: veterinario.direccion,
                calificacion: veterinario.calificacion,
                rol: veterinario.rol,
                hora_apertura: veterinario.hora_apertura,
                hora_cierre: veterinario.hora_cierre,
            };

            return {JWT, refreshToken, veterinario: veterinarioSeguro}
        } catch (error) {
            throw new Error ('Error en el proceso de login: '+error.message)
            
        }
    }

    async refreshJWT(refreshToken) {
        const stored = await RefreshToken.findByPk(refreshToken);
        if (!stored || stored.expiry < new Date()) {
            if (stored) await stored.destroy();
            throw new Error('Refresh token inválido o expirado');
        }

        const veterinario = await Veterinario.findByPk(stored.userId);
        if (!veterinario) throw new Error('Veterinario no encontrado');

        const jti = crypto.randomUUID();
        const newJWT = jwt.sign(
            { id: veterinario.id, rol: veterinario.rol, jti },
            secretKey,
            { expiresIn: '15m' }
        );

        const newRefreshToken = crypto.randomBytes(32).toString('hex');
        await stored.destroy();
        await RefreshToken.create({
            token: newRefreshToken,
            userId: veterinario.id,
            tipo: 'veterinario',
            expiry: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        });

        return { JWT: newJWT, refreshToken: newRefreshToken };
    }

     async actualizarVeterinario(Id, datosActualizados, imagen_perfil=null){
        const veterinario = await Veterinario.findByPk(Id);
        if(!veterinario) return null;

        const camposPermitidos = {};
        for (const campo of ['nombre', 'cedula', 'email', 'celular', 'direccion', 'hora_apertura', 'hora_cierre']) {
            if (datosActualizados[campo] !== undefined) {
                camposPermitidos[campo] = datosActualizados[campo];
            }
        }
        if (imagen_perfil) {
            camposPermitidos.imagen_perfil = imagen_perfil;
        }

        const updateRows = await Veterinario.update(camposPermitidos, {where:{id:Id}});
        if(updateRows > 0){
            const updated = await Veterinario.findByPk(Id);
            return updated ? this._sanitizeVet(updated) : null;
        }
        return null;
    }

    async revocarRefreshTokens(userId) {
        await RefreshToken.destroy({ where: { userId, tipo: 'veterinario' } });
    }

    async eliminarVeterinario(Id){
        const veterinario = await Veterinario.findByPk(Id);
            if(veterinario){
                return Veterinario.destroy({where:{id:Id}});
            }
                return null;
    }

}


module.exports= VeterinarioService;