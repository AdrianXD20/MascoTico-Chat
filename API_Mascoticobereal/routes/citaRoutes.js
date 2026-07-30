const express = require('express');
const router = express.Router();
const CitasController = require('../Controllers/citaController');
const { verifyToken } = require('../middleware/authMiddleware');
const { citaCrear, citaEstado } = require('../middleware/validators');

/**
 * @swagger
 * tags:
 * - name: Citas
 * description: Endpoints para gestionar citas con veterinarios
 */

/**
 * @swagger
 * /citas:
 * post:
 * summary: Agendar una nueva cita
 * tags: [Citas]
 * requestBody:
 * required: true
 * content:
 * application/json:
 * schema:
 * type: object
 * required:
 * - id_veterinario
 * - fecha_cita
 * - hora_cita
 * - razon
 * - mascota
 * - cliente
 * properties:
 * id_veterinario:
 * type: integer
 * example: 1
 * fecha_cita:
 * type: string
 * format: date
 * example: "2024-02-15"
 * hora_cita:
 * type: string
 * format: time
 * example: "10:30:00"
 * razon:
 * type: string
 * example: "Consulta general"
 * mascota:
 * type: integer
 * example: 3
 * cliente:
 * type: integer
 * example: 5
 * responses:
 * 201:
 * description: Cita creada exitosamente
 * 400:
 * description: Error en los datos proporcionados
 */
router.post('/citas', verifyToken, citaCrear, CitasController.agendarCita);

/**
 * @swagger
 * /citas/{id}:
 * put:
 * summary: Actualizar el estado de una cita (Pendiente, Confirmada o Rechazada)
 * tags: [Citas]
 * parameters:
 * - in: path
 * name: id
 * schema:
 * type: integer
 * required: true
 * description: ID de la cita a actualizar
 * requestBody:
 * required: true
 * content:
 * application/json:
 * schema:
 * type: object
 * required:
 * - estado
 * properties:
 * estado:
 * type: string
 * enum: [pendiente, confirmada, rechazada]
 * example: "confirmada"
 * responses:
 * 200:
 * description: Estado de la cita actualizado
 * 400:
 * description: Error en la solicitud
 * 404:
 * description: Cita no encontrada
 */
router.put('/citas/:id', verifyToken, citaEstado, CitasController.actualizarEstadoCita);

/**
 * @swagger
 * /citas/veterinario/{id_veterinario}:
 * get:
 * summary: Obtener todas las citas de un veterinario
 * tags: [Citas]
 * parameters:
 * - in: path
 * name: id_veterinario
 * schema:
 * type: integer
 * required: true
 * description: ID del veterinario para obtener sus citas
 * responses:
 * 200:
 * description: Lista de citas del veterinario
 * 400:
 * description: Error en la solicitud
 */
router.get('/citas/veterinario/:id_veterinario', verifyToken, CitasController.obtenerCitasPorVeterinario);

/**
 * @swagger
 * /citas/usuario/{cliente}:
 * get:
 * summary: Obtener todas las citas de un usuario
 * tags: [Citas]
 * parameters:
 * - in: path
 * name: cliente
 * schema:
 * type: integer
 * required: true
 * description: ID del usuario para obtener sus citas
 * responses:
 * 200:
 * description: Lista de citas del usuario
 * 400:
 * description: Error en la solicitud
 */
// 🚨 CORRECCIÓN: Apunta con mayúscula exacta a la función exportada
router.get('/citas/usuario/:cliente', verifyToken, CitasController.ObtenerCitasByUserId);

module.exports = router;