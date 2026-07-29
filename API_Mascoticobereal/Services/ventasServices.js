const { off } = require('process');
const ventas = require('../Models/ventasModel');

class ventaService {

    constructor(ventaRepository) {
        this.ventaRepository = ventaRepository;
    }

    async obtenerVentas(page, limit) {
        const offset = (page - 1) * limit;
        return ventas.findAll({ limit, offset });
    }

    async obtenerVentaPorId(Id) {
        return ventas.findByPk(Id);
    }

    async crearVenta(nuevoExtra) {
        return ventas.create(nuevoExtra);
    }

    async actualizarVenta(Id, datosActualizados) {
        const venta = await ventas.findByPk(Id);
        if (venta) {
            const updateRows = await ventas.update(datosActualizados, { where: { id: Id } });
            if (updateRows > 0) {
                return ventas.findByPk(Id);
            }
        }
        return null;
    }

    async eliminarVenta(Id) {
        const venta = await ventas.findByPk(Id);
        if (venta) {
            return ventas.destroy({ where: { id: Id } });
        }
        return null;
    }

    async ventasByIdUser(UserId) {
        const ventasData = await ventas.findAll({
            where: { id_usuario: UserId },
            order: [['fecha_creacion', 'DESC']]
        });

        if (!ventasData || ventasData.length === 0) return [];

        const resultado = await Promise.all(
            ventasData.map(async (venta) => {
                const detalles = await this.ventaRepository.obtenerDetallesPorVenta(venta.id);
                return {
                    ...venta.toJSON(),
                    detalles
                };
            })
        );

        return resultado;
    }
}

module.exports = ventaService;