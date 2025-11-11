const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { protegerRuta } = require('../middleware/auth');

// Rutas públicas
router.post('/register', authController.registrarAdmin);
router.post('/login', authController.loginAdmin);

// Rutas protegidas
router.get('/me', protegerRuta, authController.obtenerPerfil);
router.get('/verificar', protegerRuta, authController.verificarToken);
router.put('/cambiar-password', protegerRuta, authController.cambiarPassword);

module.exports = router;
