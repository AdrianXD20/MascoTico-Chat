class BlogControlller {
    constructor(blogsService) {
      this.blogsService = blogsService;
    }
  
    async obtenerBlogs(req, res) {
      try {
        let page = parseInt(req.query.page, 10);
        let limit = parseInt(req.query.limit, 10);

        if (isNaN(page) || page < 1) page = 1;
        if (isNaN(limit) || limit < 1) limit = 10;

        const blogs = await this.blogsService.obtenerBlogs(page, limit);
        res.json(blogs);
      } catch (error) {
        console.error('Error en obtenerBlogs:', error); 
        res.status(500).json({ message: 'Error al obtener los blogs' });
      }
    }
  
    async obtenerBlogPorId(req, res) {
      try {
        const id = req.params.id;
        const blog = await this.blogsService.obtenerBlogPorId(id);
        if (blog) {
          res.json(blog);
        } else {
          res.status(404).json({ message: 'Blog no encontrado' });
        }
      } catch (error) {
        console.error('Error en obtenerBlogPorId:', error); 
        res.status(500).json({ message: 'Error al obtener el blog' });
      }
    }
  
    async crearBlog(req, res) {
      try {
        if(!req.file){
          return res.status(400).json({ message: 'La imagen es obligatoria' });
        }
        
        const imagenUrl = req.file.path;
        const nuevoBlog = {
          ...req.body,
          imagen: imagenUrl,
        }
    
        const blog = await this.blogsService.crearBlog(nuevoBlog);
        res.status(201).json(blog);
      } catch (error) {
        console.error('Error en crearBlog:', error); 
        res.status(500).json({ message: 'Error al crear el blog' });
      }
    }
  
    async actualizarBlog(req, res) {
      try {
        const id = req.params.id;
        const datosActualizados = req.body;
        if (req.file) {
          datosActualizados.imagen = req.file.path; 
        }
        const blog = await this.blogsService.actualizarBlog(id, datosActualizados);
        if (blog) {
          res.json(blog);
        } else {
          res.status(404).json({ message: 'Blog no encontrado' });
        }
      } catch (error) {
        console.error('Error en actualizarBlog:', error); 
        res.status(500).json({ message: 'Error al actualizar el blog' });
      }
    }
  
    async eliminarBlog(req, res) {
      try {
        const id = req.params.id;
        const eliminado = await this.blogsService.eliminarBlog(id);
        if (eliminado) {
          res.json({ message: 'Blog eliminado' });
        } else {
          res.status(404).json({ message: 'Bloog no encontrado' });
        }
      } catch (error) {
        console.error('Error en eliminarBlog:', error); 
        res.status(500).json({ message: 'Error al eliminar el Blog' });
      }
    }

    async obtenerBlogsPorVeterinarioId(req, res) {
      try {
        const veterinarioId = req.params.id;
        const blogs = await this.blogsService.obtenerBlogsPorVeterinarioId(veterinarioId);
        if (blogs.length > 0) {
          res.json(blogs);
        } else {
          res.status(404).json({ message: 'No hay blogs publicados por este veterinario' });
        }
      } catch (error) {
        console.error('Error en ObtenerBlogsPorVeterinarioId:', error);
        res.status(500).json({ message: 'Error al obtener los blogs del veterinario' });
      }
    }

    async ObtenerBlogsPorNombre(req, res) {
      try {
        const nombre = req.query.nombre; 
        const blogs = await this.blogsService.ObtenerBlogsPorNombre(nombre); 
    
        if (blogs.length > 0) {
          res.json(blogs);
        } else {
          res.status(404).json({ message: 'No se encontraron blogs con ese nombre' });
        }
      } catch (error) {
        console.error('Error al obtener blogs por nombre:', error);
        res.status(500).json({ message: 'Error interno al obtener los blogs' });
      }
    }
    
    


  }
  
  module.exports = BlogControlller;
  