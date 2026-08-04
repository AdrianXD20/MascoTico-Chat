const { Where } = require('sequelize/lib/utils');
const Blogs = require('../Models/blogdModel')
const Veterinario = require('../Models/veterinarioModel');
const {Op} = require('sequelize')


class BlogsService{

    async obtenerBlogs(page, limit) {
        const offset = (page - 1) * limit;
        return Blogs.findAll({limit,offset});
      }
    
      async obtenerBlogPorId(Id) {
        return Blogs.findByPk(Id);
      }
    
      _filtrarCampos(datos) {
        const campos = ['titulo', 'imagen', 'categoria', 'id_veterinario', 'contenido'];
        const filtrado = {};
        for (const key of Object.keys(datos || {})) {
          if (campos.includes(key)) {
            filtrado[key] = datos[key];
          }
        }
        return filtrado;
      }

      async crearBlog(nuevoBlog) {
        return Blogs.create(this._filtrarCampos(nuevoBlog));
      }
    
      async actualizarBlog(Id, datosActualizados,imagen=null) {
        const blogs = await Blogs.findByPk(Id);
        if (blogs) {
          const seguro = this._filtrarCampos(datosActualizados);
          if(imagen){
            seguro.imagen = imagen
          }
          const updateRows = await Blogs.update(seguro,{
            where:{id:Id}
          })  
              if (updateRows > 0){
                return Blogs.findByPk(Id);
              }
        }
          return null
      }
    
      async eliminarBlog(Id) {
        const blogs = await Blogs.findByPk(Id);
        if (blogs) {
          return Blogs.destroy({
            where:{id:Id}
          });
        }
          return null
      }

      async obtenerBlogsPorVeterinarioId(veterinarioId) {
        return Blogs.findAll({
            where: { id_veterinario: veterinarioId },
            include: [
                {
                    model: Veterinario,
                    as: 'veterinario',
                    attributes: ['nombre', 'imagen_perfil'] 
                }
            ]
        });
    }
    
    async ObtenerBlogsPorNombre(nombre) {
      try {
        const blogs = await Blogs.findAll({
          where: {
            titulo: {
              [Op.like]: `%${nombre}%` 
            }
          }
        });
    
        return blogs;
      } catch (error) {
        console.error("Error al obtener blogs por nombre:", error);
        throw new Error("Error al obtener blogs por nombre");
      }
    }
      
}

module.exports= BlogsService