const { Error } = require('sequelize');
const Productos = require('../Models/productosModel')
const {Op} = require('sequelize')

class ProductoService {
  
  
   async obtenerProductos(page, limit) {
    const offset = (page - 1) * limit;
    
    // 🔥 Cambiamos findAll por findAndCountAll
    // Esto devolverá automáticamente { count: X, rows: [...] }
    return Productos.findAndCountAll({ limit, offset });
}
  
    async obtenerProductoPorId(Id) {
      return Productos.findByPk(Id);
    }
  
    _filtrarCampos(datos) {
      const campos = ['nombre', 'marca', 'mascota', 'precio', 'stock', 'edad', 'tamaño_mascota', 'imagen_producto', 'categoria', 'peso', 'id_veterinario'];
      const filtrado = {};
      for (const key of Object.keys(datos || {})) {
        if (campos.includes(key)) {
          filtrado[key] = datos[key];
        }
      }
      return filtrado;
    }

    async crearProducto(nuevoProducto) {
      return Productos.create(this._filtrarCampos(nuevoProducto));
    }
  
    async actualizarProducto(Id, datosActualizados,imagen=null) {
      const productos = await Productos.findByPk(Id);
      if (productos) {
        const seguro = this._filtrarCampos(datosActualizados);
        if(imagen){
          seguro.imagen = imagen
        }
        const updateRows = await Productos.update(seguro,{
          where:{id:Id}
        })  
            if (updateRows > 0){
              return Productos.findByPk(Id);
            }
      }
        return null
    }
  
    async eliminarProducto(Id) {
      const productos = await Productos.findByPk(Id);
      if (productos) {
        return Productos.destroy({
          where:{id:Id}
        });
      }
        return null
    }

    async ObtenerProductosByName(nombre){
      try {
        const productos = await Productos.findAll({
          where : {
            nombre : {
              [Op.like] : `%${nombre}%` 
            }
          }
        });
        return productos;
      } catch (error) {
        console.error("Error en la busqueda de Productos por su nombre:", error);
        throw new Error("Error al obtener productos por nombre")
      }
    }

  }
  
  module.exports = ProductoService;
  