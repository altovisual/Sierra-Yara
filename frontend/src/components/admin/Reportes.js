import React, { useState } from 'react';
import { reportesAPI } from '../../services/api';
import { FileSpreadsheet, Download, Calendar, TrendingUp, Package, DollarSign } from 'lucide-react';

/**
 * Componente para generar y descargar reportes en Excel
 */
const Reportes = () => {
  const [fechaInicio, setFechaInicio] = useState('');
  const [fechaFin, setFechaFin] = useState('');
  const [descargando, setDescargando] = useState(null);

  const handleDescargarReporte = (tipo) => {
    setDescargando(tipo);
    
    const params = {};
    if (fechaInicio) params.fechaInicio = fechaInicio;
    if (fechaFin) params.fechaFin = fechaFin;

    try {
      switch (tipo) {
        case 'ventas':
          reportesAPI.descargarReporteVentas(params);
          break;
        case 'productos':
          reportesAPI.descargarReporteProductos(params);
          break;
        case 'completo':
          reportesAPI.descargarReporteCompleto(params);
          break;
        default:
          break;
      }
      
      // Resetear estado después de un momento
      setTimeout(() => setDescargando(null), 2000);
    } catch (error) {
      console.error('Error al descargar reporte:', error);
      alert('Error al generar el reporte. Por favor intenta de nuevo.');
      setDescargando(null);
    }
  };

  const establecerRangoRapido = (dias) => {
    const hoy = new Date();
    const inicio = new Date();
    inicio.setDate(hoy.getDate() - dias);
    
    setFechaInicio(inicio.toISOString().split('T')[0]);
    setFechaFin(hoy.toISOString().split('T')[0]);
  };

  const limpiarFechas = () => {
    setFechaInicio('');
    setFechaFin('');
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-2 flex items-center gap-3">
            <FileSpreadsheet className="text-primary-600" size={36} />
            Reportes y Exportación
          </h1>
          <p className="text-gray-600">
            Genera reportes detallados en formato Excel para análisis de ventas y productos
          </p>
        </div>

        {/* Filtros de Fecha */}
        <div className="bg-white rounded-xl shadow-md p-6 mb-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center gap-2">
            <Calendar size={24} className="text-primary-600" />
            Filtrar por Rango de Fechas
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Fecha Inicio
              </label>
              <input
                type="date"
                value={fechaInicio}
                onChange={(e) => setFechaInicio(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Fecha Fin
              </label>
              <input
                type="date"
                value={fechaFin}
                onChange={(e) => setFechaFin(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
            </div>
          </div>

          {/* Rangos Rápidos */}
          <div className="flex flex-wrap gap-2 mb-4">
            <button
              onClick={() => establecerRangoRapido(7)}
              className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg text-sm font-medium transition-colors"
            >
              Últimos 7 días
            </button>
            <button
              onClick={() => establecerRangoRapido(30)}
              className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg text-sm font-medium transition-colors"
            >
              Últimos 30 días
            </button>
            <button
              onClick={() => establecerRangoRapido(90)}
              className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg text-sm font-medium transition-colors"
            >
              Últimos 3 meses
            </button>
            <button
              onClick={limpiarFechas}
              className="px-4 py-2 bg-red-100 hover:bg-red-200 text-red-700 rounded-lg text-sm font-medium transition-colors"
            >
              Limpiar filtros
            </button>
          </div>

          {(fechaInicio || fechaFin) && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
              <p className="text-sm text-blue-800">
                📊 Reportes filtrados: {fechaInicio || 'Inicio'} → {fechaFin || 'Hoy'}
              </p>
            </div>
          )}
        </div>

        {/* Tarjetas de Reportes */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Reporte de Ventas */}
          <div className="bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition-shadow">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-3 bg-green-100 rounded-lg">
                <DollarSign className="text-green-600" size={28} />
              </div>
              <h3 className="text-lg font-semibold text-gray-800">
                Reporte de Ventas
              </h3>
            </div>
            
            <p className="text-gray-600 text-sm mb-4">
              Detalle completo de todas las ventas con información de pedidos, productos, métodos de pago y propinas.
            </p>
            
            <ul className="text-sm text-gray-600 mb-4 space-y-1">
              <li>• Fecha y hora de venta</li>
              <li>• Productos vendidos</li>
              <li>• Métodos de pago</li>
              <li>• Propinas y totales</li>
            </ul>
            
            <button
              onClick={() => handleDescargarReporte('ventas')}
              disabled={descargando === 'ventas'}
              className="w-full btn-primary flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {descargando === 'ventas' ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Generando...
                </>
              ) : (
                <>
                  <Download size={20} />
                  Descargar Excel
                </>
              )}
            </button>
          </div>

          {/* Reporte de Productos */}
          <div className="bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition-shadow">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-3 bg-purple-100 rounded-lg">
                <Package className="text-purple-600" size={28} />
              </div>
              <h3 className="text-lg font-semibold text-gray-800">
                Productos Más Vendidos
              </h3>
            </div>
            
            <p className="text-gray-600 text-sm mb-4">
              Análisis de productos ordenados por cantidad vendida con estadísticas de ventas.
            </p>
            
            <ul className="text-sm text-gray-600 mb-4 space-y-1">
              <li>• Ranking de productos</li>
              <li>• Unidades vendidas</li>
              <li>• Ingresos por producto</li>
              <li>• Promedio por venta</li>
            </ul>
            
            <button
              onClick={() => handleDescargarReporte('productos')}
              disabled={descargando === 'productos'}
              className="w-full btn-primary flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {descargando === 'productos' ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Generando...
                </>
              ) : (
                <>
                  <Download size={20} />
                  Descargar Excel
                </>
              )}
            </button>
          </div>

          {/* Reporte Completo */}
          <div className="bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition-shadow border-2 border-primary-200">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-3 bg-primary-100 rounded-lg">
                <TrendingUp className="text-primary-600" size={28} />
              </div>
              <h3 className="text-lg font-semibold text-gray-800">
                Reporte Completo
              </h3>
            </div>
            
            <p className="text-gray-600 text-sm mb-4">
              Reporte integral con múltiples hojas: resumen general, ventas, productos y análisis por mesa.
            </p>
            
            <ul className="text-sm text-gray-600 mb-4 space-y-1">
              <li>• 📊 Resumen general</li>
              <li>• 💰 Ventas detalladas</li>
              <li>• 📦 Productos vendidos</li>
              <li>• 🪑 Análisis por mesa</li>
            </ul>
            
            <button
              onClick={() => handleDescargarReporte('completo')}
              disabled={descargando === 'completo'}
              className="w-full btn-primary flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {descargando === 'completo' ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Generando...
                </>
              ) : (
                <>
                  <Download size={20} />
                  Descargar Excel
                </>
              )}
            </button>
          </div>
        </div>

        {/* Información adicional */}
        <div className="mt-8 bg-blue-50 border border-blue-200 rounded-xl p-6">
          <h3 className="font-semibold text-blue-900 mb-3 flex items-center gap-2">
            <FileSpreadsheet size={20} />
            Información sobre los reportes
          </h3>
          <ul className="text-sm text-blue-800 space-y-2">
            <li>• Los reportes se generan en formato Excel (.xlsx) compatible con Microsoft Excel, Google Sheets y LibreOffice</li>
            <li>• Todos los montos están expresados en dólares ($)</li>
            <li>• Solo se incluyen pedidos confirmados como pagados</li>
            <li>• Si no seleccionas fechas, se exportarán todos los datos disponibles</li>
            <li>• Los archivos se descargan automáticamente al hacer clic en "Descargar Excel"</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default Reportes;
