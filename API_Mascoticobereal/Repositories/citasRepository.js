const db = require('../database/conexion');

class CitaRepository {
  constructor(db) {
    this.db = db;
  }

  obtenerCitas(limit, offset) {
    return new Promise((resolve, reject) => {
      this.db.query('SELECT * FROM citas LIMIT ? OFFSET ?',[limit, offset] ,(err, results) => {
        if (err) {
          console.error('Error en obtener citas query:', err); 
          return reject(err);
        }
        resolve(results);
      });
    });
  }

  obtenerCitasPorId(id) {
    return new Promise((resolve, reject) => {
      this.db.query('SELECT * FROM citas WHERE id = ?', [id], (err, results) => {
        if (err) {
          console.error('Error en obtenerCitasPorId query:', err); 
          return reject(err);
        }
        resolve(results[0]);
      });
    });
  }

  crearCitas(nuevoProducto) {
    return new Promise((resolve, reject) => {
      this.db.query('INSERT INTO citas SET ?', nuevoProducto, (err, result) => {
        if (err) {
          console.error('Error en crear Citas query:', err); 
          return reject(err);
        }
        resolve({ id: result.insertId, ...nuevoProducto });
      });
    });
  }

  actualizarCitas(Id, datosActualizados) {
    return new Promise((resolve, reject) => {
      this.db.query(
        'UPDATE citas SET ? WHERE id = ?',
        [datosActualizados, Id],
        (err, result) => {
          if (err) {
            console.error('Error en actualizar citas query:', err); 
            return reject(err);
          }
          resolve(result.affectedRows > 0 ? { Id, ...datosActualizados } : null);
        }
      );
    });
  }

  eliminarCitas(Id) {
    return new Promise((resolve, reject) => {
      this.db.query('DELETE FROM citas WHERE id = ?', [Id], (err, result) => {
        if (err) {
          console.error('Error en eliminar Citas query:', err); 
          return reject(err);
        }
        resolve(result.affectedRows > 0);
      });
    });
  }
}

module.exports = CitaRepository;
