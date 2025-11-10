const Pedido = require('../models/Pedido');
const Mesa = require('../models/Mesa');
const Producto = require('../models/Producto');
const XLSX = require('xlsx');

/**
 * @desc    Generar reporte de ventas en Excel
 * @route   GET /api/reportes/ventas/excel
 * @access  Private (Admin)
 */
exports.generarReporteVentas = async (req, res) => {
  try {
    const { fechaInicio, fechaFin } = req.query;

    // Construir filtro de fechas
    const filtro = { pagado: true };
    if (fechaInicio || fechaFin) {
      filtro.createdAt = {};
      if (fechaInicio) {
        filtro.createdAt.$gte = new Date(fechaInicio);
      }
      if (fechaFin) {
        const fechaFinDate = new Date(fechaFin);
        fechaFinDate.setHours(23, 59, 59, 999);
        filtro.createdAt.$lte = fechaFinDate;
      }
    }

    // Obtener pedidos con populate
    const pedidos = await Pedido.find(filtro)
      .populate('mesaId', 'numeroMesa')
      .populate('items.productoId', 'nombre categoria precio')
      .sort({ createdAt: -1 });

    // Preparar datos para Excel
    const datosVentas = [];
    
    pedidos.forEach(pedido => {
      pedido.items.forEach(item => {
        datosVentas.push({
          'Fecha': new Date(pedido.createdAt).toLocaleDateString('es-VE'),
          'Hora': new Date(pedido.createdAt).toLocaleTimeString('es-VE'),
          'Pedido ID': pedido._id.toString().slice(-8),
          'Mesa': pedido.mesaId?.numeroMesa || 'N/A',
          'Producto': item.productoId?.nombre || 'Producto eliminado',
          'Categoría': item.productoId?.categoria || 'N/A',
          'Cantidad': item.cantidad,
          'Precio Unitario ($)': item.precioUnitario.toFixed(2),
          'Subtotal ($)': (item.cantidad * item.precioUnitario).toFixed(2),
          'Método de Pago': pedido.metodoPago || 'N/A',
          'Propina ($)': pedido.propina?.toFixed(2) || '0.00',
          'Total Pedido ($)': (pedido.total + (pedido.propina || 0)).toFixed(2),
          'Estado': pedido.estado,
          'Dispositivo': pedido.dispositivoId?.slice(-8) || 'N/A'
        });
      });
    });

    // Crear libro de Excel
    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.json_to_sheet(datosVentas);

    // Ajustar anchos de columna
    const colWidths = [
      { wch: 12 }, // Fecha
      { wch: 10 }, // Hora
      { wch: 12 }, // Pedido ID
      { wch: 8 },  // Mesa
      { wch: 30 }, // Producto
      { wch: 15 }, // Categoría
      { wch: 10 }, // Cantidad
      { wch: 15 }, // Precio Unitario
      { wch: 15 }, // Subtotal
      { wch: 18 }, // Método de Pago
      { wch: 12 }, // Propina
      { wch: 15 }, // Total Pedido
      { wch: 12 }, // Estado
      { wch: 15 }  // Dispositivo
    ];
    ws['!cols'] = colWidths;

    XLSX.utils.book_append_sheet(wb, ws, 'Ventas');

    // Generar buffer
    const buffer = XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' });

    // Configurar headers para descarga
    const nombreArchivo = `ventas_${fechaInicio || 'inicio'}_${fechaFin || 'fin'}.xlsx`;
    res.setHeader('Content-Disposition', `attachment; filename="${nombreArchivo}"`);
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    
    res.send(buffer);
  } catch (error) {
    console.error('Error al generar reporte de ventas:', error);
    res.status(500).json({
      success: false,
      error: 'Error al generar el reporte de ventas'
    });
  }
};

/**
 * @desc    Generar reporte de productos más vendidos en Excel
 * @route   GET /api/reportes/productos/excel
 * @access  Private (Admin)
 */
exports.generarReporteProductos = async (req, res) => {
  try {
    const { fechaInicio, fechaFin } = req.query;

    // Construir filtro de fechas
    const filtro = { pagado: true };
    if (fechaInicio || fechaFin) {
      filtro.createdAt = {};
      if (fechaInicio) {
        filtro.createdAt.$gte = new Date(fechaInicio);
      }
      if (fechaFin) {
        const fechaFinDate = new Date(fechaFin);
        fechaFinDate.setHours(23, 59, 59, 999);
        filtro.createdAt.$lte = fechaFinDate;
      }
    }

    // Agregar datos de productos vendidos
    const productosVendidos = await Pedido.aggregate([
      { $match: filtro },
      { $unwind: '$items' },
      {
        $group: {
          _id: '$items.productoId',
          cantidadVendida: { $sum: '$items.cantidad' },
          totalVentas: { $sum: { $multiply: ['$items.cantidad', '$items.precioUnitario'] } },
          numeroVentas: { $sum: 1 }
        }
      },
      {
        $lookup: {
          from: 'productos',
          localField: '_id',
          foreignField: '_id',
          as: 'producto'
        }
      },
      { $unwind: { path: '$producto', preserveNullAndEmptyArrays: true } },
      { $sort: { cantidadVendida: -1 } }
    ]);

    // Preparar datos para Excel
    const datosProductos = productosVendidos.map((item, index) => ({
      'Ranking': index + 1,
      'Producto': item.producto?.nombre || 'Producto eliminado',
      'Categoría': item.producto?.categoria || 'N/A',
      'Precio Unitario ($)': item.producto?.precio?.toFixed(2) || '0.00',
      'Unidades Vendidas': item.cantidadVendida,
      'Número de Ventas': item.numeroVentas,
      'Ingreso Total ($)': item.totalVentas.toFixed(2),
      'Promedio por Venta': (item.cantidadVendida / item.numeroVentas).toFixed(2),
      'Disponible': item.producto?.disponible ? 'Sí' : 'No'
    }));

    // Agregar fila de totales
    const totalUnidades = productosVendidos.reduce((sum, item) => sum + item.cantidadVendida, 0);
    const totalIngresos = productosVendidos.reduce((sum, item) => sum + item.totalVentas, 0);
    
    datosProductos.push({
      'Ranking': '',
      'Producto': 'TOTAL',
      'Categoría': '',
      'Precio Unitario ($)': '',
      'Unidades Vendidas': totalUnidades,
      'Número de Ventas': '',
      'Ingreso Total ($)': totalIngresos.toFixed(2),
      'Promedio por Venta': '',
      'Disponible': ''
    });

    // Crear libro de Excel
    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.json_to_sheet(datosProductos);

    // Ajustar anchos de columna
    ws['!cols'] = [
      { wch: 10 }, // Ranking
      { wch: 30 }, // Producto
      { wch: 15 }, // Categoría
      { wch: 18 }, // Precio Unitario
      { wch: 18 }, // Unidades Vendidas
      { wch: 18 }, // Número de Ventas
      { wch: 18 }, // Ingreso Total
      { wch: 18 }, // Promedio por Venta
      { wch: 12 }  // Disponible
    ];

    XLSX.utils.book_append_sheet(wb, ws, 'Productos Más Vendidos');

    // Generar buffer
    const buffer = XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' });

    // Configurar headers para descarga
    const nombreArchivo = `productos_vendidos_${fechaInicio || 'inicio'}_${fechaFin || 'fin'}.xlsx`;
    res.setHeader('Content-Disposition', `attachment; filename="${nombreArchivo}"`);
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    
    res.send(buffer);
  } catch (error) {
    console.error('Error al generar reporte de productos:', error);
    res.status(500).json({
      success: false,
      error: 'Error al generar el reporte de productos'
    });
  }
};

/**
 * @desc    Generar reporte completo (múltiples hojas) en Excel
 * @route   GET /api/reportes/completo/excel
 * @access  Private (Admin)
 */
exports.generarReporteCompleto = async (req, res) => {
  try {
    const { fechaInicio, fechaFin } = req.query;

    // Construir filtro de fechas
    const filtro = { pagado: true };
    if (fechaInicio || fechaFin) {
      filtro.createdAt = {};
      if (fechaInicio) {
        filtro.createdAt.$gte = new Date(fechaInicio);
      }
      if (fechaFin) {
        const fechaFinDate = new Date(fechaFin);
        fechaFinDate.setHours(23, 59, 59, 999);
        filtro.createdAt.$lte = fechaFinDate;
      }
    }

    // Crear libro de Excel
    const wb = XLSX.utils.book_new();

    // ===== HOJA 1: RESUMEN GENERAL =====
    const pedidos = await Pedido.find(filtro);
    const totalVentas = pedidos.reduce((sum, p) => sum + p.total, 0);
    const totalPropinas = pedidos.reduce((sum, p) => sum + (p.propina || 0), 0);
    const totalGeneral = totalVentas + totalPropinas;

    // Agrupar por método de pago
    const ventasPorMetodo = {};
    pedidos.forEach(p => {
      const metodo = p.metodoPago || 'No especificado';
      if (!ventasPorMetodo[metodo]) {
        ventasPorMetodo[metodo] = { cantidad: 0, total: 0 };
      }
      ventasPorMetodo[metodo].cantidad++;
      ventasPorMetodo[metodo].total += p.total + (p.propina || 0);
    });

    const resumenGeneral = [
      { 'Concepto': 'Total de Pedidos', 'Valor': pedidos.length },
      { 'Concepto': 'Total Ventas ($)', 'Valor': totalVentas.toFixed(2) },
      { 'Concepto': 'Total Propinas ($)', 'Valor': totalPropinas.toFixed(2) },
      { 'Concepto': 'Total General ($)', 'Valor': totalGeneral.toFixed(2) },
      { 'Concepto': 'Ticket Promedio ($)', 'Valor': (totalGeneral / pedidos.length || 0).toFixed(2) },
      { 'Concepto': '', 'Valor': '' },
      { 'Concepto': 'VENTAS POR MÉTODO DE PAGO', 'Valor': '' },
      ...Object.entries(ventasPorMetodo).map(([metodo, data]) => ({
        'Concepto': `${metodo} (${data.cantidad} pedidos)`,
        'Valor': data.total.toFixed(2)
      }))
    ];

    const wsResumen = XLSX.utils.json_to_sheet(resumenGeneral);
    wsResumen['!cols'] = [{ wch: 40 }, { wch: 20 }];
    XLSX.utils.book_append_sheet(wb, wsResumen, 'Resumen General');

    // ===== HOJA 2: VENTAS DETALLADAS =====
    const pedidosDetallados = await Pedido.find(filtro)
      .populate('mesaId', 'numeroMesa')
      .populate('items.productoId', 'nombre categoria precio')
      .sort({ createdAt: -1 });

    const datosVentas = [];
    pedidosDetallados.forEach(pedido => {
      pedido.items.forEach(item => {
        datosVentas.push({
          'Fecha': new Date(pedido.createdAt).toLocaleDateString('es-VE'),
          'Hora': new Date(pedido.createdAt).toLocaleTimeString('es-VE'),
          'Pedido ID': pedido._id.toString().slice(-8),
          'Mesa': pedido.mesaId?.numeroMesa || 'N/A',
          'Producto': item.productoId?.nombre || 'Producto eliminado',
          'Cantidad': item.cantidad,
          'Precio Unit. ($)': item.precioUnitario.toFixed(2),
          'Subtotal ($)': (item.cantidad * item.precioUnitario).toFixed(2),
          'Método Pago': pedido.metodoPago || 'N/A',
          'Propina ($)': pedido.propina?.toFixed(2) || '0.00',
          'Total ($)': (pedido.total + (pedido.propina || 0)).toFixed(2)
        });
      });
    });

    const wsVentas = XLSX.utils.json_to_sheet(datosVentas);
    wsVentas['!cols'] = [
      { wch: 12 }, { wch: 10 }, { wch: 12 }, { wch: 8 }, { wch: 30 },
      { wch: 10 }, { wch: 15 }, { wch: 15 }, { wch: 18 }, { wch: 12 }, { wch: 15 }
    ];
    XLSX.utils.book_append_sheet(wb, wsVentas, 'Ventas Detalladas');

    // ===== HOJA 3: PRODUCTOS MÁS VENDIDOS =====
    const productosVendidos = await Pedido.aggregate([
      { $match: filtro },
      { $unwind: '$items' },
      {
        $group: {
          _id: '$items.productoId',
          cantidadVendida: { $sum: '$items.cantidad' },
          totalVentas: { $sum: { $multiply: ['$items.cantidad', '$items.precioUnitario'] } },
          numeroVentas: { $sum: 1 }
        }
      },
      {
        $lookup: {
          from: 'productos',
          localField: '_id',
          foreignField: '_id',
          as: 'producto'
        }
      },
      { $unwind: { path: '$producto', preserveNullAndEmptyArrays: true } },
      { $sort: { cantidadVendida: -1 } }
    ]);

    const datosProductos = productosVendidos.map((item, index) => ({
      'Ranking': index + 1,
      'Producto': item.producto?.nombre || 'Producto eliminado',
      'Categoría': item.producto?.categoria || 'N/A',
      'Unidades Vendidas': item.cantidadVendida,
      'Ventas': item.numeroVentas,
      'Ingreso Total ($)': item.totalVentas.toFixed(2),
      'Promedio/Venta': (item.cantidadVendida / item.numeroVentas).toFixed(2)
    }));

    const wsProductos = XLSX.utils.json_to_sheet(datosProductos);
    wsProductos['!cols'] = [
      { wch: 10 }, { wch: 30 }, { wch: 15 }, { wch: 18 }, { wch: 12 }, { wch: 18 }, { wch: 15 }
    ];
    XLSX.utils.book_append_sheet(wb, wsProductos, 'Productos Más Vendidos');

    // ===== HOJA 4: ANÁLISIS POR MESA =====
    const ventasPorMesa = await Pedido.aggregate([
      { $match: filtro },
      {
        $group: {
          _id: '$mesaId',
          numeroPedidos: { $sum: 1 },
          totalVentas: { $sum: '$total' },
          totalPropinas: { $sum: '$propina' }
        }
      },
      {
        $lookup: {
          from: 'mesas',
          localField: '_id',
          foreignField: '_id',
          as: 'mesa'
        }
      },
      { $unwind: { path: '$mesa', preserveNullAndEmptyArrays: true } },
      { $sort: { totalVentas: -1 } }
    ]);

    const datosMesas = ventasPorMesa.map(item => ({
      'Mesa': item.mesa?.numeroMesa || 'N/A',
      'Pedidos': item.numeroPedidos,
      'Ventas ($)': item.totalVentas.toFixed(2),
      'Propinas ($)': item.totalPropinas.toFixed(2),
      'Total ($)': (item.totalVentas + item.totalPropinas).toFixed(2),
      'Promedio/Pedido ($)': ((item.totalVentas + item.totalPropinas) / item.numeroPedidos).toFixed(2)
    }));

    const wsMesas = XLSX.utils.json_to_sheet(datosMesas);
    wsMesas['!cols'] = [{ wch: 10 }, { wch: 12 }, { wch: 15 }, { wch: 15 }, { wch: 15 }, { wch: 18 }];
    XLSX.utils.book_append_sheet(wb, wsMesas, 'Análisis por Mesa');

    // Generar buffer
    const buffer = XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' });

    // Configurar headers para descarga
    const nombreArchivo = `reporte_completo_${fechaInicio || 'inicio'}_${fechaFin || 'fin'}.xlsx`;
    res.setHeader('Content-Disposition', `attachment; filename="${nombreArchivo}"`);
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    
    res.send(buffer);
  } catch (error) {
    console.error('Error al generar reporte completo:', error);
    res.status(500).json({
      success: false,
      error: 'Error al generar el reporte completo'
    });
  }
};

module.exports = exports;
