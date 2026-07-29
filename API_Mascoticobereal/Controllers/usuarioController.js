class UsuarioController{
    constructor(userService){
        this.userService = userService;
    }

    async crearUsuario(req, res) {
      try {
          const { email, contraseña, nombre } = req.body;

          if (!email || !contraseña || !nombre) {
              return res.status(400).json({ message: 'Faltan campos obligatorios' });
          }

          const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
          if (!emailRegex.test(email)) {
              return res.status(400).json({ message: 'El correo electrónico no es válido' });
          }

          if (contraseña.length < 8) {
              return res.status(400).json({ message: 'La contraseña debe tener al menos 8 caracteres' });
          }

          const existeUsuario = await this.userService.buscarPorEmail(email);
          if (existeUsuario) {
              return res.status(409).json({ message: 'Este correo ya está registrado' });
          }

          const imagenURL = req.file ? req.file.path : null;
          const nuevoUsuario = { ...req.body, imagen_perfil: imagenURL };

          const User = await this.userService.crearUsuario(nuevoUsuario);
          return res.status(201).json(User);
      } catch (error) {
          console.error('Error creando nuevo Usuario:', error);
          res.status(500).json({ message: 'Error al crear el usuario' });
      }
  }
      async login(req, res) {
        try {
            const { email, contraseña } = req.body;
            if (!email || !contraseña) {
                return res.status(400).json({ message: 'Faltan campos obligatorios' });
            }
    
            const { JWT, refreshToken, user } = await this.userService.login(email, contraseña);
            res.status(200).json({ JWT, refreshToken, user });
        } catch (error) {
            console.error('Error al logear el usuario :', error);
            res.status(401).json({ message: 'Credenciales inválidas' });
        }
    }

    async obtenerUsuario(req, res) {
      try {
        if (req.user.rol !== 'admin') {
          return res.status(403).json({ message: 'No tienes permisos para ver todos los usuarios' });
        }

        const { page = 1, limit = 10 } = req.query;
        const pageNumber = parseInt(page);
        const limitNumber = parseInt(limit);

        if (isNaN(pageNumber) || isNaN(limitNumber)) {
          return res.status(400).json({ message: 'Parámetros de paginación inválidos' });
        }

        const users = await this.userService.obtenerUsuarios(pageNumber, limitNumber);
        res.status(200).json(users);
        
      } catch (error) {
        console.error('Error al buscar usuarios: ', error);
        res.status(500).json({ message: 'Tuvimos un error para obtener los usuarios.' });
      }
    }

    async obtenerUsuarioId(req, res) {
      try {
        const id = req.params.id;

        if (req.user.rol !== 'admin' && req.user.id != id) {
          return res.status(403).json({ message: 'No tienes permisos para ver este usuario' });
        }

        const ofuscar = req.user.rol !== 'admin';
        const user = await this.userService.obtenerUsuarioId(id, ofuscar);
        if (!user) {
          return res.status(404).json({ message: 'Este Id no existe o no se encuentra disponible' });
        }
        return res.status(200).json(user);
      } catch (error) {
        console.error('Error al obtener usuarios por Id:', error);
        res.status(500).json({ message: 'Tuvimos un error para obtener usuarios por Id.' });
      }
    }

    async actualizarUsuario(req,res){
      try {
        const id = req.params.id;

        if (req.user.rol !== 'admin' && req.user.id != id) {
          return res.status(403).json({ message: 'No puedes modificar este usuario' });
        }

        const datosActualizados = req.body;
        if(req.file){
          datosActualizados.imagen_perfil = req.file.path;
        }
        const user = await this.userService.actualizarUsuario(id, datosActualizados);
        if(user){
          res.status(200).json(user);
        }else{
          res.status(404).json({message: 'Usuario no encontrado, revisa si existe ID'})
        }
      } catch (error) {
        console.error('Error al actualizar usuario:', error);
        res.status(500).json({message:'Problema al actualizar datos de usuario'})
      }
      
    }

    async eliminarUsuario(req,res){
      try {
        const id = req.params.id;

        if (req.user.rol !== 'admin' && req.user.id != id) {
          return res.status(403).json({ message: 'No puedes eliminar este usuario' });
        }

        const user = await this.userService.eliminarUsuarios(id);
        if(user){
          res.status(200).json({message: 'Usuario eliminado correctamente'})
        }else{
          res.status(404).json({message: 'Hubo un error al eliminar usuario, checa si existe'})
        }
      } catch (error) {
        console.error('Hay un error para eliminar usuarios:', error);
        res.status(500).json({message:'Hubo un error para eliminar al usuario'})
      }
    }

}

module.exports = UsuarioController;
