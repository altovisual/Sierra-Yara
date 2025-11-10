const express = require('express');
const router = express.Router();
const {
  generarReporteVentas,
  generarReporteProductos,
  generarReporteCompleto
} = require('../controllers/reporteController');

// Rutas de reportes (todas requieren autenticación de admin en producción)
router.get('/ventas/excel', generarReporteVentas);
router.get('/productos/excel', generarReporteProductos);
router.get('/completo/excel', generarReporteCompleto);

module.exports = router;
