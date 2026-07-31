class MascotaController {
    constructor(mascotaService) {
      this.mascotaService = mascotaService;
    }
  
async obtenerMascotas(req, res) {
      try {
        const { page = 1, limit = 10 } = req.query;   // 👈 valor por defecto agregado
        const pageNumber = parseInt(page);
        const pageSize = parseInt(limit);

        // 👇 Validación extra, por si llega algo no numérico tipo ?limit=abc
        if (isNaN(pageNumber) || isNaN(pageSize)) {
          return res.status(400).json({ message: 'Parámetros de paginación inválidos' });
        }

        const productos = await this.mascotaService.obtenerMascotas(pageNumber, pageSize);
        res.json(productos);
      } catch (error) {
        console.error('Error en obtenerMascotas:', error); 
        res.status(500).json({ message: 'Error al obtener las Mascotas' });  // 👈 quité error.message del response al cliente (M-01)
      }
    }
  
    async obtenerMascotasPorId(req, res) {
      try {
        const id = req.params.id;
        const mascota = await this.mascotaService.obtenerMascotasPorId(id);
        if (!mascota) {
          return res.status(404).json({ message: 'Mascota no encontrado' });
        }
        if (req.user.rol !== 'admin' && String(mascota.id_usuario) !== String(req.user.id)) {
          return res.status(403).json({ message: 'No tienes permisos para ver esta mascota' });
        }
        res.json(mascota);
      } catch (error) {
        console.error('Error en obtenerMascotaPorId:', error); 
        res.status(500).json({ message: 'Error al obtener la Mascota' });
      }
    }
  
    async crearMascotas(req, res) {
      try {
        const nuevoProducto = req.body;
        const producto = await this.mascotaService.crearMascotas(nuevoProducto);
        res.status(201).json(producto);
      } catch (error) {
        console.error('Error en crearMascota:', error); 
        res.status(500).json({ message: 'Error al crear la Mascota' });
      }
    }
  
    async actualizarMascotas(req, res) {
      try {
        const id = req.params.id;
        const datosActualizados = req.body;
        const producto = await this.mascotaService.actualizarMascotas(id, datosActualizados);
        if (producto) {
          res.json(producto);
        } else {
          res.status(404).json({ message: 'Mascota no encontrado' });
        }
      } catch (error) {
        console.error('Error en actualizarMascota:', error); 
        res.status(500).json({ message: 'Error al actualizar la Mascota' });
      }
    }
  
    async eliminarMascotas(req, res) {
      try {
        const id = req.params.id;
        const eliminado = await this.mascotaService.eliminarMascotas(id);
        if (eliminado) {
          res.json({ message: 'Mascota eliminado' });
        } else {
          res.status(404).json({ message: 'Mascota no encontrado' });
        }
      } catch (error) {
        console.error('Error en eliminarMascota:', error); 
        res.status(500).json({ message: 'Error al eliminar la mascota' });
      }
    }
  }
  
  module.exports = MascotaController;
  