const Mesa = require('../models/Mesa');
const Pedido = require('../models/Pedido');
const { v4: uuidv4 } = require('uuid');

/**
 * Controlador para la gestión de mesas
 */

// @desc    Obtener todas las mesas
// @route   GET /api/mesas
// @access  Private (Admin)
exports.obtenerMesas = async (req, res) => {
  try {
    const mesas = await Mesa.find()
      .populate('pedidos')
      .sort({ numeroMesa: 1 });

    res.json({
      success: true,
      count: mesas.length,
      data: mesas
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Error al obtener las mesas',
      message: error.message
    });
  }
};

// @desc    Obtener una mesa por número
// @route   GET /api/mesas/:numeroMesa
// @access  Public
exports.obtenerMesaPorNumero = async (req, res) => {
  try {
    const mesa = await Mesa.findOne({ numeroMesa: req.params.numeroMesa })
      .populate({
        path: 'pedidos',
        populate: {
          path: 'items.productoId'
        }
      });

    if (!mesa) {
      return res.status(404).json({
        success: false,
        error: 'Mesa no encontrada'
      });
    }

    res.json({
      success: true,
      data: mesa
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Error al obtener la mesa',
      message: error.message
    });
  }
};

// @desc    Conectar un dispositivo a una mesa (escaneo de QR)
// @route   POST /api/mesas/:numeroMesa/conectar
// @access  Public
exports.conectarDispositivo = async (req, res) => {
  try {
    const { nombreUsuario } = req.body;
    const numeroMesa = parseInt(req.params.numeroMesa);

    let mesa = await Mesa.findOne({ numeroMesa });

    // Si la mesa no existe, crearla
    if (!mesa) {
      mesa = await Mesa.create({
        numeroMesa,
        estado: 'ocupada',
        horaOcupacion: new Date()
      });
    }

    // Generar ID único para el dispositivo
    const dispositivoId = uuidv4();

    // Agregar dispositivo a la mesa
    mesa.dispositivosActivos.push({
      dispositivoId,
      nombreUsuario: nombreUsuario || `Cliente ${mesa.dispositivosActivos.length + 1}`,
      horaConexion: new Date()
    });

    // Actualizar estado de la mesa
    if (mesa.estado === 'libre') {
      mesa.estado = 'ocupada';
      mesa.horaOcupacion = new Date();
    }

    await mesa.save();

    res.json({
      success: true,
      data: {
        mesaId: mesa._id,
        numeroMesa: mesa.numeroMesa,
        dispositivoId,
        nombreUsuario: nombreUsuario || `Cliente ${mesa.dispositivosActivos.length}`
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Error al conectar dispositivo',
      message: error.message
    });
  }
};

// @desc    Desconectar dispositivo de una mesa
// @route   POST /api/mesas/:numeroMesa/desconectar
// @access  Public
exports.desconectarDispositivo = async (req, res) => {
  try {
    const { numeroMesa } = req.params;
    const { dispositivoId } = req.body;

    const mesa = await Mesa.findOne({ numeroMesa });

    if (!mesa) {
      return res.status(404).json({
        success: false,
        error: 'Mesa no encontrada'
      });
    }

    // Remover dispositivo de la lista
    mesa.dispositivosActivos = mesa.dispositivosActivos.filter(
      d => d.dispositivoId !== dispositivoId
    );

    // Actualizar estado de la mesa
    await mesa.actualizarEstado();
    await mesa.save();

    // Emitir evento de actualización
    const io = req.app.get('io');
    if (io) {
      io.emit('mesa_actualizada', { mesa });
    }

    res.json({
      success: true,
      message: 'Dispositivo desconectado exitosamente',
      data: mesa
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Error al desconectar dispositivo',
      message: error.message
    });
  }
};

// @desc    Crear una nueva mesa
// @route   POST /api/mesas
// @access  Private (Admin)
exports.crearMesa = async (req, res) => {
  try {
    const mesa = await Mesa.create(req.body);

    res.status(201).json({
      success: true,
      data: mesa
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      error: 'Error al crear la mesa',
      message: error.message
    });
  }
};

// @desc    Actualizar estado de una mesa
// @route   PUT /api/mesas/:id
// @access  Private (Admin)
exports.actualizarMesa = async (req, res) => {
  try {
    const mesa = await Mesa.findByIdAndUpdate(
      req.params.id,
      req.body,
      {
        new: true,
        runValidators: true
      }
    );

    if (!mesa) {
      return res.status(404).json({
        success: false,
        error: 'Mesa no encontrada'
      });
    }

    res.json({
      success: true,
      data: mesa
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      error: 'Error al actualizar la mesa',
      message: error.message
    });
  }
};

// @desc    Cerrar una mesa (liberar después del pago)
// @route   POST /api/mesas/:id/cerrar
// @access  Private (Admin)
exports.cerrarMesa = async (req, res) => {
  try {
    const mesa = await Mesa.findById(req.params.id);

    if (!mesa) {
      return res.status(404).json({
        success: false,
        error: 'Mesa no encontrada'
      });
    }

    // Verificar que todos los pedidos estén pagados
    const pedidosPendientes = await Pedido.find({
      _id: { $in: mesa.pedidos },
      pagado: false
    });

    if (pedidosPendientes.length > 0) {
      return res.status(400).json({
        success: false,
        error: 'Hay pedidos pendientes de pago'
      });
    }

    // Guardar número de mesa antes de cerrar
    const numeroMesa = mesa.numeroMesa;
    
    // Cerrar la mesa
    mesa.estado = 'libre';
    mesa.pedidos = [];
    mesa.dispositivosActivos = [];
    mesa.totalMesa = 0;
    mesa.horaCierre = new Date();

    await mesa.save();

    // Emitir evento WebSocket para desconectar a los clientes
    if (req.io) {
      console.log(`🚪 Emitiendo evento mesa-liberada para mesa ${numeroMesa}`);
      req.io.to(`mesa_${numeroMesa}`).emit('mesa-liberada', {
        numeroMesa,
        mensaje: 'La mesa ha sido liberada por el administrador'
      });
      console.log(`📡 Evento emitido a sala: mesa_${numeroMesa}`);
    }

    res.json({
      success: true,
      data: mesa,
      message: 'Mesa cerrada exitosamente'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Error al cerrar la mesa',
      message: error.message
    });
  }
};

// @desc    Obtener cuenta de la mesa
// @route   GET /api/mesas/:numeroMesa/cuenta
// @access  Public
exports.obtenerCuentaMesa = async (req, res) => {
  try {
    const mesa = await Mesa.findOne({ numeroMesa: req.params.numeroMesa })
      .populate({
        path: 'pedidos',
        match: { estado: { $ne: 'cancelado' } },
        populate: {
          path: 'items.productoId'
        }
      });

    if (!mesa) {
      return res.status(404).json({
        success: false,
        error: 'Mesa no encontrada'
      });
    }

    // Agrupar pedidos por dispositivo
    const cuentaPorDispositivo = {};
    let totalMesa = 0;

    mesa.pedidos.forEach(pedido => {
      if (!cuentaPorDispositivo[pedido.dispositivoId]) {
        cuentaPorDispositivo[pedido.dispositivoId] = {
          nombreUsuario: pedido.nombreUsuario,
          pedidos: [],
          total: 0,
          propina: 0
        };
      }

      cuentaPorDispositivo[pedido.dispositivoId].pedidos.push(pedido);
      cuentaPorDispositivo[pedido.dispositivoId].total += pedido.total;
      cuentaPorDispositivo[pedido.dispositivoId].propina += pedido.propina;
      totalMesa += pedido.total + pedido.propina;
    });

    res.json({
      success: true,
      data: {
        numeroMesa: mesa.numeroMesa,
        cuentaPorDispositivo,
        totalMesa,
        dispositivosActivos: mesa.dispositivosActivos
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Error al obtener la cuenta',
      message: error.message
    });
  }
};
