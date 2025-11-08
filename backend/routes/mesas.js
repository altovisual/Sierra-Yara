const express = require('express');
const router = express.Router();
const {
  obtenerMesas,
  obtenerMesaPorNumero,
  conectarDispositivo,
  desconectarDispositivo,
  crearMesa,
  actualizarMesa,
  cerrarMesa,
  obtenerCuentaMesa
} = require('../controllers/mesaController');

// Rutas públicas
router.get('/:numeroMesa', obtenerMesaPorNumero);
router.post('/:numeroMesa/conectar', conectarDispositivo);
router.post('/:numeroMesa/desconectar', desconectarDispositivo);
router.get('/:numeroMesa/cuenta', obtenerCuentaMesa);

// Rutas de administración
router.get('/', obtenerMesas);
router.post('/', crearMesa);
router.put('/:id', actualizarMesa);
router.post('/:id/cerrar', cerrarMesa);

module.exports = router;
