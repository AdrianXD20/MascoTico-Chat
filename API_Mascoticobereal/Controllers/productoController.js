class ProductoController {
  constructor(productoService) {
    this.productoService = productoService;
  }

  // Busca este método dentro de tu Controllers/productoController.js
async obtenerProductos(req, res) {
    try {
        // 🚨 CORRECCIÓN: Forzamos que si es NaN o no viene, use 1 y 10 por defecto
        let page = parseInt(req.query.page, 10);
        let limit = parseInt(req.query.limit, 10);

        if (isNaN(page) || page < 1) page = 1;
        if (isNaN(limit) || limit < 1) limit = 10;

        const resultado = await this.productoService.obtenerProductos(page, limit);
        return res.json(resultado);
    } catch (error) {
        return res.status(500).json({ 
            message: "Error al obtener los productos"
        });
    }
}

  async obtenerProductoPorId(req, res) {
    try {
      const id = req.params.id;
      const producto = await this.productoService.obtenerProductoPorId(id);
      if (producto) {
        res.json(producto);
      } else {
        res.status(404).json({ message: 'Producto no encontrado' });
      }
    } catch (error) {
      console.error('Error en obtenerProductoPorId:', error); 
      res.status(500).json({ message: 'Error al obtener el producto' });
    }
  }

  async crearProducto(req, res) {
    try {
      if (!req.file) {
          return res.status(400).json({ message: 'La imagen es obligatoria' });
      }

      // Obtener la URL de la imagen subida a Cloudinary
      const imagenUrl = req.file.path;

      const camposPermitidos = ['nombre', 'descripcion', 'precio', 'stock', 'categoria'];
      const nuevoProducto = { imagen: imagenUrl };
      for (const campo of camposPermitidos) {
        if (req.body[campo] !== undefined) {
          nuevoProducto[campo] = req.body[campo];
        }
      }

      const producto = await this.productoService.crearProducto(nuevoProducto);
      res.status(201).json(producto);
  } catch (error) {
      console.error('Error en crearProducto:', error);
      res.status(500).json({ message: 'Error al crear el producto' });
  }
  }

  async actualizarProducto(req, res) {
    try {
      const id = req.params.id;
      const camposPermitidos = ['nombre', 'descripcion', 'precio', 'stock', 'categoria'];
      const datosActualizados = {};
      for (const campo of camposPermitidos) {
        if (req.body[campo] !== undefined) {
          datosActualizados[campo] = req.body[campo];
        }
      }
      if (req.file) {
        datosActualizados.imagen = req.file.path; 
      }
      const producto = await this.productoService.actualizarProducto(id, datosActualizados);
      if (producto) {
        res.json(producto);
      } else {
        res.status(404).json({ message: 'Producto no encontrado' });
      }
    } catch (error) {
      console.error('Error en actualizarProducto:', error); 
      res.status(500).json({ message: 'Error al actualizar el producto' });
    }
  }

  async eliminarProducto(req, res) {
    try {
      const id = req.params.id;
      const eliminado = await this.productoService.eliminarProducto(id);
      if (eliminado) {
        res.json({ message: 'Producto eliminado' });
      } else {
        res.status(404).json({ message: 'Producto no encontrado' });
      }
    } catch (error) {
      console.error('Error en eliminarProducto:', error); 
      res.status(500).json({ message: 'Error al eliminar el producto' });
    }
  }

  async ObtenerProductosByName(req,res){
    try {
      const nombre = req.query.nombre;
      if (typeof nombre !== 'string' || !nombre.trim()) {
        return res.status(400).json({ message: 'El nombre debe ser un texto válido' });
      }
      const productos = await this.productoService.ObtenerProductosByName(nombre);
      if (productos.length > 0) {
        res.status(201).json(productos)
      } else {
        res.status(501).json({mesage: 'No se encontraron los productos'})
      }
    } catch (error) {
      console.error('Error al obtener productos por su nombre: ', error);
      res.status(501).json({message: 'Error al buscar productos por nombre'})
    }
  }
}

module.exports = ProductoController;
