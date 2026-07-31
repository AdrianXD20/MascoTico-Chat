const anuncios = require('../Models/anucioModel')

class anunciosService{

    async obtenerAnuncios(){
        return anuncios.findAll()
    }

    async obtenerAnunciosId(Id){
        return anuncios.findByPk(Id)
    }

    _filtrarCampos(datos) {
      const campos = ['imagen', 'descripcion'];
      const filtrado = {};
      for (const key of Object.keys(datos || {})) {
        if (campos.includes(key)) {
          filtrado[key] = datos[key];
        }
      }
      return filtrado;
    }

    async crearAnuncios(newAdd){
        return anuncios.create(this._filtrarCampos(newAdd));
    }

    async actualizarAnuncios(id, updateAdd, imagen = null){
        const add = await anuncios.findByPk(id);
        if (add) {
            const seguro = this._filtrarCampos(updateAdd);
            if (imagen) {
                seguro.imagen = imagen;
            }
            const updates = await anuncios.update(seguro, {
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