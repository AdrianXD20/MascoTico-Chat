const db = require('../database/conexion');

class ProductoRepository {
  constructor(db) {
    this.db = db;
  }

  obtenerProductos(limit, offset) {
    return new Promise((resolve, reject) => {
      this.db.query('SELECT * FROM productos LIMIT ? OFFSET ?', [limit, offset],(err, results) => {
        if (err) {
          console.error('Error en obtenerProductos query:', err); 
          return reject(err);
        }
        resolve(results);
      });
    });
  }

  obtenerProductoPorId(id) {
    return new Promise((resolve, reject) => {
      this.db.query('SELECT * FROM productos WHERE id = ?', [id], (err, results) => {
        if (err) {
          console.error('Error en obtenerProductoPorId query:', err); 
          return reject(err);
        }
        resolve(results[0]);
      });
    });
  }

  crearProducto(nuevoProducto) {
    return new Promise((resolve, reject) => {
      this.db.query('INSERT INTO productos SET ?', nuevoProducto, (err, result) => {
        if (err) {
          console.error('Error en crearProducto query:', err); 
          return reject(err);
        }
        resolve({ id: result.insertId, ...nuevoProducto });
      });
    });
  }

  actualizarProducto(Id, datosActualizados) {
    return new Promise((resolve, reject) => {
      this.db.query(
        'UPDATE productos SET ? WHERE id = ?',
        [datosActualizados, Id],
        (err, result) => {
          if (err) {
            console.error('Error en actualizarProducto query:', err); 
            return reject(err);
          }
          resolve(result.affectedRows > 0 ? { Id, ...datosActualizados } : null);
        }
      );
    });
  }

  eliminarProducto(Id) {
    return new Promise((resolve, reject) => {
      this.db.query('DELETE FROM productos WHERE id = ?', [Id], (err, result) => {
        if (err) {
          console.error('Error en eliminarProducto query:', err); 
          return reject(err);
        }
        resolve(result.affectedRows > 0);
      });
    });
  }
}

module.exports = ProductoRepository;
