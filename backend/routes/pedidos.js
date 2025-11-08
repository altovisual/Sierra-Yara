const express = require('express');
const router = express.Router();
const {
  crearPedido,
  obtenerPedidos,
  obtenerPedidoPorId,
  obtenerPedidosPorDispositivo,
  actualizarEstadoPedido,
  procesarPago,
  confirmarPago,
  cancelarPedido,
  obtenerEstadisticasDia
} = require('../controllers/pedidoController');

// Rutas públicas
router.post('/', crearPedido);
router.get('/:id', obtenerPedidoPorId);
router.get('/dispositivo/:dispositivoId', obtenerPedidosPorDispositivo);
router.post('/:id/pagar', procesarPago);

// Rutas de administración
router.get('/estadisticas/dia', obtenerEstadisticasDia);
router.get('/', obtenerPedidos);
router.put('/:id/estado', actualizarEstadoPedido);
router.post('/:id/confirmar-pago', confirmarPago);
router.delete('/:id', cancelarPedido);

module.exports = router;
