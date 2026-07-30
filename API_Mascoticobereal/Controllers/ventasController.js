const auditLog = require('../Services/auditLog');

class ventaController{
    constructor(ventaService) {
        this.ventaService = ventaService
    }

    async obtenerVentas(req, res){
        try{
            let page = parseInt(req.query.page, 10);
            let limit = parseInt(req.query.limit, 10);

            if (isNaN(page) || page < 1) page = 1;
            if (isNaN(limit) || limit < 1) limit = 10;

            const ventas =  await this.ventaService.obtenerVentas(page, limit)
            res.json(ventas)
        }
        catch(error){
            console.error('Error al obtener ventas: ', error);
            res.status(500).json({message:'Error al obtener las ventas'});
        }
    }

    async obtenerVentaPorId(req, res){
        try{
            const id = req.params.id;
            const ventas= await this.ventaService.obtenerVentaPorId(id);
           if(ventas){
            res.json(ventas)
           }
           else{
            res.status(404).json({message:'venta no encontrado'});
           }
        }catch(error){
        console.error('Error al obtener la  venta: ', error);
        res.status(500).json({message:'No encontramos la venta'})
        }
    }

    async crearVenta(req,res){
        try{
            const nuevaVenta= req.body;
            const venta= await this.ventaService.crearVenta(nuevaVenta);
            auditLog.log('venta_creada', { user_id: req.user?.id, ip: req.ip });
            res.status(200).json(venta)

        }catch(error){
            console.error('Error al crear una nueva  venta: ', error)
            res.status(500).json({message:'Tuvimos un error para guardar la Venta'})

        }
    }

    async actualizarVenta(req,res){
        try{
            const id= req.params.id;
            const datosActualizados = req.body;
            const venta = await this.ventaService.actualizarVenta(id,datosActualizados);
            if (venta) {
                res.json(venta);
              } else {
                res.status(404).json({ message: 'Venta no encontrado' });
              }
        }catch(error){
            console.error('Error al actualizar las ventas: ', error);
            res.status(500).json({message:'Tuvimos un error al guardar los cambios que se realizaron'});
        }
    }

    async eliminarVenta(req,res){
        try{
            const id= req.params.id;
            const venta = await this.ventaService.eliminarVenta(id);
            if(venta){
                res.json({message:'Venta Eliminada'});
            } else{
                res.status(404).json({message : 'Venta no eliminada'});
            }
        }catch(error){
            console.error('Error al eliminar la: venta ', error);
            res.status(500).json({message:'Tuvimos un error al eliminar la venta'})
        }
    }

    async ventasByUserId(req,res){
        try {
            const UserId = req.params.id_usuario;

            if (req.user.rol !== 'admin' && String(req.user.id) !== String(UserId)) {
                return res.status(403).json({ error: 'No tienes permisos para ver las ventas de este usuario' });
            }

            const ventas = await this.ventaService.ventasByIdUser(UserId)
            if (ventas.length > 0){
                res.json(ventas)
            }else{
                res.status(404).json({message:'Error no hay ese ID'})
            }
        } catch (error) {
            console.error('Error en la consulta: ', error),
            res.status(500).json({message: 'Error en la consulta'})
        }
    }
}

module.exports = ventaController;