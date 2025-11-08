const express = require('express');
const router = express.Router();
const {
  obtenerProductos,
  obtenerProductoPorId,
  crearProducto,
  actualizarProducto,
  eliminarProducto,
  obtenerCategorias
} = require('../controllers/productoController');

// Rutas públicas
router.get('/', obtenerProductos);
router.get('/categorias', obtenerCategorias);
router.get('/:id', obtenerProductoPorId);

// Rutas de administración (en producción, agregar middleware de autenticación)
router.post('/', crearProducto);
router.put('/:id', actualizarProducto);
router.delete('/:id', eliminarProducto);

module.exports = router;
