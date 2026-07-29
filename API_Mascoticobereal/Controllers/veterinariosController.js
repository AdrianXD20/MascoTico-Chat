class VeterinarioController{
    constructor(veterinarioService) {
        this.veterinarioService = veterinarioService
    }

    async obtenerVeterinarios(req, res){
        try{
            let page = parseInt(req.query.page, 10);
            let limit = parseInt(req.query.limit, 10);

            if (isNaN(page) || page < 1) page = 1;
            if (isNaN(limit) || limit < 1) limit = 10;

            const veterianrios =  await this.veterinarioService.obtenerVeterinarios(page, limit);
            res.json(veterianrios)
        }
        catch(error){
            console.error('Error al obtener Productos: ', error);
            res.status(500).json({message:'Error al obtener los Veterinarios'});
        }
    }

    async obtenerVeterinarioPorId(req, res){
        try{
            const id = req.params.id;
            const veterinario= await this.veterinarioService.obtenerVeterinarioPorId(id);
           if(veterinario){
            res.json(veterinario)
           }
           else{
            res.status(404).json({message:'Veterinario no encontrado'});
           }
        }catch(error){
        console.error('Error al obtener el veterianrio : ', error);
        res.status(500).json({message:'No encontramos el Veterinario'})
        }
    }

    async crearVeterinario(req,res){
        try{
            const nuevoVeterinario = req.body;
            const veterinario= await this.veterinarioService.crearVeterinario(nuevoVeterinario);
            res.status(200).json(veterinario)

        }catch(error){
            console.error('Error al crear un nuevo veterianrio: ', error)
            res.status(500).json({message:'Tuvimos un error para guardar al Veterianrio'})

        }
    }

    async loginVeterinario(req,res){
       try{ 
            const {email, contraseña} = req.body;
            
            if (!email || !contraseña) {
                return res.status(400).json({mesage: 'Faltan datos por rellenar'})   
            }

                const {JWT, refreshToken, veterinario} = await this.veterinarioService.loginVeterinario(email,contraseña);
                res.status(200).json({JWT, refreshToken, veterinario})
        }catch(error){
            console.error('Error al logear veterianrio: ', error);
            res.status(400).json({message: 'Credenciales invalidas'})

        }
    }

    async actualizarVeterinario(req,res){
        try{
            const id= req.params.id;

            if (req.user.rol !== 'admin' && req.user.id != id) {
                return res.status(403).json({ message: 'No puedes modificar este veterinario' });
            }

            const datosActualizados = req.body;
            if(req.file){
                datosActualizados.imagen_perfil = req.file.path
            }
            const veterinario = await this.veterinarioService.actualizarVeterinario(id,datosActualizados);
            if (veterinario) {
                res.json(veterinario);
              } else {
                res.status(404).json({ message: 'Veterinario no encontrado' });
              }
        }catch(error){
            console.error('Error al actualizar los datos : ', error);
            res.status(500).json({message:'Tuvimos un error al guardar los cambios que se realizaron'});
        }
    }

    async eliminarVeterinario(req,res){
        try{
            const id= req.params.id;

            if (req.user.rol !== 'admin' && req.user.id != id) {
                return res.status(403).json({ message: 'No puedes eliminar este veterinario' });
            }

            const veterinario = await this.veterinarioService.eliminarVeterinario(id);
            if(veterinario){
                res.json({message:'Veterinario Eliminado'});
            } else{
                res.status(404).json({message : 'Veterianrio no eliminado'});
            }
        }catch(error){
            console.error('Error al eliminar veterinario: ', error);
            res.status(500).json({message:'Tuvimos un error al eliminar el veterianrio.'})
        }
    }
}

module.exports = VeterinarioController;