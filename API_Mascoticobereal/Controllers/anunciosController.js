
class anunciosController{
    constructor(anuncioService){
        this.anuncioService = anuncioService
    }

    async obtenerAnuncios(req,res){
        try {
            const add = await this.anuncioService.obtenerAnuncios();
            res.status(201).json(add)
        } catch (error) {
            console.error('Error en obtener anuncios: ', error);
            res.status(500).json({message:'Error'})
        }
    }

    async obtenerAnunciosId(req,res){
        try {
            
        } catch (error) {
            
        }
    }

    async crearAnuncios(req,res){
        try {
            
        } catch (error) {
            
        }
    }

    async actualizarAnuncios(req,res){
        try {
            
        } catch (error) {
            
        }
    }

    async eliminarAnuncios(req,res){
        try {
            
        } catch (error) {
            
        }
    }

}