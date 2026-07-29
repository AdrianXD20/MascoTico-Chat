const express = require('express');
const router = express.Router();
const {verifyToken} = require('../middleware/authMiddleware')

const ExtraRepository = require('../Repositories/extraRepository')
const ExtraService = require('../Services/extraServices')
const ExtraController = require('../Controllers/extraController')

const extraRepository = new ExtraRepository()
const extraService= new ExtraService(extraRepository);
const extraController = new ExtraController (extraService);
/**
 * @swagger
 * components:
 *   schemas:
 *     CaracteristicaExtra:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *           example: 1
 *         categoria:
 *           type: string
 *           example: "Accesorios"
 *         tamañoMascota:
 *           type: string
 *           example: "Grande"
 *         Peso:
 *           type: string
 *           example: "5kg"
 *         Largo:
 *           type: string
 *           example: "30cm"
 *         Talla:
 *           type: string
 *           example: "L"
 *       required:
 *         - id
 *         - categoria
 */

/**
 * @swagger
 * /caracteristicas:
 *   get:
 *     summary: Obtener todas las características extras
 *     tags: [CaracteristicasExtras]
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
 *         description: Lista de todas las características extras
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/CaracteristicaExtra'
 *       404:
 *         description: No se encontraron características extras
 */
router.get('/caracteristicas', verifyToken, (req, res) => extraController.obtenerExtra(req, res));

/**
 * @swagger
 * /caracteristicas/{id}:
 *   get:
 *     summary: Obtener una característica extra por ID
 *     tags: [CaracteristicasExtras]
 *     security:
 *       - bearerAuth: []  
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: ID de la característica extra
 *     responses:
 *       200:
 *         description: Característica extra encontrada
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/CaracteristicaExtra'
 *       404:
 *         description: Característica extra no encontrada
 */
router.get('/caracteristicas/:id', verifyToken, (req, res) => extraController.obtenerExtraPorId(req, res));

/**
 * @swagger
 * /caracteristicas:
 *   post:
 *     summary: Crear una nueva característica extra
 *     tags: [CaracteristicasExtras]
 *     security:
 *       - bearerAuth: []  
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CaracteristicaExtra'
 *     responses:
 *       201:
 *         description: Característica extra creada exitosamente
 *       400:
 *         description: Datos de entrada no válidos
 */
router.post('/caracteristicas', verifyToken, (req, res) => extraController.crearExtra(req, res));

/**
 * @swagger
 * /caracteristicas/{id}:
 *   put:
 *     summary: Actualizar una característica extra por ID
 *     tags: [CaracteristicasExtras]
 *     security:
 *       - bearerAuth: []  
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: ID de la característica extra a actualizar
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CaracteristicaExtra'
 *     responses:
 *       200:
 *         description: Característica extra actualizada exitosamente
 *       404:
 *         description: Característica extra no encontrada
 *       400:
 *         description: Datos de entrada no válidos
 */

router.put('/caracteristicas/:id', verifyToken, (req, res) => extraController.actualizarExtra(req, res));

/**
 * @swagger
 * /caracteristicas/{id}:
 *   delete:
 *     summary: Eliminar una característica extra por ID
 *     tags: [CaracteristicasExtras]
 *     security:
 *       - bearerAuth: []  
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: ID de la característica extra a eliminar
 *     responses:
 *       200:
 *         description: Característica extra eliminada exitosamente
 *       404:
 *         description: Característica extra no encontrada
 */
router.delete('/caracteristicas/:id', verifyToken, (req, res) => extraController.eliminarExtra(req, res));

module.exports = router;
