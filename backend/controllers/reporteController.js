const Pedido = require('../models/Pedido');
const Mesa = require('../models/Mesa');
const Producto = require('../models/Producto');
const XLSX = require('xlsx');
const PDFDocument = require('pdfkit');

// ==================== FUNCIONES HELPER PARA PDF EMPRESARIAL ====================

/**
 * Dibuja el encabezado corporativo del PDF
 */
const dibujarEncabezado = (doc, titulo, subtitulo) => {
  // Fondo del encabezado
  doc.rect(0, 0, doc.page.width, 120).fill('#2c3e50');
  
  // Logo/Nombre de la empresa
  doc.fillColor('#ffffff')
     .fontSize(28)
     .font('Helvetica-Bold')
     .text('SIERRA YARA CAFE', 50, 30, { align: 'left' });
  
  // Linea decorativa
  doc.rect(50, 65, 200, 3).fill('#e74c3c');
  
  // Titulo del reporte
  doc.fillColor('#ecf0f1')
     .fontSize(16)
     .font('Helvetica')
     .text(titulo, 50, 75);
  
  if (subtitulo) {
    doc.fontSize(10)
       .text(subtitulo, 50, 95);
  }
  
  // Resetear color
  doc.fillColor('#000000');
};

/**
 * Dibuja una caja de informacion destacada
 */
const dibujarCajaInfo = (doc, x, y, ancho, alto, titulo, valor, color = '#3498db') => {
  // Fondo de la caja
  doc.rect(x, y, ancho, alto).fill(color);
  
  // Titulo
  doc.fillColor('#ffffff')
     .fontSize(9)
     .font('Helvetica')
     .text(titulo, x + 10, y + 10, { width: ancho - 20, align: 'center' });
  
  // Valor
  doc.fontSize(16)
     .font('Helvetica-Bold')
     .text(valor, x + 10, y + 28, { width: ancho - 20, align: 'center' });
  
  // Resetear color
  doc.fillColor('#000000');
};

/**
 * Dibuja una tabla con estilo empresarial
 */
const dibujarTablaHeader = (doc, headers, x, y, colWidths) => {
  // Fondo del header
  doc.rect(x, y, Object.values(colWidths).reduce((a, b) => a + b, 0), 25).fill('#34495e');
  
  // Textos del header
  doc.fillColor('#ffffff')
     .fontSize(9)
     .font('Helvetica-Bold');
  
  let xPos = x + 5;
  headers.forEach((header, index) => {
    const colWidth = Object.values(colWidths)[index];
    doc.text(header, xPos, y + 8, { width: colWidth - 10, align: 'left' });
    xPos += colWidth;
  });
  
  // Resetear
  doc.fillColor('#000000');
  return y + 25;
};

/**
 * Dibuja una fila de tabla con alternancia de colores
 */
const dibujarFilaTabla = (doc, datos, x, y, colWidths, esImpar) => {
  const ancho = Object.values(colWidths).reduce((a, b) => a + b, 0);
  
  // Fondo alternado
  if (esImpar) {
    doc.rect(x, y, ancho, 20).fill('#ecf0f1');
  }
  
  // Textos
  doc.fillColor('#000000')
     .fontSize(8)
     .font('Helvetica');
  
  let xPos = x + 5;
  datos.forEach((dato, index) => {
    const colWidth = Object.values(colWidths)[index];
    doc.text(dato, xPos, y + 6, { width: colWidth - 10, align: 'left' });
    xPos += colWidth;
  });
  
  return y + 20;
};

/**
 * Dibuja el pie de pagina corporativo
 */
const dibujarPiePagina = (doc, numeroPagina, totalPaginas) => {
  const y = doc.page.height - 50;
  
  // Linea superior
  doc.moveTo(50, y).lineTo(doc.page.width - 50, y).stroke('#bdc3c7');
  
  // Informacion
  doc.fillColor('#7f8c8d')
     .fontSize(8)
     .font('Helvetica')
     .text('Sierra Yara Cafe - Sistema de Gestion', 50, y + 10, { align: 'left' })
     .text('Pagina ' + numeroPagina + ' de ' + totalPaginas, 50, y + 10, { align: 'center' })
     .text(new Date().toLocaleDateString('es-VE'), 50, y + 10, { align: 'right' });
  
  doc.fillColor('#000000');
};

/**
 * Dibuja una seccion con titulo
 */
const dibujarSeccion = (doc, titulo, y) => {
  // Linea decorativa
  doc.rect(50, y, 5, 20).fill('#e74c3c');
  
  // Titulo
  doc.fillColor('#2c3e50')
     .fontSize(14)
     .font('Helvetica-Bold')
     .text(titulo, 65, y + 3);
  
  doc.fillColor('#000000');
  return y + 30;
};

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
    const nombreArchivo = 'reporte_ventas_' + Date.now() + '.pdf';
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'attachment; filename="' + nombreArchivo + '"');

    // Pipe el PDF al response
    doc.pipe(res);

    // ===== ENCABEZADO CORPORATIVO =====
    let periodoTexto = fechaInicio && fechaFin 
      ? 'Periodo: ' + fechaInicio + ' al ' + fechaFin
      : 'Periodo: Todos los registros';
    dibujarEncabezado(doc, 'REPORTE DE VENTAS', periodoTexto);

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
    const ticketPromedio = pedidos.length > 0 ? totalGeneral / pedidos.length : 0;

    // ===== CAJAS DE RESUMEN =====
    let y = 140;
    dibujarCajaInfo(doc, 50, y, 120, 55, 'TOTAL PEDIDOS', pedidos.length.toString(), '#3498db');
    dibujarCajaInfo(doc, 180, y, 120, 55, 'ITEMS VENDIDOS', totalItems.toString(), '#9b59b6');
    dibujarCajaInfo(doc, 310, y, 120, 55, 'TICKET PROMEDIO', '$' + ticketPromedio.toFixed(2), '#e67e22');
    
    y += 70;
    dibujarCajaInfo(doc, 50, y, 155, 55, 'TOTAL VENTAS', '$' + totalVentas.toFixed(2), '#27ae60');
    dibujarCajaInfo(doc, 215, y, 155, 55, 'TOTAL PROPINAS', '$' + totalPropinas.toFixed(2), '#16a085');
    dibujarCajaInfo(doc, 380, y, 155, 55, 'TOTAL GENERAL', '$' + totalGeneral.toFixed(2), '#2ecc71');

    // ===== SECCION DETALLE DE VENTAS =====
    y = dibujarSeccion(doc, 'DETALLE DE VENTAS', 280);

    // Tabla de ventas con diseño empresarial
    const colWidths = {
      fecha: 75,
      mesa: 45,
      producto: 160,
      cant: 40,
      precio: 60,
      subtotal: 65
    };

    let yPos = dibujarTablaHeader(
      doc,
      ['FECHA', 'MESA', 'PRODUCTO', 'CANT', 'PRECIO', 'SUBTOTAL'],
      50,
      y,
      colWidths
    );

    // Agregar datos con filas alternadas
    let contador = 0;
    for (const pedido of pedidos) {
      for (const item of pedido.items) {
        // Verificar si necesitamos una nueva página
        if (yPos > 720) {
          doc.addPage();
          dibujarEncabezado(doc, 'REPORTE DE VENTAS (continuacion)', periodoTexto);
          yPos = dibujarTablaHeader(
            doc,
            ['FECHA', 'MESA', 'PRODUCTO', 'CANT', 'PRECIO', 'SUBTOTAL'],
            50,
            150,
            colWidths
          );
        }

        const fecha = new Date(pedido.createdAt).toLocaleDateString('es-VE');
        const producto = item.productoId?.nombre || 'N/A';
        const productoCorto = producto.length > 28 ? producto.substring(0, 25) + '...' : producto;
        
        const datos = [
          fecha,
          (pedido.mesaId?.numeroMesa || 'N/A').toString(),
          productoCorto,
          item.cantidad.toString(),
          '$' + item.precioUnitario.toFixed(2),
          '$' + (item.cantidad * item.precioUnitario).toFixed(2)
        ];

        yPos = dibujarFilaTabla(doc, datos, 50, yPos, colWidths, contador % 2 === 1);
        contador++;
      }
    }

    // Pie de página en todas las páginas
    const pages = doc.bufferedPageRange();
    for (let i = 0; i < pages.count; i++) {
      doc.switchToPage(i);
      dibujarPiePagina(doc, i + 1, pages.count);
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
    const nombreArchivo = 'reporte_productos_' + Date.now() + '.pdf';
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'attachment; filename="' + nombreArchivo + '"');

    // Pipe el PDF al response
    doc.pipe(res);

    // ===== ENCABEZADO CORPORATIVO =====
    let periodoTexto = fechaInicio && fechaFin 
      ? 'Periodo: ' + fechaInicio + ' al ' + fechaFin
      : 'Periodo: Todos los registros';
    dibujarEncabezado(doc, 'PRODUCTOS MAS VENDIDOS', periodoTexto);

    // Calcular totales
    const totalUnidades = productosVendidos.reduce((sum, item) => sum + item.cantidadVendida, 0);
    const totalIngresos = productosVendidos.reduce((sum, item) => sum + item.totalVentas, 0);
    const promedioUnidades = productosVendidos.length > 0 ? totalUnidades / productosVendidos.length : 0;

    // ===== CAJAS DE RESUMEN =====
    let y = 140;
    dibujarCajaInfo(doc, 50, y, 130, 55, 'PRODUCTOS', productosVendidos.length.toString(), '#3498db');
    dibujarCajaInfo(doc, 190, y, 130, 55, 'UNIDADES', totalUnidades.toString(), '#9b59b6');
    dibujarCajaInfo(doc, 330, y, 155, 55, 'PROMEDIO/PROD', promedioUnidades.toFixed(1), '#e67e22');
    
    y += 70;
    dibujarCajaInfo(doc, 115, y, 285, 55, 'INGRESOS TOTALES', '$' + totalIngresos.toFixed(2), '#27ae60');

    // ===== SECCION RANKING DE PRODUCTOS =====
    y = dibujarSeccion(doc, 'RANKING DE PRODUCTOS', 280);

    // Tabla de productos con diseño empresarial
    const colWidthsProd = {
      rank: 40,
      producto: 190,
      categoria: 85,
      unidades: 65,
      ingresos: 75
    };

    let yPos = dibujarTablaHeader(
      doc,
      ['#', 'PRODUCTO', 'CATEGORIA', 'UNIDADES', 'INGRESOS'],
      50,
      y,
      colWidthsProd
    );

    // Agregar datos con filas alternadas
    productosVendidos.forEach((item, index) => {
      // Verificar si necesitamos una nueva página
      if (yPos > 720) {
        doc.addPage();
        dibujarEncabezado(doc, 'PRODUCTOS MAS VENDIDOS (continuacion)', periodoTexto);
        yPos = dibujarTablaHeader(
          doc,
          ['#', 'PRODUCTO', 'CATEGORIA', 'UNIDADES', 'INGRESOS'],
          50,
          150,
          colWidthsProd
        );
      }

      const producto = item.producto?.nombre || 'Producto eliminado';
      const productoCorto = producto.length > 32 ? producto.substring(0, 29) + '...' : producto;
      
      const datos = [
        (index + 1).toString(),
        productoCorto,
        item.producto?.categoria || 'N/A',
        item.cantidadVendida.toString(),
        '$' + item.totalVentas.toFixed(2)
      ];

      yPos = dibujarFilaTabla(doc, datos, 50, yPos, colWidthsProd, index % 2 === 1);
    });

    // Pie de página en todas las páginas
    const pages = doc.bufferedPageRange();
    for (let i = 0; i < pages.count; i++) {
      doc.switchToPage(i);
      dibujarPiePagina(doc, i + 1, pages.count);
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
    const nombreArchivo = 'reporte_completo_' + Date.now() + '.pdf';
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'attachment; filename="' + nombreArchivo + '"');

    // Pipe el PDF al response
    doc.pipe(res);

    // ===== ENCABEZADO CORPORATIVO =====
    let periodoTexto = fechaInicio && fechaFin 
      ? 'Periodo: ' + fechaInicio + ' al ' + fechaFin
      : 'Periodo: Todos los registros';
    dibujarEncabezado(doc, 'REPORTE COMPLETO DE GESTION', periodoTexto);

    // Calcular totales generales
    const totalVentas = pedidos.reduce((sum, p) => sum + p.total, 0);
    const totalPropinas = pedidos.reduce((sum, p) => sum + (p.propina || 0), 0);
    const totalGeneral = totalVentas + totalPropinas;
    let totalItems = 0;
    pedidos.forEach(p => p.items.forEach(i => totalItems += i.cantidad));
    const ticketPromedio = pedidos.length > 0 ? totalGeneral / pedidos.length : 0;

    // ===== CAJAS DE RESUMEN GENERAL =====
    let y = 140;
    dibujarCajaInfo(doc, 50, y, 120, 55, 'PEDIDOS', pedidos.length.toString(), '#3498db');
    dibujarCajaInfo(doc, 180, y, 120, 55, 'ITEMS', totalItems.toString(), '#9b59b6');
    dibujarCajaInfo(doc, 310, y, 120, 55, 'TICKET PROM', '$' + ticketPromedio.toFixed(2), '#e67e22');
    
    y += 70;
    dibujarCajaInfo(doc, 50, y, 155, 55, 'VENTAS', '$' + totalVentas.toFixed(2), '#27ae60');
    dibujarCajaInfo(doc, 215, y, 155, 55, 'PROPINAS', '$' + totalPropinas.toFixed(2), '#16a085');
    dibujarCajaInfo(doc, 380, y, 155, 55, 'TOTAL', '$' + totalGeneral.toFixed(2), '#2ecc71');

    // ===== VENTAS POR METODO DE PAGO =====
    y = dibujarSeccion(doc, 'VENTAS POR METODO DE PAGO', 280);

    const ventasPorMetodo = {};
    pedidos.forEach(p => {
      const metodo = p.metodoPago || 'No especificado';
      if (!ventasPorMetodo[metodo]) {
        ventasPorMetodo[metodo] = { cantidad: 0, total: 0 };
      }
      ventasPorMetodo[metodo].cantidad++;
      ventasPorMetodo[metodo].total += p.total + (p.propina || 0);
    });

    const colWidthsMetodo = { metodo: 200, cantidad: 100, total: 145 };
    let yPosMetodo = dibujarTablaHeader(
      doc,
      ['METODO DE PAGO', 'PEDIDOS', 'TOTAL'],
      50,
      y,
      colWidthsMetodo
    );

    let contador = 0;
    Object.entries(ventasPorMetodo).forEach(([metodo, data]) => {
      const datos = [
        metodo,
        data.cantidad.toString() + ' pedidos',
        '$' + data.total.toFixed(2)
      ];
      yPosMetodo = dibujarFilaTabla(doc, datos, 50, yPosMetodo, colWidthsMetodo, contador % 2 === 1);
      contador++;
    });

    // ===== NUEVA PAGINA: TOP 10 PRODUCTOS =====
    doc.addPage();
    dibujarEncabezado(doc, 'TOP 10 PRODUCTOS MAS VENDIDOS', periodoTexto);

    y = 150;
    const top10 = productosVendidos.slice(0, 10);
    const colWidthsTop = { rank: 40, producto: 220, unidades: 80, ingresos: 105 };
    
    let yPosTop = dibujarTablaHeader(
      doc,
      ['#', 'PRODUCTO', 'UNIDADES', 'INGRESOS'],
      50,
      y,
      colWidthsTop
    );

    top10.forEach((item, index) => {
      const producto = item.producto?.nombre || 'N/A';
      const productoCorto = producto.length > 38 ? producto.substring(0, 35) + '...' : producto;
      
      const datos = [
        (index + 1).toString(),
        productoCorto,
        item.cantidadVendida.toString(),
        '$' + item.totalVentas.toFixed(2)
      ];

      yPosTop = dibujarFilaTabla(doc, datos, 50, yPosTop, colWidthsTop, index % 2 === 1);
    });

    // ===== ANALISIS POR MESA =====
    y = dibujarSeccion(doc, 'ANALISIS POR MESA', yPosTop + 30);

    const colWidthsMesa = { mesa: 70, pedidos: 80, ventas: 95, propinas: 95, total: 105 };
    let yPosMesa = dibujarTablaHeader(
      doc,
      ['MESA', 'PEDIDOS', 'VENTAS', 'PROPINAS', 'TOTAL'],
      50,
      y,
      colWidthsMesa
    );

    contador = 0;
    ventasPorMesa.slice(0, 15).forEach(item => {
      if (yPosMesa > 720) {
        doc.addPage();
        dibujarEncabezado(doc, 'ANALISIS POR MESA (continuacion)', periodoTexto);
        yPosMesa = dibujarTablaHeader(
          doc,
          ['MESA', 'PEDIDOS', 'VENTAS', 'PROPINAS', 'TOTAL'],
          50,
          150,
          colWidthsMesa
        );
      }

      const datos = [
        (item.mesa?.numeroMesa || 'N/A').toString(),
        item.numeroPedidos.toString(),
        '$' + item.totalVentas.toFixed(2),
        '$' + item.totalPropinas.toFixed(2),
        '$' + (item.totalVentas + item.totalPropinas).toFixed(2)
      ];

      yPosMesa = dibujarFilaTabla(doc, datos, 50, yPosMesa, colWidthsMesa, contador % 2 === 1);
      contador++;
    });

    // Pie de pagina en todas las paginas
    const pages = doc.bufferedPageRange();
    for (let i = 0; i < pages.count; i++) {
      doc.switchToPage(i);
      dibujarPiePagina(doc, i + 1, pages.count);
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
