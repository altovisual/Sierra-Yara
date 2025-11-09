const express = require('express');
const router = express.Router();
const {
  obtenerTasaActual,
  obtenerHistorico,
  actualizarTasaManual,
  actualizarTasaDesdeAPI,
  obtenerEstadisticas
} = require('../controllers/tasaBCVController');

// Rutas públicas
router.get('/actual', obtenerTasaActual);

// Rutas de administración
router.get('/historico', obtenerHistorico);
router.get('/estadisticas', obtenerEstadisticas);
router.post('/actualizar', actualizarTasaManual);
router.post('/actualizar-api', actualizarTasaDesdeAPI);

module.exports = router;
