const disponibilidadService = require('../Services/disponibilidadService');

exports.definirDisponibilidad = async (req, res) => {
    try {
        const { id_veterinario, fecha, hora_inicio, hora_fin } = req.body;

        if (req.user.rol !== 'admin' && String(req.user.id) !== String(id_veterinario)) {
            return res.status(403).json({ error: 'No tienes permisos para definir la disponibilidad de este veterinario' });
        }

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

        const disponibilidad = await disponibilidadService.obtenerDisponibilidadPorId(id);
        if (!disponibilidad) {
            return res.status(404).json({ error: 'Disponibilidad no encontrada' });
        }

        if (req.user.rol !== 'admin' && String(req.user.id) !== String(disponibilidad.id_veterinario)) {
            return res.status(403).json({ error: 'No tienes permisos para eliminar esta disponibilidad' });
        }

        await disponibilidadService.eliminarDisponibilidad(id);
        res.json({ message: 'Disponibilidad eliminada correctamente' });
    } catch (error) {
        res.status(500).json({ error: 'Error al eliminar la disponibilidad' });
    }
};
