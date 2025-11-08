const express = require('express');
const router = express.Router();
const promocionController = require('../controllers/promocionController');

/**
 * Rutas para gestión de promociones
 */

// Obtener todas las promociones (Admin)
router.get('/', promocionController.obtenerTodas);

// Obtener promociones activas (Cliente)
router.get('/activas', promocionController.obtenerActivas);

// Obtener una promoción por ID
router.get('/:id', promocionController.obtenerPorId);

// Crear nueva promoción (Admin)
router.post('/', promocionController.crear);

// Actualizar promoción (Admin)
router.put('/:id', promocionController.actualizar);

// Eliminar promoción (Admin)
router.delete('/:id', promocionController.eliminar);

// Activar/Desactivar promoción (Admin)
router.patch('/:id/toggle', promocionController.toggleActiva);

module.exports = router;
