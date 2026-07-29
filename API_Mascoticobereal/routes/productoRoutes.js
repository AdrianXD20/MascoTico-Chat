const express = require('express');
const router = express.Router();
const ProductoController = require('../Controllers/productoController');
const ProductoService = require('../Services/productoServices');
const ProductoRepository = require('../Repositories/productoRepository');
const rateLimit = require('express-rate-limit');

const upload = require('../middleware/cloudinary').upload;
const { verifyToken, isAdmin } = require('../middleware/authMiddleware'); // 👈 ajusta el path si tu archivo se llama distinto

const productoRepository = new ProductoRepository();
const productoService = new ProductoService(productoRepository);
const productoController = new ProductoController(productoService);

/**
 * @swagger
 * /productos/nombre:
 * get:
 * summary: Obtener productos por nombre
 */
router.get('/productos/nombre', (req, res) => productoController.ObtenerProductosByName(req, res));

/** * @swagger
 * /productos:
 * get:
 * summary: Obtener todos los productos
 */
// ✅ Público — lectura de catálogo es correcto que sea abierta
router.get('/productos', (req, res) => productoController.obtenerProductos(req, res));
 
/** * @swagger
 * /productos/{id}:
 * get:
 * summary: Obtener un producto por ID
 */
// ✅ Público — lectura individual también correcta
router.get('/productos/:id', (req, res) => productoController.obtenerProductoPorId(req, res));

/**
 * @swagger
 * /productos:
 * post:
 * summary: Crear un nuevo producto con imagen
 */
// 🔒 Solo admin puede crear productos
router.post('/productos', verifyToken, isAdmin, upload.single('imagen'), (req, res) => productoController.crearProducto(req, res));

/**
 * @swagger
 * /productos/{id}:
 * put:
 * summary: Actualizar un producto por ID
 */
// 🔒 Solo admin puede modificar productos
router.put('/productos/:id', verifyToken, isAdmin, upload.single('imagen'), (req, res) => productoController.actualizarProducto(req, res));

/**
 * @swagger
 * /productos/{id}:
 * delete:
 * summary: Eliminar un producto por ID
 */
// 🔒 Solo admin puede eliminar productos
router.delete('/productos/:id', verifyToken, isAdmin, (req, res) => productoController.eliminarProducto(req, res));

module.exports = router;