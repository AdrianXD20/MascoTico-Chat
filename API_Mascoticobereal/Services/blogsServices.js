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
    
      async crearBlog(nuevoBlog) {
        return Blogs.create(nuevoBlog);
      }
    
      async actualizarBlog(Id, datosActualizados,imagen=null) {
        const blogs = await Blogs.findByPk(Id);
        if (blogs) {
          if(imagen){
            datosActualizados.imagen = imagen
          }
          const updateRows = await Blogs.update(datosActualizados,{
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
                    attributes: ['nombre', 'apellido','imagen_perfil'] 
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