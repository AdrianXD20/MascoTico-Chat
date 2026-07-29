const anuncios = require('../Models/anucioModel')

class anunciosService{

    async obtenerAnuncios(){
        return anuncios.findAll()
    }

    async obtenerAnunciosId(Id){
        return anuncios.findByPk(Id)
    }

    async crearAnuncios(newAdd){
        return anuncios.create(newAdd);
    }

    async actualizarAnuncios(id, updateAdd, imagen = null){
        const add = await anuncios.findByPk(id);
        if (add) {
            if (imagen) {
                updateAdd.imagen = imagen;
            }
            const updates = await anuncios.update(updateAdd, {
                where: { id: id }
            });
            if (updates > 0) {
                return anuncios.findByPk(id);
            }
        }
        return null;
    }

    async eliminarAnuncios(Id){
        const adds = await anuncios.findByPk(Id)
        if(adds){
            return anuncios.destroy({
                where:{id:Id}
            })
        }
        return null
    }
}

module.exports = anunciosService