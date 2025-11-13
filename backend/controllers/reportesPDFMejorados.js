const Pedido = require('../models/Pedido');
const Mesa = require('../models/Mesa');
const Producto = require('../models/Producto');
const Cliente = require('../models/Cliente');
const PDFDocument = require('pdfkit');

// ==================== FUNCIONES HELPER PARA PDF ESTILO LIMPIO ====================

/**
 * Dibuja el encabezado limpio y profesional
 */
const dibujarEncabezadoLimpio = (doc, titulo, subtitulo) => {
  doc.fillColor('#000000')
     .fontSize(24)
     .font('Helvetica-Bold')
     .text(titulo, 50, 40);
  
  if (subtitulo) {
    doc.fillColor('#666666')
       .fontSize(10)
       .font('Helvetica')
       .text(subtitulo, 50, 70);
  }
  
  doc.moveTo(50, 90)
     .lineTo(doc.page.width - 50, 90)
     .strokeColor('#cccccc')
     .lineWidth(1)
     .stroke();
  
  doc.fillColor('#000000');
  return 100;
};

/**
 * Dibuja una seccion de resumen ejecutivo
 */
const dibujarResumenEjecutivo = (doc, titulo, y) => {
  doc.fillColor('#000000')
     .fontSize(14)
     .font('Helvetica-Bold')
     .text(titulo, 50, y);
  
  doc.fillColor('#000000');
  return y + 30;
};

/**
 * Dibuja una tabla de resumen con 2 columnas
 */
const dibujarTablaResumen = (doc, datos, x, y, ancho) => {
  const altoFila = 25;
  const anchoMetrica = ancho * 0.7;
  const anchoMonto = ancho * 0.3;
  
  // Header
  doc.rect(x, y, ancho, 20).fillAndStroke('#4a5568', '#4a5568');
  doc.fillColor('#ffffff')
     .fontSize(10)
     .font('Helvetica-Bold')
     .text('Metrica', x + 10, y + 6, { width: anchoMetrica - 20 })
     .text('Monto', x + anchoMetrica + 10, y + 6, { width: anchoMonto - 20, align: 'right' });
  
  let yPos = y + 20;
  
  datos.forEach((item) => {
    doc.rect(x, yPos, ancho, altoFila).fillAndStroke('#ffffff', '#e0e0e0');
    
    doc.fillColor('#333333')
       .fontSize(9)
       .font('Helvetica')
       .text(item.metrica, x + 10, yPos + 8, { width: anchoMetrica - 20 });
    
    const color = item.monto.toString().includes('-') ? '#e53e3e' : '#38a169';
    doc.fillColor(color)
       .fontSize(9)
       .font('Helvetica-Bold')
       .text(item.monto, x + anchoMetrica + 10, yPos + 8, { width: anchoMonto - 20, align: 'right' });
    
    yPos += altoFila;
  });
  
  doc.fillColor('#000000');
  return yPos;
};

/**
 * Dibuja una tabla con header limpio
 */
const dibujarTablaHeaderLimpio = (doc, headers, x, y, colWidths) => {
  const totalWidth = Object.values(colWidths).reduce((a, b) => a + b, 0);
  
  doc.rect(x, y, totalWidth, 20).fillAndStroke('#f5f5f5', '#cccccc');
  
  doc.fillColor('#333333')
     .fontSize(9)
     .font('Helvetica-Bold');
  
  let xPos = x + 5;
  headers.forEach((header, index) => {
    const colWidth = Object.values(colWidths)[index];
    doc.text(header, xPos, y + 6, { width: colWidth - 10, align: 'left' });
    xPos += colWidth;
  });
  
  doc.fillColor('#000000');
  return y + 20;
};

/**
 * Dibuja una fila de tabla limpia
 */
const dibujarFilaTablaLimpia = (doc, datos, x, y, colWidths) => {
  const ancho = Object.values(colWidths).reduce((a, b) => a + b, 0);
  
  doc.rect(x, y, ancho, 18).stroke('#e0e0e0');
  
  doc.fillColor('#333333')
     .fontSize(8)
     .font('Helvetica');
  
  let xPos = x + 5;
  datos.forEach((dato, index) => {
    const colWidth = Object.values(colWidths)[index];
    doc.text(dato, xPos, y + 5, { width: colWidth - 10, align: 'left' });
    xPos += colWidth;
  });
  
  return y + 18;
};

/**
 * Dibuja el pie de pagina limpio
 */
const dibujarPiePaginaLimpio = (doc, numeroPagina, totalPaginas) => {
  const y = doc.page.height - 40;
  
  doc.fillColor('#999999')
     .fontSize(8)
     .font('Helvetica')
     .text('Pagina ' + numeroPagina + ' de ' + totalPaginas + ' | Sierra Yara Cafe', 50, y, { 
       width: doc.page.width - 100, 
       align: 'center' 
     });
  
  doc.fillColor('#000000');
};

/**
 * Dibuja estadisticas en formato de lista
 */
const dibujarEstadisticas = (doc, datos, x, y) => {
  doc.fillColor('#000000')
     .fontSize(12)
     .font('Helvetica-Bold')
     .text('Estadisticas', x, y);
  
  let yPos = y + 25;
  
  datos.forEach(item => {
    doc.fillColor('#333333')
       .fontSize(10)
       .font('Helvetica')
       .text(item.label, x, yPos);
    
    doc.fillColor('#000000')
       .font('Helvetica-Bold')
       .text(item.valor, x + 300, yPos, { align: 'right', width: 100 });
    
    yPos += 20;
  });
  
  return yPos;
};

// ==================== EXPORTACIONES ====================

/**
 * @desc    Generar reporte completo detallado en PDF
 * @route   GET /api/reportes/completo-detallado/pdf
 * @access  Private (Admin)
 */
exports.generarReporteCompletoDetalladoPDF = async (req, res) => {
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

    // Obtener todos los datos
    const pedidos = await Pedido.find(filtro)
      .populate('mesaId', 'numeroMesa')
      .populate('items.productoId', 'nombre categoria precio')
      .sort({ createdAt: -1 });

    // Crear documento PDF
    const doc = new PDFDocument({ margin: 50, size: 'A4' });

    // Configurar headers para descarga
    const nombreArchivo = 'estado_cuenta_' + Date.now() + '.pdf';
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'attachment; filename="' + nombreArchivo + '"');

    doc.pipe(res);

    // ===== PAGINA 1: ENCABEZADO Y RESUMEN =====
    const fechaGeneracion = 'Generado: ' + new Date().toLocaleDateString('es-VE', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
    
    let y = dibujarEncabezadoLimpio(doc, 'Estados de Cuenta', fechaGeneracion);
    y += 20;

    // Calcular totales
    const totalVentas = pedidos.reduce((sum, p) => sum + p.total, 0);
    const totalPropinas = pedidos.reduce((sum, p) => sum + (p.propina || 0), 0);
    const totalGeneral = totalVentas + totalPropinas;
    let totalItems = 0;
    pedidos.forEach(p => p.items.forEach(i => totalItems += i.cantidad));

    // Resumen Ejecutivo
    y = dibujarResumenEjecutivo(doc, 'Resumen Ejecutivo', y);

    const datosResumen = [
      { metrica: 'Ingresos Totales', monto: '$' + totalVentas.toFixed(2) },
      { metrica: 'Gastos Totales', monto: '$0.00' },
      { metrica: 'Avances Totales', monto: '$' + totalPropinas.toFixed(2) },
      { metrica: 'Balance Total', monto: '$' + totalGeneral.toFixed(2) }
    ];

    y = dibujarTablaResumen(doc, datosResumen, 85, y, 430);
    y += 30;

    // Estadisticas
    const datosEstadisticas = [
      { label: 'Total de Estados de Cuenta', valor: pedidos.length.toString() },
      { label: 'Total de Transacciones', valor: totalItems.toString() },
      { label: 'Promedio por Estado', valor: '$' + (pedidos.length > 0 ? (totalGeneral / pedidos.length).toFixed(2) : '0.00') }
    ];

    y = dibujarEstadisticas(doc, datosEstadisticas, 85, y);

    // ===== PAGINA 2: DETALLE DE PEDIDOS =====
    doc.addPage();
    y = dibujarEncabezadoLimpio(doc, 'Estados de Cuenta', 'Detalle de Pedidos');
    y += 20;

    // Tabla de pedidos
    const colWidths = {
      artista: 100,
      mes: 60,
      inicio: 70,
      ingresos: 70,
      gastos: 60,
      avances: 60,
      balance: 65,
      trans: 40
    };

    y = dibujarTablaHeaderLimpio(
      doc,
      ['Artista', 'Mes', 'Inicio', 'Ingresos', 'Gastos', 'Avances', 'Balance', 'Trans'],
      50,
      y,
      colWidths
    );

    let contador = 0;
    for (const pedido of pedidos) {
      if (y > 720) {
        doc.addPage();
        y = dibujarEncabezadoLimpio(doc, 'Estados de Cuenta', 'Detalle de Pedidos (continuacion)');
        y = dibujarTablaHeaderLimpio(
          doc,
          ['Artista', 'Mes', 'Inicio', 'Ingresos', 'Gastos', 'Avances', 'Balance', 'Trans'],
          50,
          y + 20,
          colWidths
        );
      }

      const fecha = new Date(pedido.createdAt);
      const mes = fecha.toLocaleDateString('es-VE', { month: 'short', year: 'numeric' });
      const inicio = fecha.toLocaleDateString('es-VE');
      const mesa = pedido.mesaId?.numeroMesa || 'N/A';
      const itemsCount = pedido.items.reduce((sum, item) => sum + item.cantidad, 0);

      const datos = [
        'Mesa ' + mesa,
        mes,
        inicio,
        '$' + pedido.total.toFixed(2),
        '$0.00',
        '$' + (pedido.propina || 0).toFixed(2),
        '$' + (pedido.total + (pedido.propina || 0)).toFixed(2),
        itemsCount.toString()
      ];

      y = dibujarFilaTablaLimpia(doc, datos, 50, y, colWidths);
      contador++;
    }

    // Pie de pagina en todas las paginas
    const pages = doc.bufferedPageRange();
    for (let i = 0; i < pages.count; i++) {
      doc.switchToPage(i);
      dibujarPiePaginaLimpio(doc, i + 1, pages.count);
    }

    doc.end();
  } catch (error) {
    console.error('Error al generar reporte completo detallado PDF:', error);
    console.error('Stack:', error.stack);
    
    // Asegurarse de que no se haya enviado ya una respuesta
    if (!res.headersSent) {
      res.status(500).json({
        success: false,
        error: 'Error al generar el reporte PDF completo detallado',
        message: error.message
      });
    }
  }
};

/**
 * @desc    Generar reporte de clientes en PDF
 * @route   GET /api/reportes/clientes/pdf
 * @access  Private (Admin)
 */
exports.generarReporteClientesPDF = async (req, res) => {
  try {
    // Obtener todos los clientes
    const clientes = await Cliente.find().sort({ nombre: 1 });

    // Crear documento PDF
    const doc = new PDFDocument({ margin: 50, size: 'A4' });

    // Configurar headers para descarga
    const nombreArchivo = 'reporte_clientes_' + Date.now() + '.pdf';
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'attachment; filename="' + nombreArchivo + '"');

    doc.pipe(res);

    // Encabezado
    const fechaGeneracion = 'Generado: ' + new Date().toLocaleDateString('es-VE', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
    
    let y = dibujarEncabezadoLimpio(doc, 'Reporte de Clientes', fechaGeneracion);
    y += 20;

    // Resumen
    y = dibujarResumenEjecutivo(doc, 'Resumen', y);
    
    const datosResumen = [
      { metrica: 'Total de Clientes', monto: clientes.length.toString() },
      { metrica: 'Clientes Activos', monto: clientes.length.toString() }
    ];

    y = dibujarTablaResumen(doc, datosResumen, 85, y, 430);
    y += 30;

    // Tabla de clientes
    const colWidths = {
      nombre: 150,
      cedula: 80,
      telefono: 90,
      email: 165
    };

    y = dibujarTablaHeaderLimpio(
      doc,
      ['Nombre', 'Cedula', 'Telefono', 'Email'],
      50,
      y,
      colWidths
    );

    for (const cliente of clientes) {
      if (y > 720) {
        doc.addPage();
        y = dibujarEncabezadoLimpio(doc, 'Reporte de Clientes', 'Continuacion');
        y = dibujarTablaHeaderLimpio(
          doc,
          ['Nombre', 'Cedula', 'Telefono', 'Email'],
          50,
          y + 20,
          colWidths
        );
      }

      const datos = [
        cliente.nombre || 'N/A',
        cliente.cedula || 'N/A',
        cliente.telefono || 'N/A',
        cliente.email || 'N/A'
      ];

      y = dibujarFilaTablaLimpia(doc, datos, 50, y, colWidths);
    }

    // Pie de pagina
    const pages = doc.bufferedPageRange();
    for (let i = 0; i < pages.count; i++) {
      doc.switchToPage(i);
      dibujarPiePaginaLimpio(doc, i + 1, pages.count);
    }

    doc.end();
  } catch (error) {
    console.error('Error al generar reporte de clientes PDF:', error);
    console.error('Stack:', error.stack);
    
    // Asegurarse de que no se haya enviado ya una respuesta
    if (!res.headersSent) {
      res.status(500).json({
        success: false,
        error: 'Error al generar el reporte PDF de clientes',
        message: error.message
      });
    }
  }
};
