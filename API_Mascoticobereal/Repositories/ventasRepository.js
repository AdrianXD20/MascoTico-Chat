const db = require('../database/conexion');

class ventaRepository {
    constructor(db) {
        this.db = db;
    }

    obtenerVentas(limit, offset) {
        return new Promise((resolve, reject) => {
            this.db.query('SELECT * FROM ventas LIMIT ? OFFSET ?', [limit, offset], (err, results) => {
                if (err) {
                    console.error('Error al obtener las ventas: ', err);
                    return reject(err);
                }
                resolve(results);
            });
        });
    }

    obtenerVentaPorId(Id) {
        return new Promise((resolve, reject) => {
            this.db.query('SELECT * FROM ventas WHERE id = ?', [Id], (err, results) => {
                if (err) {
                    console.error('Error en la busqueda de la venta: ', err);
                    return reject(err);
                }
                resolve(results);
            });
        });
    }

    crearVenta(nuevaVenta) {
        return new Promise((resolve, reject) => {
            this.db.query('INSERT INTO ventas SET ?', nuevaVenta, (err, results) => {
                if (err) {
                    console.error('Error al crear una venta: ', err);
                    return reject(err);
                }
                resolve(results);
            });
        });
    }

    actualizarVenta(Id, datosActualizados) {
        return new Promise((resolve, reject) => {
            this.db.query('UPDATE ventas SET ? WHERE id = ?', [datosActualizados, Id], (err, results) => {
                if (err) {
                    console.error('Error al actualizar la venta: ', err);
                    return reject(err);
                }
                resolve(results.affectedRows > 0 ? { Id, ...datosActualizados } : null);
            });
        });
    }

    eliminarVenta(Id) {
        return new Promise((resolve, reject) => {
            this.db.query('DELETE FROM ventas WHERE id = ?', [Id], (err, results) => {
                if (err) {
                    console.error('Error al eliminar la venta: ', err);
                    return reject(err);
                }
                resolve(results.affectedRows > 0);
            });
        });
    }

    obtenerDetallesPorVenta(idVenta) {
    const { QueryTypes } = require('sequelize');
    return this.db.query(
        `SELECT 
            dv.id,
            dv.id_producto,
            dv.cantidad,
            dv.precio_unitario,
            dv.subtotal,
            p.nombre AS nombre_producto,
            p.marca
        FROM detalle_venta dv
        JOIN productos p ON dv.id_producto = p.id
        WHERE dv.id_venta = :idVenta`,
        {
            replacements: { idVenta },
            type: QueryTypes.SELECT
        }
    );
}


}

module.exports = ventaRepository;