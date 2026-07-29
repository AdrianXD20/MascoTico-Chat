const express = require('express');
const router = express.Router();
const MascotaController = require('../Controllers/mascotasController');
const MascotaService = require('../Services/mascotasServices');
const MascotaRepository = require('../Repositories/mascotasRepository');
const { verifyToken } = require('../middleware/authMiddleware');

const mascotasRepository = new MascotaRepository();
const mascotaService = new MascotaService(mascotasRepository);
const mascotasController = new MascotaController(mascotaService);

/**
 * @swagger
 * components:
 *   schemas:
 *     Mascota:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *           example: 1
 *         nombre:
 *           type: string
 *           example: "Luna"
 *         raza:
 *           type: string
 *           example: "ShihTzu"
 *         id_usuario:
 *           type: integer
 *           example: 1075
 *       required:
 *         - id
 *         - nombre
 *         - raza
 *         - id_usuario
 */

/**
 * @swagger
 * /mascotas:
 *   get:
 *     summary: Obtener todas las mascotas
 *     tags: [Mascotas]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Número de página (por defecto es 1)
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *         description: Cantidad de registros por página (por defecto es 10)
 *     responses:
 *       200:
 *         description: Lista de todas las mascotas
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Mascota'
 *       404:
 *         description: No se encontraron mascotas
 */
router.get('/mascotas', verifyToken, (req, res) => mascotasController.obtenerMascotas(req, res));

/**
 * @swagger
 * /mascotas/{id}:
 *   get:
 *     summary: Obtener una mascota por ID
 *     tags: [Mascotas]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: ID de la mascota a buscar
 *     responses:
 *       200:
 *         description: Mascota encontrada
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Mascota'
 *       404:
 *         description: Mascota no encontrada
 */
router.get('/mascotas/:id', verifyToken, (req, res) => mascotasController.obtenerMascotasPorId(req, res));

/**
 * @swagger
 * /mascotas:
 *   post:
 *     summary: Crear una nueva mascota
 *     tags: [Mascotas]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Mascota'
 *     responses:
 *       201:
 *         description: Mascota creada exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Mascota'
 *       400:
 *         description: Error en la solicitud
 */
router.post('/mascotas', verifyToken, (req, res) => mascotasController.crearMascotas(req, res));

/**
 * @swagger
 * /mascotas/{id}:
 *   put:
 *     summary: Actualizar una mascota por ID
 *     tags: [Mascotas]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: ID de la mascota a actualizar
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Mascota'
 *     responses:
 *       200:
 *         description: Mascota actualizada exitosamente
 *       400:
 *         description: Error en la solicitud
 *       404:
 *         description: Mascota no encontrada
 */
router.put('/mascotas/:id', verifyToken, (req, res) => mascotasController.actualizarMascotas(req, res));

/**
 * @swagger
 * /mascotas/{id}:
 *   delete:
 *     summary: Eliminar una mascota por ID
 *     tags: [Mascotas]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: ID de la mascota a eliminar
 *     responses:
 *       200:
 *         description: Mascota eliminada exitosamente
 *       404:
 *         description: Mascota no encontrada
 */
router.delete('/mascotas/:id', verifyToken, (req, res) => mascotasController.eliminarMascotas(req, res));

module.exports = router;
