const DisponibilidadVeterinario = require('../Models/disponibilidad_veterinarioModel');

async function definirDisponibilidad(id_veterinario, fecha, hora_inicio, hora_fin) {
    return await DisponibilidadVeterinario.create({ id_veterinario, fecha, hora_inicio, hora_fin });
}

async function obtenerDisponibilidadPorVeterinario(id_veterinario) {
    return await DisponibilidadVeterinario.findAll({ where: { id_veterinario } });
}

async function eliminarDisponibilidad(id) {
    return await DisponibilidadVeterinario.destroy({ where: { id } });
}

module.exports = { definirDisponibilidad, obtenerDisponibilidadPorVeterinario, eliminarDisponibilidad };
