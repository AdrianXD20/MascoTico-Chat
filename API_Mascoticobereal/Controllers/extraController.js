
class extraController{
    constructor(extraService){
        this.extraService=  extraService;
    }

    async obtenerExtra(req,res){
        try{
            let page = parseInt(req.query.page, 10);
            let limit = parseInt(req.query.limit, 10);

            if (isNaN(page) || page < 1) page = 1;
            if (isNaN(limit) || limit < 1) limit = 10;

            const extra = await this.extraService.obtenerExtra(page, limit);
            res.json(extra)

        }catch(err){
            console.error('Erro al Obtener las caracteristicas Extra: ', err);
            res.status(500).json({message:'Tuvimos un error obteniendo las caracteristicas extras'})
        }
    }

    async obtenerExtraPorId(req,res){
        try{
            const id = req.params.id;
            const extra = await this.extraService.obtenerExtraPorId(id);
            if (extra) {
                res.json(extra);
              } else {
                res.status(404).json({ message: 'Caracteristica extra no encontrado' });
              }
        }catch(err){
            console.error('Error al buscar una caracteristica extra: ', err);
            res.status(500).json({message: 'Tuvimos un error en la busqueda'})  
        }
    }

    async crearExtra(req,res){
        try{
            const nuevoExtra = req.body
            const extra = await this.extraService.crearExtra(nuevoExtra)
            res.status(201).json(extra);
        }catch(err){
            console.error('Error al crear la caracteristica extra', err);
            res.status(500).json({message: 'Tuvimos un error para crear la caracteristica extra'})
        }
    }

    async actualizarExtra(req,res){
        try{
            const id= req.params.id;
            const datosActualizados = req.body;
            const extra = await this.extraService.actualizarExtra(id, datosActualizados);
            if (extra) {
                res.json(extra);
              } else {
                res.status(404).json({ message: 'Caracteristica extra no encontrado' });
              }
        }catch(err){
            console.error('No se pudieron actualizar los datos', err);
            res.status(500).json({message:'Tuvimos un Error al actualizar los datos'})
        }
    }

    async eliminarExtra(req,res){
        try{
            const id = req.params.id;
            const extra = await this.extraService.eliminarExtra(id);
            if (extra) {
                res.json({message:'Caracteristica Extra Eliminada'});
              } else {
                res.status(404).json({ message: 'Caracteristica extra no encontrado' });
              }
        }catch(err){
            console.error('Error al eliminar las caracteristicas extra', err)
            res.status(500).json({message: 'Tuvimos un error para eliminar los datos'})
            
        }
    }


}

module.exports = extraController;