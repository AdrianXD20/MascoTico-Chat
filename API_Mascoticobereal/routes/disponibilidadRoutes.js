const express = require('express');
const router = express.Router();
const { verifyToken } = require('../middleware/authMiddleware');
const disponibilidadController = require('../Controllers/disponibilidadController');

/**
 * @swagger
 * tags:
 *   name: Disponibilidad
 *   description: Gestión de la disponibilidad de los veterinarios
 */

/**
 * @swagger
 * /disponibilidad:
 *   post:
 *     summary: Definir la disponibilidad de un veterinario
 *     tags: [Disponibilidad]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - id_veterinario
 *               - fecha
 *               - hora_inicio
 *               - hora_fin
 *             properties:
 *               id_veterinario:
 *                 type: integer
 *                 example: 1
 *               fecha:
 *                 type: string
 *                 format: date
 *                 example: "2025-02-15"
 *               hora_inicio:
 *                 type: string
 *                 format: time
 *                 example: "09:00:00"
 *               hora_fin:
 *                 type: string
 *                 format: time
 *                 example: "14:00:00"
 *     responses:
 *       201:
 *         description: Disponibilidad creada correctamente
 *       400:
 *         description: Error en los datos
 */
router.post('/disponibilidad', verifyToken, disponibilidadController.definirDisponibilidad);

/**
 * @swagger
 * /disponibilidad/veterinario/{id_veterinario}:
 *   get:
 *     summary: Obtener la disponibilidad de un veterinario
 *     tags: [Disponibilidad]
 *     parameters:
 *       - in: path
 *         name: id_veterinario
 *         schema:
 *           type: integer
 *         required: true
 *         description: ID del veterinario
 *     responses:
 *       200:
 *         description: Lista de disponibilidad del veterinario
 *       404:
 *         description: Veterinario no encontrado
 */
router.get('/disponibilidad/veterinario/:id_veterinario', verifyToken, disponibilidadController.obtenerDisponibilidadPorVeterinario);

/**
 * @swagger
 * /disponibilidad/{id}:
 *   delete:
 *     summary: Eliminar una disponibilidad de un veterinario
 *     tags: [Disponibilidad]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: ID de la disponibilidad a eliminar
 *     responses:
 *       200:
 *         description: Disponibilidad eliminada correctamente
 *       404:
 *         description: Disponibilidad no encontrada
 */
router.delete('/disponibilidad/:id', verifyToken, disponibilidadController.eliminarDisponibilidad);

module.exports = router;
