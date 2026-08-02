const citaService = require('../Services/citasServices');
const auditLog = require('../Services/auditLog');

exports.agendarCita = async (req, res) => {
    try {
        const datos = { ...req.body, id_usuario: req.user.id };
        const cita = await citaService.agendarCita(datos);
        auditLog.log('cita_creada', { user_id: req.user?.id, cita_id: cita?.id, veterinario_id: req.body.id_veterinario, ip: req.ip });
        res.status(201).json({ message: 'Cita registrada', cita });
    } catch (error) {
        res.status(400).json({ error: 'Error al agendar la cita' });
    }
};

exports.actualizarEstadoCita = async (req, res) => {
    try {
        const { id } = req.params;
        const { estado } = req.body;
        const cita = await citaService.obtenerCitaPorId(id);
        if (!cita) {
            return res.status(404).json({ error: 'Cita no encontrada' });
        }
        if (req.user.rol !== 'admin' && String(cita.id_usuario) !== String(req.user.id) && String(cita.id_veterinario) !== String(req.user.id)) {
            return res.status(403).json({ error: 'No tienes permisos para modificar esta cita' });
        }
        const actualizada = await citaService.actualizarEstadoCita(id, estado);
        res.json({ message: `Cita ${estado}`, cita: actualizada });
    } catch (error) {
        res.status(400).json({ error: 'Error al actualizar el estado de la cita' });
    }
};

exports.obtenerCitasPorVeterinario = async (req, res) => {
    try {
        const idVeterinario = req.params.id_veterinario;

        if (req.user.rol !== 'admin' && String(req.user.id) !== String(idVeterinario)) {
            return res.status(403).json({ error: 'No tienes permisos para ver las citas de este veterinario' });
        }

        const citas = await citaService.obtenerCitasPorVeterinario(idVeterinario);
        res.json(citas);
    } catch (error) {
        res.status(400).json({ error: 'Error al obtener las citas del veterinario' });
    }
};

exports.ObtenerCitasByUserId = async (req, res) => {
    try {
        const clienteId = req.params.cliente;

        if (req.user.rol !== 'admin' && String(req.user.id) !== String(clienteId)) {
            return res.status(403).json({ error: 'No tienes permisos para ver las citas de este usuario' });
        }

        const citas = await citaService.ObtenerCitasByUserId(clienteId);
        res.json(citas);
    } catch (error) {
        res.status(500).json({ error: 'Error al obtener las citas del usuario' });
    }
};