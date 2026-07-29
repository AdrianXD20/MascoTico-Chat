const express = require('express')
const router = express.Router();
const BlogControlller = require('../Controllers/blogsController');
const BlogsService = require ('../Services/blogsServices')
const {verifyToken,isAdmin} = require('../middleware/authMiddleware');
/*
const upload = require ('../middleware/multer')
*/

const upload = require ('../middleware/cloudinary').upload;
const blogService = new BlogsService()
const blogController = new BlogControlller(blogService)

/**
 * @swagger
 * components:
 *   schemas:
 *     Blog:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *           example: 1
 *         titulo:
 *           type: string
 *           example: "Cómo cuidar a tu perro en verano"
 *         imagen:
 *           type: string
 *           example: "/uploads/cuidado-perro-verano.jpg"
 *         categoria:
 *           type: string
 *           example: "Consejos de cuidado"
 *         id_veterinario:
 *           type: integer
 *           example: 3
 *         fecha_publicacion:
 *           type: string
 *           format: date-time
 *           example: "2024-11-28T14:30:00Z"
 *         contenido:
 *           type: string
 *           example: "En este blog te explicamos cómo mantener fresco a tu perro durante el verano..."
 *       required:
 *         - id
 *         - titulo
 *         - contenido
 */

/**
 * @swagger
 * /blogs:
 *   get:
 *     summary: Obtener todos los blogs
 *     tags: [Blogs]
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
 *         description: Lista de todos los blogs
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Blog'
 *       404:
 *         description: No se encontraron blogs
 */
router.get('/blogs', (req,res) => blogController.obtenerBlogs(req,res));

/**
 * @swagger
 * /blogs/{id}:
 *   get:
 *     summary: Obtener un blog por ID
 *     tags: [Blogs]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: ID del blog a buscar
 *     responses:
 *       200:
 *         description: Blog encontrado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Blog'
 *       404:
 *         description: Blog no encontrado
 */
router.get('/blogs/:id', (req,res) => blogController.obtenerBlogPorId(req,res));

/**
 * @swagger
 * /blogs:
 *   post:
 *     summary: Crear un nuevo blog con imagen
 *     tags: [Blogs]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               titulo:
 *                 type: string
 *                 example: "Cómo cuidar a tu perro en verano"
 *               imagen:
 *                 type: string
 *                 format: binary
 *               categoria:
 *                 type: string
 *                 example: "Consejos de cuidado"
 *               id_veterinario:
 *                 type: integer
 *                 example: 3
 *               contenido:
 *                 type: string
 *                 example: "En este blog te explicamos cómo mantener fresco a tu perro durante el verano..."
 *     responses:
 *       201:
 *         description: Blog creado exitosamente
 *       400:
 *         description: Error en la solicitud
 */
router.post('/blogs', verifyToken,isAdmin, upload.single('imagen'), (req,res)=> blogController.crearBlog(req,res));

/**
 * @swagger
 * /blogs/{id}:
 *   put:
 *     summary: Actualizar un blog por ID
 *     tags: [Blogs]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: ID del blog a actualizar
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               titulo:
 *                 type: string
 *                 example: "Cómo cuidar a tu perro en verano"
 *               imagen:
 *                 type: string
 *                 format: binary
 *               categoria:
 *                 type: string
 *                 example: "Consejos de cuidado"
 *               id_veterinario:
 *                 type: integer
 *                 example: 3
 *               contenido:
 *                 type: string
 *                 example: "Contenido actualizado del blog..."
 *     responses:
 *       200:
 *         description: Blog actualizado exitosamente
 *       404:
 *         description: Blog no encontrado
 */
router.put('/blogs/:id', verifyToken,isAdmin, upload.single('imagen'), (req,res) => blogController.actualizarBlog(req,res));

/**
 * @swagger
 * /blogs/{id}:
 *   delete:
 *     summary: Eliminar un blog por ID
 *     tags: [Blogs]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: ID del blog a eliminar
 *     responses:
 *       200:
 *         description: Blog eliminado exitosamente
 *       404:
 *         description: Blog no encontrado
 */
router.delete('/blogs/:id', verifyToken,isAdmin, (req,res) => blogController.eliminarBlog(req,res));

/**
 * @swagger
 * /blogs/veterinario/{id}:
 *   get:
 *     summary: Obtener blogs por veterinario
 *     description: Obtiene una lista de blogs publicados por un veterinario específico.
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: ID del veterinario.
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Lista de blogs.
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: integer
 *                   titulo:
 *                     type: string
 *                   contenido:
 *                     type: string
 *       404:
 *         description: No se encontraron blogs para este veterinario.
 *       500:
 *         description: Error interno del servidor.
 */
router.get('/blogs/veterinario/:id', (req, res) => blogController.obtenerBlogsPorVeterinarioId(req, res));

/**
 * @swagger
 * /blog/nombre:
 *   get:
 *     summary: Obtener blogs por nombre
 *     description: Busca blogs cuyo título coincida parcialmente con el nombre ingresado.
 *     parameters:
 *       - in: query
 *         name: nombre
 *         schema:
 *           type: string
 *         required: true
 *         description: Parte del título del blog que se desea buscar.
 *     responses:
 *       200:
 *         description: Lista de blogs encontrados.
 *       404:
 *         description: No se encontraron blogs con ese nombre.
 */
router.get('/blog/nombre', (req, res) => blogController.ObtenerBlogsPorNombre(req, res));

module.exports = router;