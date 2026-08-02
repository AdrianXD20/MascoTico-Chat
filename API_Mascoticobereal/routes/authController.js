const express = require('express');
const router = express.Router();
const upload = require('../middleware/cloudinary').upload;

const authService = require('../Services/authService.js');
const UsuarioController= require ('../Controllers/usuarioController.js');
const UserRepository = require('../Repositories/UserRepository.js');
const { verifyToken, revocarToken  } = require('../middleware/authMiddleware.js');
const { verifyCaptcha } = require('../middleware/captchaMiddleware');
const { csrfProtection } = require('../middleware/csrfMiddleware');
const { verifyRol } = require('../middleware/verifyRol');
const { usuarioRegistro, usuarioLogin } = require('../middleware/validators');
const auditLog = require('../Services/auditLog');


const userRepository = new UserRepository();
const userService = new authService(userRepository);
const userController = new UsuarioController(userService)
 
/**
 * @swagger
 * /logout:
 *   post:
 *     summary: Cierra la sesión del usuario, revocando su token actual.
 */
router.post('/logout', verifyToken, verifyRol, async (req, res) => {
    revocarToken(req.token);
    await userService.revocarRefreshTokens(req.user.id);
    auditLog.log('logout', { user_id: req.user.id, email: req.user.email });
    res.json({ message: 'Sesión cerrada correctamente' });
});

/**
 * @swagger
 * /register:
 *   post:
 *     summary: Registra un nuevo usuario.
 */
router.post('/register', csrfProtection, verifyCaptcha, usuarioRegistro, upload.single('imagen_perfil'),(req,res) => userController.crearUsuario(req,res));

/**
 * @swagger
 * /login:
 *   post:
 *     summary: Inicia sesión un usuario.
 */
router.post('/login', csrfProtection, usuarioLogin, (req,res)=> userController.login(req,res));

router.post('/refresh', csrfProtection, async (req, res) => {
  try {
    const { refreshToken } = req.body;
    if (!refreshToken) {
      return res.status(400).json({ error: 'Refresh token requerido' });
    }
    const tokens = await userService.refreshJWT(refreshToken);
    res.json(tokens);
  } catch (error) {
    res.status(401).json({ error: error.message });
  }
});

/**
 * @swagger
 * /recuperar:
 *   post:
 *     summary: Solicitar recuperación de contraseña.
 */
 router.post('/recuperar', csrfProtection, async (req, res) => {
    const { email } = req.body;
    const response = await userService.solicitarRecuperacion(email);
    res.json(response);
  });

/**
 * @swagger
 * /resetear:
 *   post:
 *     summary: Restablecer contraseña.
 */
 router.post('/resetear', csrfProtection, async (req, res) => {
    const { token, nuevaContraseña } = req.body;
    if (!token || !nuevaContraseña) {
      return res.status(400).json({ error: 'Token y nueva contraseña son requeridos' });
    }
    const response = await userService.resetearPassword(token, nuevaContraseña);
    if (!response) {
      return res.status(400).json({ error: 'Token inválido o expirado' });
    }
    res.json(response);
  });

/**
 * @swagger
 * /usuarios:
 *   get:
 *     summary: Obtiene todos los usuarios
 */
  router.get('/usuarios', verifyToken, verifyRol, (req,res)=> userController.obtenerUsuario(req,res))

  router.get('/usuario/:id', verifyToken, verifyRol, (req,res)=> userController.obtenerUsuarioId(req,res))

  router.put('/usuario/:id', verifyToken, verifyRol, upload.single('imagen_perfil') , (req,res)=> userController.actualizarUsuario(req,res))

  router.delete('/usuario/:id', verifyToken, verifyRol, (req,res)=> userController.eliminarUsuario(req,res))
  
  module.exports = router;