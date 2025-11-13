const express = require('express');
const router = express.Router();
const {
  generarReporteVentas,
  generarReporteProductos,
  generarReporteCompleto,
  generarReporteVentasPDF,
  generarReporteProductosPDF,
  generarReporteCompletoPDF
} = require('../controllers/reporteController');

const {
  generarReporteCompletoDetalladoPDF,
  generarReporteClientesPDF
} = require('../controllers/reportesPDFMejorados');

// Rutas de reportes en Excel (todas requieren autenticación de admin en producción)
router.get('/ventas/excel', generarReporteVentas);
router.get('/productos/excel', generarReporteProductos);
router.get('/completo/excel', generarReporteCompleto);

// Rutas de reportes en PDF
router.get('/ventas/pdf', generarReporteVentasPDF);
router.get('/productos/pdf', generarReporteProductosPDF);
router.get('/completo/pdf', generarReporteCompletoPDF);

// Rutas de reportes PDF mejorados
router.get('/completo-detallado/pdf', generarReporteCompletoDetalladoPDF);
router.get('/clientes/pdf', generarReporteClientesPDF);

module.exports = router;
