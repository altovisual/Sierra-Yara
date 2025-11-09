import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMesa } from '../../context/MesaContext';
import { mesasAPI } from '../../services/api';
import { useTasaBCV } from '../../context/TasaBCVContext';
import { ArrowLeft, Users, Receipt } from 'lucide-react';

/**
 * Componente para ver la cuenta completa de la mesa
 */
const CuentaMesa = () => {
  const navigate = useNavigate();
  const { mesaActual, dispositivoId } = useMesa();
  const { formatearPrecioDual } = useTasaBCV();
  const [cuentaMesa, setCuentaMesa] = useState(null);
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    if (mesaActual) {
      cargarCuentaMesa();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mesaActual]);

  const cargarCuentaMesa = async () => {
    try {
      setCargando(true);
      const response = await mesasAPI.obtenerCuenta(mesaActual.numeroMesa);
      setCuentaMesa(response.data.data);
    } catch (error) {
      console.error('Error al cargar cuenta de la mesa:', error);
    } finally {
      setCargando(false);
    }
  };

  if (!mesaActual || !dispositivoId) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">
            No estás conectado a una mesa
          </h2>
          <button onClick={() => navigate('/')} className="btn-primary">
            Conectar a Mesa
          </button>
        </div>
      </div>
    );
  }

  if (cargando) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="spinner"></div>
      </div>
    );
  }

  if (!cuentaMesa) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">
            No se pudo cargar la cuenta
          </h2>
          <button onClick={() => navigate('/mis-pedidos')} className="btn-primary">
            Volver a Mis Pedidos
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Header */}
      <div className="bg-primary-600 text-white shadow-lg sticky top-0 z-10">
        <div className="max-w-4xl mx-auto p-4 flex items-center gap-4">
          <button
            onClick={() => navigate('/mis-pedidos')}
            className="p-2 hover:bg-primary-700 rounded-lg transition-colors"
          >
            <ArrowLeft size={24} />
          </button>
          <div className="flex-1">
            <h1 className="text-2xl font-display font-bold">Cuenta de la Mesa</h1>
            <p className="text-primary-100">Mesa {mesaActual.numeroMesa}</p>
          </div>
          <Receipt size={32} />
        </div>
      </div>

      <div className="max-w-4xl mx-auto p-4">
        {/* Información de la mesa */}
        <div className="card p-6 mb-6">
          <div className="flex items-center gap-3 mb-4">
            <Users className="text-primary-600" size={24} />
            <div>
              <h2 className="text-lg font-semibold text-gray-800">
                Mesa {cuentaMesa.numeroMesa}
              </h2>
              <p className="text-sm text-gray-600">
                {cuentaMesa.dispositivosActivos?.length || 0} persona(s) en la mesa
              </p>
            </div>
          </div>
        </div>

        {/* Pedidos por persona */}
        <div className="space-y-4 mb-6">
          <h3 className="text-xl font-bold text-gray-800 mb-4">Pedidos por Persona</h3>
          
          {cuentaMesa.pedidosPorDispositivo && cuentaMesa.pedidosPorDispositivo.length > 0 ? (
            cuentaMesa.pedidosPorDispositivo.map((dispositivo, index) => (
              <div key={index} className="card p-4">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="font-semibold text-gray-800">
                    {dispositivo.nombreUsuario || `Cliente ${index + 1}`}
                    {dispositivo.dispositivoId === dispositivoId && (
                      <span className="ml-2 text-xs bg-primary-100 text-primary-700 px-2 py-1 rounded-full">
                        Tú
                      </span>
                    )}
                  </h4>
                  <div className="text-right">
                    <div className="text-lg font-bold text-primary-600">${dispositivo.total.toFixed(2)}</div>
                    <div className="text-xs text-gray-500">{formatearPrecioDual(dispositivo.total).bs}</div>
                  </div>
                </div>

                {/* Items del dispositivo */}
                <div className="space-y-2 pl-4 border-l-2 border-gray-200">
                  {dispositivo.pedidos?.map((pedido) => (
                    <div key={pedido._id} className="space-y-1">
                      {pedido.items?.map((item, itemIndex) => (
                        <div key={itemIndex} className="flex justify-between text-sm">
                          <span className="text-gray-700">
                            {item.cantidad}x {item.nombreProducto}
                          </span>
                          <div className="text-right">
                            <div className="text-gray-600">${item.subtotal.toFixed(2)}</div>
                            <div className="text-xs text-gray-500">{formatearPrecioDual(item.subtotal).bs}</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ))}
                </div>
              </div>
            ))
          ) : (
            <div className="card p-6 text-center text-gray-500">
              No hay pedidos en esta mesa
            </div>
          )}
        </div>

        {/* Resumen total */}
        <div className="card p-6 bg-primary-50 border-2 border-primary-200">
          <h3 className="text-lg font-bold text-gray-800 mb-4">Resumen Total</h3>
          
          <div className="space-y-2 mb-4">
            <div className="flex justify-between text-gray-700">
              <span>Subtotal:</span>
              <div className="text-right">
                <div className="font-medium">${(cuentaMesa.totalMesa || 0).toFixed(2)}</div>
                <div className="text-xs text-gray-500">{formatearPrecioDual(cuentaMesa.totalMesa || 0).bs}</div>
              </div>
            </div>
            
            {cuentaMesa.propinaSugerida && (
              <div className="flex justify-between text-gray-600 text-sm">
                <span>Propina sugerida (10%):</span>
                <div className="text-right">
                  <div>${cuentaMesa.propinaSugerida.toFixed(2)}</div>
                  <div className="text-xs">{formatearPrecioDual(cuentaMesa.propinaSugerida).bs}</div>
                </div>
              </div>
            )}
          </div>

          <div className="border-t-2 border-primary-300 pt-4 flex justify-between items-center">
            <span className="text-xl font-bold text-gray-800">Total de la Mesa:</span>
            <div className="text-right">
              <div className="text-3xl font-bold text-primary-600">${(cuentaMesa.totalMesa || 0).toFixed(2)}</div>
              <div className="text-base text-gray-600">{formatearPrecioDual(cuentaMesa.totalMesa || 0).bs}</div>
            </div>
          </div>
        </div>

        {/* Botones de acción */}
        <div className="mt-6 space-y-3">
          <button
            onClick={() => navigate('/mis-pedidos')}
            className="btn-outline w-full"
          >
            Volver a Mis Pedidos
          </button>
          
          <button
            onClick={() => navigate('/menu')}
            className="btn-primary w-full"
          >
            Agregar Más Productos
          </button>
        </div>

        {/* Nota informativa */}
        <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
          <p className="text-sm text-blue-800">
            <strong>Nota:</strong> Esta es la cuenta completa de la mesa. Cada persona puede pagar su parte individualmente desde "Mis Pedidos" o pueden dividir la cuenta entre todos.
          </p>
        </div>
      </div>
    </div>
  );
};

export default CuentaMesa;
