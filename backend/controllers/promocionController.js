const Promocion = require('../models/Promocion');

/**
 * Controlador para gestionar promociones
 */

// Obtener todas las promociones
exports.obtenerTodas = async (req, res) => {
  try {
    const promociones = await Promocion.find()
      .populate('productos', 'nombre precio categoria')
      .sort({ destacada: -1, fechaInicio: -1 });
    
    res.json({
      success: true,
      data: promociones
    });
  } catch (error) {
    console.error('Error al obtener promociones:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener las promociones',
      error: error.message
    });
  }
};

// Obtener promociones activas/vigentes
exports.obtenerActivas = async (req, res) => {
  try {
    const ahora = new Date();
    
    // Buscar promociones que estén en el rango de fechas
    const promociones = await Promocion.find({
      activa: true,
      fechaInicio: { $lte: ahora },
      fechaFin: { $gte: ahora }
    })
      .populate('productos', 'nombre precio categoria imagenUrl')
      .sort({ destacada: -1, createdAt: -1 });
    
    // Filtrar por día y hora
    const promocionesVigentes = promociones.filter(promo => promo.estaVigente());
    
    res.json({
      success: true,
      data: promocionesVigentes
    });
  } catch (error) {
    console.error('Error al obtener promociones activas:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener las promociones activas',
      error: error.message
    });
  }
};

// Obtener una promoción por ID
exports.obtenerPorId = async (req, res) => {
  try {
    const promocion = await Promocion.findById(req.params.id)
      .populate('productos', 'nombre precio categoria imagenUrl descripcion');
    
    if (!promocion) {
      return res.status(404).json({
        success: false,
        message: 'Promoción no encontrada'
      });
    }
    
    res.json({
      success: true,
      data: promocion
    });
  } catch (error) {
    console.error('Error al obtener promoción:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener la promoción',
      error: error.message
    });
  }
};

// Crear nueva promoción
exports.crear = async (req, res) => {
  try {
    console.log('📝 Datos recibidos para crear promoción:', req.body);
    
    const promocion = new Promocion(req.body);
    await promocion.save();
    
    console.log('✅ Promoción creada exitosamente:', promocion._id);
    
    res.status(201).json({
      success: true,
      message: 'Promoción creada exitosamente',
      data: promocion
    });
  } catch (error) {
    console.error('❌ Error al crear promoción:', error);
    
    // Manejar errores de validación de Mongoose
    if (error.name === 'ValidationError') {
      const errors = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({
        success: false,
        message: 'Error de validación',
        errors: errors
      });
    }
    
    res.status(400).json({
      success: false,
      message: 'Error al crear la promoción',
      error: error.message
    });
  }
};

// Actualizar promoción
exports.actualizar = async (req, res) => {
  try {
    const promocion = await Promocion.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    ).populate('productos', 'nombre precio categoria');
    
    if (!promocion) {
      return res.status(404).json({
        success: false,
        message: 'Promoción no encontrada'
      });
    }
    
    res.json({
      success: true,
      message: 'Promoción actualizada exitosamente',
      data: promocion
    });
  } catch (error) {
    console.error('Error al actualizar promoción:', error);
    res.status(400).json({
      success: false,
      message: 'Error al actualizar la promoción',
      error: error.message
    });
  }
};

// Eliminar promoción
exports.eliminar = async (req, res) => {
  try {
    const promocion = await Promocion.findByIdAndDelete(req.params.id);
    
    if (!promocion) {
      return res.status(404).json({
        success: false,
        message: 'Promoción no encontrada'
      });
    }
    
    res.json({
      success: true,
      message: 'Promoción eliminada exitosamente'
    });
  } catch (error) {
    console.error('Error al eliminar promoción:', error);
    res.status(500).json({
      success: false,
      message: 'Error al eliminar la promoción',
      error: error.message
    });
  }
};

// Activar/Desactivar promoción
exports.toggleActiva = async (req, res) => {
  try {
    const promocion = await Promocion.findById(req.params.id);
    
    if (!promocion) {
      return res.status(404).json({
        success: false,
        message: 'Promoción no encontrada'
      });
    }
    
    promocion.activa = !promocion.activa;
    await promocion.save();
    
    res.json({
      success: true,
      message: `Promoción ${promocion.activa ? 'activada' : 'desactivada'} exitosamente`,
      data: promocion
    });
  } catch (error) {
    console.error('Error al cambiar estado de promoción:', error);
    res.status(500).json({
      success: false,
      message: 'Error al cambiar el estado de la promoción',
      error: error.message
    });
  }
};
