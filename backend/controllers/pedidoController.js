const Pedido = require('../models/Pedido');
const Mesa = require('../models/Mesa');
const Producto = require('../models/Producto');

/**
 * Controlador para la gestión de pedidos
 */

// @desc    Crear un nuevo pedido
// @route   POST /api/pedidos
// @access  Public
exports.crearPedido = async (req, res) => {
  try {
    const { mesaId, dispositivoId, nombreUsuario, items, notas } = req.body;

    // Validar que la mesa existe
    const mesa = await Mesa.findById(mesaId);
    if (!mesa) {
      return res.status(404).json({
        success: false,
        error: 'Mesa no encontrada'
      });
    }

    // Validar y enriquecer los items con información del producto
    const itemsEnriquecidos = await Promise.all(
      items.map(async (item) => {
        const producto = await Producto.findById(item.productoId);
        
        if (!producto) {
          throw new Error(`Producto ${item.productoId} no encontrado`);
        }

        if (!producto.disponible) {
          throw new Error(`El producto ${producto.nombre} no está disponible`);
        }

        return {
          productoId: producto._id,
          nombreProducto: producto.nombre,
          cantidad: item.cantidad,
          precioUnitario: producto.precio,
          personalizaciones: item.personalizaciones || {},
          subtotal: item.cantidad * producto.precio
        };
      })
    );

    // Crear el pedido
    const pedido = await Pedido.create({
      mesaId,
      dispositivoId,
      nombreUsuario,
      items: itemsEnriquecidos,
      notas,
      estado: 'recibido'
    });

    // Agregar el pedido a la mesa
    mesa.pedidos.push(pedido._id);
    await mesa.calcularTotal();
    await mesa.save();

    // Poblar el pedido con información de productos
    await pedido.populate('items.productoId');

    res.status(201).json({
      success: true,
      data: pedido
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      error: 'Error al crear el pedido',
      message: error.message
    });
  }
};

// @desc    Obtener todos los pedidos
// @route   GET /api/pedidos
// @access  Private (Admin)
exports.obtenerPedidos = async (req, res) => {
  try {
    const { estado, mesaId } = req.query;
    const filtro = {};

    if (estado) filtro.estado = estado;
    if (mesaId) filtro.mesaId = mesaId;

    const pedidos = await Pedido.find(filtro)
      .populate('mesaId')
      .populate('items.productoId')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      count: pedidos.length,
      data: pedidos
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Error al obtener pedidos',
      message: error.message
    });
  }
};

// @desc    Obtener un pedido por ID
// @route   GET /api/pedidos/:id
// @access  Public
exports.obtenerPedidoPorId = async (req, res) => {
  try {
    const pedido = await Pedido.findById(req.params.id)
      .populate('mesaId')
      .populate('items.productoId');

    if (!pedido) {
      return res.status(404).json({
        success: false,
        error: 'Pedido no encontrado'
      });
    }

    res.json({
      success: true,
      data: pedido
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Error al obtener el pedido',
      message: error.message
    });
  }
};

// @desc    Obtener pedidos por dispositivo
// @route   GET /api/pedidos/dispositivo/:dispositivoId
// @access  Public
exports.obtenerPedidosPorDispositivo = async (req, res) => {
  try {
    const pedidos = await Pedido.find({ 
      dispositivoId: req.params.dispositivoId 
    })
      .populate('items.productoId')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      count: pedidos.length,
      data: pedidos
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Error al obtener pedidos',
      message: error.message
    });
  }
};

// @desc    Actualizar estado de un pedido
// @route   PUT /api/pedidos/:id/estado
// @access  Private (Admin)
exports.actualizarEstadoPedido = async (req, res) => {
  try {
    const { estado } = req.body;

    const pedido = await Pedido.findByIdAndUpdate(
      req.params.id,
      { estado },
      { new: true, runValidators: true }
    ).populate('items.productoId');

    if (!pedido) {
      return res.status(404).json({
        success: false,
        error: 'Pedido no encontrado'
      });
    }

    // Emitir evento de actualización de estado en tiempo real
    const io = req.app.get('io');
    if (io) {
      // Notificar al cliente específico
      io.emit('estado_pedido_actualizado', {
        pedidoId: pedido._id,
        estado: pedido.estado,
        dispositivoId: pedido.dispositivoId
      });
      
      // Notificar al admin
      io.emit('pedido_actualizado', {
        pedido: pedido
      });
    }

    res.json({
      success: true,
      data: pedido
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      error: 'Error al actualizar el estado',
      message: error.message
    });
  }
};

// @desc    Procesar pago de un pedido
// @route   POST /api/pedidos/:id/pagar
// @access  Public
exports.procesarPago = async (req, res) => {
  try {
    const { metodoPago, propina, comprobantePago, referenciaPago } = req.body;

    console.log('Procesando pago:', {
      pedidoId: req.params.id,
      metodoPago,
      propina,
      tieneComprobante: !!comprobantePago,
      tamañoComprobante: comprobantePago ? comprobantePago.length : 0,
      referencia: referenciaPago
    });

    const pedido = await Pedido.findById(req.params.id);

    if (!pedido) {
      return res.status(404).json({
        success: false,
        error: 'Pedido no encontrado'
      });
    }

    if (pedido.pagado) {
      return res.status(400).json({
        success: false,
        error: 'Este pedido ya ha sido pagado'
      });
    }

    // Actualizar información de pago
    pedido.metodoPago = metodoPago;
    pedido.propina = propina || 0;
    
    // Guardar comprobante y referencia si se proporcionan
    if (comprobantePago) {
      pedido.comprobantePago = comprobantePago;
    }
    if (referenciaPago) {
      pedido.referenciaPago = referenciaPago;
    }

    // TODOS los métodos de pago requieren confirmación del admin
    pedido.estadoPago = 'procesando';
    pedido.pagado = false;

    await pedido.save();

    // Actualizar el estado de la mesa
    const mesa = await Mesa.findById(pedido.mesaId);
    if (mesa) {
      await mesa.calcularTotal();
      await mesa.actualizarEstado();
      await mesa.save();
      
      // Emitir evento de actualización de mesa al admin
      const io = req.app.get('io');
      if (io) {
        io.emit('mesa_actualizada', {
          mesa: mesa,
          pedido: pedido
        });
      }
    }

    res.json({
      success: true,
      data: pedido,
      message: 'Pago procesado exitosamente'
    });
  } catch (error) {
    console.error('Error al procesar pago:', error);
    res.status(500).json({
      success: false,
      error: 'Error al procesar el pago',
      message: error.message
    });
  }
};

// @desc    Confirmar pago de un pedido (Admin)
// @route   POST /api/pedidos/:id/confirmar-pago
// @access  Private (Admin)
exports.confirmarPago = async (req, res) => {
  try {
    const pedido = await Pedido.findById(req.params.id);

    if (!pedido) {
      return res.status(404).json({
        success: false,
        error: 'Pedido no encontrado'
      });
    }

    if (pedido.pagado) {
      return res.status(400).json({
        success: false,
        error: 'Este pedido ya está confirmado como pagado'
      });
    }

    // Confirmar el pago
    pedido.pagado = true;
    pedido.estadoPago = 'confirmado';
    await pedido.save();

    // Actualizar el estado de la mesa
    const Mesa = require('../models/Mesa');
    const mesa = await Mesa.findById(pedido.mesaId);
    if (mesa) {
      await mesa.calcularTotal();
      await mesa.actualizarEstado();
      await mesa.save();
      
      // Emitir evento de actualización
      const io = req.app.get('io');
      if (io) {
        io.emit('mesa_actualizada', { mesa });
        io.to(`mesa-${mesa.numeroMesa}`).emit('pedido_actualizado', { 
          pedidoId: pedido._id,
          pagado: true,
          estadoPago: 'confirmado'
        });
      }
    }

    res.json({
      success: true,
      data: pedido,
      message: 'Pago confirmado exitosamente'
    });
  } catch (error) {
    console.error('Error al confirmar pago:', error);
    res.status(500).json({
      success: false,
      error: 'Error al confirmar el pago',
      message: error.message
    });
  }
};

// @desc    Obtener estadísticas de ventas del día
// @route   GET /api/pedidos/estadisticas/dia
// @access  Private (Admin)
exports.obtenerEstadisticasDia = async (req, res) => {
  try {
    // Obtener fecha de inicio y fin del día actual
    const inicioDia = new Date();
    inicioDia.setHours(0, 0, 0, 0);
    
    const finDia = new Date();
    finDia.setHours(23, 59, 59, 999);

    // Obtener todos los pedidos del día
    const pedidosDia = await Pedido.find({
      createdAt: {
        $gte: inicioDia,
        $lte: finDia
      }
    });

    // Calcular estadísticas
    const totalPedidos = pedidosDia.length;
    const pedidosPagados = pedidosDia.filter(p => p.pagado).length;
    const pedidosPendientes = pedidosDia.filter(p => !p.pagado && p.estado !== 'cancelado').length;
    const pedidosCancelados = pedidosDia.filter(p => p.estado === 'cancelado').length;

    // Calcular ventas totales (solo pedidos pagados)
    const ventasTotales = pedidosDia
      .filter(p => p.pagado)
      .reduce((sum, p) => sum + p.total, 0);

    // Calcular propinas totales
    const propinasTotales = pedidosDia
      .filter(p => p.pagado)
      .reduce((sum, p) => sum + (p.propina || 0), 0);

    // Ventas por método de pago
    const ventasPorMetodo = {};
    pedidosDia.filter(p => p.pagado).forEach(pedido => {
      const metodo = pedido.metodoPago || 'no_especificado';
      if (!ventasPorMetodo[metodo]) {
        ventasPorMetodo[metodo] = {
          cantidad: 0,
          total: 0
        };
      }
      ventasPorMetodo[metodo].cantidad++;
      ventasPorMetodo[metodo].total += pedido.total;
    });

    // Productos más vendidos
    const productosVendidos = {};
    pedidosDia.filter(p => p.pagado).forEach(pedido => {
      pedido.items.forEach(item => {
        const nombre = item.nombreProducto;
        if (!productosVendidos[nombre]) {
          productosVendidos[nombre] = {
            cantidad: 0,
            total: 0
          };
        }
        productosVendidos[nombre].cantidad += item.cantidad;
        productosVendidos[nombre].total += item.subtotal;
      });
    });

    // Convertir a array y ordenar por cantidad
    const topProductos = Object.entries(productosVendidos)
      .map(([nombre, datos]) => ({ nombre, ...datos }))
      .sort((a, b) => b.cantidad - a.cantidad)
      .slice(0, 5);

    res.json({
      success: true,
      data: {
        fecha: inicioDia,
        resumen: {
          totalPedidos,
          pedidosPagados,
          pedidosPendientes,
          pedidosCancelados,
          ventasTotales,
          propinasTotales,
          ventasTotalesConPropinas: ventasTotales + propinasTotales
        },
        ventasPorMetodo,
        topProductos
      }
    });
  } catch (error) {
    console.error('Error al obtener estadísticas:', error);
    res.status(500).json({
      success: false,
      error: 'Error al obtener estadísticas',
      message: error.message
    });
  }
};

// @desc    Cancelar un pedido
// @route   DELETE /api/pedidos/:id
// @access  Private (Admin)
exports.cancelarPedido = async (req, res) => {
  try {
    const pedido = await Pedido.findById(req.params.id);

    if (!pedido) {
      return res.status(404).json({
        success: false,
        error: 'Pedido no encontrado'
      });
    }

    if (pedido.pagado) {
      return res.status(400).json({
        success: false,
        error: 'No se puede cancelar un pedido ya pagado'
      });
    }

    pedido.estado = 'cancelado';
    await pedido.save();

    // Actualizar el total de la mesa
    const mesa = await Mesa.findById(pedido.mesaId);
    if (mesa) {
      await mesa.calcularTotal();
      await mesa.save();
    }

    res.json({
      success: true,
      data: pedido,
      message: 'Pedido cancelado exitosamente'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Error al cancelar el pedido',
      message: error.message
    });
  }
};
