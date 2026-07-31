const Pets = require('../Models/petsModel');


class PetsService{

    async obtenerPets(page,limit){
        const offset = (page-1) * limit;
        return Pets.findAll({limit,offset})
    }

    async obtenerPetPorId(Id){
        return Pets.findByPk(Id)
    }

    _filtrarCampos(datos) {
        const campos = ['mascota', 'nombre', 'raza', 'usuario'];
        const filtrado = {};
        for (const key of Object.keys(datos || {})) {
            if (campos.includes(key)) {
                filtrado[key] = datos[key];
            }
        }
        return filtrado;
    }

    async crearPets(nuevoPet){
        return Pets.create(this._filtrarCampos(nuevoPet))
    }

    async actualizarPet(Id, newData){
        const pet = await Pets.findByPk(Id);
        if (pet) {
            const updateRows = await Pets.update(this._filtrarCampos(newData), { where: { id: Id } });
            if (updateRows > 0) {
                return Pets.findByPk(Id);
            }
        }
        return null;
    }

    async eliminarPet(Id){
        const pet = await Pets.findByPk(Id);
        if (pet) {
            return Pets.destroy({ where: { id: Id } });
        }
        return null;
    }
}