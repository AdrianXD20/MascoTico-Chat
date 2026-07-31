const Mascota = require('../Models/mascotaModel'); // Importar el modelo

class mascotasServices {
  
  _sanitizar(valor) {
    if (typeof valor !== 'string') return valor;
    if (valor.length > 1000) valor = valor.slice(0, 1000);
    return valor
      .replace(/<[^>]*>/g, '')
      .replace(/[<>]/g, '')
      .replace(/on\w+\s*=\s*(?:"[^"]*"|'[^']*'|[^\s>]*)/gi, '')
      .replace(/javascript\s*:/gi, '')
      .replace(/expression\s*\(/gi, '')
      .replace(/data:\s*text\/html/gi, '');
  }

  _sanitizarObjeto(obj) {
    const campos = ['nombre', 'raza', 'especie', 'color', 'tipo', 'edad', 'peso', 'condiciones_medicas'];
    const sanitizado = {};
    for (const key of Object.keys(obj)) {
      if (campos.includes(key)) {
        sanitizado[key] = this._sanitizar(obj[key]);
      }
    }
    return sanitizado;
  }

  async obtenerMascotas(page, limit) {
    const offset = (page - 1) * limit;
    return Mascota.findAll({
      limit,
      offset
    });
  }

  async obtenerMascotasPorId(Id) {
    return Mascota.findByPk(Id);
  }

  async crearMascotas(nuevoProducto) {
    const sanitizado = this._sanitizarObjeto(nuevoProducto);
    return Mascota.create(sanitizado); 
  }

  async actualizarMascotas(Id, datosActualizados) {
    const mascota = await Mascota.findByPk(Id);
    if (mascota) {
      const sanitizado = this._sanitizarObjeto(datosActualizados);
      return mascota.update(sanitizado);
    }
    return null; 
  }

  async eliminarMascotas(Id) {
    const mascota = await Mascota.findByPk(Id);
    if (mascota) {
      return mascota.destroy(); 
    }
    return null;
  }
}

module.exports = mascotasServices;
