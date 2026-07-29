const disponibilidadService = require('../Services/disponibilidadService');

exports.definirDisponibilidad = async (req, res) => {
    try {
        const { id_veterinario, fecha, hora_inicio, hora_fin } = req.body;
        const nuevaDisponibilidad = await disponibilidadService.definirDisponibilidad(id_veterinario, fecha, hora_inicio, hora_fin);
        res.status(201).json(nuevaDisponibilidad);
    } catch (error) {
        res.status(500).json({ error: 'Error al definir la disponibilidad' });
    }
};

exports.obtenerDisponibilidadPorVeterinario = async (req, res) => {
    try {
        const { id_veterinario } = req.params;
        const disponibilidad = await disponibilidadService.obtenerDisponibilidadPorVeterinario(id_veterinario);
        res.json(disponibilidad);
    } catch (error) {
        res.status(500).json({ error: 'Error al obtener la disponibilidad' });
    }
};

exports.eliminarDisponibilidad = async (req, res) => {
    try {
        const { id } = req.params;
        await disponibilidadService.eliminarDisponibilidad(id);
        res.json({ message: 'Disponibilidad eliminada correctamente' });
    } catch (error) {
        res.status(500).json({ error: 'Error al eliminar la disponibilidad' });
    }
};
