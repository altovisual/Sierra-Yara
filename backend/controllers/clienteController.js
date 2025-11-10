const Cliente = require('../models/Cliente');
const Pedido = require('../models/Pedido');

// @desc    Obtener todos los clientes
// @route   GET /api/clientes
// @access  Private (Admin)
exports.obtenerClientes = async (req, res) => {
  try {
    const { segmento, busqueda, activo } = req.query;
    
    let filtro = {};
    
    // Filtrar por segmento
    if (segmento && segmento !== 'todos') {
      filtro.segmento = segmento;
    }
    
    // Filtrar por estado activo
    if (activo !== undefined) {
      filtro.activo = activo === 'true';
    }
    
    // Búsqueda por nombre, cédula o teléfono
    if (busqueda) {
      filtro.$or = [
        { nombre: { $regex: busqueda, $options: 'i' } },
        { cedula: { $regex: busqueda, $options: 'i' } },
        { telefono: { $regex: busqueda, $options: 'i' } }
      ];
    }
    
    const clientes = await Cliente.find(filtro)
      .sort({ ultimaVisita: -1 })
      .populate('productosPreferidos.productoId', 'nombre precio');
    
    res.json({
      success: true,
      data: clientes,
      total: clientes.length
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Error al obtener clientes',
      message: error.message
    });
  }
};

// @desc    Obtener un cliente por ID
// @route   GET /api/clientes/:id
// @access  Private (Admin)
exports.obtenerClientePorId = async (req, res) => {
  try {
    const cliente = await Cliente.findById(req.params.id)
      .populate('productosPreferidos.productoId', 'nombre precio imagen');
    
    if (!cliente) {
      return res.status(404).json({
        success: false,
        error: 'Cliente no encontrado'
      });
    }
    
    // Obtener historial de pedidos del cliente
    const pedidos = await Pedido.find({ cedula: cliente.cedula })
      .populate('mesaId', 'numeroMesa')
      .populate('items.productoId', 'nombre precio')
      .sort({ createdAt: -1 })
      .limit(20);
    
    res.json({
      success: true,
      data: {
        cliente,
        pedidos
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Error al obtener cliente',
      message: error.message
    });
  }
};

// @desc    Obtener cliente por cédula
// @route   GET /api/clientes/cedula/:cedula
// @access  Private
exports.obtenerClientePorCedula = async (req, res) => {
  try {
    const cliente = await Cliente.findOne({ cedula: req.params.cedula });
    
    if (!cliente) {
      return res.status(404).json({
        success: false,
        error: 'Cliente no encontrado'
      });
    }
    
    res.json({
      success: true,
      data: cliente
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Error al obtener cliente',
      message: error.message
    });
  }
};

// @desc    Crear o actualizar cliente
// @route   POST /api/clientes
// @access  Public
exports.crearOActualizarCliente = async (req, res) => {
  try {
    const { nombre, cedula, telefono, email } = req.body;
    
    // Buscar si el cliente ya existe
    let cliente = await Cliente.findOne({ cedula });
    
    if (cliente) {
      // Actualizar información si cambió
      cliente.nombre = nombre;
      cliente.telefono = telefono;
      if (email) cliente.email = email;
      cliente.totalVisitas += 1;
      cliente.ultimaVisita = new Date();
      await cliente.save();
      
      return res.json({
        success: true,
        data: cliente,
        mensaje: 'Cliente actualizado'
      });
    }
    
    // Crear nuevo cliente
    cliente = await Cliente.create({
      nombre,
      cedula,
      telefono,
      email
    });
    
    res.status(201).json({
      success: true,
      data: cliente,
      mensaje: 'Cliente registrado exitosamente'
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      error: 'Error al crear/actualizar cliente',
      message: error.message
    });
  }
};

// @desc    Actualizar cliente
// @route   PUT /api/clientes/:id
// @access  Private (Admin)
exports.actualizarCliente = async (req, res) => {
  try {
    const { nombre, telefono, email, notas, aceptaMarketing, segmento } = req.body;
    
    const cliente = await Cliente.findById(req.params.id);
    
    if (!cliente) {
      return res.status(404).json({
        success: false,
        error: 'Cliente no encontrado'
      });
    }
    
    // Actualizar campos permitidos
    if (nombre) cliente.nombre = nombre;
    if (telefono) cliente.telefono = telefono;
    if (email !== undefined) cliente.email = email;
    if (notas !== undefined) cliente.notas = notas;
    if (aceptaMarketing !== undefined) cliente.aceptaMarketing = aceptaMarketing;
    if (segmento) cliente.segmento = segmento;
    
    await cliente.save();
    
    res.json({
      success: true,
      data: cliente
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      error: 'Error al actualizar cliente',
      message: error.message
    });
  }
};

// @desc    Desactivar cliente
// @route   DELETE /api/clientes/:id
// @access  Private (Admin)
exports.desactivarCliente = async (req, res) => {
  try {
    const cliente = await Cliente.findById(req.params.id);
    
    if (!cliente) {
      return res.status(404).json({
        success: false,
        error: 'Cliente no encontrado'
      });
    }
    
    cliente.activo = false;
    await cliente.save();
    
    res.json({
      success: true,
      mensaje: 'Cliente desactivado'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Error al desactivar cliente',
      message: error.message
    });
  }
};

// @desc    Obtener estadísticas de clientes
// @route   GET /api/clientes/estadisticas/resumen
// @access  Private (Admin)
exports.obtenerEstadisticas = async (req, res) => {
  try {
    const totalClientes = await Cliente.countDocuments({ activo: true });
    const clientesNuevos = await Cliente.countDocuments({ segmento: 'nuevo', activo: true });
    const clientesVIP = await Cliente.countDocuments({ segmento: 'vip', activo: true });
    const clientesFrecuentes = await Cliente.countDocuments({ segmento: 'frecuente', activo: true });
    
    // Clientes que aceptan marketing
    const aceptanMarketing = await Cliente.countDocuments({ aceptaMarketing: true, activo: true });
    
    // Top 10 clientes por gasto
    const topClientes = await Cliente.find({ activo: true })
      .sort({ totalGastado: -1 })
      .limit(10)
      .select('nombre cedula telefono totalGastado totalPedidos segmento');
    
    // Promedio de gasto
    const promedios = await Cliente.aggregate([
      { $match: { activo: true } },
      {
        $group: {
          _id: null,
          promedioGasto: { $avg: '$promedioGasto' },
          promedioVisitas: { $avg: '$totalVisitas' },
          promedioGastoTotal: { $avg: '$totalGastado' }
        }
      }
    ]);
    
    res.json({
      success: true,
      data: {
        totalClientes,
        clientesNuevos,
        clientesVIP,
        clientesFrecuentes,
        aceptanMarketing,
        topClientes,
        promedios: promedios[0] || {
          promedioGasto: 0,
          promedioVisitas: 0,
          promedioGastoTotal: 0
        }
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Error al obtener estadísticas',
      message: error.message
    });
  }
};

// @desc    Exportar clientes para marketing
// @route   GET /api/clientes/exportar/marketing
// @access  Private (Admin)
exports.exportarParaMarketing = async (req, res) => {
  try {
    const { segmento } = req.query;
    
    let filtro = { aceptaMarketing: true, activo: true };
    
    if (segmento && segmento !== 'todos') {
      filtro.segmento = segmento;
    }
    
    const clientes = await Cliente.find(filtro)
      .select('nombre cedula telefono email segmento totalGastado totalPedidos ultimaVisita')
      .sort({ totalGastado: -1 });
    
    res.json({
      success: true,
      data: clientes,
      total: clientes.length
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Error al exportar clientes',
      message: error.message
    });
  }
};

module.exports = exports;
