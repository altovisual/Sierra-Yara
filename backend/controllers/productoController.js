const Producto = require('../models/Producto');

/**
 * Controlador para la gestión de productos del menú
 */

// @desc    Obtener todos los productos
// @route   GET /api/productos
// @access  Public
exports.obtenerProductos = async (req, res) => {
  try {
    const { categoria, disponible } = req.query;
    const filtro = {};

    if (categoria) filtro.categoria = categoria;
    if (disponible !== undefined) filtro.disponible = disponible === 'true';

    const productos = await Producto.find(filtro).sort({ categoria: 1, nombre: 1 });
    
    res.json({
      success: true,
      count: productos.length,
      data: productos
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Error al obtener productos',
      message: error.message
    });
  }
};

// @desc    Obtener un producto por ID
// @route   GET /api/productos/:id
// @access  Public
exports.obtenerProductoPorId = async (req, res) => {
  try {
    const producto = await Producto.findById(req.params.id);

    if (!producto) {
      return res.status(404).json({
        success: false,
        error: 'Producto no encontrado'
      });
    }

    res.json({
      success: true,
      data: producto
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Error al obtener el producto',
      message: error.message
    });
  }
};

// @desc    Crear un nuevo producto
// @route   POST /api/productos
// @access  Private (Admin)
exports.crearProducto = async (req, res) => {
  try {
    const producto = await Producto.create(req.body);

    res.status(201).json({
      success: true,
      data: producto
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      error: 'Error al crear el producto',
      message: error.message
    });
  }
};

// @desc    Actualizar un producto
// @route   PUT /api/productos/:id
// @access  Private (Admin)
exports.actualizarProducto = async (req, res) => {
  try {
    const producto = await Producto.findByIdAndUpdate(
      req.params.id,
      req.body,
      {
        new: true,
        runValidators: true
      }
    );

    if (!producto) {
      return res.status(404).json({
        success: false,
        error: 'Producto no encontrado'
      });
    }

    res.json({
      success: true,
      data: producto
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      error: 'Error al actualizar el producto',
      message: error.message
    });
  }
};

// @desc    Eliminar un producto
// @route   DELETE /api/productos/:id
// @access  Private (Admin)
exports.eliminarProducto = async (req, res) => {
  try {
    const producto = await Producto.findByIdAndDelete(req.params.id);

    if (!producto) {
      return res.status(404).json({
        success: false,
        error: 'Producto no encontrado'
      });
    }

    res.json({
      success: true,
      data: {},
      message: 'Producto eliminado exitosamente'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Error al eliminar el producto',
      message: error.message
    });
  }
};

// @desc    Obtener categorías disponibles
// @route   GET /api/productos/categorias
// @access  Public
exports.obtenerCategorias = async (req, res) => {
  try {
    const categorias = await Producto.distinct('categoria');
    
    res.json({
      success: true,
      data: categorias
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Error al obtener categorías',
      message: error.message
    });
  }
};
