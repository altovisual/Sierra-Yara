import React, { useState, useEffect, useCallback } from 'react';
import { RefreshCw, DollarSign, TrendingUp, Edit3, Download } from 'lucide-react';
import { useToast } from '../../hooks/useToast';
import ToastContainer from '../common/ToastContainer';
import AdminLayout from './AdminLayout';
import tasaBCVAPI from '../../services/tasaBCVAPI';

/**
 * Componente para gestionar la tasa BCV desde el panel admin
 */
const GestionTasaBCV = () => {
  const { toasts, removeToast, success, error: showError } = useToast();
  const [cargando, setCargando] = useState(true);
  const [actualizando, setActualizando] = useState(false);
  const [tasaActual, setTasaActual] = useState(null);
  const [historico, setHistorico] = useState([]);
  const [estadisticas, setEstadisticas] = useState(null);
  const [modalManual, setModalManual] = useState(false);
  const [formData, setFormData] = useState({ valor: '', notas: '' });

  const cargarTasaActual = useCallback(async () => {
    try {
      const response = await tasaBCVAPI.obtenerTasaActual();
      setTasaActual(response.data.data);
    } catch (error) {
      console.error('Error al cargar tasa actual:', error);
    }
  }, []);

  const cargarHistorico = useCallback(async () => {
    try {
      const response = await tasaBCVAPI.obtenerHistorico(10);
      setHistorico(response.data.data);
    } catch (error) {
      console.error('Error al cargar histórico:', error);
    }
  }, []);

  const cargarEstadisticas = useCallback(async () => {
    try {
      const response = await tasaBCVAPI.obtenerEstadisticas(30);
      setEstadisticas(response.data.data);
    } catch (error) {
      console.error('Error al cargar estadísticas:', error);
    }
  }, []);

  const cargarDatos = useCallback(async () => {
    try {
      setCargando(true);
      await Promise.all([
        cargarTasaActual(),
        cargarHistorico(),
        cargarEstadisticas()
      ]);
    } catch (error) {
      showError('Error al cargar datos');
    } finally {
      setCargando(false);
    }
  }, [cargarTasaActual, cargarHistorico, cargarEstadisticas, showError]);

  useEffect(() => {
    cargarDatos();
  }, [cargarDatos]);

  const actualizarDesdeAPI = async () => {
    if (!window.confirm('¿Actualizar tasa desde API externa?')) return;
    
    try {
      setActualizando(true);
      const response = await tasaBCVAPI.actualizarDesdeAPI();
      success(`Tasa actualizada: Bs. ${response.data.data.valor.toFixed(2)}`);
      cargarDatos();
    } catch (error) {
      showError('Error al actualizar desde API');
    } finally {
      setActualizando(false);
    }
  };

  const handleSubmitManual = async (e) => {
    e.preventDefault();
    
    if (!formData.valor || formData.valor <= 0) {
      showError('Ingresa un valor válido');
      return;
    }

    try {
      setActualizando(true);
      const response = await tasaBCVAPI.actualizarManual(
        parseFloat(formData.valor),
        'Admin',
        formData.notas || ''
      );
      success(`Tasa actualizada: Bs. ${response.data.data.valor.toFixed(2)}`);
      setFormData({ valor: '', notas: '' });
      setModalManual(false);
      cargarDatos();
    } catch (error) {
      showError('Error al actualizar tasa');
    } finally {
      setActualizando(false);
    }
  };

  const formatearFecha = (fecha) => {
    return new Date(fecha).toLocaleString('es-VE', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (cargando) {
    return (
      <AdminLayout title="Tasa BCV">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <RefreshCw className="w-12 h-12 text-primary-600 animate-spin mx-auto mb-4" />
            <p className="text-gray-600">Cargando datos...</p>
          </div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout 
      title="💱 Gestión de Tasa BCV"
      extra={
        <button
          onClick={cargarDatos}
          className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
        >
          <RefreshCw size={18} />
          <span>Actualizar</span>
        </button>
      }
    >
      <ToastContainer toasts={toasts} removeToast={removeToast} />

      {/* Estadísticas */}
      {estadisticas && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          {/* Tasa Actual */}
          <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl p-6 text-white shadow-lg">
            <div className="flex items-center justify-between mb-2">
              <span className="text-blue-100 text-sm">Tasa Actual</span>
              <DollarSign className="text-blue-200" size={24} />
            </div>
            <div className="text-3xl font-bold mb-1">
              Bs. {tasaActual?.valor.toFixed(2)}
            </div>
            <div className="text-blue-100 text-xs">
              {tasaActual && formatearFecha(tasaActual.createdAt)}
            </div>
          </div>

          {/* Promedio */}
          <div className="bg-white rounded-xl p-6 shadow-md border border-gray-200">
            <div className="flex items-center justify-between mb-2">
              <span className="text-gray-600 text-sm">Promedio (30 días)</span>
              <TrendingUp className="text-green-500" size={24} />
            </div>
            <div className="text-2xl font-bold text-gray-800">
              Bs. {estadisticas.promedio}
            </div>
          </div>

          {/* Mínima */}
          <div className="bg-white rounded-xl p-6 shadow-md border border-gray-200">
            <div className="flex items-center justify-between mb-2">
              <span className="text-gray-600 text-sm">Mínima</span>
              <Download className="text-yellow-500" size={24} />
            </div>
            <div className="text-2xl font-bold text-gray-800">
              Bs. {estadisticas.minima}
            </div>
          </div>

          {/* Máxima */}
          <div className="bg-white rounded-xl p-6 shadow-md border border-gray-200">
            <div className="flex items-center justify-between mb-2">
              <span className="text-gray-600 text-sm">Máxima</span>
              <TrendingUp className="text-red-500" size={24} />
            </div>
            <div className="text-2xl font-bold text-gray-800">
              Bs. {estadisticas.maxima}
            </div>
          </div>
        </div>
      )}

      {/* Acciones */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Actualizar desde API */}
        <div className="bg-white rounded-xl p-6 shadow-md border border-gray-200">
          <h3 className="text-lg font-bold text-gray-800 mb-2 flex items-center gap-2">
            <RefreshCw size={20} className="text-primary-600" />
            Actualizar desde API
          </h3>
          <p className="text-gray-600 text-sm mb-4">
            Obtiene la tasa actual desde ExchangeRate-API
          </p>
          <button
            onClick={actualizarDesdeAPI}
            disabled={actualizando}
            className="w-full bg-primary-600 text-white py-3 rounded-lg hover:bg-primary-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {actualizando ? (
              <>
                <RefreshCw size={18} className="animate-spin" />
                Actualizando...
              </>
            ) : (
              <>
                <RefreshCw size={18} />
                Actualizar Ahora
              </>
            )}
          </button>
          {tasaActual && (
            <div className="mt-3 text-xs text-gray-500">
              <span className={`inline-block px-2 py-1 rounded ${
                tasaActual.fuente === 'api' ? 'bg-blue-100 text-blue-700' : 'bg-orange-100 text-orange-700'
              }`}>
                Última: {tasaActual.fuente === 'api' ? 'API' : 'Manual'}
              </span>
            </div>
          )}
        </div>

        {/* Actualizar Manualmente */}
        <div className="bg-white rounded-xl p-6 shadow-md border border-gray-200">
          <h3 className="text-lg font-bold text-gray-800 mb-2 flex items-center gap-2">
            <Edit3 size={20} className="text-primary-600" />
            Actualizar Manualmente
          </h3>
          <p className="text-gray-600 text-sm mb-4">
            Ingresa un valor personalizado
          </p>
          <button
            onClick={() => setModalManual(true)}
            className="w-full bg-gray-100 text-gray-700 py-3 rounded-lg hover:bg-gray-200 transition-colors flex items-center justify-center gap-2"
          >
            <Edit3 size={18} />
            Abrir Formulario
          </button>
        </div>
      </div>

      {/* Histórico */}
      <div className="bg-white rounded-xl shadow-md border border-gray-200 overflow-hidden">
        <div className="p-6 border-b border-gray-200">
          <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2">
            <TrendingUp size={20} className="text-primary-600" />
            Histórico de Cambios (Últimos 10)
          </h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Fecha
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Valor
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Fuente
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actualizado por
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Notas
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {historico.map((item) => (
                <tr key={item._id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {formatearFecha(item.createdAt)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-primary-600">
                    Bs. {item.valor.toFixed(2)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 text-xs rounded-full ${
                      item.fuente === 'api' 
                        ? 'bg-blue-100 text-blue-700' 
                        : 'bg-orange-100 text-orange-700'
                    }`}>
                      {item.fuente === 'api' ? 'API Automática' : 'Manual'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {item.actualizadoPor}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500">
                    {item.notas || '-'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Actualización Manual */}
      {modalManual && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-md w-full p-6">
            <h3 className="text-xl font-bold text-gray-800 mb-4">
              Actualizar Tasa Manualmente
            </h3>
            <form onSubmit={handleSubmitManual}>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nueva Tasa (Bs.)
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={formData.valor}
                  onChange={(e) => setFormData({ ...formData, valor: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                  placeholder="36.50"
                  required
                />
              </div>
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Notas (opcional)
                </label>
                <textarea
                  value={formData.notas}
                  onChange={(e) => setFormData({ ...formData, notas: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                  rows="3"
                  placeholder="Ej: Ajuste manual por cambio oficial"
                />
              </div>
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setModalManual(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={actualizando}
                  className="flex-1 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors disabled:opacity-50"
                >
                  {actualizando ? 'Guardando...' : 'Guardar'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </AdminLayout>
  );
};

export default GestionTasaBCV;
