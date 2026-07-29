
const UserRepository = require('../Repositories/UserRepository');
const User = require('../Models/UserModel');

class UserService {
    constructor(userRepository) {
        this.userRepository = userRepository;
    }

    async ObtenerUser(userId) {
        const user = await User.findByPk(userId);
        if (!user) return null;
        return {
            id: user.id,
            nombre: user.nombre,
            email: user.email,
            rol: user.rol,
            direccion: user.direccion,
            telefono: user.telefono,
            imagen_perfil: user.imagen_perfil,
        };
    }
}

module.exports = UserService;
