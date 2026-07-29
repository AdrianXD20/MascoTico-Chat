const db = require('../database/conexion');

class MascotaRepository {
  constructor(db) {
    this.db = db;
  }

  obtenerMascotas(limit, offset) {
    return new Promise((resolve, reject) => {
      this.db.query('SELECT * FROM mascotas LIMIT ? OFFSET ?', [limit, offset], (err, results) => {
        if (err) {
          console.error('Error en obtener Macotas query:', err); 
          return reject(err);
        }
        resolve(results);
      });
    });
  }

  obtenerMascotasPorId(id) {
    return new Promise((resolve, reject) => {
      this.db.query('SELECT * FROM mascotas WHERE id = ?', [id], (err, results) => {
        if (err) {
          console.error('Error en obtenerMascotaPorId query:', err); 
          return reject(err);
        }
        resolve(results[0]);
      });
    });
  }

  crearMascotas(nuevoProducto) {
    return new Promise((resolve, reject) => {
      this.db.query('INSERT INTO mascotas SET ?', nuevoProducto, (err, result) => {
        if (err) {
          console.error('Error en crear Mascota query:', err); 
          return reject(err);
        }
        resolve({ id: result.insertId, ...nuevoProducto });
      });
    });
  }

  actualizarMascotas(Id, datosActualizados) {
    return new Promise((resolve, reject) => {
      this.db.query(
        'UPDATE mascotas SET ? WHERE id = ?',
        [datosActualizados, Id],
        (err, result) => {
          if (err) {
            console.error('Error en actualizar mascotas query:', err); 
            return reject(err);
          }
          resolve(result.affectedRows > 0 ? { Id, ...datosActualizados } : null);
        }
      );
    });
  }

  eliminarMascotas(Id) {
    return new Promise((resolve, reject) => {
      this.db.query('DELETE FROM mascotas WHERE id = ?', [Id], (err, result) => {
        if (err) {
          console.error('Error en eliminar Mascotas query:', err); 
          return reject(err);
        }
        resolve(result.affectedRows > 0);
      });
    });
  }
}

module.exports = MascotaRepository;
