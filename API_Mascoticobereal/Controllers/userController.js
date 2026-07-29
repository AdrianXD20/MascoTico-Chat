// userController.js
const express = require('express');
const { verifyToken } = require('../middleware/authMiddleware');
const UserService = require('../Services/ObtenerUser');
const UserRepository = require('../Repositories/UserRepository'); // Asegúrate de que la ruta sea correcta

const db= require('../database/conexion.js')

const userRepository = new UserRepository(); // Crear una instancia de UserRepository
const userService = new UserService(userRepository); // Crear una instancia de UserService

const router = express.Router();

router.get("/user", verifyToken, async (req, res) => {
    try {
        const user = await userService.ObtenerUser(req.user.id);
        res.json(user);
    } catch (error) {
        res.status(500).json({ error: 'Error al obtener el usuario' });
    }
});

module.exports = router;
