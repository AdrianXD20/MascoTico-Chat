const express = require('express');
const router = express.Router();
const { verifyToken, isAdmin } = require('../middleware/authMiddleware');
const db = require('../database/conexion');

const VentaService = require('../Services/ventasServices');
const VentaRepository = require('../Repositories/ventasRepository');
const VentaController = require('../Controllers/ventasController');
const { ventaCrear } = require('../middleware/validators');

const ventaRepository = new VentaRepository(db);
const ventaService = new VentaService(ventaRepository);
const ventaController = new VentaController(ventaService);

// ✅ IMPORTANTE: rutas específicas ANTES de las genéricas con :id
router.get('/ventas/usuario/:id_usuario', verifyToken, (req, res) => ventaController.ventasByUserId(req, res));

router.get('/ventas', verifyToken, isAdmin, (req, res) => ventaController.obtenerVentas(req, res));
router.get('/ventas/:id', verifyToken, isAdmin, (req, res) => ventaController.obtenerVentaPorId(req, res));
router.post('/ventas', verifyToken, ventaCrear, (req, res) => ventaController.crearVenta(req, res));
router.put('/ventas/:id', verifyToken, isAdmin, (req, res) => ventaController.actualizarVenta(req, res));
router.delete('/ventas/:id', verifyToken, isAdmin, (req, res) => ventaController.eliminarVenta(req, res));

module.exports = router;