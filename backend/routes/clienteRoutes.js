const express = require('express');
const router = express.Router();
const clienteController = require('../controllers/clienteController');

// Rutas públicas
router.post('/', clienteController.crearOActualizarCliente);

// Rutas privadas (Admin)
router.get('/', clienteController.obtenerClientes);
router.get('/estadisticas/resumen', clienteController.obtenerEstadisticas);
router.get('/exportar/marketing', clienteController.exportarParaMarketing);
router.get('/cedula/:cedula', clienteController.obtenerClientePorCedula);
router.get('/:id', clienteController.obtenerClientePorId);
router.put('/:id', clienteController.actualizarCliente);
router.delete('/:id', clienteController.desactivarCliente);

module.exports = router;
