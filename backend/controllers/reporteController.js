const Pedido = require('../models/Pedido');
const Mesa = require('../models/Mesa');
const Producto = require('../models/Producto');
const XLSX = require('xlsx');
const PDFDocument = require('pdfkit');

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

/**
 * @desc    Generar reporte de ventas en PDF
 * @route   GET /api/reportes/ventas/pdf
 * @access  Private (Admin)
 */
exports.generarReporteVentasPDF = async (req, res) => {
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

    // Crear documento PDF
    const doc = new PDFDocument({ margin: 50, size: 'A4' });

    // Configurar headers para descarga
    const nombreArchivo = `ventas_${fechaInicio || 'inicio'}_${fechaFin || 'fin'}.pdf`;
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="${nombreArchivo}"`);

    // Pipe el PDF al response
    doc.pipe(res);

    // Título del reporte
    doc.fontSize(20).font('Helvetica-Bold').text('Reporte de Ventas', { align: 'center' });
    doc.moveDown(0.5);
    doc.fontSize(10).font('Helvetica').text(`Sierra Yara Café`, { align: 'center' });
    doc.moveDown(0.3);
    
    // Período del reporte
    const periodoTexto = fechaInicio && fechaFin 
      ? `Período: ${fechaInicio} - ${fechaFin}`
      : 'Período: Todos los registros';
    doc.fontSize(10).text(periodoTexto, { align: 'center' });
    doc.text(`Fecha de generación: ${new Date().toLocaleDateString('es-VE')}`, { align: 'center' });
    doc.moveDown(1);

    // Calcular totales
    let totalVentas = 0;
    let totalPropinas = 0;
    let totalItems = 0;

    pedidos.forEach(pedido => {
      totalVentas += pedido.total;
      totalPropinas += pedido.propina || 0;
      pedido.items.forEach(item => {
        totalItems += item.cantidad;
      });
    });

    const totalGeneral = totalVentas + totalPropinas;

    // Resumen ejecutivo
    doc.fontSize(14).font('Helvetica-Bold').text('Resumen Ejecutivo', { underline: true });
    doc.moveDown(0.5);
    doc.fontSize(10).font('Helvetica');
    
    const y = doc.y;
    doc.text(`Total de Pedidos:`, 50, y);
    doc.text(`${pedidos.length}`, 200, y, { align: 'left' });
    
    doc.text(`Total Items Vendidos:`, 50, y + 20);
    doc.text(`${totalItems}`, 200, y + 20, { align: 'left' });
    
    doc.text(`Total Ventas:`, 50, y + 40);
    doc.text(`$${totalVentas.toFixed(2)}`, 200, y + 40, { align: 'left' });
    
    doc.text(`Total Propinas:`, 50, y + 60);
    doc.text(`$${totalPropinas.toFixed(2)}`, 200, y + 60, { align: 'left' });
    
    doc.fontSize(12).font('Helvetica-Bold');
    doc.text(`Total General:`, 50, y + 80);
    doc.text(`$${totalGeneral.toFixed(2)}`, 200, y + 80, { align: 'left' });
    
    doc.moveDown(3);

    // Detalle de ventas
    doc.fontSize(14).font('Helvetica-Bold').text('Detalle de Ventas', { underline: true });
    doc.moveDown(0.5);

    // Tabla de ventas
    const tableTop = doc.y;
    const colWidths = {
      fecha: 70,
      mesa: 40,
      producto: 150,
      cant: 35,
      precio: 50,
      subtotal: 60
    };

    // Encabezados de tabla
    doc.fontSize(9).font('Helvetica-Bold');
    let xPos = 50;
    doc.text('Fecha', xPos, tableTop);
    xPos += colWidths.fecha;
    doc.text('Mesa', xPos, tableTop);
    xPos += colWidths.mesa;
    doc.text('Producto', xPos, tableTop);
    xPos += colWidths.producto;
    doc.text('Cant', xPos, tableTop);
    xPos += colWidths.cant;
    doc.text('Precio', xPos, tableTop);
    xPos += colWidths.precio;
    doc.text('Subtotal', xPos, tableTop);

    // Línea separadora
    doc.moveTo(50, tableTop + 15).lineTo(550, tableTop + 15).stroke();

    let yPos = tableTop + 25;
    doc.fontSize(8).font('Helvetica');

    // Agregar datos
    for (const pedido of pedidos) {
      for (const item of pedido.items) {
        // Verificar si necesitamos una nueva página
        if (yPos > 700) {
          doc.addPage();
          yPos = 50;
          
          // Re-dibujar encabezados
          doc.fontSize(9).font('Helvetica-Bold');
          xPos = 50;
          doc.text('Fecha', xPos, yPos);
          xPos += colWidths.fecha;
          doc.text('Mesa', xPos, yPos);
          xPos += colWidths.mesa;
          doc.text('Producto', xPos, yPos);
          xPos += colWidths.producto;
          doc.text('Cant', xPos, yPos);
          xPos += colWidths.cant;
          doc.text('Precio', xPos, yPos);
          xPos += colWidths.precio;
          doc.text('Subtotal', xPos, yPos);
          
          doc.moveTo(50, yPos + 15).lineTo(550, yPos + 15).stroke();
          yPos += 25;
          doc.fontSize(8).font('Helvetica');
        }

        xPos = 50;
        const fecha = new Date(pedido.createdAt).toLocaleDateString('es-VE');
        const producto = item.productoId?.nombre || 'N/A';
        const productoCorto = producto.length > 25 ? producto.substring(0, 22) + '...' : producto;
        
        doc.text(fecha, xPos, yPos, { width: colWidths.fecha });
        xPos += colWidths.fecha;
        doc.text(pedido.mesaId?.numeroMesa || 'N/A', xPos, yPos, { width: colWidths.mesa });
        xPos += colWidths.mesa;
        doc.text(productoCorto, xPos, yPos, { width: colWidths.producto });
        xPos += colWidths.producto;
        doc.text(item.cantidad.toString(), xPos, yPos, { width: colWidths.cant });
        xPos += colWidths.cant;
        doc.text(`$${item.precioUnitario.toFixed(2)}`, xPos, yPos, { width: colWidths.precio });
        xPos += colWidths.precio;
        doc.text(`$${(item.cantidad * item.precioUnitario).toFixed(2)}`, xPos, yPos, { width: colWidths.subtotal });
        
        yPos += 20;
      }
    }

    // Pie de página
    const pages = doc.bufferedPageRange();
    for (let i = 0; i < pages.count; i++) {
      doc.switchToPage(i);
      doc.fontSize(8).font('Helvetica').text(
        `Página ${i + 1} de ${pages.count}`,
        50,
        doc.page.height - 50,
        { align: 'center' }
      );
    }

    // Finalizar el PDF
    doc.end();
  } catch (error) {
    console.error('Error al generar reporte PDF de ventas:', error);
    res.status(500).json({
      success: false,
      error: 'Error al generar el reporte PDF de ventas'
    });
  }
};

/**
 * @desc    Generar reporte de productos en PDF
 * @route   GET /api/reportes/productos/pdf
 * @access  Private (Admin)
 */
exports.generarReporteProductosPDF = async (req, res) => {
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

    // Crear documento PDF
    const doc = new PDFDocument({ margin: 50, size: 'A4' });

    // Configurar headers para descarga
    const nombreArchivo = `productos_vendidos_${fechaInicio || 'inicio'}_${fechaFin || 'fin'}.pdf`;
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="${nombreArchivo}"`);

    // Pipe el PDF al response
    doc.pipe(res);

    // Título del reporte
    doc.fontSize(20).font('Helvetica-Bold').text('Productos Más Vendidos', { align: 'center' });
    doc.moveDown(0.5);
    doc.fontSize(10).font('Helvetica').text(`Sierra Yara Café`, { align: 'center' });
    doc.moveDown(0.3);
    
    // Período del reporte
    const periodoTexto = fechaInicio && fechaFin 
      ? `Período: ${fechaInicio} - ${fechaFin}`
      : 'Período: Todos los registros';
    doc.fontSize(10).text(periodoTexto, { align: 'center' });
    doc.text(`Fecha de generación: ${new Date().toLocaleDateString('es-VE')}`, { align: 'center' });
    doc.moveDown(1);

    // Calcular totales
    const totalUnidades = productosVendidos.reduce((sum, item) => sum + item.cantidadVendida, 0);
    const totalIngresos = productosVendidos.reduce((sum, item) => sum + item.totalVentas, 0);

    // Resumen ejecutivo
    doc.fontSize(14).font('Helvetica-Bold').text('Resumen Ejecutivo', { underline: true });
    doc.moveDown(0.5);
    doc.fontSize(10).font('Helvetica');
    
    const y = doc.y;
    doc.text(`Total de Productos:`, 50, y);
    doc.text(`${productosVendidos.length}`, 200, y, { align: 'left' });
    
    doc.text(`Unidades Vendidas:`, 50, y + 20);
    doc.text(`${totalUnidades}`, 200, y + 20, { align: 'left' });
    
    doc.fontSize(12).font('Helvetica-Bold');
    doc.text(`Ingresos Totales:`, 50, y + 40);
    doc.text(`$${totalIngresos.toFixed(2)}`, 200, y + 40, { align: 'left' });
    
    doc.moveDown(2.5);

    // Ranking de productos
    doc.fontSize(14).font('Helvetica-Bold').text('Ranking de Productos', { underline: true });
    doc.moveDown(0.5);

    // Tabla de productos
    const tableTop = doc.y;
    const colWidths = {
      rank: 35,
      producto: 180,
      categoria: 80,
      unidades: 60,
      ingresos: 70
    };

    // Encabezados de tabla
    doc.fontSize(9).font('Helvetica-Bold');
    let xPos = 50;
    doc.text('#', xPos, tableTop);
    xPos += colWidths.rank;
    doc.text('Producto', xPos, tableTop);
    xPos += colWidths.producto;
    doc.text('Categoría', xPos, tableTop);
    xPos += colWidths.categoria;
    doc.text('Unidades', xPos, tableTop);
    xPos += colWidths.unidades;
    doc.text('Ingresos', xPos, tableTop);

    // Línea separadora
    doc.moveTo(50, tableTop + 15).lineTo(550, tableTop + 15).stroke();

    let yPos = tableTop + 25;
    doc.fontSize(8).font('Helvetica');

    // Agregar datos
    productosVendidos.forEach((item, index) => {
      // Verificar si necesitamos una nueva página
      if (yPos > 700) {
        doc.addPage();
        yPos = 50;
        
        // Re-dibujar encabezados
        doc.fontSize(9).font('Helvetica-Bold');
        xPos = 50;
        doc.text('#', xPos, yPos);
        xPos += colWidths.rank;
        doc.text('Producto', xPos, yPos);
        xPos += colWidths.producto;
        doc.text('Categoría', xPos, yPos);
        xPos += colWidths.categoria;
        doc.text('Unidades', xPos, yPos);
        xPos += colWidths.unidades;
        doc.text('Ingresos', xPos, yPos);
        
        doc.moveTo(50, yPos + 15).lineTo(550, yPos + 15).stroke();
        yPos += 25;
        doc.fontSize(8).font('Helvetica');
      }

      xPos = 50;
      const producto = item.producto?.nombre || 'Producto eliminado';
      const productoCorto = producto.length > 30 ? producto.substring(0, 27) + '...' : producto;
      
      doc.text((index + 1).toString(), xPos, yPos, { width: colWidths.rank });
      xPos += colWidths.rank;
      doc.text(productoCorto, xPos, yPos, { width: colWidths.producto });
      xPos += colWidths.producto;
      doc.text(item.producto?.categoria || 'N/A', xPos, yPos, { width: colWidths.categoria });
      xPos += colWidths.categoria;
      doc.text(item.cantidadVendida.toString(), xPos, yPos, { width: colWidths.unidades });
      xPos += colWidths.unidades;
      doc.text(`$${item.totalVentas.toFixed(2)}`, xPos, yPos, { width: colWidths.ingresos });
      
      yPos += 20;
    });

    // Pie de página
    const pages = doc.bufferedPageRange();
    for (let i = 0; i < pages.count; i++) {
      doc.switchToPage(i);
      doc.fontSize(8).font('Helvetica').text(
        `Página ${i + 1} de ${pages.count}`,
        50,
        doc.page.height - 50,
        { align: 'center' }
      );
    }

    // Finalizar el PDF
    doc.end();
  } catch (error) {
    console.error('Error al generar reporte PDF de productos:', error);
    res.status(500).json({
      success: false,
      error: 'Error al generar el reporte PDF de productos'
    });
  }
};

/**
 * @desc    Generar reporte completo en PDF
 * @route   GET /api/reportes/completo/pdf
 * @access  Private (Admin)
 */
exports.generarReporteCompletoPDF = async (req, res) => {
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

    // Obtener datos
    const pedidos = await Pedido.find(filtro)
      .populate('mesaId', 'numeroMesa')
      .populate('items.productoId', 'nombre categoria precio')
      .sort({ createdAt: -1 });

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

    // Crear documento PDF
    const doc = new PDFDocument({ margin: 50, size: 'A4' });

    // Configurar headers para descarga
    const nombreArchivo = `reporte_completo_${fechaInicio || 'inicio'}_${fechaFin || 'fin'}.pdf`;
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="${nombreArchivo}"`);

    // Pipe el PDF al response
    doc.pipe(res);

    // ===== PÁGINA 1: PORTADA Y RESUMEN GENERAL =====
    doc.fontSize(24).font('Helvetica-Bold').text('Reporte Completo', { align: 'center' });
    doc.moveDown(0.5);
    doc.fontSize(16).font('Helvetica').text('Sierra Yara Café', { align: 'center' });
    doc.moveDown(0.5);
    
    const periodoTexto = fechaInicio && fechaFin 
      ? `Período: ${fechaInicio} - ${fechaFin}`
      : 'Período: Todos los registros';
    doc.fontSize(12).text(periodoTexto, { align: 'center' });
    doc.text(`Fecha de generación: ${new Date().toLocaleDateString('es-VE')}`, { align: 'center' });
    doc.moveDown(2);

    // Calcular totales generales
    const totalVentas = pedidos.reduce((sum, p) => sum + p.total, 0);
    const totalPropinas = pedidos.reduce((sum, p) => sum + (p.propina || 0), 0);
    const totalGeneral = totalVentas + totalPropinas;
    let totalItems = 0;
    pedidos.forEach(p => p.items.forEach(i => totalItems += i.cantidad));

    // Resumen General
    doc.fontSize(16).font('Helvetica-Bold').text('Resumen General', { underline: true });
    doc.moveDown(0.5);
    doc.fontSize(11).font('Helvetica');
    
    let y = doc.y;
    doc.text(`Total de Pedidos:`, 80, y);
    doc.text(`${pedidos.length}`, 300, y);
    
    doc.text(`Total Items Vendidos:`, 80, y + 25);
    doc.text(`${totalItems}`, 300, y + 25);
    
    doc.text(`Total Ventas:`, 80, y + 50);
    doc.text(`$${totalVentas.toFixed(2)}`, 300, y + 50);
    
    doc.text(`Total Propinas:`, 80, y + 75);
    doc.text(`$${totalPropinas.toFixed(2)}`, 300, y + 75);
    
    doc.fontSize(14).font('Helvetica-Bold');
    doc.text(`Total General:`, 80, y + 100);
    doc.text(`$${totalGeneral.toFixed(2)}`, 300, y + 100);
    
    doc.fontSize(11).font('Helvetica');
    doc.text(`Ticket Promedio:`, 80, y + 125);
    doc.text(`$${(totalGeneral / pedidos.length || 0).toFixed(2)}`, 300, y + 125);

    doc.moveDown(3);

    // Ventas por método de pago
    const ventasPorMetodo = {};
    pedidos.forEach(p => {
      const metodo = p.metodoPago || 'No especificado';
      if (!ventasPorMetodo[metodo]) {
        ventasPorMetodo[metodo] = { cantidad: 0, total: 0 };
      }
      ventasPorMetodo[metodo].cantidad++;
      ventasPorMetodo[metodo].total += p.total + (p.propina || 0);
    });

    doc.fontSize(14).font('Helvetica-Bold').text('Ventas por Método de Pago', { underline: true });
    doc.moveDown(0.5);
    doc.fontSize(10).font('Helvetica');

    y = doc.y;
    Object.entries(ventasPorMetodo).forEach(([metodo, data], index) => {
      doc.text(`${metodo}:`, 80, y + (index * 20));
      doc.text(`${data.cantidad} pedidos - $${data.total.toFixed(2)}`, 300, y + (index * 20));
    });

    // ===== NUEVA PÁGINA: TOP PRODUCTOS =====
    doc.addPage();
    doc.fontSize(16).font('Helvetica-Bold').text('Top 10 Productos Más Vendidos', { underline: true });
    doc.moveDown(0.5);

    const top10 = productosVendidos.slice(0, 10);
    const tableTop = doc.y;
    
    doc.fontSize(9).font('Helvetica-Bold');
    let xPos = 50;
    doc.text('#', xPos, tableTop);
    xPos += 30;
    doc.text('Producto', xPos, tableTop);
    xPos += 200;
    doc.text('Unidades', xPos, tableTop);
    xPos += 70;
    doc.text('Ingresos', xPos, tableTop);

    doc.moveTo(50, tableTop + 15).lineTo(550, tableTop + 15).stroke();

    let yPos = tableTop + 25;
    doc.fontSize(9).font('Helvetica');

    top10.forEach((item, index) => {
      xPos = 50;
      const producto = item.producto?.nombre || 'N/A';
      const productoCorto = producto.length > 35 ? producto.substring(0, 32) + '...' : producto;
      
      doc.text((index + 1).toString(), xPos, yPos);
      xPos += 30;
      doc.text(productoCorto, xPos, yPos);
      xPos += 200;
      doc.text(item.cantidadVendida.toString(), xPos, yPos);
      xPos += 70;
      doc.text(`$${item.totalVentas.toFixed(2)}`, xPos, yPos);
      
      yPos += 25;
    });

    doc.moveDown(2);

    // Análisis por mesa
    doc.fontSize(16).font('Helvetica-Bold').text('Análisis por Mesa', { underline: true });
    doc.moveDown(0.5);

    const tableTop2 = doc.y;
    doc.fontSize(9).font('Helvetica-Bold');
    xPos = 50;
    doc.text('Mesa', xPos, tableTop2);
    xPos += 60;
    doc.text('Pedidos', xPos, tableTop2);
    xPos += 70;
    doc.text('Ventas', xPos, tableTop2);
    xPos += 80;
    doc.text('Propinas', xPos, tableTop2);
    xPos += 80;
    doc.text('Total', xPos, tableTop2);

    doc.moveTo(50, tableTop2 + 15).lineTo(550, tableTop2 + 15).stroke();

    yPos = tableTop2 + 25;
    doc.fontSize(9).font('Helvetica');

    ventasPorMesa.slice(0, 15).forEach(item => {
      if (yPos > 700) {
        doc.addPage();
        yPos = 50;
      }

      xPos = 50;
      doc.text(item.mesa?.numeroMesa || 'N/A', xPos, yPos);
      xPos += 60;
      doc.text(item.numeroPedidos.toString(), xPos, yPos);
      xPos += 70;
      doc.text(`$${item.totalVentas.toFixed(2)}`, xPos, yPos);
      xPos += 80;
      doc.text(`$${item.totalPropinas.toFixed(2)}`, xPos, yPos);
      xPos += 80;
      doc.text(`$${(item.totalVentas + item.totalPropinas).toFixed(2)}`, xPos, yPos);
      
      yPos += 20;
    });

    // Pie de página en todas las páginas
    const pages = doc.bufferedPageRange();
    for (let i = 0; i < pages.count; i++) {
      doc.switchToPage(i);
      doc.fontSize(8).font('Helvetica').text(
        `Página ${i + 1} de ${pages.count}`,
        50,
        doc.page.height - 50,
        { align: 'center' }
      );
    }

    // Finalizar el PDF
    doc.end();
  } catch (error) {
    console.error('Error al generar reporte PDF completo:', error);
    res.status(500).json({
      success: false,
      error: 'Error al generar el reporte PDF completo'
    });
  }
};

module.exports = exports;
